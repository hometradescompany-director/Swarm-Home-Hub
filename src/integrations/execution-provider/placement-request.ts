import type { SwarmHomeExternalHandoff } from "../handoff/conformance.js";
import {
  createExternalExecutionRequest,
  type ExternalExecutionRequest
} from "./contract.js";
import type { ComputePlacementDecision } from "./compute-topology.js";

function validTime(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(field + " must be a valid ISO-8601 value");
  }
  return parsed;
}

function mergeRefs(...groups: readonly (readonly string[])[]): readonly string[] {
  return Object.freeze([...new Set(groups.flat())]);
}

export function createExternalExecutionRequestFromPlacement(input: {
  readonly decision: ComputePlacementDecision;
  readonly requestId: string;
  readonly instructionRef: string;
  readonly artifactRefs?: readonly string[];
  readonly evidenceReceiptIds?: readonly string[];
  readonly handoff: SwarmHomeExternalHandoff;
  readonly requestedAt: string;
  readonly expiresAt: string;
}): ExternalExecutionRequest {
  if (
    input.decision.status !== "selected" ||
    !input.decision.selectedProviderRef
  ) {
    throw new Error(
      "external execution request requires a selected compute placement"
    );
  }

  if (input.decision.selectedEvidenceReceiptIds.length === 0) {
    throw new Error(
      "selected compute placement requires evidence before execution request creation"
    );
  }

  if (!input.handoff.capabilityRefs.includes(input.decision.capabilityRef)) {
    throw new Error(
      "selected compute capability is not present in the external handoff"
    );
  }

  const decidedAtMs = validTime(input.decision.decidedAt, "decision.decidedAt");
  const requestedAtMs = validTime(input.requestedAt, "requestedAt");

  if (requestedAtMs < decidedAtMs) {
    throw new Error(
      "external execution request cannot predate its compute placement decision"
    );
  }

  return createExternalExecutionRequest({
    requestId: input.requestId,
    providerRef: input.decision.selectedProviderRef,
    capabilityRef: input.decision.capabilityRef,
    instructionRef: input.instructionRef,
    ...(input.artifactRefs ? { artifactRefs: input.artifactRefs } : {}),
    evidenceReceiptIds: mergeRefs(
      input.decision.selectedEvidenceReceiptIds,
      input.evidenceReceiptIds ?? []
    ),
    handoff: input.handoff,
    requestedAt: input.requestedAt,
    expiresAt: input.expiresAt
  });
}
