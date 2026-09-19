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
    const result = await new AdmissionService(journal, gateway(true)).decide(
      requested(),
      { id: "habitat:one" as never, name: "One", capacity: 2, status: "open" },
      0,
      "event:decision",
      "2026-09-19T00:00:01.000Z",
      "actor:operator"
    );

    expect(result.outcome).toBe("admitted");
    expect(result.residence.status).toBe("admitted");
    expect((await journal.eventsForResidence(result.residence.residenceId))[0]).toMatchObject({
      type: "swarm.residence.admitted",
      authorityRef: "atlas:decision:allow"
    });
  });

  it("records a denied decision instead of losing it as an exception", async () => {
    const journal = new InMemoryEventJournal();
    const result = await new AdmissionService(journal, gateway(false)).decide(
      requested(),
      { id: "habitat:one" as never, name: "One", capacity: 2, status: "open" },
      0,
      "event:decision",
      "2026-09-19T00:00:01.000Z",
      "actor:operator"
    );

    expect(result.outcome).toBe("rejected");
    expect(result.residence.status).toBe("rejected");
    expect((await journal.eventsForResidence(result.residence.residenceId))[0]).toMatchObject({
      type: "swarm.residence.rejected",
      authorityRef: "atlas:decision:deny",
      reason: "bounded denial"
    });
  });
});
