import type { AgentIdentityRef } from "../../domain/agent.js";
import type { ProvenanceReceipt } from "../../provenance/receipt.js";

export interface AtlasAuthorityDecision {
  readonly allowed: boolean;
  readonly authorityRef: string;
  readonly decidedAt: string;
  readonly reason?: string;
}

export interface AtlasGateway {
  resolveAgentIdentity(ref: AgentIdentityRef): Promise<{ exists: boolean; canonicalRef: AgentIdentityRef }>;
  canEnterHome(ref: AgentIdentityRef): Promise<AtlasAuthorityDecision>;
  evidence(receiptIds: readonly string[]): Promise<readonly ProvenanceReceipt[]>;
}
