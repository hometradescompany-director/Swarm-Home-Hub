import { describe, expect, it } from "vitest";
import type { SwarmResidenceEvent } from "../src/events/event.js";
import { projectResidence } from "../src/projection/residence.js";

const first: SwarmResidenceEvent = {
  id: "event:requested",
  type: "swarm.residence.requested",
  occurredAt: "2026-09-19T00:00:10.000Z",
  observedAt: "2026-09-19T00:00:20.000Z",
  actorRef: "actor:test",
  residenceId: "residence:replay-time" as never,
  agentIdentityRef: "agent:replay-time" as never,
  habitatId: "habitat:one" as never,
  evidenceReceiptIds: [],
  previousEventId: null
};

describe("residence replay temporal validation", () => {
  it("allows event time to move backward while observation time moves forward", () => {
    expect(
      projectResidence([
        first,
        {
          ...first,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          occurredAt: "2026-09-19T00:00:05.000Z",
          observedAt: "2026-09-19T00:00:21.000Z",
          previousEventId: "event:requested"
        }
      ])
    ).toMatchObject({
      status: "admitted",
      version: 2
    });
  });

  it("rejects replay when observation time moves backward", () => {
    expect(() =>
      projectResidence([
        first,
        {
          ...first,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          occurredAt: "2026-09-19T00:00:30.000Z",
          observedAt: "2026-09-19T00:00:19.999Z",
          previousEventId: "event:requested"
        }
      ])
    ).toThrow(/observation time moved backward/);
  });

  it("rejects malformed replay timestamps", () => {
    expect(() =>
      projectResidence([
        {
          ...first,
          occurredAt: "not-a-time"
        }
      ])
    ).toThrow(/invalid ISO-8601 timestamps/);
  });
});
