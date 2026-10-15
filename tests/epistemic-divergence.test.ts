import { describe, expect, it } from "vitest";

import {
  projectEpistemicDivergence,
  SWARM_EPISTEMIC_DIVERGENCE_PROJECTION,
} from "../src/observability/epistemic-divergence.js";

describe("epistemic divergence topology", () => {
  it("keeps a clear observation set non-authoritative", () => {
    expect(projectEpistemicDivergence([])).toEqual({
      schema: SWARM_EPISTEMIC_DIVERGENCE_PROJECTION,
      standing: "clear",
      observations: [],
      layers: [],
      recommendedChecks: [],
      scalarScore: null,
      establishesTruth: false,
      diagnosesHumanState: false,
      grantsAuthority: false,
      mutatesWorkflow: false,
    });
  });

  it("maps attention narrowing to an interruptible evidence check", () => {
    expect(
      projectEpistemicDivergence([
        {
          signal: "attention_narrowing",
          sourceRef: "receipt:attention-1",
          observedAt: "2026-09-24T05:50:00+10:00",
        },
      ]),
    ).toMatchObject({
      standing: "divergence_observed",
      layers: ["attention"],
      recommendedChecks: ["widen_attention"],
      scalarScore: null,
      establishesTruth: false,
      grantsAuthority: false,
    });
  });

  it("preserves distinct perception, confidence, and social layers instead of collapsing them into hallucination", () => {
    expect(
      projectEpistemicDivergence([
        {
          signal: "social_reinforcement_without_independent_evidence",
          sourceRef: "receipt:social-1",
          observedAt: "2026-09-24T05:51:00+10:00",
        },
        {
          signal: "unsupported_observation_content",
          sourceRef: "receipt:observation-1",
          observedAt: "2026-09-24T05:51:01+10:00",
        },
        {
          signal: "confidence_inflation",
          sourceRef: "receipt:confidence-1",
          observedAt: "2026-09-24T05:51:02+10:00",
        },
      ]),
    ).toMatchObject({
      layers: ["perception_input", "confidence", "social"],
      recommendedChecks: [
        "seek_external_observation",
        "recalibrate_confidence",
        "seek_independent_evidence",
      ],
      scalarScore: null,
    });
  });

  it("keeps simulation separate from intent, authority, and action", () => {
    expect(
      projectEpistemicDivergence([
        {
          signal: "simulation_to_execution_leak",
          sourceRef: "receipt:sandbox-boundary-1",
          observedAt: "2026-09-24T05:52:00+10:00",
        },
      ]),
    ).toMatchObject({
      layers: ["authority_action"],
      recommendedChecks: [
        "separate_simulation_intent_authority_and_action",
      ],
      grantsAuthority: false,
      mutatesWorkflow: false,
    });
  });

  it("requires attributable source and observation time", () => {
    expect(() =>
      projectEpistemicDivergence([
        {
          signal: "semantic_drift",
          sourceRef: "   ",
          observedAt: "2026-09-24T05:53:00+10:00",
        },
      ]),
    ).toThrow("requires sourceRef");

    expect(() =>
      projectEpistemicDivergence([
        {
          signal: "semantic_drift",
          sourceRef: "receipt:semantic-1",
          observedAt: "not-a-time",
        },
      ]),
    ).toThrow("requires valid observedAt");
  });
});
