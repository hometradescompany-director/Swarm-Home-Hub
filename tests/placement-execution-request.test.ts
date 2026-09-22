import { describe, expect, it } from "vitest";
import type { SwarmHomeExternalHandoff } from "../src/integrations/handoff/conformance.js";
import type { ComputePlacementDecision } from "../src/integrations/execution-provider/compute-topology.js";
import { createExternalExecutionRequestFromPlacement } from "../src/integrations/execution-provider/placement-request.js";

const handoff: SwarmHomeExternalHandoff = {
  schema: "SwarmHomeExternalHandoff/v1",
  sourceResidenceRef: "residence:render:1",
  sourceEventRef: "event:ready:render:1",
  agentIdentityRef: "atlas:agent:render:1",
  capabilityRefs: ["capability:render"],
  offeringRefs: ["offering:external-render"],
  relationalContextRefs: [],
  generatedAt: "2026-09-22T01:00:00.000Z",
  freshUntil: "2026-09-22T01:10:00.000Z",
  authorityImplication: "none"
};

function selectedDecision(
  overrides: Partial<ComputePlacementDecision> = {}
): ComputePlacementDecision {
  return {
    schema: "SwarmHomeComputePlacementDecision/v1",
    workloadRef: "workload:render:1",
    capabilityRef: "capability:render",
    decidedAt: "2026-09-22T01:02:00.000Z",
    status: "selected",
    selectedProviderRef: "provider:gpu-east",
    selectedAccelerator: "gpu",
    selectedEvidenceReceiptIds: ["receipt:placement:gpu-east"],
    evaluations: [],
    selectionBasis: [
      "artifact_locality",
      "estimated_start_latency",
      "queue_depth",
      "estimated_cost",
      "stable_provider_ref"
    ],
    ...overrides
  };
}

describe("compute placement to external execution request", () => {
  it("preserves the selected provider and placement evidence", () => {
    const request = createExternalExecutionRequestFromPlacement({
      decision: selectedDecision(),
      requestId: "exec:render:1",
      instructionRef: "instruction:render:opaque",
      artifactRefs: ["artifact:scene"],
      evidenceReceiptIds: ["receipt:handoff", "receipt:placement:gpu-east"],
      handoff,
      requestedAt: "2026-09-22T01:03:00.000Z",
      expiresAt: "2026-09-22T01:08:00.000Z"
    });

    expect(request).toMatchObject({
      schema: "SwarmHomeExternalExecutionRequest/v1",
      requestId: "exec:render:1",
      providerRef: "provider:gpu-east",
      capabilityRef: "capability:render",
      instructionRef: "instruction:render:opaque"
    });
    expect(request.evidenceReceiptIds).toEqual([
      "receipt:placement:gpu-east",
      "receipt:handoff"
    ]);
  });

  it("fails closed when no provider was selected", () => {
    expect(() =>
      createExternalExecutionRequestFromPlacement({
        decision: (() => {
          const {
            selectedProviderRef: _provider,
            selectedAccelerator: _accelerator,
            ...rest
          } = selectedDecision();
          return {
            ...rest,
            status: "no_eligible_provider" as const,
            selectedEvidenceReceiptIds: [],
            evaluations: []
          };
        })(),
        requestId: "exec:render:none",
        instructionRef: "instruction:render:opaque",
        handoff,
        requestedAt: "2026-09-22T01:03:00.000Z",
        expiresAt: "2026-09-22T01:08:00.000Z"
      })
    ).toThrow(/selected compute placement/);
  });

  it("requires placement evidence before minting an execution request", () => {
    expect(() =>
      createExternalExecutionRequestFromPlacement({
        decision: selectedDecision({ selectedEvidenceReceiptIds: [] }),
        requestId: "exec:render:no-proof",
        instructionRef: "instruction:render:opaque",
        handoff,
        requestedAt: "2026-09-22T01:03:00.000Z",
        expiresAt: "2026-09-22T01:08:00.000Z"
      })
    ).toThrow(/requires evidence/);
  });

  it("requires the selected capability to be present in the handoff", () => {
    expect(() =>
      createExternalExecutionRequestFromPlacement({
        decision: selectedDecision({ capabilityRef: "capability:other" }),
        requestId: "exec:render:wrong-capability",
        instructionRef: "instruction:render:opaque",
        handoff,
        requestedAt: "2026-09-22T01:03:00.000Z",
        expiresAt: "2026-09-22T01:08:00.000Z"
      })
    ).toThrow(/not present in the external handoff/);
  });

  it("rejects a request timestamp before the placement decision", () => {
    expect(() =>
      createExternalExecutionRequestFromPlacement({
        decision: selectedDecision(),
        requestId: "exec:render:time-travel",
        instructionRef: "instruction:render:opaque",
        handoff,
        requestedAt: "2026-09-22T01:01:59.000Z",
        expiresAt: "2026-09-22T01:08:00.000Z"
      })
    ).toThrow(/cannot predate its compute placement decision/);
  });
});
