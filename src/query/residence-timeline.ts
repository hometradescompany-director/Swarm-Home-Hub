import type { ResidenceStatus } from "../domain/residence.js";
import type { SwarmResidenceEvent } from "../events/event.js";

const statusByEvent: Record<SwarmResidenceEvent["type"], ResidenceStatus> = {
  "swarm.residence.requested": "requested",
  "swarm.residence.admitted": "admitted",
  "swarm.residence.rested": "resting",
  "swarm.residence.ready": "ready",
  "swarm.residence.departed": "departed",
  "swarm.residence.rejected": "rejected"
};

export interface ResidenceTimelineEntry {
  readonly eventId: string;
  readonly type: SwarmResidenceEvent["type"];
  readonly status: ResidenceStatus;
  readonly occurredAt: string;
  readonly observedAt: string;
  readonly actorRef: string;
  readonly agentIdentityRef: string;
  readonly sourceAgentIdentityRef: string | null;
  readonly authorityRef: string | null;
  readonly evidenceReceiptIds: readonly string[];
  readonly reason: string | null;
}

export function projectResidenceTimeline(
  events: readonly SwarmResidenceEvent[]
): readonly ResidenceTimelineEntry[] {
  return events.map(event => ({
    eventId: event.id,
    type: event.type,
    status: statusByEvent[event.type],
    occurredAt: event.occurredAt,
    observedAt: event.observedAt,
    actorRef: event.actorRef,
    agentIdentityRef: event.agentIdentityRef,
    sourceAgentIdentityRef: event.sourceAgentIdentityRef ?? null,
    authorityRef: event.authorityRef ?? null,
    evidenceReceiptIds: [...event.evidenceReceiptIds],
    reason: event.reason ?? null
  }));
}
