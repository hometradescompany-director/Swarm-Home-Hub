import type { SwarmResidenceEvent } from "./event.js";

export interface AppendExpectation {
  readonly expectedLastEventId: string | null;
}

export interface EventJournal {
  append(event: SwarmResidenceEvent, expectation?: AppendExpectation): Promise<void>;
  eventsForResidence(residenceId: string): Promise<readonly SwarmResidenceEvent[]>;
}

export class InMemoryEventJournal implements EventJournal {
  #events: SwarmResidenceEvent[] = [];

  async append(event: SwarmResidenceEvent, expectation?: AppendExpectation): Promise<void> {
    if (this.#events.some(existing => existing.id === event.id)) {
      throw new Error(`duplicate event id: ${event.id}`);
    }

    const current = this.#events.filter(existing => existing.residenceId === event.residenceId);
    const actualLastEventId = current.at(-1)?.id ?? null;

    if (expectation && actualLastEventId !== expectation.expectedLastEventId) {
      throw new Error(
        `stale residence snapshot: expected last event ${expectation.expectedLastEventId ?? "<none>"} but found ${actualLastEventId ?? "<none>"}`
      );
    }

    const expectedPredecessor = expectation?.expectedLastEventId ?? actualLastEventId;
    if (
      event.previousEventId !== undefined &&
      event.previousEventId !== expectedPredecessor
    ) {
      throw new Error(
        `event predecessor mismatch: expected ${expectedPredecessor ?? "<none>"} but event named ${event.previousEventId ?? "<none>"}`
      );
    }

    this.#events.push(
      Object.freeze({
        ...event,
        previousEventId: event.previousEventId ?? expectedPredecessor
      })
    );
  }

  async eventsForResidence(residenceId: string): Promise<readonly SwarmResidenceEvent[]> {
    return this.#events.filter(event => event.residenceId === residenceId);
  }
}
