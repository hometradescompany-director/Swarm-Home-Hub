import { describe, expect, it } from "vitest";
import type { ExternalExecutionResult } from "../src/integrations/execution-provider/contract.js";
import { createExternalExecutionObservationReceipt } from "../src/integrations/execution-provider/execution-receipt.js";

function result(
  overrides: Partial<ExternalExecutionResult> = {}
): ExternalExecutionResult {
  return {
    schema: "SwarmHomeExternalExecutionResult/v1",
    requestId: "exec:render:1",
    providerRef: "provider:gpu-east",
    capabilityRef: "capability:render",
    authorityRef: "atlas:authority:allow-render",
    providerExecutionRef: "provider-execution:gpu-east:abc",
    status: "completed",
    resultRefs: ["artifact:render:output"],
    evidenceReceiptIds: ["receipt:provider:abc"],
    observedAt: "2026-09-22T04:40:00.000Z",
    ...overrides
  };
}

describe("external execution observation receipt", () => {
  it("records the attributable provider execution as a source record", () => {
    const receipt = createExternalExecutionObservationReceipt({
      receiptId: "receipt:swarm:execution:1",
      result: result()
    });

    expect(receipt).toEqual({
      id: "receipt:swarm:execution:1",
      sourceRef: "provider-execution:gpu-east:abc",
      capturedAt: "2026-09-22T04:40:00.000Z",
      standing: "source_record",
      authorityRef: "atlas:authority:allow-render"
    });
    expect(receipt).not.toHaveProperty("allowed");
  });

  it("fails closed when no provider execution ref exists", () => {
    const { providerExecutionRef: _providerExecutionRef, ...denied } = result({
      status: "refused_by_authority",
      authorityRef: "atlas:authority:deny-render",
      resultRefs: [],
      evidenceReceiptIds: []
    });

    expect(() =>
      createExternalExecutionObservationReceipt({
        receiptId: "receipt:swarm:execution:denied",
        result: denied
      })
    ).toThrow(/requires a provider execution ref/);
  });

  it("preserves the path even when a later boundary check rejects the provider outcome", () => {
    const receipt = createExternalExecutionObservationReceipt({
      receiptId: "receipt:swarm:execution:time",
      result: result({
        status: "refused_by_boundary",
        providerExecutionRef: "provider-execution:gpu-east:time-travel",
        observedAt: "2026-09-22T04:39:30.000Z",
        message: "provider outcome predates the external execution boundary"
      })
    });

    expect(receipt).toMatchObject({
      sourceRef: "provider-execution:gpu-east:time-travel",
      standing: "source_record",
      authorityRef: "atlas:authority:allow-render"
    });
  });

  it("can preserve an externally supplied content hash without inventing one", () => {
    const receipt = createExternalExecutionObservationReceipt({
      receiptId: "receipt:swarm:execution:hashed",
      result: result(),
      contentHash: "sha256:provider-result-abc"
    });

    expect(receipt.contentHash).toBe("sha256:provider-result-abc");
  });
});
