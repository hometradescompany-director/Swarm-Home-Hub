import type { ContinuityGapCandidate } from "./continuity-gap.js";
import type { EvidenceContradiction } from "./contradiction-projection.js";
import type { RecoveryObservationOutcome } from "./recovery-outcome.js";

export type ContinuityAuditFinding =
  | {
      readonly kind: "candidate_gap";
      readonly subjectRef: string;
      readonly evidenceRefs: readonly string[];
    }
  | {
      readonly kind: "contradiction";
      readonly subjectRef: string;
      readonly evidenceRefs: readonly string[];
    }
  | {
      readonly kind: "recovery_failure";
      readonly subjectRef: string;
      readonly evidenceRefs: readonly string[];
    };

export function projectContinuityAuditFindings(input: {
  readonly gaps: readonly ContinuityGapCandidate[];
  readonly contradictions: readonly EvidenceContradiction[];
  readonly recoveryOutcomes: readonly RecoveryObservationOutcome[];
}): readonly ContinuityAuditFinding[] {
  const findings: ContinuityAuditFinding[] = [];

  for (const gap of input.gaps) {
    findings.push(Object.freeze({
      kind: "candidate_gap",
      subjectRef: gap.subjectRef,
      evidenceRefs: Object.freeze([gap.beforeReceiptId, gap.afterReceiptId]),
    }));
  }

  for (const contradiction of input.contradictions) {
    findings.push(Object.freeze({
      kind: "contradiction",
      subjectRef: contradiction.subjectRef,
      evidenceRefs: Object.freeze([...contradiction.receiptIds]),
    }));
  }

  for (const outcome of input.recoveryOutcomes) {
    if (outcome.status === "failed" || outcome.status === "refused") {
      findings.push(Object.freeze({
        kind: "recovery_failure",
        subjectRef: outcome.subjectRef,
        evidenceRefs: Object.freeze(outcome.receiptId ? [outcome.receiptId] : []),
      }));
    }
  }

  return Object.freeze(findings.sort((a, b) =>
    (a.subjectRef + a.kind).localeCompare(b.subjectRef + b.kind)
  ));
}
