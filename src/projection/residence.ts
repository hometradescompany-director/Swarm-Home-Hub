import type { ResidenceSnapshot, ResidenceStatus } from "../domain/residence.js";
import type { SwarmResidenceEvent } from "../events/event.js";
import { assertAllowedTransition } from "../policy/transitions.js";

const statusByEvent: Record<SwarmResidenceEvent["type"], ResidenceStatus> = {
  "swarm.residence.requested": "requested",
  "swarm.residence.admitted": "admitted",
  "swarm.residence.rested": "resting",
  "swarm.residence.ready": "ready",
  "swarm.residence.departed": "departed",
  "swarm.residence.rejected": "rejected"
};

export function projectResidence(events: readonly SwarmResidenceEvent[]): ResidenceSnapshot | null {
  if (events.length === 0) return null;

  const first = events[0]!;
  const firstOccurredMs = Date.parse(first.occurredAt);
  let previousObservedMs = Date.parse(first.observedAt);
  if (!Number.isFinite(firstOccurredMs) || !Number.isFinite(previousObservedMs)) {
    throw new Error("residence replay contains invalid ISO-8601 timestamps");
  }
  if (first.type !== "swarm.residence.requested") {
    throw new Error("residence history must begin with a request event");
  }
  if (first.previousEventId !== undefined && first.previousEventId !== null) {
    throw new Error("first residence event cannot name a predecessor");
  }

  let snapshot: ResidenceSnapshot = {
    residenceId: first.residenceId,
    agentIdentityRef: first.agentIdentityRef,
    habitatId: first.habitatId,
    status: statusByEvent[first.type],
    version: 1,
    lastEventId: first.id
  };

  for (const event of events.slice(1)) {
    const occurredMs = Date.parse(event.occurredAt);
    const observedMs = Date.parse(event.observedAt);
    if (!Number.isFinite(occurredMs) || !Number.isFinite(observedMs)) {
      throw new Error("residence replay contains invalid ISO-8601 timestamps");
    }
    if (observedMs < previousObservedMs) {
      throw new Error("residence replay observation time moved backward");
    }
    previousObservedMs = observedMs;

    if (event.residenceId !== snapshot.residenceId) {
      throw new Error("projection mixed multiple residence identities");
    }
    if (event.agentIdentityRef !== snapshot.agentIdentityRef) {
      throw new Error("projection changed agent identity within one residence");
    }
    if (event.habitatId !== snapshot.habitatId) {
      throw new Error("projection changed habitat identity within one residence");
    }
    if (
      event.previousEventId !== undefined &&
      event.previousEventId !== snapshot.lastEventId
    ) {
      throw new Error(
        `projection predecessor mismatch: expected ${snapshot.lastEventId} but event named ${event.previousEventId ?? "<none>"}`
      );
    }

    const nextStatus = statusByEvent[event.type];
    assertAllowedTransition(snapshot.status, nextStatus);
    snapshot = {
      ...snapshot,
      status: nextStatus,
      version: snapshot.version + 1,
      lastEventId: event.id
    };
  }

  return snapshot;
}
