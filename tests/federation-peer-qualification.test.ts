import { describe, expect, it } from "vitest";
import { SWARM_HOME_FEDERATION_PROTOCOL } from "../src/domain/federation.js";
import {
  qualifyExternalFederationPeer,
  type ExternalFederationPeerObservation,
} from "../src/policy/federation-peer-qualification.js";

const observation = (
  overrides: Partial<ExternalFederationPeerObservation> = {}
): ExternalFederationPeerObservation => ({
  candidateRef: "runtime:example",
  protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
  protocolEvidenceRef: "source:protocol",
  handshakeEvidenceRef: "source:handshake",
  stateModel: "independent",
  stateBoundaryEvidenceRef: "source:state-boundary",
  authorityModel: "bounded_explicit",
  authorityBoundaryEvidenceRef: "source:authority-boundary",
  observedAt: "2026-09-22T00:00:00.000Z",
  ...overrides,
});

describe("external federation peer qualification", () => {
  it("qualifies only an evidence-backed SwarmHomeFederation/v1 peer", () => {
    const result = qualifyExternalFederationPeer(observation());

    expect(result).toEqual({
      qualified: true,
      candidateRef: "runtime:example",
      protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
      evidenceRefs: [
        "source:protocol",
        "source:handshake",
        "source:state-boundary",
        "source:authority-boundary",
      ],
      observedAt: "2026-09-22T00:00:00.000Z",
    });
    expect("authorityRef" in result).toBe(false);
    expect("residenceId" in result).toBe(false);
  });

  it("does not promote transport compatibility into federation status", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({
          protocolVersion: undefined,
          protocolEvidenceRef: undefined,
        })
      )
    ).toMatchObject({
      qualified: false,
      reason: "missing_protocol_evidence",
    });
  });

  it("refuses a different protocol even when other boundaries look compatible", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({
          protocolVersion: "A2A/1.0",
          protocolEvidenceRef: "source:a2a",
        })
      )
    ).toMatchObject({
      qualified: false,
      reason: "unsupported_protocol",
    });
  });

  it("requires evidence of the federation handshake surface", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({ handshakeEvidenceRef: undefined })
      )
    ).toMatchObject({
      qualified: false,
      reason: "missing_handshake_evidence",
    });
  });

  it("keeps unknown remote state ownership as a typed qualification gap", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({
          stateModel: "unknown",
          stateBoundaryEvidenceRef: undefined,
        })
      )
    ).toMatchObject({
      qualified: false,
      reason: "state_boundary_unknown",
    });
  });

  it("refuses federation when the candidate requires shared mutable truth", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({ stateModel: "shared_mutable" })
      )
    ).toMatchObject({
      qualified: false,
      reason: "shared_mutable_truth",
    });
  });

  it("keeps unknown authority semantics as a typed qualification gap", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({
          authorityModel: "unknown",
          authorityBoundaryEvidenceRef: undefined,
        })
      )
    ).toMatchObject({
      qualified: false,
      reason: "authority_boundary_unknown",
    });
  });

  it("refuses federation when connectivity implicitly transfers authority", () => {
    expect(
      qualifyExternalFederationPeer(
        observation({ authorityModel: "implicit_transfer" })
      )
    ).toMatchObject({
      qualified: false,
      reason: "implicit_authority_transfer",
    });
  });
});
