import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import { ResidenceService } from "../src/service/residence-service.js";

const requested = (id: string): ResidenceSnapshot => ({
  residenceId: ("residence:" + id) as never,
  agentIdentityRef: ("agent:" + id) as never,
  habitatId: "habitat:one" as never,
  status: "requested",
  version: 1,
  lastEventId: "event:" + id + ":requested"
});

async function seed(
  journal: InMemoryEventJournal,
  snapshot: ResidenceSnapshot
): Promise<void> {
  await journal.append(
    {
      id: snapshot.lastEventId,
      type: "swarm.residence.requested",
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:00.000Z",
      actorRef: "actor:request",
      residenceId: snapshot.residenceId,
      agentIdentityRef: snapshot.agentIdentityRef,
      habitatId: snapshot.habitatId,
      evidenceReceiptIds: [],
      previousEventId: null
    },
    { expectedLastEventId: null }
  );
}

describe("atomic habitat capacity guard", () => {
  it("allows only one of two residence admissions into the final slot", async () => {
    const journal = new InMemoryEventJournal();
    const first = requested("first");
    const second = requested("second");
    await seed(journal, first);
    await seed(journal, second);

    await new ResidenceService(journal).transition(
      first,
      "admitted",
      {
        id: "event:first:admitted",
        occurredAt: "2026-09-19T00:00:01.000Z",
        observedAt: "2026-09-19T00:00:01.000Z",
        actorRef: "actor:operator",
        evidenceReceiptIds: []
      },
      { habitatCapacity: 1 }
    );

    await expect(
      new ResidenceService(journal).transition(
        second,
        "admitted",
        {
          id: "event:second:admitted",
          occurredAt: "2026-09-19T00:00:01.000Z",
          observedAt: "2026-09-19T00:00:01.000Z",
          actorRef: "actor:operator",
          evidenceReceiptIds: []
        },
        { habitatCapacity: 1 }
      )
    ).rejects.toThrow(/habitat capacity reached/);

    expect(await journal.eventsForResidence(first.residenceId)).toHaveLength(2);
    expect(await journal.eventsForResidence(second.residenceId)).toHaveLength(1);
  });
});
