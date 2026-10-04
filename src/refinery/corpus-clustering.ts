export interface CorpusFeatureVector {
  readonly repoRef: string;
  readonly protocolFamilies: readonly string[];
  readonly stateDomains: readonly string[];
  readonly posture: string;
}

export interface CorpusCluster {
  readonly signature: string;
  readonly repoRefs: readonly string[];
}

function signature(vector: CorpusFeatureVector): string {
  const protocols = [...new Set(vector.protocolFamilies)].sort().join(",");
  const states = [...new Set(vector.stateDomains)].sort().join(",");
  return [vector.posture, protocols, states].join("|");
}

export function clusterCorpus(vectors: readonly CorpusFeatureVector[]): readonly CorpusCluster[] {
  const repoRefs = new Set<string>();
  const groups = new Map<string, string[]>();

  for (const vector of vectors) {
    const repoRef = vector.repoRef.trim();
    if (!repoRef) throw new Error("repoRef must be non-empty");
    if (repoRefs.has(repoRef)) throw new Error("duplicate repoRef: " + repoRef);
    repoRefs.add(repoRef);
    const key = signature(vector);
    const group = groups.get(key) ?? [];
    group.push(repoRef);
    groups.set(key, group);
  }

  return Object.freeze([...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, refs]) => Object.freeze({
      signature: key,
      repoRefs: Object.freeze(refs.sort()),
    })));
}
