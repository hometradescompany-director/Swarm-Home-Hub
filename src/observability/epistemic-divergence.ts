/**
 * Epistemic divergence topology.
 *
 * Swarm owns only this local, read-only projection over caller-supplied
 * observations. It does not decide truth, diagnose a person, mutate workflow,
 * or grant authority. Atlas remains the owner of epistemic promotion.
 *
 * A single "hallucination score" would collapse distinct failure shapes.
 * Preserve the vector instead.
 */

export const SWARM_EPISTEMIC_DIVERGENCE_PROJECTION =
  "SwarmEpistemicDivergenceProjection/v1" as const;

export const EPISTEMIC_DIVERGENCE_LAYERS = [
  "perception_input",
  "attention",
  "salience",
  "retrieval_memory",
  "representation",
  "provenance_temporal",
  "inference",
  "confidence",
  "social",
  "authority_action",
] as const;

export type EpistemicDivergenceLayer =
  (typeof EPISTEMIC_DIVERGENCE_LAYERS)[number];

export const EPISTEMIC_DIVERGENCE_SIGNALS = [
  "unsupported_observation_content",
  "attention_narrowing",
  "salience_overweighting",
  "retrieval_omission",
  "memory_confabulation",
  "context_collision",
  "semantic_drift",
  "provenance_break",
  "temporal_misalignment",
  "unsupported_bridge",
  "interpretation_lock",
  "contradiction_suppression",
  "confidence_inflation",
  "social_reinforcement_without_independent_evidence",
  "simulation_to_execution_leak",
] as const;

export type EpistemicDivergenceSignal =
  (typeof EPISTEMIC_DIVERGENCE_SIGNALS)[number];

export const EPISTEMIC_REEVALUATION_CHECKS = [
  "seek_external_observation",
  "widen_attention",
  "compare_salience_with_evidence",
  "recover_missing_context",
  "preserve_source_meaning_and_scope",
  "restore_provenance_and_time",
  "generate_alternatives_and_falsifiers",
  "recalibrate_confidence",
  "seek_independent_evidence",
  "separate_simulation_intent_authority_and_action",
] as const;

export type EpistemicReevaluationCheck =
  (typeof EPISTEMIC_REEVALUATION_CHECKS)[number];

export interface EpistemicDivergenceObservation {
  /** What was observed to have diverged. This is not a diagnosis. */
  readonly signal: EpistemicDivergenceSignal;
  /** Opaque source/evidence pointer owned elsewhere. */
  readonly sourceRef: string;
  /** When this signal was observed, not when the underlying thing became true. */
  readonly observedAt: string;
}

export interface EpistemicDivergenceProjection {
  readonly schema: typeof SWARM_EPISTEMIC_DIVERGENCE_PROJECTION;
  readonly standing: "clear" | "divergence_observed";
  readonly observations: readonly EpistemicDivergenceObservation[];
  readonly layers: readonly EpistemicDivergenceLayer[];
  readonly recommendedChecks: readonly EpistemicReevaluationCheck[];
  /** Deliberately absent: dimensions are not collapsed into one magic number. */
  readonly scalarScore: null;
  readonly establishesTruth: false;
  readonly diagnosesHumanState: false;
  readonly grantsAuthority: false;
  readonly mutatesWorkflow: false;
}

const SIGNAL_LAYER: Record<
  EpistemicDivergenceSignal,
  EpistemicDivergenceLayer
> = {
  unsupported_observation_content: "perception_input",
  attention_narrowing: "attention",
  salience_overweighting: "salience",
  retrieval_omission: "retrieval_memory",
  memory_confabulation: "retrieval_memory",
  context_collision: "representation",
  semantic_drift: "representation",
  provenance_break: "provenance_temporal",
  temporal_misalignment: "provenance_temporal",
  unsupported_bridge: "inference",
  interpretation_lock: "inference",
  contradiction_suppression: "inference",
  confidence_inflation: "confidence",
  social_reinforcement_without_independent_evidence: "social",
  simulation_to_execution_leak: "authority_action",
};

const LAYER_CHECK: Record<
  EpistemicDivergenceLayer,
  EpistemicReevaluationCheck
> = {
  perception_input: "seek_external_observation",
  attention: "widen_attention",
  salience: "compare_salience_with_evidence",
  retrieval_memory: "recover_missing_context",
  representation: "preserve_source_meaning_and_scope",
  provenance_temporal: "restore_provenance_and_time",
  inference: "generate_alternatives_and_falsifiers",
  confidence: "recalibrate_confidence",
  social: "seek_independent_evidence",
  authority_action: "separate_simulation_intent_authority_and_action",
};

function assertObservation(
  observation: EpistemicDivergenceObservation,
): void {
  if (!observation.sourceRef.trim()) {
    throw new Error("epistemic divergence observation requires sourceRef");
  }

  if (!Number.isFinite(Date.parse(observation.observedAt))) {
    throw new Error("epistemic divergence observation requires valid observedAt");
  }
}

export function projectEpistemicDivergence(
  observations: readonly EpistemicDivergenceObservation[],
): EpistemicDivergenceProjection {
  observations.forEach(assertObservation);

  const observedLayers = new Set(
    observations.map((observation) => SIGNAL_LAYER[observation.signal]),
  );

  const layers = EPISTEMIC_DIVERGENCE_LAYERS.filter((layer) =>
    observedLayers.has(layer),
  );

  const recommendedChecks = layers.map((layer) => LAYER_CHECK[layer]);

  return Object.freeze({
    schema: SWARM_EPISTEMIC_DIVERGENCE_PROJECTION,
    standing: observations.length === 0 ? "clear" : "divergence_observed",
    observations: observations.map((observation) => ({ ...observation })),
    layers,
    recommendedChecks,
    scalarScore: null,
    establishesTruth: false,
    diagnosesHumanState: false,
    grantsAuthority: false,
    mutatesWorkflow: false,
  });
}
