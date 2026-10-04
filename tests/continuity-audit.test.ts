import { describe, expect, it } from "vitest";
import { projectContinuityAuditFindings } from "../src/observability/continuity-audit.js";

describe("continuity audit findings", () => {
  it("preserves gap and contradiction evidence as separate finding types", () => {
    const findings = projectContinuityAuditFindings({
      gaps: [{
        subjectRef: "repo:x",
        beforeReceiptId: "receipt:a",
        afterReceiptId: "receipt:b",
        gapMs: 100,
        thresholdMs: 50,
        standing: "candidate_gap",
      }],
      contradictions: [{
        subjectRef: "repo:x",
        claimKey: "authority",
        fingerprints: ["a","b"],
        receiptIds: ["receipt:c","receipt:d"],
      }],
      recoveryOutcomes: [],
    });

    expect(findings.map((finding) => finding.kind)).toEqual([
      "candidate_gap",
      "contradiction",
    ]);
  });
});
