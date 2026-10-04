import { describe, expect, it } from "vitest";
import { projectEvidenceContradictions } from "../src/observability/contradiction-projection.js";

describe("evidence contradiction projection", () => {
  it("preserves both receipt paths for incompatible claims", () => {
    expect(projectEvidenceContradictions([
      {
        subjectRef: "repo:x",
        claimKey: "authority",
        claimFingerprint: "bounded",
        receiptId: "receipt:a",
        capturedAt: "2026-09-22T00:00:00.000Z",
      },
      {
        subjectRef: "repo:x",
        claimKey: "authority",
        claimFingerprint: "implicit",
        receiptId: "receipt:b",
        capturedAt: "2026-09-22T00:01:00.000Z",
      },
    ])).toEqual([{
      subjectRef: "repo:x",
      claimKey: "authority",
      fingerprints: ["bounded", "implicit"],
      receiptIds: ["receipt:a", "receipt:b"],
    }]);
  });
});
