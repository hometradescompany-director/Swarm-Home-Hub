import { describe, expect, it } from "vitest";
import { projectResidence } from "../src/projection/residence.js";
import type { SwarmResidenceEvent } from "../src/events/event.js";

describe("residence projection", () => {
  it("rebuilds the same current state from ordered events", () => {
    const base = {
      occurredAt: "2026-09-18T00:00:00Z",
      observedAt: "2026-09-18T00:00:00Z",
      actorRef: "actor:test",
      residenceId: "res:1",
      agentIdentityRef: "agent:1",
      habitatId: "habitat:default",
      evidenceReceiptIds: []
    } as const;

    const events = [
      { ...base, id: "e1", type: "swarm.residence.requested" },
      { ...base, id: "e2", type: "swarm.residence.admitted" },
      { ...base, id: "e3", type: "swarm.residence.rested" },
      { ...base, id: "e4", type: "swarm.residence.ready" }
    ] as unknown as SwarmResidenceEvent[];

    expect(projectResidence(events)).toMatchObject({
      status: "ready",
      version: 4,
      lastEventId: "e4"
    });
  });
});
