export type ExternalPrincipalExecutionPosture =
  | "worker"
  | "principal_only"
  | "unknown";

export type ExternalPrincipalExecutionRefusalReason =
  | "principal_not_worker"
  | "worker_posture_unknown";

export interface ExternalPrincipalExecutionObservation {
  readonly identityRef: string;
  readonly posture: ExternalPrincipalExecutionPosture;
  readonly evidenceReceiptIds: readonly string[];
  readonly observedAt: string;
}

export interface ExternalPrincipalExecutionQualification {
  readonly identityRef: string;
  readonly posture: ExternalPrincipalExecutionPosture;
  readonly schedulable: boolean;
  readonly refusalReason?: ExternalPrincipalExecutionRefusalReason;
  readonly evidenceReceiptIds: readonly string[];
  readonly observedAt: string;
  /**
   * Authentication or API access never becomes execution authority by itself.
   */
  readonly authorityImplication: "none";
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function refs(values: readonly string[]): readonly string[] {
  return Object.freeze(
    values.map((value, index) =>
      nonBlank(value, "evidenceReceiptIds[" + index + "]")
    )
  );
}

/**
 * Project whether an observed external identity may be treated as a worker.
 *
 * This owns no identity registry. It preserves the distinction between an API
 * principal that may authenticate and an executor that may receive work.
 */
export function qualifyExternalPrincipalForExecution(
  observation: ExternalPrincipalExecutionObservation
): ExternalPrincipalExecutionQualification {
  if (!Number.isFinite(Date.parse(observation.observedAt))) {
    throw new Error("observedAt must be a valid ISO-8601 value");
  }

  const identityRef = nonBlank(observation.identityRef, "identityRef");
  const evidenceReceiptIds = refs(observation.evidenceReceiptIds);

  if (observation.posture === "worker") {
    return Object.freeze({
      identityRef,
      posture: observation.posture,
      schedulable: true,
      evidenceReceiptIds,
      observedAt: observation.observedAt,
      authorityImplication: "none"
    });
  }

  return Object.freeze({
    identityRef,
    posture: observation.posture,
    schedulable: false,
    refusalReason:
      observation.posture === "principal_only"
        ? "principal_not_worker"
        : "worker_posture_unknown",
    evidenceReceiptIds,
    observedAt: observation.observedAt,
    authorityImplication: "none"
  });
}
