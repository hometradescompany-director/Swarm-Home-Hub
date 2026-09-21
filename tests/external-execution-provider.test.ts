import { describe, expect, it } from "vitest";
import {
  createExternalExecutionRequest,
  executeWithExternalProvider,
  SWARM_HOME_EXTERNAL_EXECUTION_REQUEST,
  SWARM_HOME_EXTERNAL_EXECUTION_RESULT
} from "../src/integrations/execution-provider/contract.js";
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
