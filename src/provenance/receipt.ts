import { createTypedAbsence, type TypedAbsence } from "./absence.js";

export type EvidenceStanding =
  | "direct_observation"
  | "source_record"
  | "user_report"
  | "supported_inference"
  | "hypothesis"
  | "unknown";

export interface ProvenanceReceipt {
  readonly id: string;
  readonly sourceRef: string;
  readonly capturedAt: string;
  readonly standing: EvidenceStanding;
  readonly authorityRef?: string;
  readonly contentHash?: string;
  readonly absence?: TypedAbsence;
}

export interface CreateProvenanceReceiptInput {
  readonly id: string;
  readonly sourceRef: string;
  readonly capturedAt: string;
  readonly standing: EvidenceStanding;
  readonly authorityRef?: string;
  readonly contentHash?: string;
  readonly absence?: TypedAbsence;
}

export function createProvenanceReceipt(
  input: CreateProvenanceReceiptInput
): ProvenanceReceipt {
  const id = input.id.trim();
  if (!id) throw new Error("provenance receipt requires a non-empty id");

  const sourceRef = input.sourceRef.trim();
  if (!sourceRef) throw new Error("provenance receipt requires a non-empty sourceRef");

  if (!Number.isFinite(Date.parse(input.capturedAt))) {
    throw new Error("provenance receipt capturedAt must be a valid ISO-8601 value");
  }

  const authorityRef = input.authorityRef?.trim();
  if (input.authorityRef !== undefined && !authorityRef) {
    throw new Error("provenance receipt authorityRef cannot be blank when supplied");
  }

  const contentHash = input.contentHash?.trim();
  if (input.contentHash !== undefined && !contentHash) {
    throw new Error("provenance receipt contentHash cannot be blank when supplied");
  }

  const absence = input.absence ? createTypedAbsence(input.absence) : undefined;

  return Object.freeze({
    id,
    sourceRef,
    capturedAt: input.capturedAt,
    standing: input.standing,
    ...(authorityRef ? { authorityRef } : {}),
    ...(contentHash ? { contentHash } : {}),
    ...(absence ? { absence } : {})
  });
}

export function assertProvenanceReceipt(receipt: ProvenanceReceipt): void {
  createProvenanceReceipt(receipt);
}
