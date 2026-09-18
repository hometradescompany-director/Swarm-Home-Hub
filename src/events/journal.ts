import type { SwarmResidenceEvent } from "./event.js";

export interface EventJournal {
  append(event: SwarmResidenceEvent): Promise<void>;
  eventsForResidence(residenceId: string): Promise<readonly SwarmResidenceEvent[]>;
}

export class InMemoryEventJournal implements EventJournal {
  #events: SwarmResidenceEvent[] = [];

  async append(event: SwarmResidenceEvent): Promise<void> {
    if (this.#events.some(existing => existing.id === event.id)) {
      throw new Error(`duplicate event id: ${event.id}`);
    }
    this.#events.push(Object.freeze({ ...event }));
  }

  async eventsForResidence(residenceId: string): Promise<readonly SwarmResidenceEvent[]> {
    return this.#events.filter(event => event.residenceId === residenceId);
  }
}
