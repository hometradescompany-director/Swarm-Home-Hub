import {
  createProvenanceReceipt,
  type ProvenanceReceipt
} from "../../provenance/receipt.js";
import type { ExternalExecutionResult } from "./contract.js";

export function createExternalExecutionObservationReceipt(input: {
  readonly receiptId: string;
  readonly result: ExternalExecutionResult;
  readonly contentHash?: string;
}): ProvenanceReceipt {
  const providerExecutionRef = input.result.providerExecutionRef?.trim();
  if (!providerExecutionRef) {
    throw new Error(
      "external execution observation receipt requires a provider execution ref"
    );
  }

  return createProvenanceReceipt({
    id: input.receiptId,
    sourceRef: providerExecutionRef,
    capturedAt: input.result.observedAt,
    standing: "source_record",
    authorityRef: input.result.authorityRef,
    ...(input.contentHash ? { contentHash: input.contentHash } : {})
  });
}
