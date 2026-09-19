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
  /** Canonical Atlas identity reference used by local state. */
  readonly agentIdentityRef: AgentIdentityRef;
  /** Caller-supplied opaque identity ref when Atlas canonicalised it to a different ref. */
  readonly sourceAgentIdentityRef?: AgentIdentityRef;
  readonly habitatId: HabitatId;
  readonly evidenceReceiptIds: readonly string[];
  /** Opaque authority decision reference when this transition depends on external authority. */
  readonly authorityRef?: string;
  /** Human-readable explanation. Never used as an authority identifier. */
  readonly reason?: string;
}
