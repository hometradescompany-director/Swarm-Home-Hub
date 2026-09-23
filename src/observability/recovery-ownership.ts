export type RecoveryOwnershipScope =
  | "none"
  | "process_local"
  | "distributed_lease";

export interface RecoveryOwnershipObservation {
  readonly subjectRef: string;
  readonly scope: RecoveryOwnershipScope;
  readonly localOwnerActive: boolean;
  /**
   * Explicit evidence that a distributed lease is currently held.
   * Absence of a local owner never implies this.
   */
  readonly distributedLeaseHeld?: boolean;
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

  if (
    observation.distributedLeaseHeld === true &&
    observation.scope !== "distributed_lease"
  ) {
    throw new Error(
      "distributedLeaseHeld requires distributed_lease ownership scope"
    );
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
    localRecoveryCandidate:
      !observation.localOwnerActive &&
      observation.distributedLeaseHeld !== true,
    distributedExclusivityProven:
      observation.scope === "distributed_lease" &&
      observation.distributedLeaseHeld === true,
    observedAt: observation.observedAt,
    evidenceReceiptIds,
    authorityImplication: "none"
  });
}
