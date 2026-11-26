import type { AgentIdentityRef } from "../domain/agent.js";
import { createTypedAbsence } from "../provenance/absence.js";
import { createProvenanceReceipt, type ProvenanceReceipt } from "../provenance/receipt.js";
import type { IncubationAppendExpectation, IncubationJournal } from "./journal.js";
import { assertIso8601Timestamp, requireNonEmptyRef } from "./validation.js";
import type {
  IncubationAssessment, IncubationAssessmentRecordedEvent, IncubationAssessmentWithdrawnEvent,
  IncubationEvent, IncubationStage, IncubationStanding, IncubationTier, IncubationReviewOutcome
} from "./types.js";

export interface IncubationEvidenceResolver {
  resolve(receiptIds: readonly string[]): Promise<readonly ProvenanceReceipt[]>;
}

/** The caller must bind this decision to its trusted reviewer/authority source. */
export interface IncubationReviewerAuthorization {
  mayReview(input: {
    readonly actorRef: string;
    readonly subjectRef: AgentIdentityRef;
    readonly action: "record" | "withdraw";
  }): Promise<boolean>;
}

export interface RecordIncubationAssessmentInput extends IncubationAppendExpectation {
  readonly eventId: string;
  readonly subjectRef: AgentIdentityRef;
  readonly actorRef: string;
  readonly occurredAt: string;
  readonly stage: IncubationStage;
  readonly tier: IncubationTier;
  readonly outcome: IncubationReviewOutcome;
  readonly evidenceReceiptIds: readonly string[];
}

export interface WithdrawIncubationAssessmentInput extends IncubationAppendExpectation {
  readonly eventId: string;
  readonly subjectRef: AgentIdentityRef;
  readonly actorRef: string;
  readonly occurredAt: string;
  readonly assessmentEventId: string;
  readonly reason: string;
  readonly evidenceReceiptIds: readonly string[];
}

const ADEQUATE_STANDINGS = new Set(["direct_observation", "source_record", "user_report", "supported_inference"]);

function validateReceiptIds(ids: readonly string[]): readonly string[] {
  const clean = ids.map(id => id.trim());
  if (!clean.length || clean.some(id => !id)) throw new Error("at least one evidence receipt id is required");
  if (new Set(clean).size !== clean.length) throw new Error("evidence receipt ids must be unique");
  return Object.freeze(clean);
}

export class IncubationService {
  constructor(
    private readonly journal: IncubationJournal,
    private readonly evidence: IncubationEvidenceResolver,
    private readonly authorization: IncubationReviewerAuthorization
  ) {}

  async recordAssessment(input: RecordIncubationAssessmentInput): Promise<IncubationAssessmentRecordedEvent> {
    const actorRef = requireNonEmptyRef(input.actorRef, "reviewer actor ref");
    requireNonEmptyRef(input.subjectRef, "incubation subject ref");
    const eventId = requireNonEmptyRef(input.eventId, "incubation event id");
    assertIso8601Timestamp(input.occurredAt, "incubation occurredAt");
    if (!["sprite", "sapling", "ent"].includes(input.stage)) throw new Error("unknown incubation stage");
    if (!Number.isInteger(input.tier) || input.tier < 1 || input.tier > 9) throw new Error("incubation tier must be an integer from 1 to 9");
    if (!["reviewed", "contested"].includes(input.outcome)) throw new Error("unknown incubation review outcome");
    await this.#authorize(actorRef, input.subjectRef, "record");
    const receipts = validateReceiptIds(input.evidenceReceiptIds);
    await this.#requireAdequateEvidence(receipts);
    const current = await this.journal.eventsForSubject(input.subjectRef);
    const previousEventId = current.at(-1)?.id ?? null;
    const event: IncubationAssessmentRecordedEvent = Object.freeze({
      id: eventId, type: "swarm.incubation.assessment_recorded", subjectRef: input.subjectRef,
      actorRef, occurredAt: input.occurredAt, evidenceReceiptIds: receipts,
      previousEventId, stage: input.stage, tier: input.tier, outcome: input.outcome
    });
    await this.journal.append(event, { expectedLastEventId: input.expectedLastEventId });
    return event;
  }

