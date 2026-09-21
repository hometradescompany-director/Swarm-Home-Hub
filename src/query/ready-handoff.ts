import type { AgentReference, CapabilityRef, OfferingRef } from "../domain/agent.js";
import type { RelationalContextRef } from "../domain/relational-context.js";
import type { Habitat } from "../domain/habitat.js";
import type { ResidenceSnapshot } from "../domain/residence.js";
import type { ResidenceHeartbeat } from "./residence-heartbeat.js";

export interface ReadyHandoffCapsule {
  readonly residenceId: string;
  readonly agentIdentityRef: string;
  readonly habitatId: string;
  readonly capabilityRefs: readonly CapabilityRef[];
  readonly offeringRefs: readonly OfferingRef[];
  /**
   * Opaque Atlas-owned contextual references. Swarm never interprets these as
   * authority and never expands them into raw human communications.
   */
  readonly relationalContextRefs: readonly RelationalContextRef[];
  readonly lastResidenceEventId: string;
  readonly generatedAt: string;
}

export interface CurrentReadyHandoffCapsule extends ReadyHandoffCapsule {
  readonly readinessObservedAt: string;
  readonly heartbeatEvaluatedAt: string;
  readonly staleAfterMs: number;
  readonly freshUntil: string;
}

function freezeReadyHandoffCapsule<T extends ReadyHandoffCapsule>(handoff: T): T {
  const frozen = {
    ...handoff,
    capabilityRefs: Object.freeze([...handoff.capabilityRefs]),
    offeringRefs: Object.freeze([...handoff.offeringRefs]),
    relationalContextRefs: Object.freeze([...handoff.relationalContextRefs])
  };

  return Object.freeze(frozen) as T;
}

export function projectReadyHandoff(
  residence: ResidenceSnapshot,
  agent: AgentReference,
  generatedAt: string,
  relationalContextRefs: readonly RelationalContextRef[] = []
): ReadyHandoffCapsule {
  if (residence.status !== "ready") {
    throw new Error(`handoff requires a ready residence, got ${residence.status}`);
  }
  if (agent.identityRef !== residence.agentIdentityRef) {
    throw new Error("handoff identity does not match residence identity");
  }
  if (!Number.isFinite(Date.parse(generatedAt))) {
    throw new Error("handoff generation time must be a valid ISO-8601 value");
  }
  if (relationalContextRefs.some((ref) => !String(ref).trim())) {
    throw new Error("relational context refs must be non-empty opaque references");
  }

  return freezeReadyHandoffCapsule({
    residenceId: residence.residenceId,
    agentIdentityRef: residence.agentIdentityRef,
    habitatId: residence.habitatId,
    capabilityRefs: agent.capabilityRefs,
    offeringRefs: agent.offeringRefs,
    relationalContextRefs,
    lastResidenceEventId: residence.lastEventId,
    generatedAt
  });
}

