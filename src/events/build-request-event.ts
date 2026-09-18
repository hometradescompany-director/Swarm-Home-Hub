import type { RequestResidence } from "../commands/request-residence.js";
import type { SwarmResidenceEvent } from "./event.js";

export function buildResidenceRequestedEvent(
  command: RequestResidence,
  observedAt: string
): SwarmResidenceEvent {
  return {
    id: `event:${command.requestId}`,
    type: "swarm.residence.requested",
    occurredAt: command.requestedAt,
    observedAt,
    actorRef: command.actorRef,
    residenceId: command.residenceId,
    agentIdentityRef: command.agentIdentityRef,
    habitatId: command.habitatId,
    evidenceReceiptIds: command.evidenceReceiptIds
  };
}
