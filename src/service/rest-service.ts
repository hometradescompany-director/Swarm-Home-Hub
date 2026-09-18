import type { ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import { assertCanBecomeReady, assertCanRest } from "../policy/readiness.js";
import { ResidenceService } from "./residence-service.js";

export class RestService {
  constructor(private readonly journal: EventJournal) {}

  async rest(
    current: ResidenceSnapshot,
    eventId: string,
    at: string,
    actorRef: string
  ): Promise<ResidenceSnapshot> {
    assertCanRest(current);
    return new ResidenceService(this.journal).transition(current, "resting", {
      id: eventId,
      occurredAt: at,
      observedAt: at,
      actorRef,
      evidenceReceiptIds: []
    });
  }

  async ready(
    current: ResidenceSnapshot,
    eventId: string,
    at: string,
    actorRef: string
  ): Promise<ResidenceSnapshot> {
    assertCanBecomeReady(current);
    return new ResidenceService(this.journal).transition(current, "ready", {
      id: eventId,
      occurredAt: at,
      observedAt: at,
      actorRef,
      evidenceReceiptIds: []
    });
  }
}
