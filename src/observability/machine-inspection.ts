import type { ContinuityAuditFinding } from "./continuity-audit.js";
import type { ObservationFreshness } from "./observation-freshness.js";
import type { ProviderHeartbeat } from "./provider-heartbeat.js";
import type { RecoveryObservationOutcome } from "./recovery-outcome.js";

export interface MachineInspectionSnapshot {
  readonly observedSubjects: number;
  readonly staleSubjects: readonly string[];
  readonly unknownSubjects: readonly string[];
  readonly staleProviders: readonly string[];
  readonly unknownProviders: readonly string[];
  readonly findingCount: number;
  readonly failedRecoveryIntentIds: readonly string[];
}

export function projectMachineInspectionSnapshot(input: {
  readonly freshness: readonly ObservationFreshness[];
  readonly providerHeartbeats: readonly ProviderHeartbeat[];
  readonly findings: readonly ContinuityAuditFinding[];
  readonly recoveryOutcomes: readonly RecoveryObservationOutcome[];
}): MachineInspectionSnapshot {
  const staleSubjects = input.freshness
    .filter((item) => item.state === "stale")
    .map((item) => item.subjectRef)
    .sort();
  const unknownSubjects = input.freshness
    .filter((item) => item.state === "unknown")
    .map((item) => item.subjectRef)
    .sort();
  const staleProviders = input.providerHeartbeats
    .filter((item) => item.state === "stale")
    .map((item) => item.providerRef)
    .sort();
  const unknownProviders = input.providerHeartbeats
    .filter((item) => item.state === "unknown")
    .map((item) => item.providerRef)
    .sort();
  const failedRecoveryIntentIds = input.recoveryOutcomes
    .filter((item) => item.status === "failed" || item.status === "refused")
    .map((item) => item.intentId)
    .sort();

  return Object.freeze({
    observedSubjects: new Set(input.freshness.map((item) => item.subjectRef)).size,
    staleSubjects: Object.freeze(staleSubjects),
    unknownSubjects: Object.freeze(unknownSubjects),
    staleProviders: Object.freeze(staleProviders),
    unknownProviders: Object.freeze(unknownProviders),
    findingCount: input.findings.length,
    failedRecoveryIntentIds: Object.freeze(failedRecoveryIntentIds),
  });
}
