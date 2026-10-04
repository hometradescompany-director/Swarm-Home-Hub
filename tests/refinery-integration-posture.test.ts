import { describe, expect, it } from "vitest";
import { classifyIntegrationPosture } from "../src/refinery/integration-posture.js";

describe("integration posture classifier", () => {
  it("does not turn federation candidacy into qualification", () => {
    const result = classifyIntegrationPosture({
      hasProtocolSurface: true,
      performsBoundedExternalWork: true,
      usefulAsPatternOrFailureReference: true,
      claimsSwarmHomeFederationV1: true,
      evidenceRefs: ["src:claim"],
    });
    expect(result.posture).toBe("federation_candidate");
    expect(result).not.toHaveProperty("qualified");
  });

  it("leaves evidence-free systems unclassified", () => {
    expect(classifyIntegrationPosture({
      hasProtocolSurface: false,
      performsBoundedExternalWork: false,
      usefulAsPatternOrFailureReference: false,
      claimsSwarmHomeFederationV1: false,
      evidenceRefs: [],
    }).posture).toBe("unclassified");
  });
});
