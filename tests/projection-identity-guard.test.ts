import { describe, expect, it } from "vitest";
import { projectResidence } from "../src/projection/residence.js";
import type { SwarmResidenceEvent } from "../src/events/event.js";

const requested: SwarmResidenceEvent = {
  id: "event:requested",
  type: "swarm.residence.requested",
  occurredAt: "2026-09-19T00:00:00.000Z",
  observedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:test",
  residenceId: "residence:identity-guard" as never,
  agentIdentityRef: "agent:one" as never,
  habitatId: "habitat:one" as never,
  evidenceReceiptIds: []
};

describe("residence projection identity guard", () => {
  it("requires the history to begin with a request", () => {
    expect(() =>
      projectResidence([
        { ...requested, id: "event:admitted", type: "swarm.residence.admitted" }
      ])
    ).toThrow(/begin with a request/);
  });

  it("rejects agent identity drift inside one residence", () => {
    expect(() =>
      projectResidence([
        requested,
        {
          ...requested,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          agentIdentityRef: "agent:two" as never
        }
      ])
    ).toThrow(/changed agent identity/);
  });

  it("rejects habitat identity drift inside one residence", () => {
    expect(() =>
      projectResidence([
        requested,
        {
          ...requested,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          habitatId: "habitat:two" as never
        }
      ])
    ).toThrow(/changed habitat identity/);
  });

  it("rejects an impossible replayed transition", () => {
    expect(() =>
      projectResidence([
        requested,
        { ...requested, id: "event:ready", type: "swarm.residence.ready" }
      ])
    ).toThrow(/invalid residence transition/);
  });
});
