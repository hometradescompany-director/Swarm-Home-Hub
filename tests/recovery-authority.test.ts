import { describe, expect, it } from "vitest";
import { createRecoveryIntent } from "../src/observability/recovery-intent.js";
import { applyRecoveryAuthorityDecision } from "../src/observability/recovery-authority.js";

const intent = createRecoveryIntent({
  kind: "reobserve_source",
  subjectRef: "repo:x",
  evidenceRefs: [],
},"recovery:1","2026-09-22T01:00:00.000Z");

describe("recovery authority boundary", () => {
  it("carries an external authority reference without minting authority", () => {
    expect(applyRecoveryAuthorityDecision(intent,{
      allowed: true,
      authorityRef: "atlas:authority:reobserve",
      decidedAt: "2026-09-22T01:00:01.000Z",
    })).toMatchObject({
      allowed: true,
      authorityRef: "atlas:authority:reobserve",
    });
  });

  it("rejects impossible decision chronology", () => {
    expect(() => applyRecoveryAuthorityDecision(intent,{
      allowed: true,
      authorityRef: "atlas:authority:reobserve",
      decidedAt: "2026-09-22T00:59:59.000Z",
    })).toThrow("cannot predate");
  });
});
