import { describe, expect, it } from "vitest";
import type { AgentReference, CapabilityRef } from "../src/domain/agent.js";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { projectReadyHandoff } from "../src/query/ready-handoff.js";

const ready: ResidenceSnapshot = {
  residenceId: "residence:handoff" as never,
  agentIdentityRef: "agent:handoff" as never,
  habitatId: "habitat:one" as never,
  status: "ready",
  version: 4,
  lastEventId: "event:ready"
};

const agent: AgentReference = {
  identityRef: ready.agentIdentityRef,
  capabilityRefs: ["capability:one" as never, "capability:two" as never],
  offeringRefs: ["offering:one" as never]
};

describe("ready handoff capsule", () => {
  it("projects a bounded handoff from a ready residence", () => {
    expect(
      projectReadyHandoff(ready, agent, "2026-09-19T03:00:00.000Z")
    ).toEqual({
      residenceId: "residence:handoff",
      agentIdentityRef: "agent:handoff",
      habitatId: "habitat:one",
      capabilityRefs: ["capability:one", "capability:two"],
      offeringRefs: ["offering:one"],
      lastResidenceEventId: "event:ready",
      generatedAt: "2026-09-19T03:00:00.000Z"
    });
  });

  it("refuses handoff before readiness", () => {
    expect(() =>
      projectReadyHandoff(
        { ...ready, status: "resting" },
        agent,
        "2026-09-19T03:00:00.000Z"
      )
    ).toThrow(/requires a ready residence/);
  });

  it("refuses malformed generation time", () => {
    expect(() =>
      projectReadyHandoff(
        ready,
        agent,
        "not-a-time"
      )
    ).toThrow(/generation time/);
  });

  it("refuses cross-identity handoff", () => {
    expect(() =>
      projectReadyHandoff(
        ready,
        { ...agent, identityRef: "agent:other" as never },
        "2026-09-19T03:00:00.000Z"
      )
    ).toThrow(/does not match residence identity/);
  });
});


it("freezes ready handoff capsules and their capability arrays", () => {
  const handoff = projectReadyHandoff(ready, agent, "2026-09-20T00:00:00.000Z");

  expect(Object.isFrozen(handoff)).toBe(true);
  expect(Object.isFrozen(handoff.capabilityRefs)).toBe(true);
  expect(Object.isFrozen(handoff.offeringRefs)).toBe(true);

  expect(() => {
    (handoff.capabilityRefs as CapabilityRef[]).push("capability:three" as never);
  }).toThrow();

  expect(() => {
    (handoff as { generatedAt: string }).generatedAt = "2099-01-01T00:00:00.000Z";
  }).toThrow();
});
