import { describe, expect, it } from "vitest";
import { createProvenanceReceipt } from "../src/provenance/receipt.js";

describe("evidence authority boundary", () => {
  it("preserves source authority as provenance without promoting it to residence authority", () => {
    const receipt = createProvenanceReceipt({
      id: "receipt:source-state",
      sourceRef: "provider:example",
      capturedAt: "2026-09-21T08:00:00.000Z",
      standing: "source_record",
      authorityRef: "authority:provider-self-state",
      contentHash: "sha256:abc123",
    });

    expect(receipt.authorityRef).toBe("authority:provider-self-state");

    const residenceAuthorityRef = undefined;
    expect(residenceAuthorityRef).toBeUndefined();
  });

  it("keeps content addressing optional metadata rather than treating absence as proof", () => {
    const receipt = createProvenanceReceipt({
      id: "receipt:uncaptured",
      sourceRef: "provider:example",
      capturedAt: "2026-09-21T08:00:00.000Z",
      standing: "source_record",
    });

    expect(receipt.contentHash).toBeUndefined();
    expect(receipt.standing).toBe("source_record");
  });
});
