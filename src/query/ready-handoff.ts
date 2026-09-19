import type { AgentReference, CapabilityRef, OfferingRef } from "../domain/agent.js";
import type { ResidenceSnapshot } from "../domain/residence.js";

export interface ReadyHandoffCapsule {
  readonly residenceId: string;
  readonly agentIdentityRef: string;
  readonly habitatId: string;
  readonly capabilityRefs: readonly CapabilityRef[];
  readonly offeringRefs: readonly OfferingRef[];
  readonly lastResidenceEventId: string;
  readonly generatedAt: string;
}

export function projectReadyHandoff(
  residence: ResidenceSnapshot,
  agent: AgentReference,
  generatedAt: string
): ReadyHandoffCapsule {
  if (residence.status !== "ready") {
    throw new Error(`handoff requires a ready residence, got ${residence.status}`);
  }
  if (agent.identityRef !== residence.agentIdentityRef) {
    throw new Error("handoff identity does not match residence identity");
  }

  return {
    residenceId: residence.residenceId,
    agentIdentityRef: residence.agentIdentityRef,
    habitatId: residence.habitatId,
    capabilityRefs: [...agent.capabilityRefs],
    offeringRefs: [...agent.offeringRefs],
    lastResidenceEventId: residence.lastEventId,
    generatedAt
  };
}