export function projectCurrentReadyHandoff(
  residence: ResidenceSnapshot,
  agent: AgentReference,
  heartbeat: ResidenceHeartbeat,
  generatedAt: string,
  relationalContextRefs: readonly RelationalContextRef[] = []
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
  if (!Number.isFinite(heartbeat.staleAfterMs) || heartbeat.staleAfterMs < 0) {
    throw new Error("handoff heartbeat freshness threshold must be a non-negative finite number");
  }
  const derivedFreshUntilMs = observedMs + heartbeat.staleAfterMs;
  if (!Number.isFinite(derivedFreshUntilMs) || derivedFreshUntilMs !== freshUntilMs) {
    throw new Error("handoff heartbeat freshness boundary is inconsistent with its observation and policy");
  }
  const derivedAgeMs = evaluatedMs - observedMs;
  if (heartbeat.ageMs !== derivedAgeMs) {
    throw new Error("handoff heartbeat age is inconsistent with its observation and evaluation times");
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

  return freezeReadyHandoffCapsule({
    ...projectReadyHandoff(residence, agent, generatedAt, relationalContextRefs),
    readinessObservedAt: heartbeat.lastObservedAt,
    heartbeatEvaluatedAt: heartbeat.evaluatedAt,
    staleAfterMs: heartbeat.staleAfterMs,
    freshUntil: heartbeat.freshUntil
  });
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

export type CurrentReadyHandoffRefusalCode =
  | "invalid_timestamp"
  | "capsule_inconsistent"
  | "checked_before_generation"
  | "expired"
  | "residence_mismatch"
  | "identity_mismatch"
  | "habitat_mismatch"
  | "freshness_policy_changed"
  | "habitat_not_open"
  | "source_event_superseded"
  | "residence_not_ready";

export type CurrentReadyHandoffValidation =
  | { readonly usable: true }
  | {
      readonly usable: false;
      readonly code: CurrentReadyHandoffRefusalCode;
      readonly message: string;
    };

export function validateCurrentReadyHandoff(
  handoff: CurrentReadyHandoffCapsule,
  currentResidence: ResidenceSnapshot,
  currentHabitat: Habitat,
  now: string
): CurrentReadyHandoffValidation {
  const nowMs = Date.parse(now);
  const generatedMs = Date.parse(handoff.generatedAt);
  const readinessObservedMs = Date.parse(handoff.readinessObservedAt);
  const heartbeatEvaluatedMs = Date.parse(handoff.heartbeatEvaluatedAt);
  const freshUntilMs = Date.parse(handoff.freshUntil);

  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(generatedMs) ||
    !Number.isFinite(readinessObservedMs) ||
    !Number.isFinite(heartbeatEvaluatedMs) ||
    !Number.isFinite(freshUntilMs)
  ) {
    return {
      usable: false,
      code: "invalid_timestamp",
      message: "handoff freshness timestamps must be valid ISO-8601 values"
    };
  }
  if (!Number.isFinite(handoff.staleAfterMs) || handoff.staleAfterMs < 0) {
    return {
      usable: false,
      code: "capsule_inconsistent",
      message: "handoff capsule freshness threshold is invalid"
    };
  }
  const derivedFreshUntilMs = readinessObservedMs + handoff.staleAfterMs;
  if (
    !Number.isFinite(derivedFreshUntilMs) ||
    derivedFreshUntilMs !== freshUntilMs
  ) {
    return {
      usable: false,
      code: "capsule_inconsistent",
      message: "handoff capsule freshness boundary is inconsistent with its readiness observation and policy"
    };
  }
  if (heartbeatEvaluatedMs !== generatedMs) {
    return {
      usable: false,
      code: "capsule_inconsistent",
      message: "handoff capsule heartbeat evaluation time does not match generation time"
    };
  }
  if (generatedMs < readinessObservedMs) {
    return {
      usable: false,
      code: "capsule_inconsistent",
      message: "handoff capsule was generated before its readiness observation"
    };
  }
  if (nowMs < generatedMs) {
    return {
      usable: false,
      code: "checked_before_generation",
      message: "handoff cannot be checked before it was generated"
    };
  }
  if (nowMs > freshUntilMs) {
    return {
      usable: false,
      code: "expired",
      message: "handoff freshness has expired"
    };
  }
  if (handoff.residenceId !== currentResidence.residenceId) {
    return {
      usable: false,
      code: "residence_mismatch",
      message: "handoff does not belong to the current residence"
    };
  }
  if (handoff.agentIdentityRef !== currentResidence.agentIdentityRef) {
    return {
      usable: false,
      code: "identity_mismatch",
      message: "handoff identity does not match the current residence"
    };
  }
  if (
    handoff.habitatId !== currentResidence.habitatId ||
    currentHabitat.id !== currentResidence.habitatId
  ) {
    return {
      usable: false,
      code: "habitat_mismatch",
      message: "handoff habitat does not match the current residence and habitat policy"
    };
  }
  if (handoff.staleAfterMs !== currentHabitat.heartbeatStaleAfterMs) {
    return {
      usable: false,
      code: "freshness_policy_changed",
      message: "handoff freshness policy has changed since generation"
    };
  }
  if (currentHabitat.status !== "open") {
    return {
      usable: false,
      code: "habitat_not_open",
      message: `handoff habitat is not open: ${currentHabitat.id}`
    };
  }
  if (handoff.lastResidenceEventId !== currentResidence.lastEventId) {
    return {
      usable: false,
      code: "source_event_superseded",
      message: "handoff source residence event has been superseded"
    };
  }
  if (currentResidence.status !== "ready") {
    return {
      usable: false,
      code: "residence_not_ready",
      message: `handoff requires the current residence to remain ready, got ${currentResidence.status}`
    };
  }

  return { usable: true };
}

export function assertCurrentReadyHandoffUsable(
  handoff: CurrentReadyHandoffCapsule,
  currentResidence: ResidenceSnapshot,
  currentHabitat: Habitat,
  now: string
): void {
  const validation = validateCurrentReadyHandoff(
    handoff,
    currentResidence,
    currentHabitat,
    now
  );
  if (!validation.usable) {
    throw new Error(validation.message);
  }
}
