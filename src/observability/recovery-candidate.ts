import type { EvidenceContradiction } from "./contradiction-projection.js";
import type { ObservationFreshness } from "./observation-freshness.js";
import type { ProviderHeartbeat } from "./provider-heartbeat.js";

export type RecoveryCandidateKind =
  | "reobserve_source"
  | "investigate_contradiction"
  | "reobserve_provider";

export interface RecoveryCandidate {
  readonly kind: RecoveryCandidateKind;
  readonly subjectRef: string;
  readonly evidenceRefs: readonly string[];
}

export function projectRecoveryCandidates(input: {
  readonly freshness: readonly ObservationFreshness[];
  readonly contradictions: readonly EvidenceContradiction[];
  readonly providerHeartbeats: readonly ProviderHeartbeat[];
}): readonly RecoveryCandidate[] {
  const candidates: RecoveryCandidate[] = [];

  for (const freshness of input.freshness) {
    if (freshness.state !== "current") {
      candidates.push(Object.freeze({
        kind: "reobserve_source",
        subjectRef: freshness.subjectRef,
        evidenceRefs: Object.freeze(
          freshness.receiptId ? [freshness.receiptId] : []
        ),
      }));
    }
  }

  for (const contradiction of input.contradictions) {
    candidates.push(Object.freeze({
      kind: "investigate_contradiction",
      subjectRef: contradiction.subjectRef,
      evidenceRefs: Object.freeze([...contradiction.receiptIds]),
    }));
  }

  for (const heartbeat of input.providerHeartbeats) {
    if (heartbeat.state !== "current") {
      candidates.push(Object.freeze({
        kind: "reobserve_provider",
        subjectRef: heartbeat.providerRef,
        evidenceRefs: Object.freeze([]),
      }));
    }
  }

  return Object.freeze(candidates);
}
