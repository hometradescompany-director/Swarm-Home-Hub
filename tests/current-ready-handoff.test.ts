import { describe, expect, it } from "vitest";
import type { AgentReference } from "../src/domain/agent.js";
import type { Habitat } from "../src/domain/habitat.js";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import type { ResidenceHeartbeat } from "../src/query/residence-heartbeat.js";
import {
  assertCurrentReadyHandoffFresh,
  assertCurrentReadyHandoffUsable,
  projectCurrentReadyHandoff,
  validateCurrentReadyHandoff
} from "../src/query/ready-handoff.js";

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

const habitat: Habitat = {
  id: residence.habitatId,
  name: "One",
  capacity: 3,
  status: "open",
  heartbeatStaleAfterMs: 60_000
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
  staleAfterMs: 60_000,
  freshUntil: "2026-09-19T03:01:00.000Z",
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
      lastResidenceEventId: "event:ready",
      readinessObservedAt: "2026-09-19T03:00:00.000Z",
      heartbeatEvaluatedAt: "2026-09-19T03:00:01.000Z",
      staleAfterMs: 60_000,
      freshUntil: "2026-09-19T03:01:00.000Z"
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

  it("refuses a handoff generated after its freshness boundary", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({
          evaluatedAt: "2026-09-19T03:01:00.001Z",
          freshUntil: "2026-09-19T03:01:00.000Z"
        }),
        "2026-09-19T03:01:00.001Z"
      )
    ).toThrow(/freshness boundary/);
  });

  it("refuses a heartbeat whose freshness boundary exceeds its declared policy", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({
          staleAfterMs: 60_000,
          freshUntil: "2027-09-19T03:01:00.000Z"
        }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/freshness boundary is inconsistent/);
  });

  it("refuses a heartbeat whose age does not match its timestamps", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({ ageMs: 42_000 }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/age is inconsistent/);
  });

  it("refuses a malformed heartbeat freshness threshold", () => {
    expect(() =>
      projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat({ staleAfterMs: Number.NaN }),
        "2026-09-19T03:00:01.000Z"
      )
    ).toThrow(/freshness threshold/);
  });

  it("allows a consumer to use the capsule through the freshness boundary", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(() =>
      assertCurrentReadyHandoffFresh(handoff, "2026-09-19T03:01:00.000Z")
    ).not.toThrow();
  });

  it("refuses replay after the freshness boundary", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(() =>
      assertCurrentReadyHandoffFresh(handoff, "2026-09-19T03:01:00.001Z")
    ).toThrow(/expired/);
  });

  it("allows use while the exact source residence event is still current", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(() =>
      assertCurrentReadyHandoffUsable(
        handoff,
        residence,
        habitat,
        "2026-09-19T03:00:30.000Z"
      )
    ).not.toThrow();
  });

  it("refuses a still-fresh handoff after the residence advances", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );
    const advanced: ResidenceSnapshot = {
      ...residence,
      status: "departed",
      version: residence.version + 1,
      lastEventId: "event:departed"
    };

    expect(() =>
      assertCurrentReadyHandoffUsable(
        handoff,
        advanced,
        habitat,
        "2026-09-19T03:00:30.000Z"
      )
    ).toThrow(/superseded/);
  });

  it("returns a typed refusal instead of requiring message parsing", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(
      validateCurrentReadyHandoff(
        handoff,
        residence,
        habitat,
        "2026-09-19T03:01:00.001Z"
      )
    ).toMatchObject({
      usable: false,
      code: "expired"
    });
  });

  it("types event supersession separately from expiry", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );
    const advanced: ResidenceSnapshot = {
      ...residence,
      version: residence.version + 1,
      lastEventId: "event:new-ready"
    };

    expect(
      validateCurrentReadyHandoff(
        handoff,
        advanced,
        habitat,
        "2026-09-19T03:00:30.000Z"
      )
    ).toMatchObject({
      usable: false,
      code: "source_event_superseded"
    });
  });

  it("returns usable true for the exact live source event", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(
      validateCurrentReadyHandoff(
        handoff,
        residence,
        habitat,
        "2026-09-19T03:00:30.000Z"
      )
    ).toEqual({ usable: true });
  });

  it("refuses an otherwise-live capsule after freshness policy changes", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(
      validateCurrentReadyHandoff(
        handoff,
        residence,
        { ...habitat, heartbeatStaleAfterMs: 10_000 },
        "2026-09-19T03:00:05.000Z"
      )
    ).toMatchObject({
      usable: false,
      code: "freshness_policy_changed"
    });
  });

  it("refuses an otherwise-live capsule when its habitat is paused", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(
      validateCurrentReadyHandoff(
        handoff,
        residence,
        { ...habitat, status: "paused" },
        "2026-09-19T03:00:05.000Z"
      )
    ).toMatchObject({
      usable: false,
      code: "habitat_not_open"
    });
  });

  it("refuses an otherwise-live capsule when its habitat is closed", () => {
    const handoff = projectCurrentReadyHandoff(
      residence,
      agent,
      heartbeat(),
      "2026-09-19T03:00:01.000Z"
    );

    expect(
      validateCurrentReadyHandoff(
        handoff,
        residence,
        { ...habitat, status: "closed" },
        "2026-09-19T03:00:05.000Z"
      )
    ).toMatchObject({
      usable: false,
      code: "habitat_not_open"
    });
  });
});
