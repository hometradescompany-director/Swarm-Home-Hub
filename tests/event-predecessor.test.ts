import { describe, expect, it } from "vitest";
import { InMemoryEventJournal } from "../src/events/journal.js";

const base = {
  occurredAt: "2026-09-19T00:00:00.000Z",
  observedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:test",
  residenceId: "residence:chain" as never,
  agentIdentityRef: "agent:chain" as never,
  habitatId: "habitat:one" as never,
  evidenceReceiptIds: []
};

describe("residence event predecessor chain", () => {
  it("persists explicit predecessor links for the whole residence path", async () => {
    const journal = new InMemoryEventJournal();

    await journal.append(
      {
        ...base,
        id: "event:requested",
        type: "swarm.residence.requested",
        previousEventId: null
      },
      { expectedLastEventId: null }
    );

    await journal.append(
      {
        ...base,
        id: "event:admitted",
        type: "swarm.residence.admitted",
        previousEventId: "event:requested"
      },
      { expectedLastEventId: "event:requested" }
    );

    const events = await journal.eventsForResidence(base.residenceId);
    expect(events.map(event => [event.id, event.previousEventId])).toEqual([
      ["event:requested", null],
      ["event:admitted", "event:requested"]
    ]);
  });

  it("fills the predecessor from the append expectation when a caller omits it", async () => {
    const journal = new InMemoryEventJournal();

    await journal.append(
      { ...base, id: "event:requested", type: "swarm.residence.requested" },
      { expectedLastEventId: null }
    );
    await journal.append(
      { ...base, id: "event:admitted", type: "swarm.residence.admitted" },
      { expectedLastEventId: "event:requested" }
    );

    const events = await journal.eventsForResidence(base.residenceId);
    expect(events[1]?.previousEventId).toBe("event:requested");
  });

  it("rejects a claimed predecessor that is not the event being extended", async () => {
    const journal = new InMemoryEventJournal();

    await journal.append(
      { ...base, id: "event:requested", type: "swarm.residence.requested" },
      { expectedLastEventId: null }
    );

    await expect(
      journal.append(
        {
          ...base,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          previousEventId: "event:somewhere-else"
        },
        { expectedLastEventId: "event:requested" }
      )
    ).rejects.toThrow(/predecessor mismatch/);
  });
});
