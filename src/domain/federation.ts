export type HomeRef = string & { readonly __brand: "HomeRef" };

export const SWARM_HOME_FEDERATION_PROTOCOL = "SwarmHomeFederation/v1" as const;

export interface FederationPeerAdvertisement {
  readonly homeRef: HomeRef;
  readonly protocolVersion: string;
  readonly capabilityRefs: readonly string[];
  readonly evidenceReceiptIds: readonly string[];
  readonly nonce: string;
  readonly observedAt: string;
}

export type FederationHandshakeRefusalReason =
  | "invalid_home_ref"
  | "self_peer"
  | "unsupported_protocol"
  | "missing_evidence"
  | "missing_nonce"
  | "replayed_nonce";

export interface FederationHandshakeAccepted {
  readonly accepted: true;
  readonly localHomeRef: HomeRef;
  readonly remoteHomeRef: HomeRef;
  readonly protocolVersion: typeof SWARM_HOME_FEDERATION_PROTOCOL;
  readonly correlationId: string;
  readonly capabilityRefs: readonly string[];
  readonly evidenceReceiptIds: readonly string[];
}

export interface FederationHandshakeRefused {
  readonly accepted: false;
  readonly localHomeRef: HomeRef;
  readonly remoteHomeRef?: HomeRef;
  readonly correlationId: string;
  readonly reason: FederationHandshakeRefusalReason;
}

export type FederationHandshakeResult =
  | FederationHandshakeAccepted
  | FederationHandshakeRefused;
