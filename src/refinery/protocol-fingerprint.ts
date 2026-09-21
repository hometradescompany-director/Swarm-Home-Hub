export type ProtocolFamily =
  | "mcp"
  | "a2a"
  | "openrpc"
  | "jsonrpc"
  | "openapi"
  | "framework_native"
  | "unknown";

export interface ProtocolEvidence {
  readonly family: ProtocolFamily;
  readonly evidenceRef: string;
  readonly version?: string;
}

export interface ProtocolFingerprint {
  readonly families: readonly ProtocolFamily[];
  readonly evidenceRefs: readonly string[];
}

export function fingerprintProtocols(
  evidence: readonly ProtocolEvidence[]
): ProtocolFingerprint {
  const families = new Set<ProtocolFamily>();
  const refs = new Set<string>();

  for (const item of evidence) {
    const ref = item.evidenceRef.trim();
    if (!ref) throw new Error("evidenceRef must be non-empty");
    refs.add(ref);
    families.add(item.family);
  }

  return Object.freeze({
    families: Object.freeze([...families].sort()),
    evidenceRefs: Object.freeze([...refs].sort()),
  });
}
