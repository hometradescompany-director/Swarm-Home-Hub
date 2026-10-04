export interface EvidenceVersion {
  readonly receiptId: string;
  readonly sourceRef: string;
  readonly claimFingerprint: string;
  readonly capturedAt: string;
}

export type RecoveryComparisonStanding = "unchanged" | "changed";

export interface RecoveryEvidenceComparison {
  readonly standing: RecoveryComparisonStanding;
  readonly beforeReceiptId: string;
  readonly afterReceiptId: string;
  readonly beforeFingerprint: string;
  readonly afterFingerprint: string;
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export function compareRecoveryEvidence(
  before: EvidenceVersion,
  after: EvidenceVersion
): RecoveryEvidenceComparison {
  const beforeMs = Date.parse(before.capturedAt);
  const afterMs = Date.parse(after.capturedAt);
  if (!Number.isFinite(beforeMs) || !Number.isFinite(afterMs)) {
    throw new Error("evidence capturedAt must be a valid ISO-8601 value");
  }
  if (afterMs < beforeMs) {
    throw new Error("recovered evidence cannot predate the evidence it reobserves");
  }

  const beforeFingerprint = nonBlank(before.claimFingerprint, "before.claimFingerprint");
  const afterFingerprint = nonBlank(after.claimFingerprint, "after.claimFingerprint");

  return Object.freeze({
    standing: beforeFingerprint === afterFingerprint ? "unchanged" : "changed",
    beforeReceiptId: nonBlank(before.receiptId, "before.receiptId"),
    afterReceiptId: nonBlank(after.receiptId, "after.receiptId"),
    beforeFingerprint,
    afterFingerprint,
  });
}
