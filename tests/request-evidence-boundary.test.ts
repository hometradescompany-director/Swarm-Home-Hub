import { describe, expect, it } from "vitest";
import type { RequestResidence } from "../src/commands/request-residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { ResidenceRequestService } from "../src/service/request-service.js";

const command = (evidenceReceiptIds: readonly string[]): RequestResidence => ({
  requestId: "request:evidence",
  residenceId: "residence:evidence" as never,
  agentIdentityRef: "agent:evidence" as never,
  habitatId: "habitat:one" as never,
  requestedAt: "2026-09-19T00:00:00.000Z",
  actorRef: "actor:source",
  evidenceReceiptIds
});

function gateway(
  resolvedIds: readonly string[],
  mutate?: (receipt: {
    id: string;
    sourceRef: string;
    capturedAt: string;
    standing: "source_record";
    absence?: never;
  }) => unknown
): AtlasGateway {
  return {
    async resolveAgentIdentity(ref) {
      return { exists: true, canonicalRef: ref };
    },
    async canEnterHome() {
      throw new Error("not used by request service");
    },
    async evidence() {
      return resolvedIds.map(id => {
        const receipt = {
          id,
          sourceRef: "source:" + id,
          capturedAt: "2026-09-19T00:00:00.000Z",
          standing: "source_record" as const
        };
        return (mutate ? mutate(receipt) : receipt) as never;
      });
    }
  };
}

describe("residence request evidence boundary", () => {
  it("creates the request only when every evidence reference resolves", async () => {
    const journal = new InMemoryEventJournal();
    const current = command(["receipt:one", "receipt:two"]);

    const snapshot = await new ResidenceRequestService(
      journal,
      gateway(["receipt:one", "receipt:two"])
    ).request(current, "2026-09-19T00:00:01.000Z");

    expect(snapshot.status).toBe("requested");
    expect((await journal.eventsForResidence(snapshot.residenceId))[0]).toMatchObject({
      evidenceReceiptIds: ["receipt:one", "receipt:two"]
    });
  });

  it("refuses unresolved evidence without writing a residence event", async () => {
    const journal = new InMemoryEventJournal();
    const current = command(["receipt:one", "receipt:missing"]);

    await expect(
      new ResidenceRequestService(journal, gateway(["receipt:one"])).request(
        current,
        "2026-09-19T00:00:01.000Z"
      )
    ).rejects.toThrow(/receipt:missing/);

    expect(await journal.eventsForResidence(current.residenceId)).toHaveLength(0);
  });

  it("refuses malformed evidence receipts without writing a residence event", async () => {
    const journal = new InMemoryEventJournal();
    const current = command(["receipt:one"]);

    await expect(
      new ResidenceRequestService(
        journal,
        gateway(["receipt:one"], receipt => ({
          ...receipt,
          capturedAt: "not-a-time"
        }))
      ).request(current, "2026-09-19T00:00:01.000Z")
    ).rejects.toThrow(/capturedAt/);

    expect(await journal.eventsForResidence(current.residenceId)).toHaveLength(0);
  });

  it("refuses malformed embedded typed absence without writing a residence event", async () => {
    const journal = new InMemoryEventJournal();
    const current = command(["receipt:one"]);

    await expect(
      new ResidenceRequestService(
        journal,
        gateway(["receipt:one"], receipt => ({
          ...receipt,
          absence: {
            kind: "superseded",
            statement: "Old evidence superseded.",
            observedAt: "2026-09-19T00:00:00.000Z",
            sourceRef: "swarm:evidence:old"
          }
        }))
      ).request(current, "2026-09-19T00:00:01.000Z")
    ).rejects.toThrow(/supersededByRef/);

    expect(await journal.eventsForResidence(current.residenceId)).toHaveLength(0);
  });

  it("refuses duplicate evidence relationships", async () => {
    const journal = new InMemoryEventJournal();
    const current = command(["receipt:one", "receipt:one"]);

    await expect(
      new ResidenceRequestService(journal, gateway(["receipt:one"])).request(
        current,
        "2026-09-19T00:00:01.000Z"
      )
    ).rejects.toThrow(/duplicate evidence/);

    expect(await journal.eventsForResidence(current.residenceId)).toHaveLength(0);
  });
});
