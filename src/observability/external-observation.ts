import {
  assertProvenanceReceipt,
  type EvidenceStanding,
  type ProvenanceReceipt,
} from "../provenance/receipt.js";

export interface ExternalObservationProjection {
  readonly subjectRef: string;
  readonly category: string;
  readonly receiptId: string;
  readonly sourceRef: string;
  readonly capturedAt: string;
  readonly standing: EvidenceStanding;
  readonly relatedRefs: readonly string[];
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export function projectExternalObservation(input: {
  readonly subjectRef: string;
  readonly category: string;
  readonly receipt: ProvenanceReceipt;
  readonly relatedRefs?: readonly string[];
}): ExternalObservationProjection {
  assertProvenanceReceipt(input.receipt);
  const relatedRefs = (input.relatedRefs ?? []).map((ref, index) =>
    nonBlank(ref, "relatedRefs[" + index + "]")
  );

  return Object.freeze({
    subjectRef: nonBlank(input.subjectRef, "subjectRef"),
    category: nonBlank(input.category, "category"),
    receiptId: input.receipt.id,
    sourceRef: input.receipt.sourceRef,
    capturedAt: input.receipt.capturedAt,
    standing: input.receipt.standing,
    relatedRefs: Object.freeze([...new Set(relatedRefs)].sort()),
  });
}
