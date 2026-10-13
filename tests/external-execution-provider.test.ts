import { describe, expect, it } from "vitest";
import {
  createExternalExecutionRequest,
  executeWithExternalProvider,
  SWARM_HOME_EXTERNAL_EXECUTION_REQUEST,
  SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
  type ExternalExecutionResult
} from "../src/integrations/execution-provider/contract.js";
import { createExternalExecutionCheckpointReceipt } from "../src/integrations/execution-provider/execution-receipt.js";
import type { SwarmHomeExternalHandoff } from "../src/integrations/handoff/conformance.js";

const handoff: SwarmHomeExternalHandoff = {
  schema: "SwarmHomeExternalHandoff/v1",
  sourceResidenceRef: "residence:one",
  sourceEventRef: "event:ready",
  agentIdentityRef: "atlas:agent:one",
  capabilityRefs: ["capability:bounded-code"],
  offeringRefs: ["offering:external-execution"],
  relationalContextRefs: [],
  generatedAt: "2026-09-22T01:00:00.000Z",
  freshUntil: "2026-09-22T01:05:00.000Z",
  authorityImplication: "none"
};

function request() {
  return createExternalExecutionRequest({
    requestId: "exec:req:1",
    providerRef: "provider:agent-swarm",
    capabilityRef: "capability:bounded-code",
    instructionRef: "atlas:instruction:opaque-1",
    artifactRefs: ["artifact:input:1"],
    evidenceReceiptIds: ["receipt:handoff:1"],
    handoff,
    requestedAt: "2026-09-22T01:01:00.000Z",
    expiresAt: "2026-09-22T01:04:00.000Z"
  });
}

function checkpointReceipt(
  overrides: Partial<ExternalExecutionResult> = {}
) {
  return createExternalExecutionCheckpointReceipt({
    receiptId: "receipt:checkpoint:1",
    result: {
      schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
      requestId: "exec:req:1",
      providerRef: "provider:agent-swarm",
      capabilityRef: "capability:bounded-code",
      authorityRef: "atlas:authority:original",
      providerExecutionRef: "remote:task:abc",
      checkpointRef: "provider:checkpoint:opaque-1",
      status: "accepted",
      resultRefs: [],
      evidenceReceiptIds: [],
      observedAt: "2026-09-22T01:02:00.000Z",
      ...overrides
    }
  });
}

