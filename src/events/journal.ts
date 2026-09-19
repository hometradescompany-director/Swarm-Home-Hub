import type { SwarmResidenceEvent } from "./event.js";

export interface AppendExpectation {
  readonly expectedLastEventId: string | null;
  readonly habitatCapacity?: number;
}

export class HabitatCapacityConflict extends Error {
  readonly habitatId: string;
  constructor(habitatId: string) {
    super(`habitat capacity reached: ${habitatId}`);
    this.name = "HabitatCapacityConflict";
    this.habitatId = habitatId;
  }
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

    const occurredMs = Date.parse(event.occurredAt);
    const observedMs = Date.parse(event.observedAt);
    if (!Number.isFinite(occurredMs) || !Number.isFinite(observedMs)) {
      throw new Error("residence event timestamps must be valid ISO-8601 values");
    }

    const current = this.#events.filter(existing => existing.residenceId === event.residenceId);
    const previous = current.at(-1) ?? null;
    const actualLastEventId = previous?.id ?? null;
    if (previous) {
      const previousObservedMs = Date.parse(previous.observedAt);
      if (observedMs < previousObservedMs) {
        throw new Error(
          `residence observation time moved backward: ${event.observedAt} < ${previous.observedAt}`
        );
      }
    }

    if (expectation && actualLastEventId !== expectation.expectedLastEventId) {
      throw new Error(
        `stale residence snapshot: expected last event ${expectation.expectedLastEventId ?? "<none>"} but found ${actualLastEventId ?? "<none>"}`
      );
    }

    if (expectation?.habitatCapacity !== undefined) {
      if (event.type !== "swarm.residence.admitted") {
        throw new Error("habitat capacity guard only applies to admission events");
      }
      if (!Number.isInteger(expectation.habitatCapacity) || expectation.habitatCapacity < 1) {
        throw new Error("habitat capacity must be a positive integer");
      }

      const latestByResidence = new Map<string, SwarmResidenceEvent>();
      for (const existing of this.#events) {
        if (existing.habitatId === event.habitatId) {
          latestByResidence.set(existing.residenceId, existing);
        }
      }
      const occupied = [...latestByResidence.values()].filter(existing =>
        [
          "swarm.residence.admitted",
          "swarm.residence.rested",
          "swarm.residence.ready"
        ].includes(existing.type)
      ).length;
      if (occupied >= expectation.habitatCapacity) {
        throw new HabitatCapacityConflict(event.habitatId);
      }
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
