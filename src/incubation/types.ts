import type { AgentIdentityRef } from "../domain/agent.js";

/** The life-cycle vocabulary recorded by Order 676. */
export const INCUBATION_STAGES = ["sprite", "sapling", "ent"] as const;
export type IncubationStage = (typeof INCUBATION_STAGES)[number];

/** Nine tiers are recorded independently of stage until their mapping is ratified. */
export const INCUBATION_TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type IncubationTier = (typeof INCUBATION_TIERS)[number];

/** A review is explicit. A contested record never becomes an active classification. */
export type IncubationReviewOutcome = "reviewed" | "contested";

export type IncubationEventType =
  | "swarm.incubation.assessment_recorded"
  | "swarm.incubation.assessment_withdrawn";

export interface IncubationEventBase {
  readonly id: string;
  readonly type: IncubationEventType;
  readonly subjectRef: AgentIdentityRef;
  readonly occurredAt: string;
  /** Opaque actor reference. It is provenance, not an authority grant. */
  readonly actorRef: string;
  readonly evidenceReceiptIds: readonly string[];
  /** This feature's append-only subject chain, independent of residence state. */
  readonly previousEventId: string | null;
}

export interface IncubationAssessmentRecordedEvent extends IncubationEventBase {
  readonly type: "swarm.incubation.assessment_recorded";
  readonly stage: IncubationStage;
  readonly tier: IncubationTier;
  readonly outcome: IncubationReviewOutcome;
}

export interface IncubationAssessmentWithdrawnEvent extends IncubationEventBase {
  readonly type: "swarm.incubation.assessment_withdrawn";
  readonly previousEventId: string;
  readonly reason: string;
}

export type IncubationEvent =
  | IncubationAssessmentRecordedEvent
  | IncubationAssessmentWithdrawnEvent;

export interface IncubationAssessment {
  readonly eventId: string;
  readonly subjectRef: AgentIdentityRef;
  readonly stage: IncubationStage;
  readonly tier: IncubationTier;
  readonly outcome: IncubationReviewOutcome;
  readonly reviewedByRef: string;
  readonly reviewedAt: string;
  readonly evidenceReceiptIds: readonly string[];
}

export type IncubationStanding =
  | {
      readonly status: "reviewed";
      readonly assessment: IncubationAssessment;
      readonly history: readonly IncubationEvent[];
      readonly lastEventId: string;
    }
  | {
      readonly status: "contested";
      readonly assessment: IncubationAssessment;
      readonly history: readonly IncubationEvent[];
      readonly lastEventId: string;
    }
  | {
      readonly status: "unassessed";
      readonly absence: import("../provenance/absence.js").TypedAbsence;
      readonly history: readonly IncubationEvent[];
      readonly lastEventId: string | null;
    }
  | {
      readonly status: "withdrawn";
      readonly absence: import("../provenance/absence.js").TypedAbsence;
      readonly history: readonly IncubationEvent[];
      readonly lastEventId: string;
    };
