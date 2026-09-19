import { describe, expect, it } from "vitest";
import type { SwarmResidenceEvent } from "../src/events/event.js";
import { projectResidenceHeartbeat } from "../src/query/residence-heartbeat.js";

const base: SwarmResidenceEvent = {
  id: "event:requested",
  type: "swarm.residence.requested",
  occurredAt: "2026-09-19T00:00:00.000Z",
  observedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:test",
  residenceId: "residence:heartbeat" as never,
  agentIdentityRef: "agent:heartbeat" as never,
  habitatId: "habitat:one" as never,
  evidenceReceiptIds: []
};

describe("residence heartbeat", () => {
  it("returns unknown for absent history", () => {
    expect(
      projectResidenceHeartbeat([], "2026-09-19T00:01:00.000Z", 60_000)
    ).toEqual({
      residenceId: null,
      state: "unknown",
      status: null,
      lastEventId: null,
      evaluatedAt: "2026-09-19T00:01:00.000Z",
      lastObservedAt: null,
      ageMs: null
    });
  });

  it("marks active residence history stale only after the supplied threshold", () => {
    const admitted: SwarmResidenceEvent = {
      ...base,
      id: "event:admitted",
      type: "swarm.residence.admitted",
      observedAt: "2026-09-19T00:00:10.000Z"
    };

    expect(
      projectResidenceHeartbeat(
        [base, admitted],
        "2026-09-19T00:01:20.001Z",
        60_000
      )
    ).toMatchObject({
      state: "stale",
      status: "admitted",
      lastEventId: "event:admitted",
      evaluatedAt: "2026-09-19T00:01:20.001Z",
      ageMs: 70_001
    });
  });

  it("marks departed/rejected histories terminal rather than stale", () => {
    const admitted: SwarmResidenceEvent = {
      ...base,
      id: "event:admitted",
      type: "swarm.residence.admitted",
      observedAt: "2026-09-19T00:00:10.000Z"
    };
    const departed: SwarmResidenceEvent = {
      ...base,
      id: "event:departed",
      type: "swarm.residence.departed",
      observedAt: "2026-09-19T00:00:20.000Z"
    };

    expect(
      projectResidenceHeartbeat(
        [base, admitted, departed],
        "2026-09-20T00:00:00.000Z",
        60_000
      )
    ).toMatchObject({
      state: "terminal",
      status: "departed",
      lastEventId: "event:departed"
    });
  });

  it("refuses a heartbeat evaluated before its latest observation", () => {
    expect(() =>
      projectResidenceHeartbeat(
        [base],
        "2026-09-18T23:59:59.999Z",
        60_000
      )
    ).toThrow(/future relative to now/);
  });

  it("refuses an invalid evaluation time even when history is absent", () => {
    expect(() =>
      projectResidenceHeartbeat([], "not-a-time", 60_000)
    ).toThrow(/evaluation time/);
  });
});
