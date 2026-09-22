import { describe, expect, it } from "vitest";
import { compareIntegrationPosture } from "../src/observability/posture-drift.js";

describe("integration posture drift", () => {
  it("records a posture change without making a federation decision", () => {
    const result = compareIntegrationPosture(
      { posture: "reference_implementation", evidenceRefs: ["receipt:a"] },
      { posture: "transport_peer", evidenceRefs: ["receipt:b"] },
    );
    expect(result).toEqual({
      changed: true,
      before: "reference_implementation",
      after: "transport_peer",
      evidenceRefs: ["receipt:a","receipt:b"],
    });
    expect(result).not.toHaveProperty("qualified");
  });
});
