import { describe, expect, it } from "vitest";

import {
  projectTransitionIntelligence,
  SWARM_TRANSITION_INTELLIGENCE_PROJECTION
} from "../src/policy/transitions.js";

describe("transition intelligence stays on the edge", () => {
  it("can identify a locally valid edge without becoming state or authority", () => {
    expect(
      projectTransitionIntelligence({
        currentState: "requested",
        proposedState: "admitted",
        sourceRef: "advice:model-observation-1",
        observedAt: "2026-09-26T03:18:00+10:00"
      })
    ).toEqual({
      schema: SWARM_TRANSITION_INTELLIGENCE_PROJECTION,
      standing: "advisory",
      currentState: "requested",
      proposedState: "admitted",
      locallyAllowedByTransitionGrammar: true,
      sourceRef: "advice:model-observation-1",
      observedAt: "2026-09-26T03:18:00+10:00",
      authorityImplication: "none",
      mutatesState: false,
      becomesState: false,
      requiresTransitionEvent: true
    });
  });

  it("can reject an impossible edge without inventing a transition", () => {
    expect(
      projectTransitionIntelligence({
        currentState: "requested",
        proposedState: "ready",
        sourceRef: "advice:planner-2",
        observedAt: "2026-09-26T03:19:00+10:00"
      })
    ).toMatchObject({
      locallyAllowedByTransitionGrammar: false,
      currentState: "requested",
      proposedState: "ready",
      authorityImplication: "none",
      mutatesState: false,
      becomesState: false
    });
  });

  it("requires attributable source and observation time", () => {
    expect(() =>
      projectTransitionIntelligence({
        currentState: "resting",
        proposedState: "ready",
        sourceRef: "   ",
        observedAt: "2026-09-26T03:20:00+10:00"
      })
    ).toThrow("requires sourceRef");

    expect(() =>
      projectTransitionIntelligence({
        currentState: "resting",
        proposedState: "ready",
        sourceRef: "advice:planner-3",
        observedAt: "not-a-time"
      })
    ).toThrow("requires valid observedAt");
  });
});
