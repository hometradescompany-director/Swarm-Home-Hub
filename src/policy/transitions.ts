import type { ResidenceStatus } from "../domain/residence.js";

const allowed: Readonly<Record<ResidenceStatus, readonly ResidenceStatus[]>> = {
  requested: ["admitted", "rejected"],
  admitted: ["resting", "departed"],
  resting: ["ready", "departed"],
  ready: ["resting", "departed"],
  departed: [],
  rejected: []
};

export const SWARM_TRANSITION_INTELLIGENCE_PROJECTION =
  "SwarmTransitionIntelligenceProjection/v1" as const;

export interface TransitionIntelligenceInput {
  readonly currentState: ResidenceStatus;
  readonly proposedState: ResidenceStatus;
  /** Opaque reference to the advisory observation or reasoning source. */
  readonly sourceRef: string;
  /** Observation time for the advice, not event time for a state transition. */
  readonly observedAt: string;
}

export interface TransitionIntelligenceProjection {
  readonly schema: typeof SWARM_TRANSITION_INTELLIGENCE_PROJECTION;
  readonly standing: "advisory";
  readonly currentState: ResidenceStatus;
  readonly proposedState: ResidenceStatus;
  readonly locallyAllowedByTransitionGrammar: boolean;
  readonly sourceRef: string;
  readonly observedAt: string;
  readonly authorityImplication: "none";
  readonly mutatesState: false;
  readonly becomesState: false;
  readonly requiresTransitionEvent: true;
}

export function projectTransitionIntelligence(
  input: TransitionIntelligenceInput
): TransitionIntelligenceProjection {
  const sourceRef = input.sourceRef.trim();
  if (!sourceRef) {
    throw new Error("transition intelligence requires sourceRef");
  }

  if (!Number.isFinite(Date.parse(input.observedAt))) {
    throw new Error("transition intelligence requires valid observedAt");
  }

  return Object.freeze({
    schema: SWARM_TRANSITION_INTELLIGENCE_PROJECTION,
    standing: "advisory",
    currentState: input.currentState,
    proposedState: input.proposedState,
    locallyAllowedByTransitionGrammar: allowed[input.currentState].includes(
      input.proposedState
    ),
    sourceRef,
    observedAt: input.observedAt,
    authorityImplication: "none",
    mutatesState: false,
    becomesState: false,
    requiresTransitionEvent: true
  });
}

export function assertAllowedTransition(from: ResidenceStatus, to: ResidenceStatus): void {
  if (!allowed[from].includes(to)) {
    throw new Error(`invalid residence transition: ${from} -> ${to}`);
  }
}
