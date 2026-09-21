import { describe, expect, it } from "vitest";
import {
  SWARM_HOME_FEDERATION_PROTOCOL,
  type FederationPeerAdvertisement,
  type HomeRef,
} from "../src/domain/federation.js";
import { FederationHandshakeService } from "../src/service/federation-handshake-service.js";

const ad = (
  overrides: Partial<FederationPeerAdvertisement> = {}
): FederationPeerAdvertisement => ({
  homeRef: "home:remote" as HomeRef,
  protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
  capabilityRefs: ["cap:handoff"],
  evidenceReceiptIds: ["receipt:peer"],
  nonce: "nonce:1",
  observedAt: "2026-09-21T00:00:00.000Z",
  ...overrides,
});

describe("federation handshake boundary", () => {
  it("accepts a compatible peer without creating authority", () => {
    const service = new FederationHandshakeService("home:local" as HomeRef);
    const result = service.evaluate(ad(), "corr:1");

    expect(result.accepted).toBe(true);
    if (!result.accepted) throw new Error("expected accepted handshake");

    expect(result.remoteHomeRef).toBe("home:remote");
    expect(result.protocolVersion).toBe(SWARM_HOME_FEDERATION_PROTOCOL);
    expect("authorityRef" in result).toBe(false);
    expect("residenceId" in result).toBe(false);
    expect("capacity" in result).toBe(false);
  });

  it("refuses self-federation", () => {
    const service = new FederationHandshakeService("home:local" as HomeRef);
    const result = service.evaluate(
      ad({ homeRef: "home:local" as HomeRef }),
      "corr:2"
    );

    expect(result).toMatchObject({ accepted: false, reason: "self_peer" });
  });

  it("refuses incompatible protocol versions", () => {
    const service = new FederationHandshakeService("home:local" as HomeRef);
    const result = service.evaluate(
      ad({ protocolVersion: "SwarmHomeFederation/v2" }),
      "corr:3"
    );

    expect(result).toMatchObject({
      accepted: false,
      reason: "unsupported_protocol",
    });
  });

  it("requires attributable evidence", () => {
    const service = new FederationHandshakeService("home:local" as HomeRef);
    const result = service.evaluate(ad({ evidenceReceiptIds: [] }), "corr:4");

    expect(result).toMatchObject({ accepted: false, reason: "missing_evidence" });
  });

  it("refuses replay of an already accepted peer nonce", () => {
    const service = new FederationHandshakeService("home:local" as HomeRef);

    expect(service.evaluate(ad(), "corr:5")).toMatchObject({ accepted: true });
    expect(service.evaluate(ad(), "corr:6")).toMatchObject({
      accepted: false,
      reason: "replayed_nonce",
    });
  });

  it("does not burn a nonce for a protocol refusal", () => {
    const service = new FederationHandshakeService("home:local" as HomeRef);

    expect(
      service.evaluate(
        ad({ protocolVersion: "SwarmHomeFederation/v0" }),
        "corr:7"
      )
    ).toMatchObject({ accepted: false, reason: "unsupported_protocol" });

    expect(service.evaluate(ad(), "corr:8")).toMatchObject({ accepted: true });
  });
});
