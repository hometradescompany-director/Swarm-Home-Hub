import type { ExternalExecutionProviderOutcome } from "./contract.js";

export type ExternalDurableExecutionStanding =
  | "accepted"
  | "observed_success_only"
  | "replayable_success"
  | "incomplete"
  | "failed"
  | "refused";

export interface ExternalDurableExecutionObservation {
  readonly status: ExternalExecutionProviderOutcome["status"];
  readonly idempotencyKey?: string;
  readonly activationAcknowledged?: boolean;
  readonly completionAcknowledged?: boolean;
  readonly postCommitFault?: boolean;
}

export interface ExternalDurableExecutionProjection {
  readonly standing: ExternalDurableExecutionStanding;
  readonly normalizedIdempotencyKey?: string;
  readonly activationAcknowledged: boolean;
  readonly completionAcknowledged: boolean;
  readonly replayable: boolean;
  readonly durableSuccess: boolean;
}

function normalizeKey(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

/**
 * Project whether a provider-reported completion is merely observed or has an
 * explicit replay-safe durable acknowledgement boundary.
 *
 * A keyless healthy call may still be a valid observed success. A post-commit
 * fault, however, may only retain success standing when both acknowledgement
 * evidence and a non-empty idempotency key exist.
 */
export function projectExternalDurableExecutionStanding(
  observation: ExternalDurableExecutionObservation
): ExternalDurableExecutionProjection {
  const normalizedIdempotencyKey = normalizeKey(observation.idempotencyKey);
  const activationAcknowledged = observation.activationAcknowledged === true;
  const completionAcknowledged = observation.completionAcknowledged === true;
  const replayable =
    observation.status === "completed" &&
    Boolean(normalizedIdempotencyKey) &&
    activationAcknowledged &&
    completionAcknowledged;

  let standing: ExternalDurableExecutionStanding;
  if (observation.status === "accepted") {
    standing = "accepted";
  } else if (observation.status === "failed") {
    standing = "failed";
  } else if (observation.status === "refused") {
    standing = "refused";
  } else if (observation.postCommitFault && !replayable) {
    standing = "incomplete";
  } else {
    standing = replayable ? "replayable_success" : "observed_success_only";
  }

  return Object.freeze({
    standing,
    ...(normalizedIdempotencyKey
      ? { normalizedIdempotencyKey }
      : {}),
    activationAcknowledged,
    completionAcknowledged,
    replayable,
    durableSuccess: standing === "replayable_success"
  });
}
