import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { AdmissionService } from "../src/service/admission-service.js";

const requested = (): ResidenceSnapshot => ({
  residenceId: "residence:decision" as never,
  agentIdentityRef: "agent:decision" as never,
  habitatId: "habitat:one" as never,
  status: "requested",
  version: 1,
  lastEventId: "event:requested"
});

async function seedRequested(
  journal: InMemoryEventJournal,
  snapshot: ResidenceSnapshot
): Promise<void> {
  await journal.append(
    {
      id: snapshot.lastEventId,
      type: "swarm.residence.requested",
      occurredAt: "2026-09-18T23:59:59.000Z",
      observedAt: "2026-09-18T23:59:59.500Z",
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

const gateway = (allowed: boolean): AtlasGateway => ({
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed,
      authorityRef: allowed ? "atlas:decision:allow" : "atlas:decision:deny",
      decidedAt: "2026-09-19T00:00:00.000Z",
      ...(allowed ? {} : { reason: "bounded denial" })
    };
  },
  async evidence() {
    return [];
  }
});

describe("admission decision orchestration", () => {
  it("records an allowed decision as admission", async () => {
    const journal = new InMemoryEventJournal();
    const current = requested();
    await seedRequested(journal, current);

    const result = await new AdmissionService(journal, gateway(true)).decide(
      current,
      { id: "habitat:one" as never, name: "One", capacity: 2, status: "open" },
      [],
      "event:decision",
      "2026-09-19T00:00:01.000Z",
      "actor:operator"
    );

    expect(result.outcome).toBe("admitted");
    expect(result.residence.status).toBe("admitted");
    expect((await journal.eventsForResidence(result.residence.residenceId))[1]).toMatchObject({
      type: "swarm.residence.admitted",
      authorityRef: "atlas:decision:allow",
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:01.000Z"
    });
  });

  it("records a denied decision with decision time separate from observation time", async () => {
    const journal = new InMemoryEventJournal();
    const current = requested();
    await seedRequested(journal, current);

    const result = await new AdmissionService(journal, gateway(false)).decide(
      current,
      { id: "habitat:one" as never, name: "One", capacity: 2, status: "open" },
      [],
      "event:decision",
      "2026-09-19T00:00:01.000Z",
      "actor:operator"
    );

    expect(result.outcome).toBe("rejected");
    expect(result.residence.status).toBe("rejected");
    expect((await journal.eventsForResidence(result.residence.residenceId))[1]).toMatchObject({
      type: "swarm.residence.rejected",
      authorityRef: "atlas:decision:deny",
      reason: "bounded denial",
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:01.000Z"
    });
  });

  it("derives full habitat occupancy from residence snapshots instead of a caller count", async () => {
    const journal = new InMemoryEventJournal();
    const current = requested();
    await seedRequested(journal, current);

    const occupying: ResidenceSnapshot = {
      residenceId: "residence:occupying" as never,
      agentIdentityRef: "agent:occupying" as never,
      habitatId: "habitat:one" as never,
      status: "ready",
      version: 3,
      lastEventId: "event:occupying-ready"
    };

    await expect(
      new AdmissionService(journal, gateway(true)).decide(
        current,
        { id: "habitat:one" as never, name: "One", capacity: 1, status: "open" },
        [occupying],
        "event:decision",
        "2026-09-19T00:00:01.000Z",
        "actor:operator"
      )
    ).rejects.toThrow(/habitat capacity reached/);
  });
});
