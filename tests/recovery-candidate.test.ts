import { describe, expect, it } from "vitest";
import { projectRecoveryCandidates } from "../src/observability/recovery-candidate.js";

describe("recovery candidate projection", () => {
  it("surfaces stale evidence and contradictions without performing recovery", () => {
    const candidates = projectRecoveryCandidates({
      freshness: [{
        subjectRef: "repo:x",
        state: "stale",
        evaluatedAt: "2026-09-22T01:00:00.000Z",
        lastCapturedAt: "2026-09-22T00:00:00.000Z",
        ageMs: 3_600_000,
        staleAfterMs: 60_000,
        freshUntil: "2026-09-22T00:01:00.000Z",
        receiptId: "receipt:old",
      }],
      contradictions: [{
        subjectRef: "repo:x",
        claimKey: "authority",
        fingerprints: ["bounded","implicit"],
        receiptIds: ["receipt:a","receipt:b"],
      }],
      providerHeartbeats: [],
    });

    expect(candidates.map((candidate) => candidate.kind)).toEqual([
      "reobserve_source",
      "investigate_contradiction",
    ]);
  });
});
