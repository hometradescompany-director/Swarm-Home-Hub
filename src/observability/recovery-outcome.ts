import type { AuthorizedRecoveryIntent } from "./recovery-authority.js";

export type RecoveryOutcomeStatus = "observed" | "refused" | "failed";

export interface RecoveryObservationOutcome {
  readonly intentId: string;
  readonly subjectRef: string;
  readonly authorityRef: string;
  readonly status: RecoveryOutcomeStatus;
  readonly observedAt: string;
  readonly receiptId?: string;
  readonly sourceRef?: string;
  readonly message?: string;
}

function optionalNonBlank(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " cannot be blank");
  return normalized;
}

export function createRecoveryObservationOutcome(input: {
  readonly authorized: AuthorizedRecoveryIntent;
  readonly status: RecoveryOutcomeStatus;
  readonly observedAt: string;
  readonly receiptId?: string;
  readonly sourceRef?: string;
  readonly message?: string;
}): RecoveryObservationOutcome {
  if (!input.authorized.allowed) {
    throw new Error("cannot create an observation outcome for a refused recovery intent");
  }
  const observedMs = Date.parse(input.observedAt);
  const decidedMs = Date.parse(input.authorized.decidedAt);
  if (!Number.isFinite(observedMs) || observedMs < decidedMs) {
    throw new Error("recovery outcome must be observed at or after authority decision");
  }

  const receiptId = optionalNonBlank(input.receiptId, "receiptId");
  const sourceRef = optionalNonBlank(input.sourceRef, "sourceRef");
  if (input.status === "observed" && (!receiptId || !sourceRef)) {
    throw new Error("observed recovery outcome requires receiptId and sourceRef");
  }

  return Object.freeze({
    intentId: input.authorized.intent.intentId,
    subjectRef: input.authorized.intent.subjectRef,
    authorityRef: input.authorized.authorityRef,
    status: input.status,
    observedAt: input.observedAt,
    ...(receiptId ? { receiptId } : {}),
    ...(sourceRef ? { sourceRef } : {}),
    ...(input.message?.trim() ? { message: input.message.trim() } : {}),
  });
}
