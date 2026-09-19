import type { AgentIdentityRef } from "../domain/agent.js";
import type { HabitatId, ResidenceId } from "../domain/residence.js";

export interface RequestResidence {
  readonly requestId: string;
  readonly residenceId: ResidenceId;
  readonly agentIdentityRef: AgentIdentityRef;
  readonly habitatId: HabitatId;
  readonly requestedAt: string;
  readonly actorRef: string;
  readonly evidenceReceiptIds: readonly string[];
}
