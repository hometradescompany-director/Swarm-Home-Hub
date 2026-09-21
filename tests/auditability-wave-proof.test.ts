import { describe, expect, it } from "vitest";
import { proveAuditabilityWave } from "../src/observability/wave-proof.js";

describe("auditability wave proof", () => {
  it("requires every first-wave observability surface", () => {
    expect(proveAuditabilityWave({
      externalObservations: 1,
      freshnessProjections: 1,
      contradictionScans: 1,
      auditTimelines: 1,
      providerSnapshots: 1,
      providerHeartbeats: 1,
      recoveryCandidateScans: 1,
    })).toEqual({ complete: true, missing: [] });
  });

  it("reports missing proof surfaces", () => {
    const result = proveAuditabilityWave({
      externalObservations: 1,
      freshnessProjections: 0,
      contradictionScans: 1,
      auditTimelines: 1,
      providerSnapshots: 1,
      providerHeartbeats: 1,
      recoveryCandidateScans: 1,
    });
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("freshnessProjections");
  });
});
