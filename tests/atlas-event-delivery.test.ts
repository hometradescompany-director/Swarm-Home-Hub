import { describe, expect, it } from "vitest";

import { InMemoryEventJournal } from "../src/events/journal.js";
import type { SwarmResidenceEvent } from "../src/events/event.js";
import {
  AtlasResidenceEventPublisher,
  InMemoryAtlasDeliveryLedger
} from "../src/integrations/atlas/event-delivery.js";
import {
  AtlasHttpEventSink,
  atlasEventIdFor,
  type AtlasEventSink
} from "../src/integrations/atlas/event-sink.js";

const event: SwarmResidenceEvent = {
  id: "event:residence:ready:001",
  type: "swarm.residence.ready",
  occurredAt: "2026-09-20T05:15:00.000Z",
  observedAt: "2026-09-20T05:15:00.100Z",
  actorRef: "actor:steward",
  residenceId: "residence:001" as never,
  agentIdentityRef: "agent:swarm_01" as never,
  habitatId: "habitat:commons" as never,
  evidenceReceiptIds: ["receipt:ready_001"],
  previousEventId: "event:residence:rested:001",
  authorityRef: "authority:atlas_01"
};

describe("Atlas residence event delivery", () => {
  it("derives the same Atlas UUID from the same product event identity", async () => {
    const one = await atlasEventIdFor(event.id);
    const two = await atlasEventIdFor(event.id);
    expect(one).toBe(two);
    expect(one).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("uses the journal itself as the outbox and records successful delivery", async () => {
    const journal = new InMemoryEventJournal();
    await journal.append(event);
    const ledger = new InMemoryAtlasDeliveryLedger();

    const sink: AtlasEventSink = {
      async deliver(input) {
        return {
          sourceEventId: input.id,
          atlasEventId: await atlasEventIdFor(input.id),
          atlasRecordId: "atlas:event:001",
          accepted: true,
          duplicate: false
        };
      }
    };

    const publisher = new AtlasResidenceEventPublisher(journal, sink, ledger);
    await expect(
      publisher.deliverPending("2026-09-20T05:16:00.000Z")
    ).resolves.toEqual({
      inspected: 1,
      delivered: 1,
      failed: 0,
      skippedAlreadyDelivered: 0
    });

    expect(await ledger.receiptsFor(event.id)).toEqual([
      expect.objectContaining({
        sourceEventId: event.id,
        outcome: "delivered",
        atlasRecordId: "atlas:event:001"
      })
    ]);
  });

  it("retries failures because absence of a delivered receipt means pending", async () => {
    const journal = new InMemoryEventJournal();
    await journal.append(event);
    const ledger = new InMemoryAtlasDeliveryLedger();
    let calls = 0;

    const sink: AtlasEventSink = {
      async deliver(input) {
        calls += 1;
        if (calls === 1) throw new Error("temporary network failure");
        return {
          sourceEventId: input.id,
          atlasEventId: await atlasEventIdFor(input.id),
          atlasRecordId: "atlas:event:001",
          accepted: false,
          duplicate: true
        };
      }
    };

    const publisher = new AtlasResidenceEventPublisher(journal, sink, ledger);
    expect(await publisher.deliverPending("2026-09-20T05:16:00.000Z")).toMatchObject({
      failed: 1
    });
    expect(await publisher.deliverPending("2026-09-20T05:17:00.000Z")).toMatchObject({
      delivered: 1
    });
    expect(calls).toBe(2);
    expect((await ledger.receiptsFor(event.id)).map(receipt => receipt.outcome)).toEqual([
      "failed",
      "delivered"
    ]);
  });

  it("does not redeliver after a delivered receipt exists", async () => {
    const journal = new InMemoryEventJournal();
    await journal.append(event);
    const ledger = new InMemoryAtlasDeliveryLedger();
    let calls = 0;
    const sink: AtlasEventSink = {
      async deliver(input) {
        calls += 1;
        return {
          sourceEventId: input.id,
          atlasEventId: await atlasEventIdFor(input.id),
          atlasRecordId: "atlas:event:001",
          accepted: true,
          duplicate: false
        };
      }
    };

    const publisher = new AtlasResidenceEventPublisher(journal, sink, ledger);
    await publisher.deliverPending("2026-09-20T05:16:00.000Z");
    const second = await publisher.deliverPending("2026-09-20T05:17:00.000Z");

    expect(second.skippedAlreadyDelivered).toBe(1);
    expect(calls).toBe(1);
  });

  it("posts only opaque references through atlas-event/v1", async () => {
    let body: Record<string, unknown> | null = null;
    const sink = new AtlasHttpEventSink({
      baseUrl: "https://atlas.example",
      token: "atlas_gw_test",
      fetcher: async (_input, init) => {
        body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            ok: true,
            data: {
              event_id: body["event_id"],
              atlas_event_id: "11111111-1111-4111-8111-111111111111",
              accepted: true,
              duplicate: false
            }
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
    });

    const result = await sink.deliver(event);
    expect(result.sourceEventId).toBe(event.id);
    expect(body).toMatchObject({
      contract: "atlas-event/v1",
      name: "swarm.residence.ready",
      occurred_at: event.occurredAt,
      subject_ref: event.agentIdentityRef,
      payload: {
        source_event_ref: event.id,
        residence_ref: event.residenceId,
        habitat_ref: event.habitatId,
        actor_ref: event.actorRef,
        authority_ref: event.authorityRef,
        evidence_receipt_refs: event.evidenceReceiptIds
      }
    });
  });
});
