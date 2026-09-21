export interface PatternCandidate {
  readonly patternRef: string;
  readonly sourceEvidenceRefs: readonly string[];
  readonly localReason: string;
  readonly localTargetRef: string;
  readonly copiedSource: false;
}

export function extractPatternCandidate(input: {
  readonly patternRef: string;
  readonly sourceEvidenceRefs: readonly string[];
  readonly localReason: string;
  readonly localTargetRef: string;
}): PatternCandidate {
  const refs = input.sourceEvidenceRefs.map((ref) => ref.trim()).filter(Boolean);
  if (refs.length === 0) throw new Error("pattern candidate requires source evidence");
  const patternRef = input.patternRef.trim();
  const localReason = input.localReason.trim();
  const localTargetRef = input.localTargetRef.trim();
  if (!patternRef || !localReason || !localTargetRef) {
    throw new Error("patternRef, localReason and localTargetRef must be non-empty");
  }

  return Object.freeze({
    patternRef,
    sourceEvidenceRefs: Object.freeze([...new Set(refs)].sort()),
    localReason,
    localTargetRef,
    copiedSource: false,
  });
}
