import { describe, expect, it } from "vitest";
import { InMemoryEventJournal } from "../src/events/journal.js";

const base = {
  actorRef: "actor:test",
  residenceId: "residence:time" as never,
  agentIdentityRef: "agent:time" as never,
  habitatId: "habitat:one" as never,
  evidenceReceiptIds: []
};

describe("residence observation-time ordering", () => {
  it("allows event time to move backward when observation time moves forward", async () => {
    const journal = new InMemoryEventJournal();

    await journal.append(
      {
        ...base,
        id: "event:requested",
        type: "swarm.residence.requested",
        occurredAt: "2026-09-19T00:00:10.000Z",
        observedAt: "2026-09-19T00:00:20.000Z",
        previousEventId: null
      },
      { expectedLastEventId: null }
    );

    await expect(
      journal.append(
        {
          ...base,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          occurredAt: "2026-09-19T00:00:05.000Z",
          observedAt: "2026-09-19T00:00:21.000Z",
          previousEventId: "event:requested"
        },
        { expectedLastEventId: "event:requested" }
      )
    ).resolves.toBeUndefined();
  });

  it("refuses observation time moving backward in one residence history", async () => {
    const journal = new InMemoryEventJournal();

    await journal.append(
      {
        ...base,
        id: "event:requested",
        type: "swarm.residence.requested",
        occurredAt: "2026-09-19T00:00:10.000Z",
        observedAt: "2026-09-19T00:00:20.000Z",
        previousEventId: null
      },
      { expectedLastEventId: null }
    );

    await expect(
      journal.append(
        {
          ...base,
          id: "event:admitted",
          type: "swarm.residence.admitted",
          occurredAt: "2026-09-19T00:00:30.000Z",
          observedAt: "2026-09-19T00:00:19.999Z",
          previousEventId: "event:requested"
        },
        { expectedLastEventId: "event:requested" }
      )
    ).rejects.toThrow(/observation time moved backward/);
  });

  it("refuses invalid event or observation timestamps", async () => {
    const journal = new InMemoryEventJournal();

    await expect(
      journal.append(
        {
          ...base,
          id: "event:bad-time",
          type: "swarm.residence.requested",
          occurredAt: "not-a-time",
          observedAt: "2026-09-19T00:00:20.000Z"
        },
        { expectedLastEventId: null }
      )
    ).rejects.toThrow(/valid ISO-8601/);
  });
});
