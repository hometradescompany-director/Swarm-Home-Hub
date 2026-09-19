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

export interface CurrentReadyHandoffCapsule extends ReadyHandoffCapsule {
  readonly readinessObservedAt: string;
  readonly heartbeatEvaluatedAt: string;
  readonly freshUntil: string;
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
): CurrentReadyHandoffCapsule {
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
  if (!heartbeat.freshUntil) {
    throw new Error("handoff heartbeat is missing its freshness boundary");
  }

  const generatedMs = Date.parse(generatedAt);
  const observedMs = Date.parse(heartbeat.lastObservedAt);
  const evaluatedMs = Date.parse(heartbeat.evaluatedAt);
  const freshUntilMs = Date.parse(heartbeat.freshUntil);
  if (
    !Number.isFinite(generatedMs) ||
    !Number.isFinite(observedMs) ||
    !Number.isFinite(evaluatedMs) ||
    !Number.isFinite(freshUntilMs)
  ) {
    throw new Error("handoff timestamps must be valid ISO-8601 values");
  }
  if (generatedMs < observedMs) {
    throw new Error("handoff cannot be generated before the readiness observation");
  }
  if (generatedMs !== evaluatedMs) {
    throw new Error("handoff must be generated at the heartbeat evaluation time");
  }
  if (generatedMs > freshUntilMs) {
    throw new Error("handoff cannot be generated after the heartbeat freshness boundary");
  }

  return {
    ...projectReadyHandoff(residence, agent, generatedAt),
    readinessObservedAt: heartbeat.lastObservedAt,
    heartbeatEvaluatedAt: heartbeat.evaluatedAt,
    freshUntil: heartbeat.freshUntil
  };
}

export function assertCurrentReadyHandoffFresh(
  handoff: CurrentReadyHandoffCapsule,
  now: string
): void {
  const nowMs = Date.parse(now);
  const generatedMs = Date.parse(handoff.generatedAt);
  const freshUntilMs = Date.parse(handoff.freshUntil);

  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(generatedMs) ||
    !Number.isFinite(freshUntilMs)
  ) {
    throw new Error("handoff freshness timestamps must be valid ISO-8601 values");
  }
  if (nowMs < generatedMs) {
    throw new Error("handoff cannot be checked before it was generated");
  }
  if (nowMs > freshUntilMs) {
    throw new Error("handoff freshness has expired");
  }
}

export function assertCurrentReadyHandoffUsable(
  handoff: CurrentReadyHandoffCapsule,
  currentResidence: ResidenceSnapshot,
  now: string
): void {
  assertCurrentReadyHandoffFresh(handoff, now);

  if (handoff.residenceId !== currentResidence.residenceId) {
    throw new Error("handoff does not belong to the current residence");
  }
  if (handoff.agentIdentityRef !== currentResidence.agentIdentityRef) {
    throw new Error("handoff identity does not match the current residence");
  }
  if (handoff.habitatId !== currentResidence.habitatId) {
    throw new Error("handoff habitat does not match the current residence");
  }
  if (handoff.lastResidenceEventId !== currentResidence.lastEventId) {
    throw new Error("handoff source residence event has been superseded");
  }
  if (currentResidence.status !== "ready") {
    throw new Error(`handoff requires the current residence to remain ready, got ${currentResidence.status}`);
  }
}
