// Swarm Home — human state / workflow intent boundary.
//
// A human report about their condition, circumstances, emotion, pain, load or
// situation is an observation about state. It MUST NOT be silently converted
// into workflow intent.
//
// Example:
//   "I am in severe pain" != "cancel my appointment"
//
// Swarm Home may preserve the observation and route an escalation when a
// caller has already classified it as actionable, but workflow mutation
// requires separate explicit intent evidence.

export type WorkflowIntent =
  | "continue"
  | "cancel"
  | "reschedule"
  | "pause"
  | "other";

export type HumanSignalEscalation =
  | "none"
  | "route"
  | "capability_gap";

export interface HumanStateIntentInput {
  /** The human supplied information about their own current state. */
  humanStateReported: boolean;

  /**
   * Workflow intent must be explicit. A state report can never populate this
   * field by inference.
   */
  explicitWorkflowIntent?: WorkflowIntent | null;

  /**
   * Upstream classification only. This module does not diagnose severity or
   * decide whether escalation is clinically, legally or morally required.
   */
  requiresEscalation: boolean;

  /** Whether the system has a valid escalation route available. */
  routingCapabilityAvailable: boolean;

  /** Whether the receiving role may invoke that route. */
  receivingRoleCanRoute: boolean;
}

export interface HumanStateIntentDecision {
  preserveHumanStateObservation: boolean;
  workflowIntent: WorkflowIntent | null;
  escalation: HumanSignalEscalation;
  explanation: string;
}

export function separateHumanStateFromWorkflowIntent(
  input: HumanStateIntentInput,
): HumanStateIntentDecision {
  const workflowIntent = input.explicitWorkflowIntent ?? null;

  let escalation: HumanSignalEscalation = "none";
  if (input.requiresEscalation) {
    escalation =
      input.routingCapabilityAvailable && input.receivingRoleCanRoute
        ? "route"
        : "capability_gap";
  }

  return {
    preserveHumanStateObservation: input.humanStateReported,
    workflowIntent,
    escalation,
    explanation:
      input.humanStateReported && workflowIntent === null
        ? "Human state was reported without explicit workflow intent; preserve the observation and do not infer cancellation, rescheduling or any other workflow mutation."
        : "Human state and workflow intent remain separate inputs; only explicit intent may mutate workflow.",
  };
}
