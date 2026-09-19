import type { ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import { ResidenceService } from "./residence-service.js";

export class RejectionService {
  constructor(private readonly journal: EventJournal) {}

  async reject(
    current: ResidenceSnapshot,
    eventId: string,
    at: string,
    actorRef: string,
    reason: string,
    evidenceReceiptIds: readonly string[] = []
  ): Promise<ResidenceSnapshot> {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw new Error("rejection requires an explicit reason");
    }

    return new ResidenceService(this.journal).transition(current, "rejected", {
      id: eventId,
      occurredAt: at,
      observedAt: at,
      actorRef,
      evidenceReceiptIds,
      reason: normalizedReason
    });
  }
}
