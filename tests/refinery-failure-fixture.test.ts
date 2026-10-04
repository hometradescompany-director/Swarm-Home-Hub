import { describe, expect, it } from "vitest";
import { extractFailureFixture } from "../src/refinery/failure-fixture.js";

describe("failure fixture extraction", () => {
  it("routes a source-backed failure into a later proof phase", () => {
    expect(extractFailureFixture({
      failureRef: "failure:duplicate-handoff",
      sourceEvidenceRef: "upstream:test",
      targetPhase: "fault_replay_concurrency",
      expectedInvariant: "handoff remains idempotent",
    })).toMatchObject({
      fixtureOnly: true,
      targetPhase: "fault_replay_concurrency",
    });
  });
});
