import { describe, expect, it } from "vitest";
import { qualifyExternalPrincipalForExecution } from "../src/policy/external-principal-execution.js";
import { projectExternalSemanticState } from "../src/refinery/external-semantic-state.js";
import { projectRecoveryOwnership } from "../src/observability/recovery-ownership.js";
import { projectExternalDurableExecutionStanding } from "../src/integrations/execution-provider/durable-standing.js";
import { createExternalExecutionRequest } from "../src/integrations/execution-provider/contract.js";
import type { SwarmHomeExternalHandoff } from "../src/integrations/handoff/conformance.js";

const handoff: SwarmHomeExternalHandoff = {
  schema: "SwarmHomeExternalHandoff/v1",
  sourceResidenceRef: "residence:watch-harvest",
  sourceEventRef: "event:ready",
  agentIdentityRef: "atlas:agent:watch-harvest",
  capabilityRefs: ["capability:execute"],
  offeringRefs: ["offering:external-execution"],
  relationalContextRefs: [],
  generatedAt: "2026-09-24T00:00:00.000Z",
  freshUntil: "2026-09-24T00:10:00.000Z",
  authorityImplication: "none"
};

describe("2026-09-24 cross-swarm watcher harvest", () => {
  it("keeps API principals out of worker scheduling", () => {
    expect(
      qualifyExternalPrincipalForExecution({
        identityRef: "ext:github",
        posture: "principal_only",
        evidenceReceiptIds: ["receipt:principal"],
        observedAt: "2026-09-24T00:01:00.000Z"
      })
    ).toMatchObject({
      schedulable: false,
      refusalReason: "principal_not_worker",
      authorityImplication: "none"
    });

    expect(
      qualifyExternalPrincipalForExecution({
        identityRef: "worker:one",
        posture: "worker",
        evidenceReceiptIds: ["receipt:worker"],
        observedAt: "2026-09-24T00:01:00.000Z"
      })
    ).toMatchObject({
      schedulable: true,
      authorityImplication: "none"
    });
  });

  it("does not collapse provider storage completion into semantic completion", () => {
    expect(
      projectExternalSemanticState({
        subjectRef: "provider-task:deferred",
        storageStatus: "completed",
        deferredAt: "2026-09-24T00:02:00.000Z",
        wakeRef: "schedule:wake:1",
        observedAt: "2026-09-24T00:02:01.000Z",
        evidenceReceiptIds: ["receipt:deferral"]
      })
    ).toMatchObject({
      storageStatus: "completed",
      semanticStanding: "waiting",
      wakeRef: "schedule:wake:1"
    });

    expect(
      projectExternalSemanticState({
        subjectRef: "provider-task:done",
        storageStatus: "completed",
        observedAt: "2026-09-24T00:02:01.000Z",
        evidenceReceiptIds: ["receipt:done"]
      })
    ).toMatchObject({
      storageStatus: "completed",
      semanticStanding: "done"
    });
  });

  it("treats process-local recovery ownership as local evidence only", () => {
    expect(
      projectRecoveryOwnership({
        subjectRef: "workflow:one",
        scope: "process_local",
        localOwnerActive: true,
        observedAt: "2026-09-24T00:03:00.000Z",
        evidenceReceiptIds: ["receipt:walk"]
      })
    ).toMatchObject({
      localRecoveryCandidate: false,
      distributedExclusivityProven: false,
      authorityImplication: "none"
    });

    expect(
      projectRecoveryOwnership({
        subjectRef: "workflow:one",
        scope: "process_local",
        localOwnerActive: false,
        observedAt: "2026-09-24T00:03:01.000Z",
        evidenceReceiptIds: ["receipt:no-local-walk"]
      })
    ).toMatchObject({
      localRecoveryCandidate: true,
      distributedExclusivityProven: false,
      authorityImplication: "none"
    });
  });

  it("requires keyed acknowledgements before a post-commit fault may retain durable success", () => {
    expect(
      projectExternalDurableExecutionStanding({
        status: "completed",
        idempotencyKey: "fork:one",
        activationAcknowledged: true,
        completionAcknowledged: true,
        postCommitFault: true
      })
    ).toMatchObject({
      standing: "replayable_success",
      replayable: true,
      durableSuccess: true
    });

    expect(
      projectExternalDurableExecutionStanding({
        status: "completed",
        idempotencyKey: "   ",
        activationAcknowledged: true,
        completionAcknowledged: true,
        postCommitFault: true
      })
    ).toMatchObject({
      standing: "incomplete",
      replayable: false,
      durableSuccess: false
    });

    expect(
      projectExternalDurableExecutionStanding({
        status: "completed"
      })
    ).toMatchObject({
      standing: "observed_success_only",
      replayable: false,
      durableSuccess: false
    });
  });

  it("preserves normalized idempotency intent on the existing execution envelope", () => {
    expect(
      createExternalExecutionRequest({
        requestId: "exec:watch:1",
        providerRef: "provider:division",
        capabilityRef: "capability:fork",
        instructionRef: "instruction:fork",
        idempotencyKey: "  fork:stable:1  ",
        handoff,
        requestedAt: "2026-09-24T00:01:00.000Z",
        expiresAt: "2026-09-24T00:09:00.000Z"
      })
    ).toMatchObject({
      idempotencyKey: "fork:stable:1"
    });

    expect(
      createExternalExecutionRequest({
        requestId: "exec:watch:2",
        providerRef: "provider:division",
        capabilityRef: "capability:fork",
        instructionRef: "instruction:fork",
        idempotencyKey: "   ",
        handoff,
        requestedAt: "2026-09-24T00:01:00.000Z",
        expiresAt: "2026-09-24T00:09:00.000Z"
      })
    ).not.toHaveProperty("idempotencyKey");
  });
});
