import { describe, expect, it } from "vitest";
import { SWARM_HOME_FEDERATION_PROTOCOL } from "../src/domain/federation.js";
import { projectFederationReevaluation } from "../src/observability/federation-reevaluation.js";

describe("federation reevaluation requirement", () => {
  it("requires reevaluation when authority evidence drifts", () => {
    const result = projectFederationReevaluation({
      previous: {
        qualified: true,
        candidateRef: "peer:x",
        protocolVersion: SWARM_HOME_FEDERATION_PROTOCOL,
        evidenceRefs: ["receipt:old"],
        observedAt: "2026-09-22T00:00:00.000Z",
      },
      authorityDrift: {
        changed: true,
        standingChanged: true,
        scopeChanged: false,
        federationSafetyChanged: true,
      },
    });
    expect(result).toMatchObject({
      required: true,
      priorQualified: true,
      reasons: ["authority_changed"],
    });
  });
});
