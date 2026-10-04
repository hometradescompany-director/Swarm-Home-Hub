import { ATLAS_EVENT_CONTRACT } from "./federation.js";

export const ATLAS_WORK_REQUESTED_NAME = "atlas.work.requested" as const;
export const ATLAS_SWARM_HANDOFF_CONTRACT = "atlas-swarm-handoff/v1" as const;

export interface AtlasWorkRequestedEvent {
  readonly contract: typeof ATLAS_EVENT_CONTRACT;
  readonly eventId: string;
  readonly name: typeof ATLAS_WORK_REQUESTED_NAME;
  readonly occurredAt: string;
  readonly subjectRef: string;
  readonly sourceSequence: number | null;
  readonly handoffContract: typeof ATLAS_SWARM_HANDOFF_CONTRACT;
  readonly workKind: string;
  readonly parameters: Readonly<Record<string, unknown>>;
}

export type SwarmWorkHandoffOutcome =
  | {
      readonly accepted: true;
      readonly correlationId: string;
      readonly result?: unknown;
    }
  | {
      readonly accepted: false;
      readonly correlationId: string;
      readonly reason: string;
    };

export interface SwarmWorkHandoffHandler {
  handle(event: AtlasWorkRequestedEvent): Promise<SwarmWorkHandoffOutcome>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (!nonEmptyString(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time);
}

export function parseAtlasWorkRequestedEvent(
  body: unknown
): { ok: true; event: AtlasWorkRequestedEvent } | { ok: false; error: string } {
  if (!isRecord(body)) return { ok: false, error: "request body must be a JSON object" };
  if (body.contract !== ATLAS_EVENT_CONTRACT) return { ok: false, error: "unsupported event contract" };
  if (body.name !== ATLAS_WORK_REQUESTED_NAME) return { ok: false, error: "unsupported event name" };
  if (!nonEmptyString(body.event_id)) return { ok: false, error: "event_id must be a non-empty string" };
  if (!isIsoTimestamp(body.occurred_at)) return { ok: false, error: "occurred_at must be a valid ISO-8601 timestamp" };
  if (!nonEmptyString(body.subject_ref)) return { ok: false, error: "subject_ref must be a non-empty string" };
  if (body.source_sequence !== null && body.source_sequence !== undefined) {
    if (typeof body.source_sequence !== "number" || !Number.isInteger(body.source_sequence)) {
      return { ok: false, error: "source_sequence must be an integer or null" };
    }
  }
  if (body.handoff_contract !== ATLAS_SWARM_HANDOFF_CONTRACT) {
    return { ok: false, error: "unsupported handoff contract" };
  }
  if (!nonEmptyString(body.work_kind)) return { ok: false, error: "work_kind must be a non-empty string" };
  if (!isRecord(body.parameters)) return { ok: false, error: "parameters must be a JSON object" };

  return {
    ok: true,
    event: {
      contract: ATLAS_EVENT_CONTRACT,
      eventId: body.event_id,
      name: ATLAS_WORK_REQUESTED_NAME,
      occurredAt: body.occurred_at,
      subjectRef: body.subject_ref,
      sourceSequence: body.source_sequence === undefined ? null : body.source_sequence,
      handoffContract: ATLAS_SWARM_HANDOFF_CONTRACT,
      workKind: body.work_kind,
      parameters: body.parameters
    }
  };
}
