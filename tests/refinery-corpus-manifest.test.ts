import { describe, expect, it } from "vitest";
import { createExternalCorpusManifest } from "../src/refinery/corpus-manifest.js";

describe("external corpus manifest", () => {
  it("creates a deterministic pinned observation set", () => {
    const manifest = createExternalCorpusManifest([
      {
        repoRef: "repo:z",
        commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        sourceRef: "github:repo:z",
        observedAt: "2026-09-22T00:00:00.000Z",
      },
      {
        repoRef: "repo:a",
        commitSha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        sourceRef: "github:repo:a",
        observedAt: "2026-09-22T00:00:01.000Z",
      },
    ]);

    expect(manifest.observedRepos).toBe(2);
    expect(manifest.entries.map((entry) => entry.repoRef)).toEqual([
      "repo:a",
      "repo:z",
    ]);
  });

  it("refuses duplicate repository identities", () => {
    expect(() =>
      createExternalCorpusManifest([
        {
          repoRef: "repo:a",
          commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          sourceRef: "github:a",
          observedAt: "2026-09-22T00:00:00.000Z",
        },
        {
          repoRef: "repo:a",
          commitSha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          sourceRef: "github:b",
          observedAt: "2026-09-22T00:00:01.000Z",
        },
      ])
    ).toThrow("duplicate repoRef");
  });

  it("requires source-near commit pins", () => {
    expect(() =>
      createExternalCorpusManifest([
        {
          repoRef: "repo:a",
          commitSha: "main",
          sourceRef: "github:a",
          observedAt: "2026-09-22T00:00:00.000Z",
        },
      ])
    ).toThrow("40-character Git commit SHA");
  });
});
