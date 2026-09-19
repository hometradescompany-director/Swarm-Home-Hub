import { describe, expect, it } from "vitest";
import type { RequestResidence } from "../src/commands/request-residence.js";
import type { AgentIdentityRef } from "../src/domain/agent.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { ResidenceRequestService } from "../src/service/request-service.js";

const command = (): RequestResidence => ({
  requestId: "request:identity",
  residenceId: "residence:identity" as never,
  agentIdentityRef: "agent:submitted" as never,
  habitatId: "habitat:one" as never,
  requestedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:source",
  evidenceReceiptIds: ["receipt:request"]
});

function atlas(\n  exists: boolean,\n  canonicalRef: AgentIdentityRef = "agent:canonical" as AgentIdentityRef\n): AtlasGateway {
  return {
    async resolveAgentIdentity() {
      return { exists, canonicalRef };
    },
    async canEnterHome() {
      throw new Error("not used by request service");
    },
    async evidence(receiptIds) {
      return receiptIds.map(id => ({
        id,
        sourceRef: `source:${id}`,
        capturedAt: "2026-09-19T00:00:00.000Z",
        standing: "source_record" as const
      }));
    }
  };
}

describe("residence request identity boundary", () => {
  it("uses the canonical Atlas identity and preserves a differing submitted ref", async () => {
    const journal = new InMemoryEventJournal();
    const snapshot = await new ResidenceRequestService(journal, atlas(true)).request(
      command(),
      "2026-09-19T00:00:01.000Z"
    );

    expect(snapshot.agentIdentityRef).toBe("agent:canonical");
    expect((await journal.eventsForResidence(snapshot.residenceId))[0]).toMatchObject({
      agentIdentityRef: "agent:canonical",
      sourceAgentIdentityRef: "agent:submitted"
    });
  });

  it("does not duplicate a source ref when Atlas returns the same canonical identity", async () => {
    const journal = new InMemoryEventJournal();
    const submitted = command();
    const snapshot = await new ResidenceRequestService(
      journal,
      atlas(true, submitted.agentIdentityRef)
    ).request(submitted, "2026-09-19T00:00:01.000Z");

    const [event] = await journal.eventsForResidence(snapshot.residenceId);
    expect(event?.sourceAgentIdentityRef).toBeUndefined();
  });

  it("refuses to create local residence truth for an unknown Atlas identity", async () => {
    const journal = new InMemoryEventJournal();

    await expect(
      new ResidenceRequestService(journal, atlas(false)).request(
        command(),
        "2026-09-19T00:00:01.000Z"
      )
    ).rejects.toThrow(/Atlas identity not found/);

    expect(await journal.eventsForResidence(command().residenceId)).toHaveLength(0);
  });
});
