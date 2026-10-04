import {
  SWARM_HOME_FEDERATION_PROTOCOL,
  type FederationHandshakeResult,
  type FederationPeerAdvertisement,
  type HomeRef,
} from "../domain/federation.js";

const nonBlank = (value: string): boolean => value.trim().length > 0;

export interface FederationReplayState {
  hasAccepted(homeRef: HomeRef, nonce: string): boolean;
  recordAccepted(homeRef: HomeRef, nonce: string): void;
}

/**
 * Process-local replay state for hosts that do not need restart durability.
 * Deployments requiring restart-safe replay protection should inject a durable
 * implementation backed by shared persistent storage.
 */
export class InMemoryFederationReplayState implements FederationReplayState {
  readonly #accepted = new Map<HomeRef, Set<string>>();

  hasAccepted(homeRef: HomeRef, nonce: string): boolean {
    return this.#accepted.get(homeRef)?.has(nonce) ?? false;
  }

  recordAccepted(homeRef: HomeRef, nonce: string): void {
    const nonces = this.#accepted.get(homeRef) ?? new Set<string>();
    nonces.add(nonce);
    this.#accepted.set(homeRef, nonces);
  }
}

export class FederationHandshakeService {
  readonly #replayState: FederationReplayState;

  constructor(
    readonly localHomeRef: HomeRef,
    replayState: FederationReplayState = new InMemoryFederationReplayState()
  ) {
    if (!nonBlank(localHomeRef)) {
      throw new Error("local home ref must be non-empty");
    }
    this.#replayState = replayState;
  }

  evaluate(
    advertisement: FederationPeerAdvertisement,
    correlationId: string
  ): FederationHandshakeResult {
    if (!nonBlank(correlationId)) {
      throw new Error("correlation id must be non-empty");
    }

    if (!nonBlank(advertisement.homeRef)) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        correlationId,
        reason: "invalid_home_ref",
      });
    }

    if (advertisement.homeRef === this.localHomeRef) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "self_peer",
      });
    }

    if (advertisement.protocolVersion !== SWARM_HOME_FEDERATION_PROTOCOL) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "unsupported_protocol",
      });
    }

    if (!nonBlank(advertisement.nonce)) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "missing_nonce",
      });
    }

    if (
      advertisement.evidenceReceiptIds.length === 0 ||
      advertisement.evidenceReceiptIds.some((id) => !nonBlank(id))
    ) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "missing_evidence",
      });
    }

    if (this.#replayState.hasAccepted(advertisement.homeRef, advertisement.nonce)) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "replayed_nonce",
      });
    }

    this.#replayState.recordAccepted(advertisement.homeRef, advertisement.nonce);

    return Object.freeze({
      accepted: true,
      localHomeRef: this.localHomeRef,
      remoteHomeRef: advertisement.homeRef,
      protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
      correlationId,
      capabilityRefs: Object.freeze([...advertisement.capabilityRefs]),
      evidenceReceiptIds: Object.freeze([...advertisement.evidenceReceiptIds]),
    });
  }
}
