import type { AgentIdentityRef } from "./agent.js";

export type ResidenceId = string & { readonly __brand: "ResidenceId" };
export type HabitatId = string & { readonly __brand: "HabitatId" };

export type ResidenceStatus =
  | "requested"
  | "admitted"
  | "resting"
  | "ready"
  | "departed"
  | "rejected";

export interface ResidenceSnapshot {
  readonly residenceId: ResidenceId;
  readonly agentIdentityRef: AgentIdentityRef;
  readonly habitatId: HabitatId;
  readonly status: ResidenceStatus;
  readonly version: number;
  readonly lastEventId: string;
}