  async withdrawAssessment(input: WithdrawIncubationAssessmentInput): Promise<IncubationAssessmentWithdrawnEvent> {
    const actorRef = requireNonEmptyRef(input.actorRef, "reviewer actor ref");
    requireNonEmptyRef(input.subjectRef, "incubation subject ref");
    const eventId = requireNonEmptyRef(input.eventId, "incubation event id");
    assertIso8601Timestamp(input.occurredAt, "incubation occurredAt");
    await this.#authorize(actorRef, input.subjectRef, "withdraw");
    const receipts = validateReceiptIds(input.evidenceReceiptIds);
    await this.#requireAdequateEvidence(receipts);
    const reason = input.reason.trim();
    if (!reason) throw new Error("withdrawal requires a reason");
    const history = await this.journal.eventsForSubject(input.subjectRef);
    const current = history.at(-1);
    if (!current || current.type !== "swarm.incubation.assessment_recorded" || current.id !== input.assessmentEventId) {
      throw new Error("withdrawal must identify the current recorded assessment");
    }
    const event: IncubationAssessmentWithdrawnEvent = Object.freeze({
      id: eventId, type: "swarm.incubation.assessment_withdrawn", subjectRef: input.subjectRef,
      actorRef, occurredAt: input.occurredAt, evidenceReceiptIds: receipts,
      previousEventId: current.id, reason
    });
    await this.journal.append(event, { expectedLastEventId: input.expectedLastEventId });
    return event;
  }

  async getStanding(subjectRef: AgentIdentityRef, observedAt: string): Promise<IncubationStanding> {
    requireNonEmptyRef(subjectRef, "incubation subject ref");
    assertIso8601Timestamp(observedAt, "standing observedAt");
    const history = await this.journal.eventsForSubject(subjectRef);
    const last = history.at(-1);
    if (!last) return Object.freeze({
      status: "unassessed", absence: createTypedAbsence({ kind: "searched_no_adequate_match", statement: "The subject journal contains no incubation assessment.", observedAt }),
      history, lastEventId: null
    });
    if (last.type === "swarm.incubation.assessment_withdrawn") return Object.freeze({
      status: "withdrawn", absence: createTypedAbsence({ kind: "superseded", statement: last.reason,
        observedAt: last.occurredAt, sourceRef: last.previousEventId, supersededByRef: last.id }), history, lastEventId: last.id
    });
    const assessment: IncubationAssessment = Object.freeze({
      eventId: last.id, subjectRef: last.subjectRef, stage: last.stage, tier: last.tier,
      outcome: last.outcome, reviewedByRef: last.actorRef, reviewedAt: last.occurredAt,
      evidenceReceiptIds: last.evidenceReceiptIds
    });
    return Object.freeze({ status: last.outcome, assessment, history, lastEventId: last.id });
  }

  async #requireAdequateEvidence(ids: readonly string[]): Promise<void> {
    const resolved = await this.evidence.resolve(ids);
    if (resolved.length !== ids.length) throw new Error("evidence resolver must return exactly the requested receipts");
    const byId = new Map<string, ProvenanceReceipt>();
    for (const candidate of resolved) {
      const receipt = createProvenanceReceipt(candidate);
      assertIso8601Timestamp(receipt.capturedAt, `evidence receipt ${receipt.id} capturedAt`);
      if (byId.has(receipt.id)) throw new Error(`duplicate evidence receipt returned: ${receipt.id}`);
      if (receipt.absence) throw new Error(`absence receipt cannot substantiate an incubation assessment: ${receipt.id}`);
      byId.set(receipt.id, receipt);
    }
    for (const id of ids) {
      const receipt = byId.get(id);
      if (!receipt) throw new Error(`evidence receipt unavailable: ${id}`);
      if (!ADEQUATE_STANDINGS.has(receipt.standing)) throw new Error(`evidence receipt is insufficiently grounded: ${id}`);
    }
  }

  async #authorize(actorRef: string, subjectRef: AgentIdentityRef, action: "record" | "withdraw"): Promise<void> {
    if (await this.authorization.mayReview({ actorRef, subjectRef, action }) !== true) {
      throw new Error(`reviewer is not authorized to ${action} this incubation record`);
    }
  }
}
