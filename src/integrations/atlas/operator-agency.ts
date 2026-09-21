/**
 * Read-only Atlas -> Swarm envelope for operator agency.
 *
 * Swarm does not own global human identity, PII, or operator truth. This
 * contract carries only an opaque operator reference plus bounded, already
 * derived agency state that Swarm may use to reduce avoidable friction.
 */
export type AtlasOperatorAgencyStanding =
  | "operational"
  | "constrained"
  | "preservation-required"
  | "unknown";

export interface AtlasOperatorAgencyEnvelope {
  readonly operatorRef: string;
  readonly standing: AtlasOperatorAgencyStanding;
  /** Opaque references to actions the operator can currently execute. */
  readonly executableOptionRefs: readonly string[];
  /** Evidence/provenance references supporting the standing. */
  readonly evidenceRefs: readonly string[];
  readonly observedAt: string;
  /** Optional Atlas decision/reference. Never interpreted as local authority. */
  readonly authorityRef?: string;
}

export function assertAtlasOperatorAgencyEnvelope(
  value: AtlasOperatorAgencyEnvelope
): AtlasOperatorAgencyEnvelope {
  if (!value.operatorRef.trim()) {
    throw new Error("operator agency envelope requires a non-empty operatorRef");
  }
  if (!Number.isFinite(Date.parse(value.observedAt))) {
    throw new Error("operator agency envelope requires a valid observedAt timestamp");
  }
  for (const ref of [...value.executableOptionRefs, ...value.evidenceRefs]) {
    if (!ref.trim()) throw new Error("operator agency envelope refs must be non-empty");
  }
  return value;
}

/**
 * Measures change in executable options only. This is deliberately narrower
 * than mood, wellbeing, safety, or worth, none of which this module infers.
 */
export function executableAgencyDelta(
  beforeOptionRefs: readonly string[],
  afterOptionRefs: readonly string[]
): number {
  const before = new Set(beforeOptionRefs.filter((ref) => ref.trim().length > 0));
  const after = new Set(afterOptionRefs.filter((ref) => ref.trim().length > 0));
  return after.size - before.size;
}
