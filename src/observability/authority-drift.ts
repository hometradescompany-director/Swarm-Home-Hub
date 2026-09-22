import type { AuthorityFingerprint } from "../refinery/authority-semantics.js";

export interface AuthorityDrift {
  readonly changed: boolean;
  readonly standingChanged: boolean;
  readonly scopeChanged: boolean;
  readonly federationSafetyChanged: boolean;
  readonly beforeEvidenceRef?: string;
  readonly afterEvidenceRef?: string;
}

export function compareAuthorityFingerprints(
  before: AuthorityFingerprint,
  after: AuthorityFingerprint
): AuthorityDrift {
  const standingChanged = before.standing !== after.standing;
  const scopeChanged = (before.scopeRef ?? null) !== (after.scopeRef ?? null);
  const federationSafetyChanged =
    before.federationSafeByEvidence !== after.federationSafeByEvidence;

  return Object.freeze({
    changed: standingChanged || scopeChanged || federationSafetyChanged,
    standingChanged,
    scopeChanged,
    federationSafetyChanged,
    ...(before.evidenceRef ? { beforeEvidenceRef: before.evidenceRef } : {}),
    ...(after.evidenceRef ? { afterEvidenceRef: after.evidenceRef } : {}),
  });
}
