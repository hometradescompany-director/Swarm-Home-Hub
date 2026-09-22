import { describe, expect, it } from "vitest";
import { createRecoveryIntent } from "../src/observability/recovery-intent.js";

describe("recovery intent", () => {
  it("preserves a read-only no-authority recovery boundary", () => {
    expect(createRecoveryIntent({
      kind: "reobserve_source",
      subjectRef: "repo:x",
      evidenceRefs: ["receipt:old"],
    },"recovery:1","2026-09-22T01:00:00.000Z")).toMatchObject({
      schema: "SwarmHomeRecoveryIntent/v1",
      authorityImplication: "none",
      remoteMutationRequested: false,
    });
  });
});
