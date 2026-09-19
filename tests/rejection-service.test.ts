import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import { RejectionService } from "../src/service/rejection-service.js";

const requested = (): ResidenceSnapshot => ({
  residenceId: "residence:reject-test" as never,
  agentIdentityRef: "agent:reject-test" as never,
  habitatId: "habitat:default" as never,
  status: "requested",
  version: 1,
  lastEventId: "event:requested"
});

describe("rejection service", () => {
  it("records a requested -> rejected decision with reason and evidence", async () => {
    const journal = new InMemoryEventJournal();
    const service = new RejectionService(journal);

    const next = await service.reject(
      requested(),
      "event:rejected",
      "2026-09-19T00:00:00.000Z",
      "actor:atlas-gateway",
      "authority denied admission",
      ["receipt:authority-decision"]
    );

    expect(next.status).toBe("rejected");
    const events = await journal.eventsForResidence(next.residenceId);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: "event:rejected",
      type: "swarm.residence.rejected",
      reason: "authority denied admission",
      evidenceReceiptIds: ["receipt:authority-decision"]
    });
  });

  it("refuses an unreasoned rejection", async () => {
    const service = new RejectionService(new InMemoryEventJournal());
    await expect(
      service.reject(
        requested(),
        "event:rejected",
        "2026-09-19T00:00:00.000Z",
        "actor:atlas-gateway",
        "   "
      )
    ).rejects.toThrow(/explicit reason/);
  });

  it("does not reject a residence after admission", async () => {
    const service = new RejectionService(new InMemoryEventJournal());
    await expect(
      service.reject(
        { ...requested(), status: "admitted" },
        "event:rejected",
        "2026-09-19T00:00:00.000Z",
        "actor:atlas-gateway",
        "late denial"
      )
    ).rejects.toThrow(/invalid residence transition/);
  });
});
