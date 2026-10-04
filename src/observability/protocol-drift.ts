import type { ProtocolFamily, ProtocolFingerprint } from "../refinery/protocol-fingerprint.js";

export interface ProtocolDrift {
  readonly changed: boolean;
  readonly added: readonly ProtocolFamily[];
  readonly removed: readonly ProtocolFamily[];
  readonly beforeEvidenceRefs: readonly string[];
  readonly afterEvidenceRefs: readonly string[];
}

export function compareProtocolFingerprints(
  before: ProtocolFingerprint,
  after: ProtocolFingerprint
): ProtocolDrift {
  const beforeSet = new Set(before.families);
  const afterSet = new Set(after.families);
  const added = [...afterSet].filter((family) => !beforeSet.has(family)).sort();
  const removed = [...beforeSet].filter((family) => !afterSet.has(family)).sort();

  return Object.freeze({
    changed: added.length > 0 || removed.length > 0,
    added: Object.freeze(added),
    removed: Object.freeze(removed),
    beforeEvidenceRefs: Object.freeze([...before.evidenceRefs]),
    afterEvidenceRefs: Object.freeze([...after.evidenceRefs]),
  });
}
