import { describe, expect, it } from "vitest";
import type { Habitat } from "../src/domain/habitat.js";
import type { SwarmResidenceEvent } from "../src/events/event.js";
import { projectResidenceHeartbeat } from "../src/query/residence-heartbeat.js";

const habitat: Habitat = {
  id: "habitat:one" as never,
  name: "One",
  capacity: 3,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

const base: SwarmResidenceEvent = {
  id: "event:requested",
  type: "swarm.residence.requested",
  occurredAt: "2026-09-19T00:00:00.000Z",
  observedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:test",
  residenceId: "residence:heartbeat" as never,
  agentIdentityRef: "agent:heartbeat" as never,
  habitatId: habitat.id,
  evidenceReceiptIds: []
};

describe("residence heartbeat", () => {
  it("returns unknown for absent history using habitat-owned freshness policy", () => {
    expect(
      projectResidenceHeartbeat([], "2026-09-19T00:01:00.000Z", habitat)
    ).toEqual({
      residenceId: null,
      state: "unknown",
      status: null,
      lastEventId: null,
      evaluatedAt: "2026-09-19T00:01:00.000Z",
      lastObservedAt: null,
      ageMs: null,
      staleAfterMs: 60_000,
      freshUntil: null
    });
  });

  it("marks active residence history stale only after habitat threshold", () => {
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
        habitat
      )
    ).toMatchObject({
      state: "stale",
      status: "admitted",
      lastEventId: "event:admitted",
      evaluatedAt: "2026-09-19T00:01:20.001Z",
      ageMs: 70_001,
      staleAfterMs: 60_000,
      freshUntil: "2026-09-19T00:01:10.000Z"
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
        habitat
      )
    ).toMatchObject({
      state: "terminal",
      status: "departed",
      lastEventId: "event:departed",
      freshUntil: "2026-09-19T00:01:20.000Z"
    });
  });

  it("refuses a heartbeat evaluated before its latest observation", () => {
    expect(() =>
      projectResidenceHeartbeat(
        [base],
        "2026-09-18T23:59:59.999Z",
        habitat
      )
    ).toThrow(/future relative to now/);
  });

  it("refuses an invalid evaluation time even when history is absent", () => {
    expect(() =>
      projectResidenceHeartbeat([], "not-a-time", habitat)
    ).toThrow(/evaluation time/);
  });

  it("refuses a heartbeat projected under the wrong habitat", () => {
    expect(() =>
      projectResidenceHeartbeat(
        [base],
        "2026-09-19T00:00:10.000Z",
        { ...habitat, id: "habitat:other" as never }
      )
    ).toThrow(/does not match residence habitat/);
  });

  it("refuses malformed habitat freshness policy", () => {
    expect(() =>
      projectResidenceHeartbeat(
        [base],
        "2026-09-19T00:00:10.000Z",
        { ...habitat, heartbeatStaleAfterMs: Number.NaN }
      )
    ).toThrow(/heartbeatStaleAfterMs/);
  });
});
