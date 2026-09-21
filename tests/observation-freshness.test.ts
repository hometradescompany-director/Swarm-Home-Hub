import { describe, expect, it } from "vitest";
import { projectObservationFreshness } from "../src/observability/observation-freshness.js";
import type { ExternalObservationProjection } from "../src/observability/external-observation.js";

const observation: ExternalObservationProjection = {
  subjectRef: "repo:example",
  category: "protocol",
  receiptId: "receipt:1",
  sourceRef: "source:1",
  capturedAt: "2026-09-22T00:00:00.000Z",
  standing: "source_record",
  relatedRefs: [],
};

describe("observation freshness", () => {
  it("distinguishes current evidence from stale evidence", () => {
    expect(projectObservationFreshness(
      "repo:example",[observation],"2026-09-22T00:00:05.000Z",10_000
    ).state).toBe("current");

    expect(projectObservationFreshness(
      "repo:example",[observation],"2026-09-22T00:00:11.000Z",10_000
    ).state).toBe("stale");
  });

  it("returns unknown when no observation exists", () => {
    expect(projectObservationFreshness(
      "repo:missing",[],"2026-09-22T00:00:00.000Z",10_000
    ).state).toBe("unknown");
  });
});
