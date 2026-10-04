export interface ExternalCorpusEntry {
  readonly repoRef: string;
  readonly commitSha: string;
  readonly sourceRef: string;
  readonly observedAt: string;
}

export interface ExternalCorpusManifest {
  readonly entries: readonly ExternalCorpusEntry[];
  readonly observedRepos: number;
}

const COMMIT_SHA = /^[0-9a-f]{40}$/i;

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function validObservedAt(value: string): string {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error("observedAt must be a valid ISO-8601 value");
  }
  return value;
}

function normalizeEntry(entry: ExternalCorpusEntry): ExternalCorpusEntry {
  const repoRef = nonBlank(entry.repoRef, "repoRef");
  const sourceRef = nonBlank(entry.sourceRef, "sourceRef");
  const commitSha = nonBlank(entry.commitSha, "commitSha").toLowerCase();
  if (!COMMIT_SHA.test(commitSha)) {
    throw new Error("commitSha must be a 40-character Git commit SHA");
  }

  return Object.freeze({
    repoRef,
    commitSha,
    sourceRef,
    observedAt: validObservedAt(entry.observedAt),
  });
}

/**
 * Build a deterministic observation manifest for external swarm reconnaissance.
 *
 * This is a derived evidence projection only. It owns no remote repository
 * identity, imports no source, and grants no runtime or federation authority.
 */
export function createExternalCorpusManifest(
  entries: readonly ExternalCorpusEntry[]
): ExternalCorpusManifest {
  const normalized = entries.map(normalizeEntry);
  const seen = new Set<string>();

  for (const entry of normalized) {
    if (seen.has(entry.repoRef)) {
      throw new Error("duplicate repoRef: " + entry.repoRef);
    }
    seen.add(entry.repoRef);
  }

  normalized.sort((left, right) => left.repoRef.localeCompare(right.repoRef));

  return Object.freeze({
    entries: Object.freeze(normalized),
    observedRepos: normalized.length,
  });
}
