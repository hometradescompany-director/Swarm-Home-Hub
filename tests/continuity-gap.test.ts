import { describe, expect, it } from "vitest";
import { projectContinuityGapCandidates } from "../src/observability/continuity-gap.js";
import type { AuditTimelineEntry } from "../src/observability/audit-timeline.js";

const entry = (sequence: number, receiptId: string, capturedAt: string): AuditTimelineEntry => ({
  sequence,
  subjectRef: "repo:x",
  category: "protocol",
  receiptId,
  sourceRef: "source:" + receiptId,
  capturedAt,
  standing: "source_record",
  relatedRefs: [],
});

describe("continuity gap candidates", () => {
  it("marks an interval as a candidate rather than claiming missing history", () => {
    expect(projectContinuityGapCandidates([
      entry(1,"receipt:a","2026-09-22T00:00:00.000Z"),
      entry(2,"receipt:b","2026-09-22T00:10:00.000Z"),
    ],60_000)).toEqual([{
      subjectRef: "repo:x",
      beforeReceiptId: "receipt:a",
      afterReceiptId: "receipt:b",
      gapMs: 600_000,
      thresholdMs: 60_000,
      standing: "candidate_gap",
    }]);
  });
});
