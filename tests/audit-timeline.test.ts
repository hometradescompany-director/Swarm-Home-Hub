import { describe, expect, it } from "vitest";
import { projectAuditTimeline } from "../src/observability/audit-timeline.js";
import type { ExternalObservationProjection } from "../src/observability/external-observation.js";

const item = (receiptId: string, capturedAt: string): ExternalObservationProjection => ({
  subjectRef: "repo:x",
  category: "protocol",
  receiptId,
  sourceRef: "source:" + receiptId,
  capturedAt,
  standing: "source_record",
  relatedRefs: [],
});

describe("audit timeline", () => {
  it("orders by capture time and stable receipt identity", () => {
    expect(projectAuditTimeline([
      item("receipt:b","2026-09-22T00:01:00.000Z"),
      item("receipt:a","2026-09-22T00:00:00.000Z"),
    ]).map((entry) => [entry.sequence, entry.receiptId])).toEqual([
      [1,"receipt:a"],
      [2,"receipt:b"],
    ]);
  });

  it("refuses duplicate receipt identities", () => {
    expect(() => projectAuditTimeline([
      item("receipt:a","2026-09-22T00:00:00.000Z"),
      item("receipt:a","2026-09-22T00:01:00.000Z"),
    ])).toThrow("duplicate receiptId");
  });
});
