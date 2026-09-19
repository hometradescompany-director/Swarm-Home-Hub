import { describe, expect, it } from "vitest";
import { InMemoryEventJournal } from "../src/events/journal.js";
import { recoverResidence } from "../src/query/residence-recovery.js";

describe("residence recovery", () => {
  it("returns typed absence when no local history can be located", async () => {
    const result = await recoverResidence(
      new InMemoryEventJournal(),
      "residence:missing" as never,
      "2026-09-19T02:00:00.000Z"
    );

    expect(result).toEqual({
      found: false,
      absence: {
        kind: "cannot_be_located",
        statement:
          "No residence events can be located for residence:missing in this journal.",
        observedAt: "2026-09-19T02:00:00.000Z",
        sourceRef: "swarm:event-journal:residence:missing"
      }
    });
  });

  it("rebuilds current state and timeline from the append-only event history", async () => {
    const journal = new InMemoryEventJournal();
    const residenceId = "residence:recover" as never;
    const base = {
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:00.000Z",
      actorRef: "actor:test",
      residenceId,
      agentIdentityRef: "agent:recover" as never,
      habitatId: "habitat:one" as never,
      evidenceReceiptIds: []
    };

    await journal.append(
      { ...base, id: "event:requested", type: "swarm.residence.requested" },
      { expectedLastEventId: null }
    );
    await journal.append(
      { ...base, id: "event:admitted", type: "swarm.residence.admitted" },
      { expectedLastEventId: "event:requested" }
    );

    const result = await recoverResidence(
      journal,
      residenceId,
      "2026-09-19T02:00:00.000Z"
    );

    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.residence).toMatchObject({
        residenceId,
        status: "admitted",
        version: 2,
        lastEventId: "event:admitted"
      });
      expect(result.timeline.map(entry => entry.eventId)).toEqual([
        "event:requested",
        "event:admitted"
      ]);
    }
  });

  it("returns a corrupted typed absence instead of pretending malformed history is valid", async () => {
    const journal = new InMemoryEventJournal();
    const residenceId = "residence:corrupt" as never;
    const base = {
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:00.000Z",
      actorRef: "actor:test",
      residenceId,
      agentIdentityRef: "agent:corrupt" as never,
      habitatId: "habitat:one" as never,
      evidenceReceiptIds: []
    };

    await journal.append(
      { ...base, id: "event:requested", type: "swarm.residence.requested" },
      { expectedLastEventId: null }
    );
    await journal.append(
      { ...base, id: "event:ready", type: "swarm.residence.ready" },
      { expectedLastEventId: "event:requested" }
    );

    const result = await recoverResidence(
      journal,
      residenceId,
      "2026-09-19T02:00:00.000Z"
    );

    expect(result.found).toBe(false);
    if (!result.found) {
      expect(result.absence.kind).toBe("corrupted");
      expect(result.absence.statement).toMatch(/invalid residence transition/);
    }
  });

  it("rejects invalid recovery observation time", async () => {
    await expect(
      recoverResidence(
        new InMemoryEventJournal(),
        "residence:missing" as never,
        "not-a-time"
      )
    ).rejects.toThrow(/valid ISO-8601/);
  });

  it("canonicalizes recovery observation time before writing typed absence", async () => {
    const result = await recoverResidence(
      new InMemoryEventJournal(),
      "residence:missing" as never,
      "2026-09-19T13:00:00+10:00"
    );

    expect(result.found).toBe(false);
    if (!result.found) {
      expect(result.absence.observedAt).toBe("2026-09-19T03:00:00.000Z");
    }
  });

});
