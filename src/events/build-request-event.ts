import type { AgentIdentityRef } from "../domain/agent.js";
import type { RequestResidence } from "../commands/request-residence.js";
import type { SwarmResidenceEvent } from "./event.js";

export function buildResidenceRequestedEvent(
  command: RequestResidence,
  observedAt: string,
  canonicalAgentIdentityRef: AgentIdentityRef
): SwarmResidenceEvent {
  return {
    id: `event:${command.requestId}`,
    type: "swarm.residence.requested",
    occurredAt: command.requestedAt,
    observedAt,
    actorRef: command.actorRef,
    residenceId: command.residenceId,
    agentIdentityRef: canonicalAgentIdentityRef,
    ...(canonicalAgentIdentityRef !== command.agentIdentityRef
      ? { sourceAgentIdentityRef: command.agentIdentityRef }
      : {}),
    habitatId: command.habitatId,
    evidenceReceiptIds: command.evidenceReceiptIds,
    previousEventId: null
  };
}
