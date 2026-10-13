import {
  createProvenanceReceipt,
  type ProvenanceReceipt
} from "../../provenance/receipt.js";
import type {
  ExternalExecutionCheckpointReceipt,
  ExternalExecutionResult
} from "./contract.js";

function nonBlank(value: string | undefined, field: string): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

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

export function createExternalExecutionCheckpointReceipt(input: {
  readonly receiptId: string;
  readonly result: ExternalExecutionResult;
}): ExternalExecutionCheckpointReceipt {
  if (!["accepted", "completed", "failed"].includes(input.result.status)) {
    throw new Error("checkpoint receipt requires a non-refused provider outcome");
  }

  const checkpointRef = nonBlank(
    input.result.checkpointRef,
    "provider checkpointRef"
  );
  const providerExecutionRef = nonBlank(
    input.result.providerExecutionRef,
    "provider execution ref"
  );
  const receipt = createProvenanceReceipt({
    id: input.receiptId,
    sourceRef: checkpointRef,
    capturedAt: input.result.observedAt,
    standing: "source_record",
    authorityRef: input.result.authorityRef
  });

  return Object.freeze({
    ...receipt,
    requestId: nonBlank(input.result.requestId, "requestId"),
    providerRef: nonBlank(input.result.providerRef, "providerRef"),
    capabilityRef: nonBlank(input.result.capabilityRef, "capabilityRef"),
    providerExecutionRef,
    checkpointRef
  });
}
