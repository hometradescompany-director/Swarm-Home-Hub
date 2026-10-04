import { describe, expect, it } from "vitest";
import { proveRecoveryWave } from "../src/observability/recovery-wave-proof.js";

describe("recovery wave proof", () => {
  it("requires every recovery and continuity proof surface", () => {
    expect(proveRecoveryWave({
      continuityGapScans: 1,
      recoveryIntents: 1,
      authorityDecisions: 1,
      recoveryOutcomes: 1,
      evidenceComparisons: 1,
      continuityAudits: 1,
      machineInspectionSnapshots: 1,
    })).toEqual({ complete: true, missing: [] });
  });
});
