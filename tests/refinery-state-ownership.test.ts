import { describe, expect, it } from "vitest";
import { fingerprintStateOwnership } from "../src/refinery/state-ownership.js";

describe("state ownership fingerprint", () => {
  it("leaves unobserved domains unknown", () => {
    expect(
      fingerprintStateOwnership([
        { domain: "task", standing: "external", evidenceRef: "src:task" },
      ])
    ).toEqual({
      task: "external",
      memory: "unknown",
      identity: "unknown",
      event: "unknown",
      schedule: "unknown",
    });
  });

  it("requires evidence before asserting ownership", () => {
    expect(() =>
      fingerprintStateOwnership([{ domain: "memory", standing: "shared" }])
    ).toThrow("requires evidenceRef");
  });
});
