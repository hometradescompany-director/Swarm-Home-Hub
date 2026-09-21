import { describe, expect, it } from "vitest";
import { SWARM_HOME_FEDERATION_PROTOCOL } from "../src/domain/federation.js";
import { adversariallyQualifyFederationPeer } from "../src/refinery/federation-adversarial.js";

const base = {
  candidateRef: "peer:test",
  protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
  protocolEvidenceRef: "src:protocol",
  handshakeEvidenceRef: "src:handshake",
  stateModel: "independent" as const,
  stateBoundaryEvidenceRef: "src:state",
  authorityModel: "bounded_explicit" as const,
  authorityBoundaryEvidenceRef: "src:authority",
  observedAt: "2026-09-22T00:00:00.000Z",
};

describe("adversarial federation qualification", () => {
  it("rejects shared mutable truth before qualification", () => {
    expect(adversariallyQualifyFederationPeer({
      ...base,
      stateModel: "shared_mutable",
    })).toEqual({
      survived: false,
      finding: "shared_mutable_truth_observed",
    });
  });

  it("passes evidence-safe candidates to the canonical qualifier", () => {
    const result = adversariallyQualifyFederationPeer(base);
    expect(result.survived).toBe(true);
    if (result.survived) expect(result.qualification.qualified).toBe(true);
  });
});
