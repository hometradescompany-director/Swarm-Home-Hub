import type {
  AtlasOperatorAgencyEnvelope,
  AtlasOperatorAgencyStanding,
} from "../integrations/atlas/operator-agency.js";

export type SwarmActionPressure =
  | "essential"
  | "optional"
  | "repetitive"
  | "cost-increasing"
  | "irreversible";

export type OperatorPreservationAction =
  | "preserve-context"
  | "reduce-friction"
  | "restore-options"
  | "avoid-repetition"
  | "surface-owner"
  | "record-agency-delta";

export type OperatorPreservationDisposition =
  | "continue"
  | "defer-nonessential"
  | "require-explicit-confirmation";

export interface OperatorPreservationDecision {
  readonly disposition: OperatorPreservationDisposition;
  readonly actions: readonly OperatorPreservationAction[];
  readonly standing: AtlasOperatorAgencyStanding;
  readonly reason: string;
}

/**
 * Local Swarm policy for respecting an Atlas-derived operator agency envelope.
 *
 * This policy never grants authority. It can only keep essential work moving,
 * defer avoidable work, or require confirmation before locally increasing
 * cost/irreversibility while agency is constrained.
 */
export function decideOperatorPreservation(
  envelope: AtlasOperatorAgencyEnvelope,
  pressure: SwarmActionPressure
): OperatorPreservationDecision {
  const common: OperatorPreservationAction[] = [
    "preserve-context",
    "record-agency-delta",
  ];

  if (envelope.standing === "operational") {
    return {
      disposition: "continue",
      actions: common,
      standing: envelope.standing,
      reason: "operator agency is operational; preserve continuity without adding friction",
    };
  }

  if (envelope.standing === "unknown") {
    return {
      disposition:
        pressure === "irreversible"
          ? "require-explicit-confirmation"
          : "continue",
      actions: common,
      standing: envelope.standing,
      reason:
        pressure === "irreversible"
          ? "operator agency is unknown; do not make an irreversible local move silently"
          : "unknown standing alone is not evidence of impairment",
    };
  }

  const preservationActions: OperatorPreservationAction[] = [
    ...common,
    "reduce-friction",
    "restore-options",
    "surface-owner",
  ];

  if (pressure === "repetitive") {
    return {
      disposition: "defer-nonessential",
      actions: [...preservationActions, "avoid-repetition"],
      standing: envelope.standing,
      reason: "repeating failed work consumes agency without creating a new executable option",
    };
  }

  if (pressure === "optional") {
    return {
      disposition: "defer-nonessential",
      actions: preservationActions,
      standing: envelope.standing,
      reason: "nonessential work should yield while operator agency is constrained",
    };
  }

  if (pressure === "cost-increasing" || pressure === "irreversible") {
    return {
      disposition: "require-explicit-confirmation",
      actions: preservationActions,
      standing: envelope.standing,
      reason: "do not silently increase cost or irreversibility while operator agency is constrained",
    };
  }

  return {
    disposition: "continue",
    actions: preservationActions,
    standing: envelope.standing,
    reason: "essential work may continue, but the system must preserve context and restore options",
  };
}
