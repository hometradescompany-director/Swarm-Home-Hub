export type AuthorityStanding =
  | "bounded_explicit"
  | "delegated_explicit"
  | "implicit_transfer"
  | "shared_root"
  | "unknown";

export interface AuthorityObservation {
  readonly standing: AuthorityStanding;
  readonly evidenceRef?: string;
  readonly scopeRef?: string;
}

export interface AuthorityFingerprint {
  readonly standing: AuthorityStanding;
  readonly evidenceRef?: string;
  readonly scopeRef?: string;
  readonly federationSafeByEvidence: boolean;
}

export function fingerprintAuthority(
  observation: AuthorityObservation
): AuthorityFingerprint {
  const evidenceRef = observation.evidenceRef?.trim();
  if (observation.standing !== "unknown" && !evidenceRef) {
    throw new Error("non-unknown authority standing requires evidenceRef");
  }
  const safe =
    observation.standing === "bounded_explicit" ||
    observation.standing === "delegated_explicit";

  return Object.freeze({
    standing: observation.standing,
    ...(evidenceRef ? { evidenceRef } : {}),
    ...(observation.scopeRef?.trim() ? { scopeRef: observation.scopeRef.trim() } : {}),
    federationSafeByEvidence: safe,
  });
}
