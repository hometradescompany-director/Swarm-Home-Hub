import type { ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import { assertCanDepart } from "../policy/departure.js";
import { ResidenceService } from "./residence-service.js";

export class DepartureService {
  constructor(private readonly journal: EventJournal) {}

  async depart(
    current: ResidenceSnapshot,
    eventId: string,
    at: string,
    actorRef: string,
    reason?: string
  ): Promise<ResidenceSnapshot> {
    assertCanDepart(current);
    return new ResidenceService(this.journal).transition(current, "departed", {
      id: eventId,
      occurredAt: at,
      observedAt: at,
      actorRef,
      evidenceReceiptIds: [],
      reason
    });
  }
}
