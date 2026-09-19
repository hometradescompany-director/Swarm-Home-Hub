import { describe, expect, it } from "vitest";
import type { AgentReference } from "../src/domain/agent.js";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import type { ResidenceHeartbeat } from "../src/query/residence-heartbeat.js";
import { projectCurrentReadyHandoff } from "../src/query/ready-handoff.js";

const residence: ResidenceSnapshot = {
  residenceId: "residence:fresh-handoff" as never,
  agentIdentityRef: "agent:fresh-handoff" as never,
  habitatId: "habitat:one" as never,
  status: "ready",
  version: 4,
  lastEventId: "event:ready"
};

const agent: AgentReference = {
  identityRef: residence.agentIdentityRef,
  capabilityRefs: ["capability:one" as never],
  offeringRefs: ["offering:one" as never]
};

const heartbeat = (
  overrides: Partial<ResidenceHeartbeat> = {}
): ResidenceHeartbeat => ({
  residenceId: residence.residenceId,
  state: "current",
  status: "ready",
  lastEventId: residence.lastEventId,
  evaluatedAt: "2026-09-19T03:00:01.000Z",
  lastObservedAt: "2026-09-19T03:00:00.000Z",
  ageMs: 1_000,
  ...overrides
});

describe("current ready handoff", () => {
  it("allows handoff only from the exact current ready event", () => {
    expect(
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat(),
        "2026-09-19T03:00:01.000Z"
      )
    ).toMatchObject({
      residenceId: "residence:fresh-handoff",
      lastResidenceEventId: "event:ready"
    });
  });

  it("refuses a heartbeat from another residence", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({ residenceId: "residence:other" }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/does not belong/);
  });

  it("refuses a heartbeat based on an older residence event", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({ lastEventId: "event:rested" }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/different residence event/);
  });

  it("refuses stale readiness", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({ state: "stale" }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/current residence heartbeat/);
  });

  it("refuses a handoff generated before the readiness observation", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({ lastObservedAt: "2026-09-19T03:00:02.000Z" }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/before the readiness observation/);
  });

  it("refuses a heartbeat evaluated at another handoff time", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat(),
        "2026-09-19T03:00:02.000Z"
      )
    ).toThrow(/heartbeat evaluation time/);
  });

  it("refuses malformed handoff timestamps", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat(),
        "not-a-time"
      )
    ).toThrow(/valid ISO-8601/);
  });
});
