import { describe, expect, it } from "vitest";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import { AdmissionService } from "../src/service/admission-service.js";

const requested: ResidenceSnapshot = {
  residenceId: "residence:authority-ref" as never,
  agentIdentityRef: "agent:authority-ref" as never,
  habitatId: "habitat:one" as never,
  status: "requested",
  version: 1,
  lastEventId: "event:requested"
};

const atlas: AtlasGateway = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: true,
      authorityRef: "atlas:decision:abc123",
      decidedAt: "2026-09-19T00:00:00.000Z"
    };
  },
  async evidence() {
    return [];
  }
};

describe("admission authority relationship", () => {
  it("preserves authorityRef separately from human-readable reason", async () => {
    const journal = new InMemoryEventJournal();
    await journal.append(
      {
        id: requested.lastEventId,
        type: "swarm.residence.requested",
        occurredAt: "2026-09-18T23:59:59.000Z",
        observedAt: "2026-09-18T23:59:59.500Z",
        actorRef: "actor:request",
        residenceId: requested.residenceId,
        agentIdentityRef: requested.agentIdentityRef,
        habitatId: requested.habitatId,
        evidenceReceiptIds: [],
        previousEventId: null
      },
      { expectedLastEventId: null }
    );
    const service = new AdmissionService(journal, atlas);

    await service.admit(
      requested,
      { id: requested.habitatId, name: "One", capacity: 2, status: "open" },
      [],
      "event:admitted",
      "2026-09-19T00:00:01.000Z",
      "actor:operator"
    );

    const events = await journal.eventsForResidence(requested.residenceId);
    expect(events[1]).toMatchObject({
      type: "swarm.residence.admitted",
      authorityRef: "atlas:decision:abc123",
      occurredAt: "2026-09-19T00:00:00.000Z",
      observedAt: "2026-09-19T00:00:01.000Z",
      previousEventId: "event:requested"
    });
    expect(events[1]?.reason).toBeUndefined();
  });
});
