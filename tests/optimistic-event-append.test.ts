import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import { ResidenceService } from "../src/service/residence-service.js";

const requested: ResidenceSnapshot = {
  residenceId: "residence:race" as never,
  agentIdentityRef: "agent:race" as never,
  habitatId: "habitat:one" as never,
  status: "requested",
  version: 1,
  lastEventId: "event:requested"
};

describe("optimistic event append", () => {
  it("rejects a second writer using a stale residence snapshot", async () => {
    const journal = new InMemoryEventJournal();
    await journal.append(
      {
        id: "event:requested",
        type: "swarm.residence.requested",
        occurredAt: "2026-09-19T00:00:00.000Z",
        observedAt: "2026-09-19T00:00:00.000Z",
        actorRef: "actor:request",
        residenceId: requested.residenceId,
        agentIdentityRef: requested.agentIdentityRef,
        habitatId: requested.habitatId,
        evidenceReceiptIds: []
      },
      { expectedLastEventId: null }
    );

    const service = new ResidenceService(journal);
    await service.transition(requested, "admitted", {
      id: "event:admitted",
      occurredAt: "2026-09-19T00:00:01.000Z",
      observedAt: "2026-09-19T00:00:01.000Z",
      actorRef: "actor:first",
      evidenceReceiptIds: []
    });

    await expect(
      service.transition(requested, "rejected", {
        id: "event:rejected",
        occurredAt: "2026-09-19T00:00:02.000Z",
        observedAt: "2026-09-19T00:00:02.000Z",
        actorRef: "actor:stale",
        evidenceReceiptIds: [],
        reason: "stale writer"
      })
    ).rejects.toThrow(/stale residence snapshot/);

    expect(await journal.eventsForResidence(requested.residenceId)).toHaveLength(2);
  });

  it("fails concurrent creation when a residence already has a first event", async () => {
    const journal = new InMemoryEventJournal();
    const event = {
      id: "event:first",
      type: "swarm.residence.requested" as const,
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:00.000Z",
      actorRef: "actor:first",
      residenceId: "residence:create-race" as never,
      agentIdentityRef: "agent:create-race" as never,
      habitatId: "habitat:one" as never,
      evidenceReceiptIds: []
    };

    await journal.append(event, { expectedLastEventId: null });

    await expect(
      journal.append(
        { ...event, id: "event:second" },
        { expectedLastEventId: null }
      )
    ).rejects.toThrow(/stale residence snapshot/);
  });
});
