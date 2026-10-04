import { describe, expect, it } from "vitest";
import {
  selectComputeTopologyPlacement,
  SWARM_HOME_COMPUTE_PLACEMENT_DECISION
} from "../src/integrations/execution-provider/compute-topology.js";

const workload = {
  workloadRef: "workload:render:1",
  capabilityRef: "capability:render",
  artifactRefs: ["artifact:scene", "artifact:texture"],
  acceptedAccelerators: ["gpu"] as const,
  minimumMemoryBytes: 24_000,
  maximumQueueDepth: 4,
  maximumStartLatencyMs: 5_000
};

describe("topology-aware compute placement", () => {
  it("prefers artifact locality before latency, queue depth and cost", () => {
    const decision = selectComputeTopologyPlacement({
      workload,
      decidedAt: "2026-09-22T01:00:00.000Z",
      candidates: [
        {
          providerRef: "provider:remote-fast",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 80_000,
          queueDepth: 0,
          estimatedStartLatencyMs: 100,
          estimatedCostMicrounits: 1,
          localArtifactRefs: [],
          evidenceReceiptIds: ["receipt:remote-fast"],
          observedAt: "2026-09-22T00:59:30.000Z",
          freshUntil: "2026-09-22T01:01:00.000Z"
        },
        {
          providerRef: "provider:local-slower",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 48_000,
          queueDepth: 2,
          estimatedStartLatencyMs: 900,
          estimatedCostMicrounits: 50,
          localArtifactRefs: ["artifact:scene", "artifact:texture"],
          evidenceReceiptIds: ["receipt:local-slower"],
          observedAt: "2026-09-22T00:59:30.000Z",
          freshUntil: "2026-09-22T01:01:00.000Z"
        }
      ]
    });

    expect(decision).toMatchObject({
      schema: SWARM_HOME_COMPUTE_PLACEMENT_DECISION,
      status: "selected",
      selectedProviderRef: "provider:local-slower",
      selectedAccelerator: "gpu"
    });
    expect(decision.selectedEvidenceReceiptIds).toEqual(["receipt:local-slower"]);
  });

  it("fails closed when every observation is stale or unsuitable", () => {
    const decision = selectComputeTopologyPlacement({
      workload,
      decidedAt: "2026-09-22T01:00:00.000Z",
      candidates: [
        {
          providerRef: "provider:stale",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 80_000,
          queueDepth: 0,
          estimatedStartLatencyMs: 100,
          estimatedCostMicrounits: 1,
          localArtifactRefs: ["artifact:scene"],
          evidenceReceiptIds: ["receipt:stale"],
          observedAt: "2026-09-22T00:50:00.000Z",
          freshUntil: "2026-09-22T00:55:00.000Z"
        },
        {
          providerRef: "provider:tiny",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 8_000,
          queueDepth: 10,
          estimatedStartLatencyMs: 10_000,
          estimatedCostMicrounits: 1,
          localArtifactRefs: ["artifact:scene", "artifact:texture"],
          evidenceReceiptIds: ["receipt:tiny"],
          observedAt: "2026-09-22T00:59:30.000Z",
          freshUntil: "2026-09-22T01:01:00.000Z"
        }
      ]
    });

    expect(decision.status).toBe("no_eligible_provider");
    expect(decision.selectedEvidenceReceiptIds).toEqual([]);
    expect(decision.evaluations).toHaveLength(2);
    expect(decision.evaluations[0]?.refusalReasons).toContain("observation_stale");
    expect(decision.evaluations[1]?.refusalReasons).toEqual(
      expect.arrayContaining([
        "insufficient_memory",
        "queue_depth_exceeded",
        "start_latency_exceeded"
      ])
    );
  });

  it("rejects observations from the future relative to the decision", () => {
    const decision = selectComputeTopologyPlacement({
      workload,
      decidedAt: "2026-09-22T01:00:00.000Z",
      candidates: [
        {
          providerRef: "provider:future",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 80_000,
          queueDepth: 0,
          estimatedStartLatencyMs: 100,
          estimatedCostMicrounits: 1,
          localArtifactRefs: ["artifact:scene", "artifact:texture"],
          evidenceReceiptIds: ["receipt:future"],
          observedAt: "2026-09-22T01:00:01.000Z",
          freshUntil: "2026-09-22T01:01:00.000Z"
        }
      ]
    });

    expect(decision.status).toBe("no_eligible_provider");
    expect(decision.evaluations[0]?.refusalReasons).toContain("observation_after_decision");
  });
});
