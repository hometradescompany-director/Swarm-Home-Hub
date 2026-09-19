import { describe, expect, it } from "vitest";
import type { SwarmResidenceEvent } from "../src/events/event.js";
import { projectResidenceTimeline } from "../src/query/residence-timeline.js";

describe("residence timeline projection", () => {
  it("preserves event time, observation time, authority and evidence as distinct facts", () => {
    const events: SwarmResidenceEvent[] = [
      {
        id: "event:requested",
        type: "swarm.residence.requested",
        occurredAt: "2026-09-19T00:00:00.000Z",
        observedAt: "2026-09-19T00:00:01.000Z",
        actorRef: "actor:source",
        residenceId: "residence:timeline" as never,
        agentIdentityRef: "agent:timeline" as never,
        sourceAgentIdentityRef: "agent:submitted" as never,
        habitatId: "habitat:one" as never,
        evidenceReceiptIds: ["receipt:request"]
      },
      {
        id: "event:admitted",
        type: "swarm.residence.admitted",
        occurredAt: "2026-09-19T00:00:02.000Z",
        observedAt: "2026-09-19T00:00:03.000Z",
        actorRef: "actor:operator",
        residenceId: "residence:timeline" as never,
        agentIdentityRef: "agent:timeline" as never,
        habitatId: "habitat:one" as never,
        evidenceReceiptIds: [],
        authorityRef: "atlas:decision:timeline"
      }
    ];

    expect(projectResidenceTimeline(events)).toEqual([
      {
        eventId: "event:requested",
        type: "swarm.residence.requested",
        status: "requested",
        occurredAt: "2026-09-19T00:00:00.000Z",
        observedAt: "2026-09-19T00:00:01.000Z",
        actorRef: "actor:source",
        agentIdentityRef: "agent:timeline",
        sourceAgentIdentityRef: "agent:submitted",
        authorityRef: null,
        evidenceReceiptIds: ["receipt:request"],
        reason: null
      },
      {
        eventId: "event:admitted",
        type: "swarm.residence.admitted",
        status: "admitted",
        occurredAt: "2026-09-19T00:00:02.000Z",
        observedAt: "2026-09-19T00:00:03.000Z",
        actorRef: "actor:operator",
        agentIdentityRef: "agent:timeline",
        sourceAgentIdentityRef: null,
        authorityRef: "atlas:decision:timeline",
        evidenceReceiptIds: [],
        reason: null
      }
    ]);
  });
});
