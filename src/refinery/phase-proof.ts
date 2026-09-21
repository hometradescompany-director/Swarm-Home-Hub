import type { ExternalCorpusManifest } from "./corpus-manifest.js";

export interface RefineryPhaseProofInput {
  readonly corpus: ExternalCorpusManifest;
  readonly sourceReceipts: number;
  readonly protocolFingerprints: number;
  readonly stateFingerprints: number;
  readonly authorityFingerprints: number;
  readonly postureDecisions: number;
  readonly safetyDecisions: number;
  readonly clusters: number;
  readonly patternCandidates: number;
  readonly failureFixtures: number;
  readonly federationDecisions: number;
}

export interface RefineryPhaseProof {
  readonly complete: boolean;
  readonly observedRepos: number;
  readonly optionalDiscoveries: Readonly<{
    patternCandidates: number;
    failureFixtures: number;
  }>;
  readonly missing: readonly string[];
}

export function proveRefineryPhase(input: RefineryPhaseProofInput): RefineryPhaseProof {
  const required: ReadonlyArray<readonly [string, number]> = [
    ["sourceReceipts", input.sourceReceipts],
    ["protocolFingerprints", input.protocolFingerprints],
    ["stateFingerprints", input.stateFingerprints],
    ["authorityFingerprints", input.authorityFingerprints],
    ["postureDecisions", input.postureDecisions],
    ["safetyDecisions", input.safetyDecisions],
    ["clusters", input.clusters],
    ["federationDecisions", input.federationDecisions],
  ];
  const missing = required.filter(([, count]) => count < 1).map(([name]) => name);

  return Object.freeze({
    complete: input.corpus.observedRepos > 0 && missing.length === 0,
    observedRepos: input.corpus.observedRepos,
    optionalDiscoveries: Object.freeze({
      patternCandidates: input.patternCandidates,
      failureFixtures: input.failureFixtures,
    }),
    missing: Object.freeze(missing),
  });
}
