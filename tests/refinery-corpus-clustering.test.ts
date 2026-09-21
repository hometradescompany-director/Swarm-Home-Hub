import { describe, expect, it } from "vitest";
import { clusterCorpus } from "../src/refinery/corpus-clustering.js";

describe("corpus clustering", () => {
  it("groups equivalent observed shapes without merging repo identity", () => {
    const clusters = clusterCorpus([
      { repoRef: "repo:b", protocolFamilies: ["mcp"], stateDomains: ["task"], posture: "capability_provider" },
      { repoRef: "repo:a", protocolFamilies: ["mcp"], stateDomains: ["task"], posture: "capability_provider" },
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.repoRefs).toEqual(["repo:a", "repo:b"]);
  });
});
