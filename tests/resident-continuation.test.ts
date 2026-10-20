import { describe, expect, it, vi } from "vitest";
import type { AgentReference } from "../src/domain/agent.js";
import type { ResidenceId } from "../src/domain/residence.js";
import { createTypedAbsence } from "../src/provenance/absence.js";
import type { CurrentReadyHandoffCapsule } from "../src/query/ready-handoff.js";
import type { ReadyHandoffAttempt } from "../src/service/ready-handoff-service.js";
import {
  ResidentContinuationBridge,
  type ContinuationExecutor,
  type ReadyHandoffIssuer
} from "../src/platform/resident-continuation.js";

const residenceId = "residence:continuation" as ResidenceId;
const agent: AgentReference = {
  identityRef: "agent:sol" as never,
  capabilityRefs: ["capability:build" as never],
  offeringRefs: ["offering:iteration" as never]
};

const handoff: CurrentReadyHandoffCapsule = {
  residenceId,
  agentIdentityRef: agent.identityRef,
  habitatId: "habitat:swarm-home",
  capabilityRefs: agent.capabilityRefs,
  offeringRefs: agent.offeringRefs,
  lastResidenceEventId: "event:ready",
  generatedAt: "2026-09-21T03:00:00.000Z",
  readinessObservedAt: "2026-09-21T02:59:30.000Z",
  heartbeatEvaluatedAt: "2026-09-21T03:00:00.000Z",
  staleAfterMs: 60_000,
  freshUntil: "2026-09-21T03:00:30.000Z"
};

function issuer(result: ReadyHandoffAttempt): ReadyHandoffIssuer {
  return {
    attempt: vi.fn().mockResolvedValue(result)
  };
}

describe("resident continuation bridge", () => {
  it("fails closed when the residence cannot produce a current ready handoff", async () => {
    const absence = createTypedAbsence({
      kind: "rejected_by_validation",
      statement: "residence is stale",
      observedAt: "2026-09-21T03:00:00.000Z",
      sourceRef: "swarm:ready-handoff:residence:continuation"
    });
    const execute = vi.fn();
    const pulses: string[] = [];
    const bridge = new ResidentContinuationBridge(
      issuer({ created: false, absence }),
      { execute },
      {
        clock: () => "2026-09-21T03:00:00.000Z",
        observe: pulse => pulses.push(pulse.state)
      }
    );

    const result = await bridge.runOnce({
      taskRef: "task:321",
      residenceId,
      agent,
      payload: { instruction: "continue" }
    });

    expect(result).toMatchObject({
      state: "blocked",
      taskRef: "task:321",
      absence
    });
    expect(execute).not.toHaveBeenCalled();
    expect(pulses).toEqual(["blocked"]);
  });

  it("publishes running and completed pulses around one bounded execution", async () => {
    const times = [
      "2026-09-21T03:00:00.000Z",
      "2026-09-21T03:00:04.000Z"
    ];
    const execute: ContinuationExecutor<{ instruction: string }, { pr: number }>["execute"] =
      vi.fn().mockResolvedValue({ pr: 321 });
    const pulses: string[] = [];
    const bridge = new ResidentContinuationBridge(
      issuer({ created: true, handoff }),
      { execute },
      {
        clock: () => times.shift()!,
        observe: pulse => pulses.push(pulse.state)
      }
    );

    const task = {
      taskRef: "task:321",
      residenceId,
      agent,
      payload: { instruction: "continue" }
    };

    const result = await bridge.runOnce(task);

    expect(execute).toHaveBeenCalledWith({
      task,
      handoff,
      startedAt: "2026-09-21T03:00:00.000Z"
    });
    expect(result).toMatchObject({
      state: "completed",
      taskRef: "task:321",
      observedAt: "2026-09-21T03:00:04.000Z",
      result: { pr: 321 }
    });
    expect(pulses).toEqual(["running", "completed"]);
  });

  it("surfaces executor failure without inventing a completed iteration", async () => {
    const times = [
      "2026-09-21T03:00:00.000Z",
      "2026-09-21T03:00:02.000Z"
    ];
    const pulses: string[] = [];
    const bridge = new ResidentContinuationBridge(
      issuer({ created: true, handoff }),
      {
        execute: vi.fn().mockRejectedValue(new Error("provider unavailable"))
      },
      {
        clock: () => times.shift()!,
        observe: pulse => pulses.push(pulse.state)
      }
    );

    const result = await bridge.runOnce({
      taskRef: "task:blocked-provider",
      residenceId,
      agent,
      payload: null
    });

    expect(result).toMatchObject({
      state: "failed",
      taskRef: "task:blocked-provider",
      error: "provider unavailable",
      observedAt: "2026-09-21T03:00:02.000Z"
    });
    expect(pulses).toEqual(["running", "failed"]);
  });

  it("refuses empty task identities before requesting a handoff", async () => {
    const handoffs = issuer({ created: true, handoff });
    const bridge = new ResidentContinuationBridge(
      handoffs,
      { execute: vi.fn() },
      { clock: () => "2026-09-21T03:00:00.000Z" }
    );

    await expect(
      bridge.runOnce({
        taskRef: "   ",
        residenceId,
        agent,
        payload: null
      })
    ).rejects.toThrow(/taskRef/);

    expect(handoffs.attempt).not.toHaveBeenCalled();
  });
});
