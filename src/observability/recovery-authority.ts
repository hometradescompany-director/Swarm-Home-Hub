import type { RecoveryIntent } from "./recovery-intent.js";

export interface RecoveryAuthorityDecision {
  readonly allowed: boolean;
  readonly authorityRef: string;
  readonly decidedAt: string;
  readonly reason?: string;
}

export type AuthorizedRecoveryIntent =
  | {
      readonly allowed: true;
      readonly intent: RecoveryIntent;
      readonly authorityRef: string;
      readonly decidedAt: string;
    }
  | {
      readonly allowed: false;
      readonly intentId: string;
      readonly authorityRef: string;
      readonly decidedAt: string;
      readonly reason?: string;
    };

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export function applyRecoveryAuthorityDecision(
  intent: RecoveryIntent,
  decision: RecoveryAuthorityDecision
): AuthorizedRecoveryIntent {
  const requestedMs = Date.parse(intent.requestedAt);
  const decidedMs = Date.parse(decision.decidedAt);
  if (!Number.isFinite(requestedMs) || !Number.isFinite(decidedMs)) {
    throw new Error("recovery authority timestamps must be valid ISO-8601 values");
  }
  if (decidedMs < requestedMs) {
    throw new Error("recovery authority decision cannot predate the intent");
  }
  const authorityRef = nonBlank(decision.authorityRef, "authorityRef");

  return decision.allowed
    ? Object.freeze({
        allowed: true,
        intent,
        authorityRef,
        decidedAt: decision.decidedAt,
      })
    : Object.freeze({
        allowed: false,
        intentId: intent.intentId,
        authorityRef,
        decidedAt: decision.decidedAt,
        ...(decision.reason?.trim() ? { reason: decision.reason.trim() } : {}),
      });
}
