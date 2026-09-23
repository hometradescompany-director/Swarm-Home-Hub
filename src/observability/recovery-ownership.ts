export type RecoveryOwnershipScope =
  | "none"
  | "process_local"
  | "distributed_lease";

export interface RecoveryOwnershipObservation {
  readonly subjectRef: string;
  readonly scope: RecoveryOwnershipScope;
  readonly localOwnerActive: boolean;
  readonly observedAt: string;
  readonly evidenceReceiptIds: readonly string[];
}

export interface RecoveryOwnershipProjection {
  readonly subjectRef: string;
  readonly scope: RecoveryOwnershipScope;
  readonly localOwnerActive: boolean;
  readonly localRecoveryCandidate: boolean;
  readonly distributedExclusivityProven: boolean;
  readonly observedAt: string;
  readonly evidenceReceiptIds: readonly string[];
  /**
   * Recovery eligibility is an observation, not authority to mutate.
   */
  readonly authorityImplication: "none";
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

/**
 * Interpret recovery ownership evidence without upgrading a local guard into a
 * distributed lease or mutation authority.
 */
export function projectRecoveryOwnership(
  observation: RecoveryOwnershipObservation
): RecoveryOwnershipProjection {
  if (!Number.isFinite(Date.parse(observation.observedAt))) {
    throw new Error("observedAt must be a valid ISO-8601 value");
  }

  const evidenceReceiptIds = Object.freeze(
    observation.evidenceReceiptIds.map((value, index) =>
      nonBlank(value, "evidenceReceiptIds[" + index + "]")
    )
  );

  return Object.freeze({
    subjectRef: nonBlank(observation.subjectRef, "subjectRef"),
    scope: observation.scope,
    localOwnerActive: observation.localOwnerActive,
    localRecoveryCandidate: !observation.localOwnerActive,
    distributedExclusivityProven:
      observation.scope === "distributed_lease" &&
      !observation.localOwnerActive,
    observedAt: observation.observedAt,
    evidenceReceiptIds,
    authorityImplication: "none"
  });
}
