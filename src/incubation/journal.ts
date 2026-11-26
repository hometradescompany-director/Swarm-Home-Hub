import type { AgentIdentityRef } from "../domain/agent.js";
import type { IncubationEvent } from "./types.js";
import { assertIso8601Timestamp, requireNonEmptyRef } from "./validation.js";

export interface IncubationAppendExpectation {
  readonly expectedLastEventId: string | null;
}

/** Persistence port for developmental records; it is deliberately separate from residence. */
export interface IncubationJournal {
  /** Implementations must atomically enforce uniqueness, predecessor, and expected-last checks. */
  append(event: IncubationEvent, expectation: IncubationAppendExpectation): Promise<void>;
  eventsForSubject(subjectRef: AgentIdentityRef): Promise<readonly IncubationEvent[]>;
}

/** Process-local adapter for development and tests. It is not durable storage. */
export class InMemoryIncubationJournal implements IncubationJournal {
  #events: IncubationEvent[] = [];

  async append(event: IncubationEvent, expectation: IncubationAppendExpectation): Promise<void> {
    requireNonEmptyRef(event.id, "incubation event id");
    requireNonEmptyRef(event.subjectRef, "incubation subject ref");
    requireNonEmptyRef(event.actorRef, "incubation actor ref");
    if (this.#events.some(existing => existing.id === event.id)) {
      throw new Error(`duplicate incubation event id: ${event.id}`);
    }
    assertIso8601Timestamp(event.occurredAt, "incubation occurredAt");
    if (!event.evidenceReceiptIds.length || event.evidenceReceiptIds.some(id => !id.trim())) {
      throw new Error("incubation event requires non-empty evidence receipt ids");
    }
    if (new Set(event.evidenceReceiptIds).size !== event.evidenceReceiptIds.length) {
      throw new Error("incubation event evidence receipt ids must be unique");
    }
    if (event.type === "swarm.incubation.assessment_recorded") {
      if (!["sprite", "sapling", "ent"].includes(event.stage)) throw new Error("unknown incubation stage");
      if (!Number.isInteger(event.tier) || event.tier < 1 || event.tier > 9) throw new Error("incubation tier must be an integer from 1 to 9");
      if (!["reviewed", "contested"].includes(event.outcome)) throw new Error("unknown incubation review outcome");
    } else if (event.type === "swarm.incubation.assessment_withdrawn") {
      requireNonEmptyRef(event.reason, "withdrawal reason");
    } else {
      throw new Error("unknown incubation event type");
    }

    const current = this.#events.filter(existing => existing.subjectRef === event.subjectRef);
    const previous = current.at(-1) ?? null;
    const lastId = previous?.id ?? null;
    if (lastId !== expectation.expectedLastEventId) {
      throw new Error(`stale incubation snapshot: expected ${expectation.expectedLastEventId ?? "<none>"} but found ${lastId ?? "<none>"}`);
    }
    if (event.previousEventId !== lastId) {
      throw new Error(`incubation predecessor mismatch: expected ${lastId ?? "<none>"} but event named ${event.previousEventId ?? "<none>"}`);
    }
    if (previous && Date.parse(event.occurredAt) < Date.parse(previous.occurredAt)) {
      throw new Error("incubation event time cannot move backward");
    }
    if (event.type === "swarm.incubation.assessment_withdrawn" && previous?.type !== "swarm.incubation.assessment_recorded") {
      throw new Error("only the current assessment can be withdrawn");
    }
    if (event.type === "swarm.incubation.assessment_withdrawn" && event.previousEventId !== previous?.id) {
      throw new Error("withdrawal must name the current assessment event");
    }

    this.#events.push(Object.freeze({ ...event, evidenceReceiptIds: Object.freeze([...event.evidenceReceiptIds]) }));
  }

  async eventsForSubject(subjectRef: AgentIdentityRef): Promise<readonly IncubationEvent[]> {
    return Object.freeze(this.#events.filter(event => event.subjectRef === subjectRef));
  }
}
