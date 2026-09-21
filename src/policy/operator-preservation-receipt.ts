import { executableAgencyDelta } from "../integrations/atlas/operator-agency.js";
import type {
  OperatorPreservationDecision,
  SwarmActionPressure,
} from "./operator-preservation.js";

export interface OperatorPreservationOutcomeReceipt {
  readonly receiptId: string;
  readonly operatorRef: string;
  readonly decidedAt: string;
  readonly completedAt: string;
  readonly pressure: SwarmActionPressure;
  readonly disposition: OperatorPreservationDecision["disposition"];
  readonly standing: OperatorPreservationDecision["standing"];
  readonly beforeOptionRefs: readonly string[];
  readonly afterOptionRefs: readonly string[];
  readonly agencyDelta: number;
  readonly evidenceRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
  readonly authoritative: false;
}

const cleanRefs = (values: readonly string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))];

export function createOperatorPreservationOutcomeReceipt(input: {
  receiptId: string;
  operatorRef: string;
  decidedAt: string;
  completedAt: string;
  pressure: SwarmActionPressure;
  decision: OperatorPreservationDecision;
  beforeOptionRefs: readonly string[];
  afterOptionRefs: readonly string[];
  evidenceRefs?: readonly string[];
  sourceEventRefs?: readonly string[];
}): OperatorPreservationOutcomeReceipt {
  if (!input.receiptId.trim()) throw new Error("receiptId is required");
  if (!input.operatorRef.trim()) throw new Error("operatorRef is required");
  if (!Number.isFinite(Date.parse(input.decidedAt))) {
    throw new Error("decidedAt must be a valid timestamp");
  }
  if (!Number.isFinite(Date.parse(input.completedAt))) {
    throw new Error("completedAt must be a valid timestamp");
  }
  if (Date.parse(input.completedAt) < Date.parse(input.decidedAt)) {
    throw new Error("completedAt cannot precede decidedAt");
  }

  const beforeOptionRefs = cleanRefs(input.beforeOptionRefs);
  const afterOptionRefs = cleanRefs(input.afterOptionRefs);

  return {
    receiptId: input.receiptId,
    operatorRef: input.operatorRef,
    decidedAt: input.decidedAt,
    completedAt: input.completedAt,
    pressure: input.pressure,
    disposition: input.decision.disposition,
    standing: input.decision.standing,
    beforeOptionRefs,
    afterOptionRefs,
    agencyDelta: executableAgencyDelta(beforeOptionRefs, afterOptionRefs),
    evidenceRefs: cleanRefs(input.evidenceRefs ?? []),
    sourceEventRefs: cleanRefs(input.sourceEventRefs ?? []),
    authoritative: false,
  };
}
