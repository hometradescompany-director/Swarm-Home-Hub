import type { SwarmResidenceEvent } from "../../events/event.js";
import type { EventJournal } from "../../events/journal.js";
import type { AtlasEventDeliveryResult, AtlasEventSink } from "./event-sink.js";

export type AtlasDeliveryOutcome = "delivered" | "failed";

export interface AtlasDeliveryReceipt {
  readonly sourceEventId: string;
  readonly attemptedAt: string;
  readonly outcome: AtlasDeliveryOutcome;
  readonly atlasEventId?: string;
  readonly atlasRecordId?: string;
  readonly duplicate?: boolean;
  readonly error?: string;
}

export interface AtlasDeliveryLedger {
  append(receipt: AtlasDeliveryReceipt): Promise<void>;
  receiptsFor(sourceEventId: string): Promise<readonly AtlasDeliveryReceipt[]>;
  allReceipts?(): Promise<readonly AtlasDeliveryReceipt[]>;
}

export class InMemoryAtlasDeliveryLedger implements AtlasDeliveryLedger {
  #receipts: AtlasDeliveryReceipt[] = [];

  async append(receipt: AtlasDeliveryReceipt): Promise<void> {
    if (!Number.isFinite(Date.parse(receipt.attemptedAt))) {
      throw new Error("delivery receipt attemptedAt must be a valid ISO-8601 value");
    }
    this.#receipts.push(Object.freeze({ ...receipt }));
  }

  async receiptsFor(sourceEventId: string): Promise<readonly AtlasDeliveryReceipt[]> {
    return this.#receipts.filter(receipt => receipt.sourceEventId === sourceEventId);
  }

  async allReceipts(): Promise<readonly AtlasDeliveryReceipt[]> {
    return [...this.#receipts];
  }
}

export interface AtlasDeliverySweep {
  readonly inspected: number;
  readonly delivered: number;
  readonly failed: number;
  readonly skippedAlreadyDelivered: number;
}

export class AtlasResidenceEventPublisher {
  constructor(
    private readonly journal: EventJournal,
    private readonly sink: AtlasEventSink,
    private readonly ledger: AtlasDeliveryLedger
  ) {}

  /**
   * The event journal itself is the outbox source of truth.
   *
   * There is no second enqueue write that can be lost after a residence state
   * transition. Missing delivery receipt means "still pending". If Atlas
   * accepted an event but Swarm crashed before recording the receipt, the next
   * sweep safely replays the same deterministic Atlas event UUID and Atlas
   * returns its idempotent duplicate result.
   */
  async deliverPending(attemptedAt: string, limit = 100): Promise<AtlasDeliverySweep> {
    if (!Number.isFinite(Date.parse(attemptedAt))) {
      throw new Error("delivery sweep attemptedAt must be a valid ISO-8601 value");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      throw new Error("delivery sweep limit must be an integer from 1 to 1000");
    }
    if (!this.journal.allEvents) {
      throw new Error("event journal must expose bounded inspection for Atlas delivery");
    }

    const events = await this.journal.allEvents();
    let inspected = 0;
    let delivered = 0;
    let failed = 0;
    let skippedAlreadyDelivered = 0;

    for (const event of events) {
      if (inspected >= limit) break;
      inspected += 1;

      const receipts = await this.ledger.receiptsFor(event.id);
      if (receipts.some(receipt => receipt.outcome === "delivered")) {
        skippedAlreadyDelivered += 1;
        continue;
      }

      try {
        const result = await this.sink.deliver(event);
        await this.ledger.append(successReceipt(event, result, attemptedAt));
        delivered += 1;
      } catch (error) {
        await this.ledger.append({
          sourceEventId: event.id,
          attemptedAt,
          outcome: "failed",
          error: error instanceof Error ? error.message : String(error)
        });
        failed += 1;
      }
    }

    return { inspected, delivered, failed, skippedAlreadyDelivered };
  }
}

function successReceipt(
  event: SwarmResidenceEvent,
  result: AtlasEventDeliveryResult,
  attemptedAt: string
): AtlasDeliveryReceipt {
  if (result.sourceEventId !== event.id) {
    throw new Error("Atlas delivery result source identity mismatch");
  }
  return {
    sourceEventId: event.id,
    attemptedAt,
    outcome: "delivered",
    atlasEventId: result.atlasEventId,
    atlasRecordId: result.atlasRecordId,
    duplicate: result.duplicate
  };
}
