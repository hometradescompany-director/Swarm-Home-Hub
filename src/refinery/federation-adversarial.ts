import {
  qualifyExternalFederationPeer,
  type ExternalFederationPeerObservation,
  type FederationPeerQualification,
} from "../policy/federation-peer-qualification.js";

export type AdversarialFederationFinding =
  | "shared_mutable_truth_observed"
  | "implicit_authority_transfer_observed"
  | "handshake_evidence_missing";

export type AdversarialFederationDecision =
  | { readonly survived: false; readonly finding: AdversarialFederationFinding }
  | { readonly survived: true; readonly qualification: FederationPeerQualification };

export function adversariallyQualifyFederationPeer(
  observation: ExternalFederationPeerObservation
): AdversarialFederationDecision {
  if (observation.stateModel === "shared_mutable") {
    return { survived: false, finding: "shared_mutable_truth_observed" };
  }
  if (observation.authorityModel === "implicit_transfer") {
    return { survived: false, finding: "implicit_authority_transfer_observed" };
  }
  if (!observation.handshakeEvidenceRef?.trim()) {
    return { survived: false, finding: "handshake_evidence_missing" };
  }
  return {
    survived: true,
    qualification: qualifyExternalFederationPeer(observation),
  };
}
