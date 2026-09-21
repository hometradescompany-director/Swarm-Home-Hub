import { describe, expect, it } from "vitest";
import { createRecoveryIntent } from "../src/observability/recovery-intent.js";
import { applyRecoveryAuthorityDecision } from "../src/observability/recovery-authority.js";
import { createRecoveryObservationOutcome } from "../src/observability/recovery-outcome.js";

const intent = createRecoveryIntent({
  kind: "reobserve_source",
  subjectRef: "repo:x",
  evidenceRefs: [],
},"recovery:1","2026-09-22T01:00:00.000Z");
const authorized = applyRecoveryAuthorityDecision(intent,{
  allowed: true,
  authorityRef: "atlas:authority:reobserve",
  decidedAt: "2026-09-22T01:00:01.000Z",
});

describe("recovery observation outcome", () => {
  it("requires a provenance receipt reference for an observed result", () => {
    expect(createRecoveryObservationOutcome({
      authorized,
      status: "observed",
      observedAt: "2026-09-22T01:00:02.000Z",
      receiptId: "receipt:new",
      sourceRef: "github:repo@sha",
    })).toMatchObject({
      status: "observed",
      receiptId: "receipt:new",
      authorityRef: "atlas:authority:reobserve",
    });
  });

  it("refuses to call an observation successful without evidence refs", () => {
    expect(() => createRecoveryObservationOutcome({
      authorized,
      status: "observed",
      observedAt: "2026-09-22T01:00:02.000Z",
    })).toThrow("requires receiptId and sourceRef");
  });
});
