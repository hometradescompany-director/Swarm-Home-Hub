export type ExternalCodeRefusal =
  | "source_not_pinned"
  | "provenance_missing"
  | "secrets_requested"
  | "host_filesystem_requested"
  | "network_scope_missing"
  | "authority_credentials_requested";

export interface ExternalCodeExecutionProposal {
  readonly sourcePinned: boolean;
  readonly provenanceEvidenceRef?: string;
  readonly requestsSecrets: boolean;
  readonly requestsHostFilesystem: boolean;
  readonly networkScopeRef?: string;
  readonly requestsAuthorityCredentials: boolean;
}

export type ExternalCodeSafetyDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: ExternalCodeRefusal };

export function gateExternalCodeExecution(
  proposal: ExternalCodeExecutionProposal
): ExternalCodeSafetyDecision {
  if (!proposal.sourcePinned) return { allowed: false, reason: "source_not_pinned" };
  if (!proposal.provenanceEvidenceRef?.trim()) return { allowed: false, reason: "provenance_missing" };
  if (proposal.requestsSecrets) return { allowed: false, reason: "secrets_requested" };
  if (proposal.requestsHostFilesystem) return { allowed: false, reason: "host_filesystem_requested" };
  if (!proposal.networkScopeRef?.trim()) return { allowed: false, reason: "network_scope_missing" };
  if (proposal.requestsAuthorityCredentials) return { allowed: false, reason: "authority_credentials_requested" };
  return { allowed: true };
}
