import { describe, expect, it } from "vitest";
import { proveDriftWave } from "../src/observability/drift-wave-proof.js";

describe("drift wave proof", () => {
  it("requires every drift and reevaluation proof surface", () => {
    expect(proveDriftWave({
      sourceDriftChecks: 1,
      protocolDriftChecks: 1,
      stateDriftChecks: 1,
      authorityDriftChecks: 1,
      postureDriftChecks: 1,
      reevaluationChecks: 1,
      reevaluationIntents: 1,
    })).toEqual({ complete: true, missing: [] });
  });

  it("fails closed when a required proof surface is absent", () => {
    expect(proveDriftWave({
      sourceDriftChecks: 1,
      protocolDriftChecks: 1,
      stateDriftChecks: 1,
      authorityDriftChecks: 1,
      postureDriftChecks: 1,
      reevaluationChecks: 1,
      reevaluationIntents: 0,
    })).toEqual({
      complete: false,
      missing: ["reevaluationIntents"],
    });
  });
});
