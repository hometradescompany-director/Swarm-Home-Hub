export interface RecoveryWaveEvidence {
  readonly continuityGapScans: number;
  readonly recoveryIntents: number;
  readonly authorityDecisions: number;
  readonly recoveryOutcomes: number;
  readonly evidenceComparisons: number;
  readonly continuityAudits: number;
  readonly machineInspectionSnapshots: number;
}

export interface RecoveryWaveProof {
  readonly complete: boolean;
  readonly missing: readonly string[];
}

export function proveRecoveryWave(
  evidence: RecoveryWaveEvidence
): RecoveryWaveProof {
  const entries = Object.entries(evidence) as Array<
    [keyof RecoveryWaveEvidence, number]
  >;
  const missing = entries
    .filter(([, count]) => !Number.isInteger(count) || count < 1)
    .map(([name]) => name);

  return Object.freeze({
    complete: missing.length === 0,
    missing: Object.freeze(missing),
  });
}
