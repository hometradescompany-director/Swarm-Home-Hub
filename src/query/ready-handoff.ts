import type { AgentReference, CapabilityRef, OfferingRef } from "../domain/agent.js";
import type { ResidenceSnapshot } from "../domain/residence.js";
import type { ResidenceHeartbeat } from "./residence-heartbeat.js";

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

export function projectCurrentReadyHandoff(
  residence: ResidenceSnapshot,
  agent: AgentReference,
  heartbeat: ResidenceHeartbeat,
  generatedAt: string
): ReadyHandoffCapsule {
  if (heartbeat.residenceId !== residence.residenceId) {
    throw new Error("handoff heartbeat does not belong to residence");
  }
  if (heartbeat.lastEventId !== residence.lastEventId) {
    throw new Error("handoff heartbeat is based on a different residence event");
  }
  if (heartbeat.state !== "current") {
    throw new Error(`handoff requires current residence heartbeat, got ${heartbeat.state}`);
  }
  if (heartbeat.status !== "ready") {
    throw new Error(`handoff heartbeat must report ready status, got ${heartbeat.status ?? "unknown"}`);
  }
  if (!heartbeat.lastObservedAt) {
    throw new Error("handoff heartbeat is missing its last observation time");
  }

  const generatedMs = Date.parse(generatedAt);
  const observedMs = Date.parse(heartbeat.lastObservedAt);
  const evaluatedMs = Date.parse(heartbeat.evaluatedAt);
  if (
    !Number.isFinite(generatedMs) ||
    !Number.isFinite(observedMs) ||
    !Number.isFinite(evaluatedMs)
  ) {
    throw new Error("handoff timestamps must be valid ISO-8601 values");
  }
  if (generatedMs < observedMs) {
    throw new Error("handoff cannot be generated before the readiness observation");
  }
  if (generatedMs !== evaluatedMs) {
    throw new Error("handoff must be generated at the heartbeat evaluation time");
  }

  return projectReadyHandoff(residence, agent, generatedAt);
}
