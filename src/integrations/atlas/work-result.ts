import { ATLAS_EVENT_CONTRACT } from "./federation.js";
import { atlasEventIdFor } from "./event-sink.js";
import type { AtlasWorkRequestedEvent, SwarmWorkHandoffOutcome } from "./work-handoff.js";

/**
 * Return path for atlas-swarm-handoff/v1.
 *
 * Swarm reports the outcome of an `atlas.work.requested` hand-off back to
 * Atlas as a `swarm.work.result` atlas-event/v1 envelope through Atlas's
 * existing Gateway event ingest (`POST /api/public/v1/events`). No second
 * result protocol: the request's `event_id` travels as
 * `payload.correlation_event_id`, and the result's own `event_id` is derived
 * deterministically so replays hit Atlas's idempotency boundary.
 *
 * The result is evidence, not a command. The Atlas gateway token only carries
 * `observe:event`; it grants Swarm no other authority inside Atlas.
 */
export const SWARM_WORK_RESULT_NAME = "swarm.work.result" as const;
export type SwarmWorkResultOutcome = "completed" | "refused" | "failed";

export interface AtlasWorkResultDelivery {
  readonly resultEventId: string;
  readonly correlationEventId: string;
  readonly atlasRecordId: string;
  readonly accepted: boolean;
  readonly duplicate: boolean;
}

export interface AtlasWorkResultReporterOptions {
  readonly baseUrl: string;
  readonly token: string;
  readonly fetcher?: typeof fetch;
  readonly now?: () => Date;
}

export function workResultOutcome(outcome: SwarmWorkHandoffOutcome | null): SwarmWorkResultOutcome {
  if (!outcome) return "failed";
  return outcome.accepted ? "completed" : "refused";
}

export async function buildAtlasWorkResultEvent(
  request: AtlasWorkRequestedEvent,
  outcome: SwarmWorkResultOutcome,
  occurredAt: string
): Promise<Record<string, unknown>> {
  return {
    contract: ATLAS_EVENT_CONTRACT,
    event_id: await atlasEventIdFor(`swarm.work.result:${request.eventId}`),
    name: SWARM_WORK_RESULT_NAME,
    occurred_at: occurredAt,
    subject_ref: request.subjectRef,
    source_sequence: null,
    payload: {
      correlation_event_id: request.eventId,
      outcome,
      work_kind: request.workKind
    }
  };
}

export class AtlasWorkResultReporter {
  readonly #baseUrl: URL;
  readonly #token: string;
  readonly #fetcher: typeof fetch;
  readonly #now: () => Date;

  constructor(options: AtlasWorkResultReporterOptions) {
    const token = options.token.trim();
    if (!token) throw new Error("Atlas gateway token is required");
    const baseUrl = new URL(options.baseUrl);
    if (!["http:", "https:"].includes(baseUrl.protocol)) {
      throw new Error("Atlas gateway baseUrl must use http or https");
    }
    this.#baseUrl = baseUrl;
    this.#token = token;
    this.#fetcher = options.fetcher ?? fetch;
    this.#now = options.now ?? (() => new Date());
  }

  async report(
    request: AtlasWorkRequestedEvent,
    outcome: SwarmWorkResultOutcome
  ): Promise<AtlasWorkResultDelivery> {
    const body = await buildAtlasWorkResultEvent(request, outcome, this.#now().toISOString());
    const response = await this.#fetcher(new URL("/api/public/v1/events", this.#baseUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.#token}`,
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(body)
    });
    let envelope: {
      ok?: boolean;
      data?: { event_id?: string; atlas_event_id?: string; accepted?: boolean; duplicate?: boolean };
      refusal?: { reason?: string; stage?: string };
    };
    try {
      envelope = (await response.json()) as typeof envelope;
    } catch {
      throw new Error(`Atlas event endpoint returned non-JSON HTTP ${response.status}`);
    }
    if (!response.ok || envelope.ok !== true || !envelope.data) {
      const reason = envelope.refusal?.reason ?? `HTTP ${response.status}`;
      const stage = envelope.refusal?.stage ? ` at ${envelope.refusal.stage}` : "";
      throw new Error(`Atlas work result refused${stage}: ${reason}`);
    }
    if (envelope.data.event_id !== body["event_id"]) {
      throw new Error("Atlas response does not match the delivered result identity");
    }
    return {
      resultEventId: body["event_id"] as string,
      correlationEventId: request.eventId,
      atlasRecordId: envelope.data.atlas_event_id ?? "",
      accepted: envelope.data.accepted === true,
      duplicate: envelope.data.duplicate === true
    };
  }
}
