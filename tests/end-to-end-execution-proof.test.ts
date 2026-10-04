import { describe, expect, it } from "vitest";
import type { SwarmHomeExternalHandoff } from "../src/integrations/handoff/conformance.js";
import { selectComputeTopologyPlacement } from "../src/integrations/execution-provider/compute-topology.js";
import { createExternalExecutionRequestFromPlacement } from "../src/integrations/execution-provider/placement-request.js";
import { executeWithExternalProvider } from "../src/integrations/execution-provider/contract.js";
import { createExternalExecutionObservationReceipt } from "../src/integrations/execution-provider/execution-receipt.js";

const handoff: SwarmHomeExternalHandoff = {
  schema: "SwarmHomeExternalHandoff/v1",
  sourceResidenceRef: "residence:render:proof",
  sourceEventRef: "event:ready:render:proof",
  agentIdentityRef: "atlas:agent:render:proof",
  capabilityRefs: ["capability:render"],
  offeringRefs: ["offering:external-render"],
  relationalContextRefs: [],
  generatedAt: "2026-09-22T05:10:00.000Z",
  freshUntil: "2026-09-22T05:20:00.000Z",
  authorityImplication: "none"
};

describe("end-to-end bounded external execution proof", () => {
  it("preserves the full placement -> request -> authority -> provider -> receipt path", async () => {
    const placement = selectComputeTopologyPlacement({
      workload: {
        workloadRef: "workload:render:proof",
        capabilityRef: "capability:render",
        artifactRefs: ["artifact:scene"],
        acceptedAccelerators: ["gpu"],
        minimumMemoryBytes: 8_000_000_000,
        maximumQueueDepth: 3,
        maximumStartLatencyMs: 15_000
      },
      candidates: [
        {
          providerRef: "provider:gpu-west",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 24_000_000_000,
          queueDepth: 1,
          estimatedStartLatencyMs: 2_000,
          estimatedCostMicrounits: 25,
          localArtifactRefs: ["artifact:scene"],
          evidenceReceiptIds: ["receipt:placement:gpu-west"],
          observedAt: "2026-09-22T05:11:00.000Z",
          freshUntil: "2026-09-22T05:16:00.000Z"
        }
      ],
      decidedAt: "2026-09-22T05:12:00.000Z"
    });

    const request = createExternalExecutionRequestFromPlacement({
      decision: placement,
      requestId: "exec:render:proof",
      instructionRef: "instruction:render:opaque",
      artifactRefs: ["artifact:scene"],
      evidenceReceiptIds: ["receipt:handoff:proof"],
      handoff,
      requestedAt: "2026-09-22T05:13:00.000Z",
      expiresAt: "2026-09-22T05:18:00.000Z"
    });

    const result = await executeWithExternalProvider({
      request,
      provider: {
        providerRef: "provider:gpu-west",
        async execute(input) {
          expect(input.providerRef).toBe("provider:gpu-west");
          expect(input.evidenceReceiptIds).toEqual([
            "receipt:placement:gpu-west",
            "receipt:handoff:proof"
          ]);
          return {
            providerExecutionRef: "provider-execution:gpu-west:proof",
            status: "completed",
            resultRefs: ["artifact:render:proof-output"],
            evidenceReceiptIds: ["receipt:provider:proof"],
            observedAt: "2026-09-22T05:14:00.000Z"
          };
        }
      },
      authorize: async (input) => {
        expect(input.requestId).toBe("exec:render:proof");
        return {
          allowed: true,
          authorityRef: "atlas:authority:render:proof",
          decidedAt: "2026-09-22T05:13:30.000Z"
        };
      },
      observedAt: "2026-09-22T05:13:30.000Z"
    });

    const receipt = createExternalExecutionObservationReceipt({
      receiptId: "receipt:swarm:execution:proof",
      result
    });

    expect(placement).toMatchObject({
      status: "selected",
      selectedProviderRef: "provider:gpu-west"
    });
    expect(request).toMatchObject({
      providerRef: "provider:gpu-west",
      capabilityRef: "capability:render"
    });
    expect(result).toMatchObject({
      authorityRef: "atlas:authority:render:proof",
      providerExecutionRef: "provider-execution:gpu-west:proof",
      status: "completed"
    });
    expect(receipt).toEqual({
      id: "receipt:swarm:execution:proof",
      sourceRef: "provider-execution:gpu-west:proof",
      capturedAt: "2026-09-22T05:14:00.000Z",
      standing: "source_record",
      authorityRef: "atlas:authority:render:proof"
    });
  });

  it("never calls the provider when authority refuses the placed request", async () => {
    const placement = selectComputeTopologyPlacement({
      workload: {
        workloadRef: "workload:render:denied",
        capabilityRef: "capability:render",
        artifactRefs: [],
        acceptedAccelerators: ["gpu"]
      },
      candidates: [
        {
          providerRef: "provider:gpu-west",
          capabilityRef: "capability:render",
          accelerator: "gpu",
          availableMemoryBytes: 24_000_000_000,
          queueDepth: 0,
          estimatedStartLatencyMs: 500,
          estimatedCostMicrounits: 10,
          localArtifactRefs: [],
          evidenceReceiptIds: ["receipt:placement:denied"],
          observedAt: "2026-09-22T05:11:00.000Z",
          freshUntil: "2026-09-22T05:16:00.000Z"
        }
      ],
      decidedAt: "2026-09-22T05:12:00.000Z"
    });

    const request = createExternalExecutionRequestFromPlacement({
      decision: placement,
      requestId: "exec:render:denied",
      instructionRef: "instruction:render:opaque",
      handoff,
      requestedAt: "2026-09-22T05:13:00.000Z",
      expiresAt: "2026-09-22T05:18:00.000Z"
    });

    let providerCalls = 0;
    const result = await executeWithExternalProvider({
      request,
      provider: {
        providerRef: "provider:gpu-west",
        async execute() {
          providerCalls += 1;
          throw new Error("provider must not be called");
        }
      },
      authorize: async () => ({
        allowed: false,
        authorityRef: "atlas:authority:deny:render",
        decidedAt: "2026-09-22T05:13:30.000Z",
        reason: "execution not authorised"
      }),
      observedAt: "2026-09-22T05:13:30.000Z"
    });

    expect(providerCalls).toBe(0);
    expect(result.status).toBe("refused_by_authority");
    expect(() =>
      createExternalExecutionObservationReceipt({
        receiptId: "receipt:swarm:execution:must-not-exist",
        result
      })
    ).toThrow(/requires a provider execution ref/);
  });
});
