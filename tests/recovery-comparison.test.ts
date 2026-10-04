import { describe, expect, it } from "vitest";
import { compareRecoveryEvidence } from "../src/observability/recovery-comparison.js";

describe("recovery evidence comparison", () => {
  it("records changed evidence without deciding what the change means", () => {
    expect(compareRecoveryEvidence({
      receiptId: "receipt:old",
      sourceRef: "source:old",
      claimFingerprint: "mcp:v1",
      capturedAt: "2026-09-22T00:00:00.000Z",
    },{
      receiptId: "receipt:new",
      sourceRef: "source:new",
      claimFingerprint: "mcp:v2",
      capturedAt: "2026-09-22T01:00:00.000Z",
    })).toEqual({
      standing: "changed",
      beforeReceiptId: "receipt:old",
      afterReceiptId: "receipt:new",
      beforeFingerprint: "mcp:v1",
      afterFingerprint: "mcp:v2",
    });
  });
});
