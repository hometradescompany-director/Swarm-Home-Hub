import { describe, expect, it } from "vitest";
import { projectMachineInspectionSnapshot } from "../src/observability/machine-inspection.js";

describe("machine inspection snapshot", () => {
  it("summarizes observable conditions without becoming a new truth store", () => {
    expect(projectMachineInspectionSnapshot({
      freshness: [{
        subjectRef: "repo:x",
        state: "stale",
        evaluatedAt: "2026-09-22T01:00:00.000Z",
        lastCapturedAt: "2026-09-22T00:00:00.000Z",
        ageMs: 3_600_000,
        staleAfterMs: 60_000,
        freshUntil: "2026-09-22T00:01:00.000Z",
        receiptId: "receipt:x",
      }],
      providerHeartbeats: [],
      findings: [],
      recoveryOutcomes: [],
    })).toMatchObject({
      observedSubjects: 1,
      staleSubjects: ["repo:x"],
      findingCount: 0,
    });
  });
});
