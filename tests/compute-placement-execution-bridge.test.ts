import { describe, expect, it } from "vitest";
import {
  createComputePlacedExecutionRequest,
  SWARM_HOME_COMPUTE_PLACEMENT_DECISION
} from "../src/integrations/execution-provider/compute-topology.js";

const handoff = {
  schema: "SwarmHomeExternalHandoff/v1" as const,
  sourceResidenceRef: "residence:render",
  sourceEventRef: "event:ready",
  agentIdentityRef: "atlas:agent:render",
  capabilityRefs: ["capability:render"],
  offeringRefs: ["offering:external-execution"],
  relationalContextRefs: [],
  generatedAt: "2026-09-22T01:00:00.000Z",
  freshUntil: "2026-09-22T01:10:00.000Z",
  authorityImplication: "none" as const
};

const workload = {
  workloadRef: "workload:render:2",
  capabilityRef: "capability:render",
  artifactRefs: ["artifact:scene", "artifact:texture"],
  acceptedAccelerators: ["gpu"] as const,
  minimumMemoryBytes: 24_000
};

const candidate = {
  providerRef: "provider:gpu-home",
  capabilityRef: "capability:render",
  accelerator: "gpu" as const,
  availableMemoryBytes: 48_000,
  queueDepth: 1,
  estimatedStartLatencyMs: 250,
  estimatedCostMicrounits: 20,
  localArtifactRefs: ["artifact:scene"],
  evidenceReceiptIds: ["receipt:placement:1"],
  observedAt: "2026-09-22T01:00:20.000Z",
  freshUntil: "2026-09-22T01:05:00.000Z"
};

describe("compute placement to external execution bridge", () => {
  it("creates the existing bounded execution request from the selected provider", () => {
    const plan = createComputePlacedExecutionRequest({
      workload,
      candidates: [candidate],
      requestId: "exec:req:gpu-1",
      instructionRef: "atlas:instruction:render-1",
      evidenceReceiptIds: ["receipt:intent:1", "receipt:placement:1"],
      handoff,
      decidedAt: "2026-09-22T01:01:00.000Z",
      requestedAt: "2026-09-22T01:01:30.000Z",
      expiresAt: "2026-09-22T01:04:00.000Z"
    });

    expect(plan.placement).toMatchObject({
      schema: SWARM_HOME_COMPUTE_PLACEMENT_DECISION,
      status: "selected",
      selectedProviderRef: "provider:gpu-home",
      selectedFreshUntil: "2026-09-22T01:05:00.000Z"
    });
    expect(plan.request).toMatchObject({
      requestId: "exec:req:gpu-1",
      providerRef: "provider:gpu-home",
      capabilityRef: "capability:render",
      instructionRef: "atlas:instruction:render-1",
      artifactRefs: ["artifact:scene", "artifact:texture"]
    });
    expect(plan.request?.evidenceReceiptIds).toEqual([
      "receipt:intent:1",
      "receipt:placement:1"
    ]);
  });

  it("returns placement evidence without inventing a request when no provider qualifies", () => {
    const plan = createComputePlacedExecutionRequest({
      workload: { ...workload, minimumMemoryBytes: 96_000 },
      candidates: [candidate],
      requestId: "exec:req:none",
      instructionRef: "atlas:instruction:render-2",
      handoff,
      decidedAt: "2026-09-22T01:01:00.000Z",
      requestedAt: "2026-09-22T01:01:30.000Z",
      expiresAt: "2026-09-22T01:04:00.000Z"
    });

    expect(plan.placement.status).toBe("no_eligible_provider");
    expect(plan.request).toBeUndefined();
  });

  it("refuses to create a request after the selected placement observation becomes stale", () => {
    expect(() =>
      createComputePlacedExecutionRequest({
        workload,
        candidates: [candidate],
        requestId: "exec:req:stale",
        instructionRef: "atlas:instruction:render-3",
        handoff,
        decidedAt: "2026-09-22T01:01:00.000Z",
        requestedAt: "2026-09-22T01:05:01.000Z",
        expiresAt: "2026-09-22T01:06:00.000Z"
      })
    ).toThrow(/stale compute placement/);
  });

  it("refuses an execution request whose expiry outlives placement freshness", () => {
    expect(() =>
      createComputePlacedExecutionRequest({
        workload,
        candidates: [candidate],
        requestId: "exec:req:too-long",
        instructionRef: "atlas:instruction:render-4",
        handoff,
        decidedAt: "2026-09-22T01:01:00.000Z",
        requestedAt: "2026-09-22T01:02:00.000Z",
        expiresAt: "2026-09-22T01:05:01.000Z"
      })
    ).toThrow(/outlive compute placement freshness/);
  });
});
