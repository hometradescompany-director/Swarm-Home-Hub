import {
  SWARM_HOME_FEDERATION_PROTOCOL,
  type FederationHandshakeResult,
  type FederationPeerAdvertisement,
  type HomeRef,
} from "../domain/federation.js";

const nonBlank = (value: string): boolean => value.trim().length > 0;

export class FederationHandshakeService {
  readonly #seenAcceptedNonces = new Set<string>();

  constructor(readonly localHomeRef: HomeRef) {
    if (!nonBlank(localHomeRef)) {
      throw new Error("local home ref must be non-empty");
    }
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

    if (advertisement.evidenceReceiptIds.length === 0) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "missing_evidence",
      });
    }

    const replayKey = `${advertisement.homeRef}:${advertisement.nonce}`;
    if (this.#seenAcceptedNonces.has(replayKey)) {
      return Object.freeze({
        accepted: false,
        localHomeRef: this.localHomeRef,
        remoteHomeRef: advertisement.homeRef,
        correlationId,
        reason: "replayed_nonce",
      });
    }

    this.#seenAcceptedNonces.add(replayKey);

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
