export type IntegrationPosture =
  | "transport_peer"
  | "capability_provider"
  | "reference_implementation"
  | "federation_candidate"
  | "unclassified";

export interface IntegrationPostureEvidence {
  readonly hasProtocolSurface: boolean;
  readonly performsBoundedExternalWork: boolean;
  readonly usefulAsPatternOrFailureReference: boolean;
  readonly claimsSwarmHomeFederationV1: boolean;
  readonly evidenceRefs: readonly string[];
}

export interface IntegrationPostureDecision {
  readonly posture: IntegrationPosture;
  readonly evidenceRefs: readonly string[];
}

export function classifyIntegrationPosture(
  evidence: IntegrationPostureEvidence
): IntegrationPostureDecision {
  const refs = evidence.evidenceRefs.map((ref) => ref.trim()).filter(Boolean);
  const assertsSomething =
    evidence.hasProtocolSurface ||
    evidence.performsBoundedExternalWork ||
    evidence.usefulAsPatternOrFailureReference ||
    evidence.claimsSwarmHomeFederationV1;

  if (assertsSomething && refs.length === 0) {
    throw new Error("classified posture requires evidenceRefs");
  }

  const posture: IntegrationPosture = evidence.claimsSwarmHomeFederationV1
    ? "federation_candidate"
    : evidence.performsBoundedExternalWork
      ? "capability_provider"
      : evidence.hasProtocolSurface
        ? "transport_peer"
        : evidence.usefulAsPatternOrFailureReference
          ? "reference_implementation"
          : "unclassified";

  return Object.freeze({
    posture,
    evidenceRefs: Object.freeze([...new Set(refs)].sort()),
  });
}
