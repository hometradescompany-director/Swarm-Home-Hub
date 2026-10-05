export type ExternalStorageStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "unknown";

export type ExternalSemanticStanding =
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "cancelled"
  | "unknown";

export interface ExternalSemanticStateObservation {
  readonly subjectRef: string;
  readonly storageStatus: ExternalStorageStatus;
  readonly deferredAt?: string;
  readonly wakeRef?: string;
  readonly observedAt: string;
  readonly evidenceReceiptIds: readonly string[];
}

export interface ExternalSemanticStateProjection {
  readonly subjectRef: string;
  readonly storageStatus: ExternalStorageStatus;
  readonly semanticStanding: ExternalSemanticStanding;
  readonly deferredAt?: string;
  readonly wakeRef?: string;
  readonly observedAt: string;
  readonly evidenceReceiptIds: readonly string[];
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function optionalRef(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return nonBlank(value, field);
}

function validTime(value: string, field: string): string {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(field + " must be a valid ISO-8601 value");
  }
  return value;
}

/**
 * Preserve provider storage status while deriving the semantic standing that a
 * Swarm Home adapter should display or reason over.
 *
 * A provider may persist a deferral by terminally completing one storage row
 * and scheduling a wake-up elsewhere. In that case "completed" is not "done".
 */
export function projectExternalSemanticState(
  observation: ExternalSemanticStateObservation
): ExternalSemanticStateProjection {
  const subjectRef = nonBlank(observation.subjectRef, "subjectRef");
  const observedAt = validTime(observation.observedAt, "observedAt");
  const deferredAt = observation.deferredAt
    ? validTime(observation.deferredAt, "deferredAt")
    : undefined;
  const wakeRef = optionalRef(observation.wakeRef, "wakeRef");
  const evidenceReceiptIds = Object.freeze(
    observation.evidenceReceiptIds.map((value, index) =>
      nonBlank(value, "evidenceReceiptIds[" + index + "]")
    )
  );

  if (deferredAt && observation.storageStatus !== "completed") {
    throw new Error(
      "deferredAt currently describes provider-completed storage rows only"
    );
  }
  if (deferredAt && Date.parse(deferredAt) > Date.parse(observedAt)) {
    throw new Error("deferredAt cannot be later than observedAt");
  }

  const semanticStanding: ExternalSemanticStanding =
    deferredAt
      ? "waiting"
      : observation.storageStatus === "pending"
        ? "waiting"
        : observation.storageStatus === "running"
          ? "active"
          : observation.storageStatus === "completed"
            ? "done"
            : observation.storageStatus;

  return Object.freeze({
    subjectRef,
    storageStatus: observation.storageStatus,
    semanticStanding,
    ...(deferredAt ? { deferredAt } : {}),
    ...(wakeRef ? { wakeRef } : {}),
    observedAt,
    evidenceReceiptIds
  });
}
