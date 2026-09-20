import type { SwarmResidenceEvent } from "../../events/event.js";

export const ATLAS_EVENT_CONTRACT = "atlas-event/v1" as const;

export interface AtlasEventDeliveryResult {
  readonly sourceEventId: string;
  readonly atlasEventId: string;
  readonly atlasRecordId: string;
  readonly accepted: boolean;
  readonly duplicate: boolean;
}

export interface AtlasEventSink {
  deliver(event: SwarmResidenceEvent): Promise<AtlasEventDeliveryResult>;
}

type Fetcher = typeof fetch;

interface AtlasEnvelope<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly refusal?: {
    readonly reason?: string;
    readonly stage?: string;
  };
}

interface AtlasEventResponse {
  readonly event_id: string;
  readonly atlas_event_id: string;
  readonly accepted: boolean;
  readonly duplicate: boolean;
}

function bytesToUuid(bytes: Uint8Array): string {
  const copy = bytes.slice(0, 16);
  copy[6] = ((copy[6] ?? 0) & 0x0f) | 0x50;
  copy[8] = ((copy[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...copy].map(value => value.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join("-");
}

/**
 * Derive the stable Atlas event UUID from the product-owned event identity.
 * Replays therefore hit Atlas's existing idempotency boundary without Swarm
 * needing a second mutable queue identity.
 */
export async function atlasEventIdFor(sourceEventId: string): Promise<string> {
  const source = sourceEventId.trim();
  if (!source) throw new Error("source event id is required");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return bytesToUuid(new Uint8Array(digest));
}

export interface AtlasHttpEventSinkOptions {
  readonly baseUrl: string;
  readonly token: string;
  readonly fetcher?: Fetcher;
}

export class AtlasHttpEventSink implements AtlasEventSink {
  readonly #baseUrl: URL;
  readonly #token: string;
  readonly #fetcher: Fetcher;

  constructor(options: AtlasHttpEventSinkOptions) {
    const token = options.token.trim();
    if (!token) throw new Error("Atlas gateway token is required");
    const baseUrl = new URL(options.baseUrl);
    if (!["http:", "https:"].includes(baseUrl.protocol)) {
      throw new Error("Atlas gateway baseUrl must use http or https");
    }
    this.#baseUrl = baseUrl;
    this.#token = token;
    this.#fetcher = options.fetcher ?? fetch;
  }

  async deliver(event: SwarmResidenceEvent): Promise<AtlasEventDeliveryResult> {
    const atlasEventId = await atlasEventIdFor(event.id);
    const url = new URL("/api/public/v1/events", this.#baseUrl);

    const response = await this.#fetcher(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.#token}`,
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        contract: ATLAS_EVENT_CONTRACT,
        event_id: atlasEventId,
        name: event.type,
        occurred_at: event.occurredAt,
        subject_ref: event.agentIdentityRef,
        source_sequence: null,
        payload: {
          source_event_ref: event.id,
          residence_ref: event.residenceId,
          habitat_ref: event.habitatId,
          actor_ref: event.actorRef,
          previous_event_ref: event.previousEventId ?? null,
          authority_ref: event.authorityRef ?? null,
          evidence_receipt_refs: event.evidenceReceiptIds
        }
      })
    });

    let envelope: AtlasEnvelope<AtlasEventResponse>;
    try {
      envelope = (await response.json()) as AtlasEnvelope<AtlasEventResponse>;
    } catch {
      throw new Error(`Atlas event endpoint returned non-JSON HTTP ${response.status}`);
    }

    if (!response.ok || envelope.ok !== true || !envelope.data) {
      const reason = envelope.refusal?.reason ?? `HTTP ${response.status}`;
      const stage = envelope.refusal?.stage ? ` at ${envelope.refusal.stage}` : "";
      throw new Error(`Atlas event delivery refused${stage}: ${reason}`);
    }

    if (envelope.data.event_id !== atlasEventId) {
      throw new Error("Atlas event response does not match the delivered event identity");
    }

    return {
      sourceEventId: event.id,
      atlasEventId,
      atlasRecordId: envelope.data.atlas_event_id,
      accepted: envelope.data.accepted,
      duplicate: envelope.data.duplicate
    };
  }
}
