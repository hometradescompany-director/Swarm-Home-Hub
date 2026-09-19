import { describe, expect, it } from "vitest";
import type { SwarmResidenceEvent } from "../src/events/event.js";
import { projectResidence } from "../src/projection/residence.js";

const base: SwarmResidenceEvent = {
  id: "event:requested",
  type: "swarm.residence.requested",
  occurredAt: "2026-09-19T00:00:00.000Z",
  observedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:test",
  residenceId: "residence:replay-chain" as never,
  agentIdentityRef: "agent:replay-chain" as never,
  habitatId: "habitat:one" as never,
  evidenceReceiptIds: [],
  previousEventId: null
};

describe("residence replay predecessor validation", () => {
  it("accepts an explicit valid predecessor chain", () => {
    expect(
      projectResidence([
        base,
        {
          ...base,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          previousEventId: "event:requested"
        }
      ])
    ).toMatchObject({
      status: "admitted",
      lastEventId: "event:admitted",
      version: 2
    });
  });

  it("rejects a first event that claims a predecessor", () => {
    expect(() =>
      projectResidence([
        { ...base, previousEventId: "event:before-history" }
      ])
    ).toThrow(/first residence event cannot name a predecessor/);
  });

  it("rejects a replay whose predecessor claim does not match the prior event", () => {
    expect(() =>
      projectResidence([
        base,
        {
          ...base,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          previousEventId: "event:wrong"
        }
      ])
    ).toThrow(/projection predecessor mismatch/);
  });
});
