import type { AgentIdentityRef } from "../domain/agent.js";
import type { IncubationEvent } from "./types.js";

export interface IncubationAppendExpectation {
  readonly expectedLastEventId: string | null;
}

/** Persistence port for developmental records; it is deliberately separate from residence. */
export interface IncubationJournal {
  append(event: IncubationEvent, expectation: IncubationAppendExpectation): Promise<void>;
  eventsForSubject(subjectRef: AgentIdentityRef): Promise<readonly IncubationEvent[]>;
}

/** Process-local adapter for development and tests. It is not durable storage. */
export class InMemoryIncubationJournal implements IncubationJournal {
  #events: IncubationEvent[] = [];

  async append(event: IncubationEvent, expectation: IncubationAppendExpectation): Promise<void> {
    if (this.#events.some(existing => existing.id === event.id)) {
      throw new Error(`duplicate incubation event id: ${event.id}`);
    }
    if (!event.id.trim() || !event.actorRef.trim()) {
      throw new Error("incubation event requires non-empty id and actorRef");
    }
    if (!Number.isFinite(Date.parse(event.occurredAt))) {
      throw new Error("incubation occurredAt must be a valid ISO-8601 value");
    }
    if (!event.evidenceReceiptIds.length || event.evidenceReceiptIds.some(id => !id.trim())) {
      throw new Error("incubation event requires non-empty evidence receipt ids");
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
