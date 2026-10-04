export interface DriftWaveEvidence {
  readonly sourceDriftChecks: number;
  readonly protocolDriftChecks: number;
  readonly stateDriftChecks: number;
  readonly authorityDriftChecks: number;
  readonly postureDriftChecks: number;
  readonly reevaluationChecks: number;
  readonly reevaluationIntents: number;
}

export function proveDriftWave(
  evidence: DriftWaveEvidence
): Readonly<{ complete: boolean; missing: readonly string[] }> {
  const entries = Object.entries(evidence) as Array<[keyof DriftWaveEvidence, number]>;
  const missing = entries
    .filter(([, count]) => !Number.isInteger(count) || count < 1)
    .map(([name]) => name);
  return Object.freeze({
    complete: missing.length === 0,
    missing: Object.freeze(missing),
  });
}
