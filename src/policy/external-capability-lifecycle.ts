export type ExternalCapabilityLifecycle =
  | "draft"
  | "active"
  | "disabled";

export type ExternalCapabilityExecutionRefusalReason =
  | "draft_is_inert"
  | "capability_disabled"
  | "missing_selected_version"
  | "missing_activation_authority"
  | "missing_activation_evidence";

export interface ExternalCapabilityLifecycleObservation {
  readonly capabilityRef: string;
  readonly creatorIdentityRef: string;
  readonly ownerIdentityRef: string;
  readonly runtimeIdentityRef: string;
  readonly lifecycle: ExternalCapabilityLifecycle;
  readonly selectedVersionRef?: string;
  readonly activationAuthorityRef?: string;
  readonly activationEvidenceReceiptIds: readonly string[];
  readonly observedAt: string;
}

export interface ExternalCapabilityExecutionQualification {
  readonly capabilityRef: string;
  readonly creatorIdentityRef: string;
  readonly ownerIdentityRef: string;
  readonly runtimeIdentityRef: string;
  readonly lifecycle: ExternalCapabilityLifecycle;
  readonly selectedVersionRef?: string;
  readonly activationAuthorityRef?: string;
  readonly activationEvidenceReceiptIds: readonly string[];
  readonly observedAt: string;
  readonly eligible: boolean;
  readonly refusalReasons: readonly ExternalCapabilityExecutionRefusalReason[];
  /**
   * Provider-local activation evidence never becomes Atlas or Swarm authority.
   */
  readonly authorityImplication: "none";
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

function validTime(value: string): string {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error("observedAt must be a valid ISO-8601 value");
  }
  return value;
}

function refs(values: readonly string[]): readonly string[] {
  return Object.freeze(
    values.map((value, index) =>
      nonBlank(value, "activationEvidenceReceiptIds[" + index + "]")
    )
  );
}

/**
 * Evaluate whether an observed external capability is eligible to approach the
 * existing execution-provider boundary.
 *
 * Creation, ownership, and runtime identity stay distinct. An inert draft does
 * not become executable because an agent created it, and provider-local
 * activation never replaces the later Atlas execution-authority decision.
 */
export function qualifyExternalCapabilityForExecution(
  observation: ExternalCapabilityLifecycleObservation
): ExternalCapabilityExecutionQualification {
  const capabilityRef = nonBlank(observation.capabilityRef, "capabilityRef");
  const creatorIdentityRef = nonBlank(
    observation.creatorIdentityRef,
    "creatorIdentityRef"
  );
  const ownerIdentityRef = nonBlank(
    observation.ownerIdentityRef,
    "ownerIdentityRef"
  );
  const runtimeIdentityRef = nonBlank(
    observation.runtimeIdentityRef,
    "runtimeIdentityRef"
  );
  const selectedVersionRef = optionalRef(
    observation.selectedVersionRef,
    "selectedVersionRef"
  );
  const activationAuthorityRef = optionalRef(
    observation.activationAuthorityRef,
    "activationAuthorityRef"
  );
  const activationEvidenceReceiptIds = refs(
    observation.activationEvidenceReceiptIds
  );
  const refusalReasons: ExternalCapabilityExecutionRefusalReason[] = [];

  if (observation.lifecycle === "draft") {
    refusalReasons.push("draft_is_inert");
  } else if (observation.lifecycle === "disabled") {
    refusalReasons.push("capability_disabled");
  } else {
    if (!selectedVersionRef) {
      refusalReasons.push("missing_selected_version");
    }
    if (!activationAuthorityRef) {
      refusalReasons.push("missing_activation_authority");
    }
    if (activationEvidenceReceiptIds.length === 0) {
      refusalReasons.push("missing_activation_evidence");
    }
  }

  return Object.freeze({
    capabilityRef,
    creatorIdentityRef,
    ownerIdentityRef,
    runtimeIdentityRef,
    lifecycle: observation.lifecycle,
    ...(selectedVersionRef ? { selectedVersionRef } : {}),
    ...(activationAuthorityRef ? { activationAuthorityRef } : {}),
    activationEvidenceReceiptIds,
    observedAt: validTime(observation.observedAt),
    eligible: refusalReasons.length === 0,
    refusalReasons: Object.freeze(refusalReasons),
    authorityImplication: "none"
  });
}
