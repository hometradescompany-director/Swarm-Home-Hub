import { describe, expect, it } from "vitest";
import { detectRemoteTruthStores } from "../src/refinery/truth-store.js";

describe("remote truth store detection", () => {
  it("detects canonical mutable remote truth without importing it", () => {
    const result = detectRemoteTruthStores([
      {
        domain: "task",
        mutable: true,
        canonicalForRemoteRuntime: true,
        evidenceRef: "src:tasks",
      },
    ]);
    expect(result.hasRemoteCanonicalMutableTruth).toBe(true);
    expect(result).not.toHaveProperty("records");
  });
});
