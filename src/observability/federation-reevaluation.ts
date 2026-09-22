import type { FederationPeerQualification } from "../policy/federation-peer-qualification.js";
import type { SourceDrift } from "./source-drift.js";
import type { ProtocolDrift } from "./protocol-drift.js";
import type { StateOwnershipDrift } from "./state-ownership-drift.js";
import type { AuthorityDrift } from "./authority-drift.js";
import type { IntegrationPostureDrift } from "./posture-drift.js";

export type FederationReevaluationReason =
  | "source_changed"
  | "protocol_changed"
  | "state_ownership_changed"
  | "authority_changed"
  | "integration_posture_changed";

export interface FederationReevaluationRequirement {
  readonly candidateRef: string;
  readonly priorQualified: boolean;
  readonly priorObservedAt: string;
  readonly required: boolean;
  readonly reasons: readonly FederationReevaluationReason[];
}

export function projectFederationReevaluation(input: {
  readonly previous: FederationPeerQualification;
  readonly sourceDrift?: SourceDrift;
  readonly protocolDrift?: ProtocolDrift;
  readonly stateDrift?: StateOwnershipDrift;
  readonly authorityDrift?: AuthorityDrift;
  readonly postureDrift?: IntegrationPostureDrift;
}): FederationReevaluationRequirement {
  const reasons: FederationReevaluationReason[] = [];
  if (input.sourceDrift && input.sourceDrift.standing !== "unchanged") {
    reasons.push("source_changed");
  }
  if (input.protocolDrift?.changed) reasons.push("protocol_changed");
  if (input.stateDrift?.changed) reasons.push("state_ownership_changed");
  if (input.authorityDrift?.changed) reasons.push("authority_changed");
  if (input.postureDrift?.changed) reasons.push("integration_posture_changed");

  return Object.freeze({
    candidateRef: input.previous.candidateRef,
    priorQualified: input.previous.qualified,
    priorObservedAt: input.previous.observedAt,
    required: reasons.length > 0,
    reasons: Object.freeze(reasons),
  });
}