describe("external execution-provider envelope", () => {
  it("creates a bounded request from an existing handoff", () => {
    expect(request()).toMatchObject({
      schema: SWARM_HOME_EXTERNAL_EXECUTION_REQUEST,
      requestId: "exec:req:1",
      providerRef: "provider:agent-swarm",
      capabilityRef: "capability:bounded-code",
      instructionRef: "atlas:instruction:opaque-1",
      handoff: {
        authorityImplication: "none"
      }
    });
  });

  it("cannot outlive the readiness handoff", () => {
    expect(() =>
      createExternalExecutionRequest({
        requestId: "exec:req:late",
        providerRef: "provider:agent-swarm",
        capabilityRef: "capability:bounded-code",
        instructionRef: "atlas:instruction:opaque-1",
        handoff,
        requestedAt: "2026-09-22T01:01:00.000Z",
        expiresAt: "2026-09-22T01:06:00.000Z"
      })
    ).toThrow(/outlive/);
  });

  it("requires an explicit authority decision before provider execution", async () => {
    let providerCalls = 0;

    const result = await executeWithExternalProvider({
      request: request(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          providerCalls += 1;
          return {
            providerExecutionRef: "remote:task:should-not-run",
            status: "accepted",
            resultRefs: [],
            evidenceReceiptIds: [],
            observedAt: "2026-09-22T01:02:00.000Z"
          };
        }
      },
      authorize: async () => ({
        allowed: false,
        authorityRef: "atlas:authority:deny",
        decidedAt: "2026-09-22T01:01:30.000Z",
        reason: "capability not authorised"
      }),
      observedAt: "2026-09-22T01:01:30.000Z"
    });

    expect(providerCalls).toBe(0);
    expect(result).toMatchObject({
      schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
      status: "refused_by_authority",
      authorityRef: "atlas:authority:deny"
    });
  });

  it("returns only provider/result/evidence refs instead of copying remote task state", async () => {
    const result = await executeWithExternalProvider({
      request: request(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute(input) {
          expect(input.instructionRef).toBe("atlas:instruction:opaque-1");
          return {
            providerExecutionRef: "remote:task:abc",
            status: "completed",
            resultRefs: ["artifact:result:1"],
            evidenceReceiptIds: ["receipt:remote:1"],
            observedAt: "2026-09-22T01:02:00.000Z",
            message: "bounded execution completed"
          };
        }
      },
      authorize: async () => ({
        allowed: true,
        authorityRef: "atlas:authority:allow",
        decidedAt: "2026-09-22T01:01:30.000Z"
      }),
      observedAt: "2026-09-22T01:01:30.000Z"
    });

    expect(result).toEqual({
      schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
      requestId: "exec:req:1",
      providerRef: "provider:agent-swarm",
      capabilityRef: "capability:bounded-code",
      authorityRef: "atlas:authority:allow",
      providerExecutionRef: "remote:task:abc",
      status: "completed",
      resultRefs: ["artifact:result:1"],
      evidenceReceiptIds: ["receipt:remote:1"],
      observedAt: "2026-09-22T01:02:00.000Z",
      message: "bounded execution completed"
    });

    expect(result).not.toHaveProperty("remoteTask");
    expect(result).not.toHaveProperty("worker");
    expect(result).not.toHaveProperty("memory");
    expect(result).not.toHaveProperty("schedule");
  });

  it("records a provider-owned checkpoint as an opaque provenance reference", () => {
    const receipt = checkpointReceipt();

    expect(receipt).toMatchObject({
      id: "receipt:checkpoint:1",
      sourceRef: "provider:checkpoint:opaque-1",
      checkpointRef: "provider:checkpoint:opaque-1",
      providerExecutionRef: "remote:task:abc",
      authorityRef: "atlas:authority:original",
      standing: "source_record"
    });
    expect(receipt).not.toHaveProperty("checkpointData");
  });

  it("preserves a provider checkpoint ref in the execution receipt", async () => {
    const result = await executeWithExternalProvider({
      request: request(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          return {
            providerExecutionRef: "remote:task:abc",
            checkpointRef: "provider:checkpoint:opaque-1",
            status: "accepted",
            resultRefs: [],
            evidenceReceiptIds: [],
            observedAt: "2026-09-22T01:02:00.000Z"
          };
        }
      },
      authorize: async () => ({
        allowed: true,
        authorityRef: "atlas:authority:original",
        decidedAt: "2026-09-22T01:01:30.000Z"
      }),
      observedAt: "2026-09-22T01:01:30.000Z"
    });
    const receipt = createExternalExecutionCheckpointReceipt({
      receiptId: "receipt:checkpoint:1",
      result
    });

    expect(result.checkpointRef).toBe("provider:checkpoint:opaque-1");
    expect(receipt.sourceRef).toBe("provider:checkpoint:opaque-1");
  });

  it("revalidates authority and refuses a revoked checkpoint without resuming", async () => {
    let authorizations = 0;
    let resumes = 0;
    const result = await executeWithExternalProvider({
      request: request(),
      checkpoint: checkpointReceipt(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          throw new Error("resume must not execute a fresh task");
        },
        async resume() {
          resumes += 1;
          throw new Error("revoked work must not resume");
        }
      },
      authorize: async () => {
        authorizations += 1;
        return {
          allowed: false,
          authorityRef: "atlas:authority:revoked",
          decidedAt: "2026-09-22T01:03:00.000Z"
        };
      },
      observedAt: "2026-09-22T01:03:00.000Z"
    });

    expect(authorizations).toBe(1);
    expect(resumes).toBe(0);
    expect(result).toMatchObject({
      status: "refused_by_authority",
      authorityRef: "atlas:authority:revoked"
    });
  });

  it("resumes only the checkpointed provider execution after fresh authorization", async () => {
    let resumedCheckpointRef = "";
    const result = await executeWithExternalProvider({
      request: request(),
      checkpoint: checkpointReceipt(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          throw new Error("resume must not create a fresh task");
        },
        async resume(input, checkpointRef) {
          expect(input.requestId).toBe("exec:req:1");
          resumedCheckpointRef = checkpointRef;
          return {
            providerExecutionRef: "remote:task:abc",
            status: "completed",
            resultRefs: ["artifact:result:1"],
            evidenceReceiptIds: ["receipt:provider:resumed"],
            observedAt: "2026-09-22T01:03:00.000Z"
          };
        }
      },
      authorize: async () => ({
        allowed: true,
        authorityRef: "atlas:authority:renewed",
        decidedAt: "2026-09-22T01:03:00.000Z"
      }),
      observedAt: "2026-09-22T01:03:00.000Z"
    });

    expect(resumedCheckpointRef).toBe("provider:checkpoint:opaque-1");
    expect(result).toMatchObject({
      status: "completed",
      providerExecutionRef: "remote:task:abc",
      authorityRef: "atlas:authority:renewed"
    });
  });

  it("refuses a stale checkpoint receipt before consulting authority or provider", async () => {
    let authorized = false;
    let resumed = false;
    const result = await executeWithExternalProvider({
      request: request(),
      checkpoint: checkpointReceipt({
        observedAt: "2026-09-22T01:00:00.000Z"
      }),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          throw new Error("must not execute");
        },
        async resume() {
          resumed = true;
          throw new Error("stale checkpoint must not resume");
        }
      },
      authorize: async () => {
        authorized = true;
        return {
          allowed: true,
          authorityRef: "atlas:authority:allow",
          decidedAt: "2026-09-22T01:03:00.000Z"
        };
      },
      observedAt: "2026-09-22T01:03:00.000Z"
    });

    expect(authorized).toBe(false);
    expect(resumed).toBe(false);
    expect(result).toMatchObject({
      status: "refused_by_boundary",
      message: "external execution checkpoint receipt is stale or mismatched"
    });
  });

  it("preserves provider refusal when a checkpoint is no longer current", async () => {
    const result = await executeWithExternalProvider({
      request: request(),
      checkpoint: checkpointReceipt(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          throw new Error("resume must not create a fresh task");
        },
        async resume() {
          return {
            providerExecutionRef: "remote:task:abc",
            status: "refused",
            resultRefs: [],
            evidenceReceiptIds: [],
            observedAt: "2026-09-22T01:03:00.000Z",
            message: "checkpoint is no longer current"
          };
        }
      },
      authorize: async () => ({
        allowed: true,
        authorityRef: "atlas:authority:renewed",
        decidedAt: "2026-09-22T01:03:00.000Z"
      }),
      observedAt: "2026-09-22T01:03:00.000Z"
    });

    expect(result).toMatchObject({
      status: "refused",
      message: "checkpoint is no longer current"
    });
  });

  it("refuses impossible provider chronology while preserving the remote execution ref", async () => {
    const result = await executeWithExternalProvider({
      request: request(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          return {
            providerExecutionRef: "remote:task:time-travel",
            status: "completed",
            resultRefs: ["artifact:result:time-travel"],
            evidenceReceiptIds: ["receipt:remote:time-travel"],
            observedAt: "2026-09-22T01:01:20.000Z"
          };
        }
      },
      authorize: async () => ({
        allowed: true,
        authorityRef: "atlas:authority:allow",
        decidedAt: "2026-09-22T01:01:25.000Z"
      }),
      observedAt: "2026-09-22T01:01:30.000Z"
    });

    expect(result).toMatchObject({
      providerExecutionRef: "remote:task:time-travel",
      status: "refused_by_boundary",
      message: "provider outcome predates the external execution boundary"
    });
  });

  it("refuses an execution boundary observed before the request exists", async () => {
    let authorised = false;
    const result = await executeWithExternalProvider({
      request: request(),
      provider: {
        providerRef: "provider:agent-swarm",
        async execute() {
          throw new Error("must not execute");
        }
      },
      authorize: async () => {
        authorised = true;
        return {
          allowed: true,
          authorityRef: "atlas:authority:allow",
          decidedAt: "2026-09-22T01:00:30.000Z"
        };
      },
      observedAt: "2026-09-22T01:00:30.000Z"
    });

    expect(authorised).toBe(false);
    expect(result).toMatchObject({
      status: "refused_by_boundary",
      message: "external execution cannot be observed before the request exists"
    });
  });

  it("fails closed when the provider identity does not match the request", async () => {
    let authorised = false;
    const result = await executeWithExternalProvider({
      request: request(),
      provider: {
        providerRef: "provider:wrong",
        async execute() {
          throw new Error("must not execute");
        }
      },
      authorize: async () => {
        authorised = true;
        return {
          allowed: true,
          authorityRef: "atlas:authority:allow",
          decidedAt: "2026-09-22T01:01:30.000Z"
        };
      },
      observedAt: "2026-09-22T01:01:30.000Z"
    });

    expect(authorised).toBe(false);
    expect(result.status).toBe("refused_by_boundary");
  });
});
