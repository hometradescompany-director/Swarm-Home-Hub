import { describe, expect, it } from "vitest";
import { createFederationReevaluationIntent } from "../src/observability/federation-reevaluation-intent.js";

describe("federation reevaluation intent", () => {
  it("creates an intent only when the prior evidence became stale", () => {
    expect(createFederationReevaluationIntent({
      candidateRef: "peer:x",
      priorQualified: true,
      priorObservedAt: "2026-09-22T00:00:00.000Z",
      required: true,
      reasons: ["protocol_changed"],
    },"reeval:1","2026-09-22T01:00:00.000Z")).toMatchObject({
      candidateRef: "peer:x",
      reasons: ["protocol_changed"],
      authorityImplication: "none",
    });

    expect(createFederationReevaluationIntent({
      candidateRef: "peer:x",
      priorQualified: true,
      priorObservedAt: "2026-09-22T00:00:00.000Z",
      required: false,
      reasons: [],
    },"reeval:2","2026-09-22T01:00:00.000Z")).toBeNull();
  });
});
