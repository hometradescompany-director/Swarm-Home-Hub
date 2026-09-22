import { describe, expect, it } from "vitest";
import { createSourceProvenanceReceipt } from "../src/refinery/source-provenance.js";
import { compareSourceProvenance } from "../src/observability/source-drift.js";

const before = createSourceProvenanceReceipt({
  repoRef: "repo:x",
  commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  sourceRef: "github:x@a",
  licenseId: "MIT",
  licenseStanding: "declared",
  observedAt: "2026-09-22T00:00:00.000Z",
});

describe("source drift", () => {
  it("preserves commit drift as an observation rather than a compatibility judgment", () => {
    const after = createSourceProvenanceReceipt({
      repoRef: "repo:x",
      commitSha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      sourceRef: "github:x@b",
      licenseId: "MIT",
      licenseStanding: "declared",
      observedAt: "2026-09-22T01:00:00.000Z",
    });
    expect(compareSourceProvenance(before,after).standing).toBe("commit_changed");
  });
});
