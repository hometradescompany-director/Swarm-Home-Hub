import type { ResidenceSnapshot, ResidenceStatus } from "../domain/residence.js";
import type { SwarmResidenceEvent } from "../events/event.js";

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
  let snapshot: ResidenceSnapshot = {
    residenceId: first.residenceId,
    agentIdentityRef: first.agentIdentityRef,
    habitatId: first.habitatId,
    status: statusByEvent[first.type],
    version: 1,
    lastEventId: first.id
  };

  for (const event of events.slice(1)) {
    if (event.residenceId !== snapshot.residenceId) {
      throw new Error("projection mixed multiple residence identities");
    }
    snapshot = {
      ...snapshot,
      status: statusByEvent[event.type],
      version: snapshot.version + 1,
      lastEventId: event.id
    };
  }

  return snapshot;
}
