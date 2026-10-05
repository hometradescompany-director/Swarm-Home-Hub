export type ConcurrentBranchStateMode =
  | "independent"
  | "shared_explicit";

export interface ConcurrentBranchObservation {
  readonly participantRef: string;
  readonly declaredOrder: number;
  readonly completedAt: string;
  readonly mutableStateRef: string;
  readonly stateMode: ConcurrentBranchStateMode;
  readonly resultRef: string;
  readonly transcriptRef?: string;
  readonly evidenceReceiptIds: readonly string[];
}

export interface ConcurrentBranchProjection {
  /**
   * Stable semantic order chosen by the caller before execution.
   * Provider latency must never rewrite this order.
   */
  readonly semanticOrder: readonly ConcurrentBranchObservation[];
  /**
   * Physical completion order retained as a separate observation.
   */
  readonly completionOrder: readonly ConcurrentBranchObservation[];
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function validTime(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(field + " must be a valid ISO-8601 value");
  }
  return parsed;
}

function nonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative integer");
  }
  return value;
}

function refs(values: readonly string[], field: string): readonly string[] {
  return Object.freeze(
    values.map((value, index) => nonBlank(value, field + "[" + index + "]"))
  );
}

function normalize(
  observation: ConcurrentBranchObservation,
  index: number
): ConcurrentBranchObservation {
  const transcriptRef =
    observation.transcriptRef === undefined
      ? undefined
      : nonBlank(observation.transcriptRef, "observations[" + index + "].transcriptRef");

  validTime(observation.completedAt, "observations[" + index + "].completedAt");

  return Object.freeze({
    participantRef: nonBlank(
      observation.participantRef,
      "observations[" + index + "].participantRef"
    ),
    declaredOrder: nonNegativeInteger(
      observation.declaredOrder,
      "observations[" + index + "].declaredOrder"
    ),
    completedAt: observation.completedAt,
    mutableStateRef: nonBlank(
      observation.mutableStateRef,
      "observations[" + index + "].mutableStateRef"
    ),
    stateMode: observation.stateMode,
    resultRef: nonBlank(
      observation.resultRef,
      "observations[" + index + "].resultRef"
    ),
    ...(transcriptRef ? { transcriptRef } : {}),
    evidenceReceiptIds: refs(
      observation.evidenceReceiptIds,
      "observations[" + index + "].evidenceReceiptIds"
    )
  });
}

/**
 * Project concurrent observations without allowing provider completion latency to
 * become semantic ordering and without allowing supposedly independent branches
 * to share mutable state accidentally.
 *
 * This owns no scheduler and no remote state. It only validates and projects
 * already-observed branch results.
 */
export function projectConcurrentBranchResults(
  observations: readonly ConcurrentBranchObservation[]
): ConcurrentBranchProjection {
  const normalized = observations.map(normalize);
  const participantRefs = new Set<string>();
  const declaredOrders = new Set<number>();
  const stateOwners = new Map<string, ConcurrentBranchObservation[]>();

  for (const observation of normalized) {
    if (participantRefs.has(observation.participantRef)) {
      throw new Error(
        "duplicate concurrent participantRef: " + observation.participantRef
      );
    }
    participantRefs.add(observation.participantRef);

    if (declaredOrders.has(observation.declaredOrder)) {
      throw new Error(
        "duplicate concurrent declaredOrder: " + observation.declaredOrder
      );
    }
    declaredOrders.add(observation.declaredOrder);

    const owners = stateOwners.get(observation.mutableStateRef) ?? [];
    owners.push(observation);
    stateOwners.set(observation.mutableStateRef, owners);
  }

  for (const [stateRef, owners] of stateOwners) {
    if (
      owners.length > 1 &&
      owners.some((owner) => owner.stateMode === "independent")
    ) {
      throw new Error(
        "independent concurrent branches must not share mutable state: " + stateRef
      );
    }
  }

  const semanticOrder = Object.freeze(
    normalized
      .slice()
      .sort(
        (left, right) =>
          left.declaredOrder - right.declaredOrder ||
          left.participantRef.localeCompare(right.participantRef)
      )
  );

  const completionOrder = Object.freeze(
    normalized
      .slice()
      .sort(
        (left, right) =>
          Date.parse(left.completedAt) - Date.parse(right.completedAt) ||
          left.declaredOrder - right.declaredOrder ||
          left.participantRef.localeCompare(right.participantRef)
      )
  );

  return Object.freeze({ semanticOrder, completionOrder });
}
