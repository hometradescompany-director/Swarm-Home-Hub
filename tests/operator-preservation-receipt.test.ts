import { describe, expect, it } from "vitest";
import {
  createOperatorPreservationOutcomeReceipt,
} from "../src/policy/operator-preservation-receipt.js";
import type { OperatorPreservationDecision } from "../src/policy/operator-preservation.js";

const decision: OperatorPreservationDecision = {
  disposition: "continue",
  actions: ["preserve-context", "record-agency-delta"],
  standing: "constrained",
  reason: "test",
};

describe("operator preservation outcome receipts", () => {
  it("records positive executable-option change", () => {
    const receipt = createOperatorPreservationOutcomeReceipt({
      receiptId: "receipt:1",
      operatorRef: "operator:opaque:1",
      decidedAt: "2026-09-21T08:00:00.000Z",
      completedAt: "2026-09-21T08:05:00.000Z",
      pressure: "essential",
      decision,
      beforeOptionRefs: ["a"],
      afterOptionRefs: ["a", "b", "c"],
      evidenceRefs: ["e:1"],
      sourceEventRefs: ["event:1"],
    });

    expect(receipt.agencyDelta).toBe(2);
    expect(receipt.authoritative).toBe(false);
  });

  it("records harmful option loss instead of masking it as success", () => {
    const receipt = createOperatorPreservationOutcomeReceipt({
      receiptId: "receipt:2",
      operatorRef: "operator:opaque:1",
      decidedAt: "2026-09-21T08:00:00.000Z",
      completedAt: "2026-09-21T08:05:00.000Z",
      pressure: "cost-increasing",
      decision,
      beforeOptionRefs: ["a", "b"],
      afterOptionRefs: ["b"],
    });

    expect(receipt.agencyDelta).toBe(-1);
  });

  it("deduplicates blank and repeated refs before computing the receipt", () => {
    const receipt = createOperatorPreservationOutcomeReceipt({
      receiptId: "receipt:3",
      operatorRef: "operator:opaque:1",
      decidedAt: "2026-09-21T08:00:00.000Z",
      completedAt: "2026-09-21T08:01:00.000Z",
      pressure: "optional",
      decision,
      beforeOptionRefs: ["a", "a", ""],
      afterOptionRefs: ["a", "b", "b"],
      evidenceRefs: ["e:1", "e:1", ""],
    });

    expect(receipt.beforeOptionRefs).toEqual(["a"]);
    expect(receipt.afterOptionRefs).toEqual(["a", "b"]);
    expect(receipt.evidenceRefs).toEqual(["e:1"]);
    expect(receipt.agencyDelta).toBe(1);
  });

  it("refuses temporally impossible receipts", () => {
    expect(() =>
      createOperatorPreservationOutcomeReceipt({
        receiptId: "receipt:4",
        operatorRef: "operator:opaque:1",
        decidedAt: "2026-09-21T08:05:00.000Z",
        completedAt: "2026-09-21T08:00:00.000Z",
        pressure: "essential",
        decision,
        beforeOptionRefs: ["a"],
        afterOptionRefs: ["a"],
      }),
    ).toThrow(/cannot precede/);
  });
});
