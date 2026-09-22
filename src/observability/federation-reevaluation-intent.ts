import type {
  FederationReevaluationReason,
  FederationReevaluationRequirement,
} from "./federation-reevaluation.js";

export const SWARM_HOME_FEDERATION_REEVALUATION_INTENT =
  "SwarmHomeFederationReevaluationIntent/v1" as const;

export interface FederationReevaluationIntent {
  readonly schema: typeof SWARM_HOME_FEDERATION_REEVALUATION_INTENT;
  readonly intentId: string;
  readonly candidateRef: string;
  readonly priorObservedAt: string;
  readonly reasons: readonly FederationReevaluationReason[];
  readonly requestedAt: string;
  readonly authorityImplication: "none";
}

export function createFederationReevaluationIntent(
  requirement: FederationReevaluationRequirement,
  intentId: string,
  requestedAt: string
): FederationReevaluationIntent | null {
  if (!requirement.required) return null;
  const id = intentId.trim();
  if (!id) throw new Error("intentId must be non-empty");
  const requestedMs = Date.parse(requestedAt);
  const priorMs = Date.parse(requirement.priorObservedAt);
  if (!Number.isFinite(requestedMs) || !Number.isFinite(priorMs)) {
    throw new Error("reevaluation timestamps must be valid ISO-8601 values");
  }
  if (requestedMs < priorMs) {
    throw new Error("reevaluation intent cannot predate the decision it reevaluates");
  }
  return Object.freeze({
    schema: SWARM_HOME_FEDERATION_REEVALUATION_INTENT,
    intentId: id,
    candidateRef: requirement.candidateRef,
    priorObservedAt: requirement.priorObservedAt,
    reasons: Object.freeze([...requirement.reasons]),
    requestedAt,
    authorityImplication: "none",
  });
}
