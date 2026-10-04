import type {
  RecoveryCandidate,
  RecoveryCandidateKind,
} from "./recovery-candidate.js";

export const SWARM_HOME_RECOVERY_INTENT = "SwarmHomeRecoveryIntent/v1" as const;

export interface RecoveryIntent {
  readonly schema: typeof SWARM_HOME_RECOVERY_INTENT;
  readonly intentId: string;
  readonly kind: RecoveryCandidateKind;
  readonly subjectRef: string;
  readonly evidenceRefs: readonly string[];
  readonly requestedAt: string;
  readonly authorityImplication: "none";
  readonly remoteMutationRequested: false;
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export function createRecoveryIntent(
  candidate: RecoveryCandidate,
  intentId: string,
  requestedAt: string
): RecoveryIntent {
  if (!Number.isFinite(Date.parse(requestedAt))) {
    throw new Error("requestedAt must be a valid ISO-8601 value");
  }
  return Object.freeze({
    schema: SWARM_HOME_RECOVERY_INTENT,
    intentId: nonBlank(intentId, "intentId"),
    kind: candidate.kind,
    subjectRef: nonBlank(candidate.subjectRef, "subjectRef"),
    evidenceRefs: Object.freeze(candidate.evidenceRefs.map((ref, index) =>
      nonBlank(ref, "evidenceRefs[" + index + "]")
    )),
    requestedAt,
    authorityImplication: "none",
    remoteMutationRequested: false,
  });
}
