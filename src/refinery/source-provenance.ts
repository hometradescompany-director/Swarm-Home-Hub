export type LicenseStanding =
  | "declared"
  | "missing"
  | "conflicting"
  | "unknown";

export interface SourceProvenanceObservation {
  readonly repoRef: string;
  readonly commitSha: string;
  readonly sourceRef: string;
  readonly licenseId?: string;
  readonly licenseStanding: LicenseStanding;
  readonly observedAt: string;
}

export interface SourceProvenanceReceipt extends SourceProvenanceObservation {
  readonly receiptType: "external_source_observation";
}

const SHA = /^[0-9a-f]{40}$/i;

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export function createSourceProvenanceReceipt(
  observation: SourceProvenanceObservation
): SourceProvenanceReceipt {
  const commitSha = required(observation.commitSha, "commitSha").toLowerCase();
  if (!SHA.test(commitSha)) throw new Error("commitSha must be a 40-character Git SHA");
  if (!Number.isFinite(Date.parse(observation.observedAt))) {
    throw new Error("observedAt must be a valid ISO-8601 value");
  }
  const licenseId = observation.licenseId?.trim();
  if (observation.licenseStanding === "declared" && !licenseId) {
    throw new Error("declared license requires licenseId");
  }
  return Object.freeze({
    receiptType: "external_source_observation",
    repoRef: required(observation.repoRef, "repoRef"),
    commitSha,
    sourceRef: required(observation.sourceRef, "sourceRef"),
    ...(licenseId ? { licenseId } : {}),
    licenseStanding: observation.licenseStanding,
    observedAt: observation.observedAt,
  });
}
