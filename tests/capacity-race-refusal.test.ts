import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { AdmissionService } from "../src/service/admission-service.js";

const gateway: AtlasGateway = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: true,
      authorityRef: "atlas:decision:allow",
      decidedAt: "2026-09-19T00:00:00.000Z"
    };
  },
  async evidence() {
    return [];
  }
};

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

describe("capacity race refusal", () => {
  it("records atomic final-slot loss as a habitat-policy rejection", async () => {
    const journal = new InMemoryEventJournal();

    const occupying: ResidenceSnapshot = {
      residenceId: "residence:occupying" as never,
      agentIdentityRef: "agent:occupying" as never,
      habitatId: "habitat:one" as never,
      status: "requested",
      version: 1,
      lastEventId: "event:occupying:requested"
    };
    await seedRequested(journal, occupying);
    await journal.append(
      {
        id: "event:occupying:admitted",
        type: "swarm.residence.admitted",
        occurredAt: "2026-09-19T00:00:00.000Z",
        observedAt: "2026-09-19T00:00:00.500Z",
        actorRef: "actor:first",
        residenceId: occupying.residenceId,
        agentIdentityRef: occupying.agentIdentityRef,
        habitatId: occupying.habitatId,
        evidenceReceiptIds: [],
        previousEventId: occupying.lastEventId
      },
      { expectedLastEventId: occupying.lastEventId }
    );

    const current: ResidenceSnapshot = {
      residenceId: "residence:second" as never,
      agentIdentityRef: "agent:second" as never,
      habitatId: "habitat:one" as never,
      status: "requested",
      version: 1,
      lastEventId: "event:second:requested"
    };
    await seedRequested(journal, current);

    const result = await new AdmissionService(journal, gateway).decide(
      current,
      { id: current.habitatId, name: "One", capacity: 1, status: "open" },
      [],
      "event:second:decision",
      "2026-09-19T00:00:01.000Z",
      "actor:second"
    );

    expect(result.outcome).toBe("rejected");
    expect(result.rejectionSource).toBe("habitat_policy");
    expect(result.decision.allowed).toBe(true);
    expect((await journal.eventsForResidence(current.residenceId))[1]).toMatchObject({
      type: "swarm.residence.rejected",
      reason: "habitat capacity reached: habitat:one",
      authorityRef: "atlas:decision:allow"
    });
  });
});
