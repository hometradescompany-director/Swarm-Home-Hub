export interface ObservedClaim {
  readonly subjectRef: string;
  readonly claimKey: string;
  readonly claimFingerprint: string;
  readonly receiptId: string;
  readonly capturedAt: string;
}

export interface EvidenceContradiction {
  readonly subjectRef: string;
  readonly claimKey: string;
  readonly fingerprints: readonly string[];
  readonly receiptIds: readonly string[];
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export function projectEvidenceContradictions(
  claims: readonly ObservedClaim[]
): readonly EvidenceContradiction[] {
  const groups = new Map<string, ObservedClaim[]>();
  for (const claim of claims) {
    const subjectRef = nonBlank(claim.subjectRef, "subjectRef");
    const claimKey = nonBlank(claim.claimKey, "claimKey");
    nonBlank(claim.claimFingerprint, "claimFingerprint");
    nonBlank(claim.receiptId, "receiptId");
    if (!Number.isFinite(Date.parse(claim.capturedAt))) {
      throw new Error("capturedAt must be a valid ISO-8601 value");
    }
    const key = subjectRef + "\u0000" + claimKey;
    const group = groups.get(key) ?? [];
    group.push(claim);
    groups.set(key, group);
  }

  const contradictions: EvidenceContradiction[] = [];
  for (const group of groups.values()) {
    const fingerprints = [...new Set(group.map((claim) => claim.claimFingerprint))].sort();
    if (fingerprints.length < 2) continue;
    contradictions.push(Object.freeze({
      subjectRef: group[0]!.subjectRef,
      claimKey: group[0]!.claimKey,
      fingerprints: Object.freeze(fingerprints),
      receiptIds: Object.freeze([...new Set(group.map((claim) => claim.receiptId))].sort()),
    }));
  }

  return Object.freeze(contradictions.sort((a, b) =>
    (a.subjectRef + a.claimKey).localeCompare(b.subjectRef + b.claimKey)
  ));
}
