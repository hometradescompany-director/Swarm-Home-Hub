import type { CurrentReadyHandoffCapsule } from "../../query/ready-handoff.js";

export const SWARM_HOME_EXTERNAL_HANDOFF = "SwarmHomeExternalHandoff/v1" as const;

export interface SwarmHomeExternalHandoff {
  readonly schema: typeof SWARM_HOME_EXTERNAL_HANDOFF;
  readonly sourceResidenceRef: string;
  readonly sourceEventRef: string;
  readonly agentIdentityRef: string;
  readonly capabilityRefs: readonly string[];
  readonly offeringRefs: readonly string[];
  readonly relationalContextRefs: readonly string[];
  readonly generatedAt: string;
  readonly freshUntil: string;
  readonly authorityImplication: "none";
}

export interface AgencySwarmHandoffProjection {
  readonly recipient_agent: string;
  readonly message: string;
  readonly additional_instructions: string;
}

export interface LangGraphHandoffProjection {
  readonly goto: string;
  readonly update: Readonly<{
    active_agent: string;
    swarm_home_handoff: SwarmHomeExternalHandoff;
  }>;
}

export interface GenericHandoffPacket {
  readonly kind: "swarm-home-handoff";
  readonly targetRef: string;
  readonly handoff: SwarmHomeExternalHandoff;
}

function nonBlank(value: string, field: string): string {
  if (!value.trim()) {
    throw new Error(field + " must be non-empty");
  }
  return value;
}

export function projectExternalHandoff(
  handoff: CurrentReadyHandoffCapsule
): SwarmHomeExternalHandoff {
  return Object.freeze({
    schema: SWARM_HOME_EXTERNAL_HANDOFF,
    sourceResidenceRef: handoff.residenceId,
    sourceEventRef: handoff.lastResidenceEventId,
    agentIdentityRef: handoff.agentIdentityRef,
    capabilityRefs: Object.freeze([...handoff.capabilityRefs]),
    offeringRefs: Object.freeze([...handoff.offeringRefs]),
    relationalContextRefs: Object.freeze([...handoff.relationalContextRefs]),
    generatedAt: handoff.generatedAt,
    freshUntil: handoff.freshUntil,
    authorityImplication: "none"
  });
}

/**
 * Agency Swarm-compatible projection.
 *
 * The host supplies the target agent and bounded task summary. Swarm Home does
 * not manufacture conversation history or recipient instructions.
 */
export function projectAgencySwarmHandoff(
  handoff: CurrentReadyHandoffCapsule,
  input: {
    readonly recipientAgent: string;
    readonly taskSummary: string;
  }
): AgencySwarmHandoffProjection {
  const envelope = projectExternalHandoff(handoff);
  const recipientAgent = nonBlank(input.recipientAgent, "recipientAgent");
  const taskSummary = nonBlank(input.taskSummary, "taskSummary");

  return Object.freeze({
    recipient_agent: recipientAgent,
    message: taskSummary,
    additional_instructions: JSON.stringify({
      swarmHomeHandoff: envelope
    })
  });
}

/**
 * LangGraph-style projection for hosts using a custom parent/child state schema.
 *
 * It intentionally does not synthesize a messages array. A host that wants to
 * expose conversational history must make that separate disclosure decision.
 */
export function projectLangGraphHandoff(
  handoff: CurrentReadyHandoffCapsule,
  targetAgent: string
): LangGraphHandoffProjection {
  const goto = nonBlank(targetAgent, "targetAgent");
  return Object.freeze({
    goto,
    update: Object.freeze({
      active_agent: goto,
      swarm_home_handoff: projectExternalHandoff(handoff)
    })
  });
}

/**
 * Minimal packet for runtimes that support an opaque handoff payload.
 */
export function projectGenericHandoffPacket(
  handoff: CurrentReadyHandoffCapsule,
  targetRef: string
): GenericHandoffPacket {
  return Object.freeze({
    kind: "swarm-home-handoff",
    targetRef: nonBlank(targetRef, "targetRef"),
    handoff: projectExternalHandoff(handoff)
  });
}
