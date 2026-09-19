import type { AgentIdentityRef } from "../domain/agent.js";
import type { HabitatId, ResidenceId } from "../domain/residence.js";

export type SwarmResidenceEventType =
  | "swarm.residence.requested"
  | "swarm.residence.admitted"
  | "swarm.residence.rested"
  | "swarm.residence.ready"
  | "swarm.residence.departed"
  | "swarm.residence.rejected";

export interface SwarmResidenceEvent {
  readonly id: string;
  readonly type: SwarmResidenceEventType;
  readonly occurredAt: string;
  readonly observedAt: string;
  readonly actorRef: string;
  readonly residenceId: ResidenceId;
  readonly agentIdentityRef: AgentIdentityRef;
  readonly habitatId: HabitatId;
  readonly evidenceReceiptIds: readonly string[];
  /** Opaque authority decision reference when this transition depends on external authority. */
  readonly authorityRef?: string;
  /** Human-readable explanation. Never used as an authority identifier. */
  readonly reason?: string;
}
