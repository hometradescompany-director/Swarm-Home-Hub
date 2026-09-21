export interface AuditabilityWaveEvidence {
  readonly externalObservations: number;
  readonly freshnessProjections: number;
  readonly contradictionScans: number;
  readonly auditTimelines: number;
  readonly providerSnapshots: number;
  readonly providerHeartbeats: number;
  readonly recoveryCandidateScans: number;
}

export interface AuditabilityWaveProof {
  readonly complete: boolean;
  readonly missing: readonly string[];
}

export function proveAuditabilityWave(
  evidence: AuditabilityWaveEvidence
): AuditabilityWaveProof {
  const entries = Object.entries(evidence) as Array<
    [keyof AuditabilityWaveEvidence, number]
  >;
  const missing = entries
    .filter(([, count]) => !Number.isInteger(count) || count < 1)
    .map(([name]) => name);

  return Object.freeze({
    complete: missing.length === 0,
    missing: Object.freeze(missing),
  });
}
