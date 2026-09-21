import { describe, expect, it } from "vitest";
import { createExternalCorpusManifest } from "../src/refinery/corpus-manifest.js";
import { proveRefineryPhase } from "../src/refinery/phase-proof.js";

const corpus = createExternalCorpusManifest([{
  repoRef: "repo:example",
  commitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  sourceRef: "github:example",
  observedAt: "2026-09-22T00:00:00.000Z",
}]);

describe("refinery phase proof", () => {
  it("proves required surfaces without inventing optional discoveries", () => {
    expect(proveRefineryPhase({
      corpus,
      sourceReceipts: 1,
      protocolFingerprints: 1,
      stateFingerprints: 1,
      authorityFingerprints: 1,
      postureDecisions: 1,
      safetyDecisions: 1,
      clusters: 1,
      patternCandidates: 0,
      failureFixtures: 0,
      federationDecisions: 1,
    })).toEqual({
      complete: true,
      observedRepos: 1,
      optionalDiscoveries: { patternCandidates: 0, failureFixtures: 0 },
      missing: [],
    });
  });

  it("reports missing governing evidence instead of faking completion", () => {
    const result = proveRefineryPhase({
      corpus,
      sourceReceipts: 0,
      protocolFingerprints: 1,
      stateFingerprints: 1,
      authorityFingerprints: 1,
      postureDecisions: 1,
      safetyDecisions: 1,
      clusters: 1,
      patternCandidates: 0,
      failureFixtures: 0,
      federationDecisions: 1,
    });
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("sourceReceipts");
  });
});
