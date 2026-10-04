import { describe, expect, it } from "vitest";
import { createProvenanceReceipt } from "../src/provenance/receipt.js";
import { projectExternalObservation } from "../src/observability/external-observation.js";

describe("external observation projection", () => {
  it("references the canonical provenance receipt instead of copying evidence truth", () => {
    const receipt = createProvenanceReceipt({
      id: "receipt:source:1",
      sourceRef: "github:repo@sha",
      capturedAt: "2026-09-22T00:00:00.000Z",
      standing: "source_record",
    });

    expect(projectExternalObservation({
      subjectRef: "repo:example",
      category: "protocol",
      receipt,
      relatedRefs: ["protocol:mcp"],
    })).toEqual({
      subjectRef: "repo:example",
      category: "protocol",
      receiptId: "receipt:source:1",
      sourceRef: "github:repo@sha",
      capturedAt: "2026-09-22T00:00:00.000Z",
      standing: "source_record",
      relatedRefs: ["protocol:mcp"],
    });
  });
});
