import { describe, expect, it } from "vitest";
import { compareStateOwnership } from "../src/observability/state-ownership-drift.js";

describe("state ownership drift", () => {
  it("identifies the exact remote truth domain that changed", () => {
    const before = {
      task: "external",
      memory: "external",
      identity: "external",
      event: "external",
      schedule: "absent",
    } as const;
    const after = { ...before, memory: "shared" as const };
    expect(compareStateOwnership(before,after)).toEqual({
      changed: true,
      domains: [{ domain: "memory", before: "external", after: "shared" }],
    });
  });
});
