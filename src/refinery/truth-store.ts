import type { StateDomain } from "./state-ownership.js";

export interface TruthStoreObservation {
  readonly domain: StateDomain;
  readonly mutable: boolean;
  readonly canonicalForRemoteRuntime: boolean;
  readonly evidenceRef: string;
}

export interface TruthStoreDetection {
  readonly domains: readonly StateDomain[];
  readonly hasRemoteCanonicalMutableTruth: boolean;
  readonly evidenceRefs: readonly string[];
}

export function detectRemoteTruthStores(
  observations: readonly TruthStoreObservation[]
): TruthStoreDetection {
  const domains = new Set<StateDomain>();
  const refs = new Set<string>();
  let hasRemoteCanonicalMutableTruth = false;

  for (const item of observations) {
    const ref = item.evidenceRef.trim();
    if (!ref) throw new Error("evidenceRef must be non-empty");
    refs.add(ref);
    domains.add(item.domain);
    if (item.mutable && item.canonicalForRemoteRuntime) {
      hasRemoteCanonicalMutableTruth = true;
    }
  }

  return Object.freeze({
    domains: Object.freeze([...domains].sort()),
    hasRemoteCanonicalMutableTruth,
    evidenceRefs: Object.freeze([...refs].sort()),
  });
}
