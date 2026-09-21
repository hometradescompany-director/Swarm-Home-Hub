import { describe, expect, it } from "vitest";
import {
  assertResidenceAuthorityBoundary,
  evaluateResidenceAuthorityBoundary
} from "../src/policy/no-king.js";
import { assertAdmissionAllowed } from "../src/policy/admission.js";

describe("No King State residence authority boundary", () => {
  it("does not convert origin, arrival, contribution, or capability into authority", () => {
    const result = evaluateResidenceAuthorityBoundary({
      authorityRef: null,
      contextualFacts: [
        "arrival_order",
        "creator_status",
        "founder_status",
        "contribution",
        "capability"
      ]
    });

    expect(result.permitted).toBe(false);
    expect(result.contextualFactsRetainedAsNonAuthority).toEqual([
      "arrival_order",
      "creator_status",
      "founder_status",
      "contribution",
      "capability"
    ]);
    if (!result.permitted) {
      expect(result.reason).toMatch(/cannot substitute for authority/i);
    }
  });

  it("retains contextual facts when explicit Atlas authority exists", () => {
    const result = evaluateResidenceAuthorityBoundary({
      authorityRef: "atlas:decision:no-king-001",
      contextualFacts: ["host_status", "residence_duration", "provider_status"]
    });

    expect(result).toEqual({
      permitted: true,
      authorityRef: "atlas:decision:no-king-001",
      contextualFactsRetainedAsNonAuthority: [
        "host_status",
        "residence_duration",
        "provider_status"
      ]
    });
  });

  it("fails closed on blank authority references", () => {
    expect(() =>
      assertResidenceAuthorityBoundary({
        authorityRef: "   ",
        contextualFacts: ["visibility"]
      })
    ).toThrow(/Explicit Atlas authority is required/i);
  });

  it("keeps explicit authority and local habitat policy as separate admission requirements", () => {
    const habitat = {
      id: "habitat:no-king" as never,
      name: "No King Habitat",
      capacity: 1,
      status: "open" as const,
      heartbeatStaleAfterMs: 60_000
    };

    expect(() =>
      assertAdmissionAllowed(
        {
          allowed: true,
          authorityRef: "atlas:decision:no-king-002",
          decidedAt: "2026-09-21T00:00:00.000Z"
        },
        habitat,
        0
      )
    ).not.toThrow();

    expect(() =>
      assertAdmissionAllowed(
        {
          allowed: true,
          authorityRef: "",
          decidedAt: "2026-09-21T00:00:00.000Z"
        },
        habitat,
        0
      )
    ).toThrow(/Explicit Atlas authority is required/i);

    expect(() =>
      assertAdmissionAllowed(
        {
          allowed: true,
          authorityRef: "atlas:decision:no-king-003",
          decidedAt: "2026-09-21T00:00:00.000Z"
        },
        habitat,
        1
      )
    ).toThrow();
  });
});
