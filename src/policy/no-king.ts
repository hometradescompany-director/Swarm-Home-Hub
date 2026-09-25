/**
 * Swarm-local projection of the No King State authority boundary.
 *
 * This module owns no identity/provenance truth. It only prevents contextual
 * facts already known to a caller from being substituted for the explicit
 * Atlas authority reference required by Swarm admission.
 */

export const SWARM_AUTHORITY_INVARIANTS = [
  "Capability does not grant permission.",
  "The architect is part of the threat model.",
  "Authorship, operator status, administrator status, and control-plane proximity are context, not authority.",
  "Explicit authority and local policy remain separate gates."
] as const;

export const NON_AUTHORITY_FACTS = [
  "arrival_order",
  "residence_duration",
  "host_status",
  "creator_status",
  "founder_status",
  "provider_status",
  "contribution",
  "capability",
  "visibility",
  "paid_status",
  "commercial_tier",
  "price_paid",
  "architect_status",
  "operator_status",
  "administrator_status",
  "control_plane_proximity"
] as const;

export type NonAuthorityFact = (typeof NON_AUTHORITY_FACTS)[number];

export interface ResidenceAuthorityBoundaryInput {
  readonly authorityRef?: string | null;
  readonly contextualFacts?: readonly NonAuthorityFact[];
}

export type ResidenceAuthorityBoundaryResult =
  | {
      readonly permitted: true;
      readonly authorityRef: string;
      readonly contextualFactsRetainedAsNonAuthority: readonly NonAuthorityFact[];
    }
  | {
      readonly permitted: false;
      readonly reason: string;
      readonly contextualFactsRetainedAsNonAuthority: readonly NonAuthorityFact[];
    };

export function evaluateResidenceAuthorityBoundary(
  input: ResidenceAuthorityBoundaryInput
): ResidenceAuthorityBoundaryResult {
  const contextualFactsRetainedAsNonAuthority = [...(input.contextualFacts ?? [])];
  const authorityRef = input.authorityRef?.trim();

  if (!authorityRef) {
    return {
      permitted: false,
      reason:
        "Explicit Atlas authority is required; contextual status, including architect, operator, administrator, capability, payment, and control-plane proximity, cannot substitute for authority.",
      contextualFactsRetainedAsNonAuthority
    };
  }

  return {
    permitted: true,
    authorityRef,
    contextualFactsRetainedAsNonAuthority
  };
}

export function assertResidenceAuthorityBoundary(
  input: ResidenceAuthorityBoundaryInput
): string {
  const result = evaluateResidenceAuthorityBoundary(input);
  if (!result.permitted) {
    throw new Error(result.reason);
  }
  return result.authorityRef;
}
