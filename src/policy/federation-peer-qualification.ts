import { SWARM_HOME_FEDERATION_PROTOCOL } from "../domain/federation.js";

export type FederationCandidateStateModel =
  | "independent"
  | "shared_mutable"
  | "unknown";

export type FederationCandidateAuthorityModel =
  | "bounded_explicit"
  | "implicit_transfer"
  | "unknown";

export interface ExternalFederationPeerObservation {
  readonly candidateRef: string;
  readonly protocolVersion?: string;
  readonly protocolEvidenceRef?: string;
  readonly handshakeEvidenceRef?: string;
  readonly stateModel: FederationCandidateStateModel;
  readonly stateBoundaryEvidenceRef?: string;
  readonly authorityModel: FederationCandidateAuthorityModel;
  readonly authorityBoundaryEvidenceRef?: string;
  readonly observedAt: string;
}

export type FederationPeerQualificationRefusalReason =
  | "missing_protocol_evidence"
  | "unsupported_protocol"
  | "missing_handshake_evidence"
  | "state_boundary_unknown"
  | "shared_mutable_truth"
  | "authority_boundary_unknown"
  | "implicit_authority_transfer";

export interface FederationPeerQualified {
  readonly qualified: true;
  readonly candidateRef: string;
  readonly protocolVersion: typeof SWARM_HOME_FEDERATION_PROTOCOL;
  readonly evidenceRefs: readonly string[];
  readonly observedAt: string;
}

export interface FederationPeerNotQualified {
  readonly qualified: false;
  readonly candidateRef: string;
  readonly reason: FederationPeerQualificationRefusalReason;
  readonly evidenceRefs: readonly string[];
  readonly observedAt: string;
}

export type FederationPeerQualification =
  | FederationPeerQualified
  | FederationPeerNotQualified;

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function optionalRef(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function validTime(value: string): string {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error("observedAt must be a valid ISO-8601 value");
  }
  return value;
}

function evidenceRefs(
  observation: ExternalFederationPeerObservation
): readonly string[] {
  return Object.freeze(
    [
      optionalRef(observation.protocolEvidenceRef),
      optionalRef(observation.handshakeEvidenceRef),
      optionalRef(observation.stateBoundaryEvidenceRef),
      optionalRef(observation.authorityBoundaryEvidenceRef),
    ].filter((value): value is string => value !== undefined)
  );
}

function notQualified(
  observation: ExternalFederationPeerObservation,
  reason: FederationPeerQualificationRefusalReason
): FederationPeerNotQualified {
  return Object.freeze({
    qualified: false,
    candidateRef: nonBlank(observation.candidateRef, "candidateRef"),
    reason,
    evidenceRefs: evidenceRefs(observation),
    observedAt: validTime(observation.observedAt),
  });
}

/**
 * Classify whether an observed external runtime has earned the stronger
 * "SwarmHomeFederation/v1 peer" label.
 *
 * This is an evidence gate only. It owns no remote state, creates no authority,
 * performs no handshake, and does not turn transport compatibility into
 * federation status.
 */
export function qualifyExternalFederationPeer(
  observation: ExternalFederationPeerObservation
): FederationPeerQualification {
  const candidateRef = nonBlank(observation.candidateRef, "candidateRef");
  const observedAt = validTime(observation.observedAt);
  const protocolEvidenceRef = optionalRef(observation.protocolEvidenceRef);
  const handshakeEvidenceRef = optionalRef(observation.handshakeEvidenceRef);
  const stateBoundaryEvidenceRef = optionalRef(
    observation.stateBoundaryEvidenceRef
  );
  const authorityBoundaryEvidenceRef = optionalRef(
    observation.authorityBoundaryEvidenceRef
  );

  if (!observation.protocolVersion || !protocolEvidenceRef) {
    return notQualified(observation, "missing_protocol_evidence");
  }

  if (observation.protocolVersion !== SWARM_HOME_FEDERATION_PROTOCOL) {
    return notQualified(observation, "unsupported_protocol");
  }

  if (!handshakeEvidenceRef) {
    return notQualified(observation, "missing_handshake_evidence");
  }

  if (
    observation.stateModel === "unknown" ||
    !stateBoundaryEvidenceRef
  ) {
    return notQualified(observation, "state_boundary_unknown");
  }

  if (observation.stateModel === "shared_mutable") {
    return notQualified(observation, "shared_mutable_truth");
  }

  if (
    observation.authorityModel === "unknown" ||
    !authorityBoundaryEvidenceRef
  ) {
    return notQualified(observation, "authority_boundary_unknown");
  }

  if (observation.authorityModel === "implicit_transfer") {
    return notQualified(observation, "implicit_authority_transfer");
  }

  return Object.freeze({
    qualified: true,
    candidateRef,
    protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
    evidenceRefs: Object.freeze([
      protocolEvidenceRef,
      handshakeEvidenceRef,
      stateBoundaryEvidenceRef,
      authorityBoundaryEvidenceRef,
    ]),
    observedAt,
  });
}
