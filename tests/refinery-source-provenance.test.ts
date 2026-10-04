import { describe, expect, it } from "vitest";
import { createSourceProvenanceReceipt } from "../src/refinery/source-provenance.js";

describe("source provenance receipt", () => {
  it("preserves pin, source and declared license separately", () => {
    expect(
      createSourceProvenanceReceipt({
        repoRef: "repo:example",
        commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        sourceRef: "github:example",
        licenseId: "MIT",
        licenseStanding: "declared",
        observedAt: "2026-09-22T00:00:00.000Z",
      })
    ).toMatchObject({
      receiptType: "external_source_observation",
      repoRef: "repo:example",
      licenseId: "MIT",
    });
  });

  it("does not silently call a missing license declared", () => {
    expect(() =>
      createSourceProvenanceReceipt({
        repoRef: "repo:example",
        commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        sourceRef: "github:example",
        licenseStanding: "declared",
        observedAt: "2026-09-22T00:00:00.000Z",
      })
    ).toThrow("declared license requires licenseId");
  });
});
