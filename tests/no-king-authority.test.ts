import { describe, expect, it } from "vitest";
import {
  NON_AUTHORITY_FACTS,
  SWARM_AUTHORITY_INVARIANTS,
  assertResidenceAuthorityBoundary,
  evaluateResidenceAuthorityBoundary
} from "../src/policy/no-king.js";
import { assertAdmissionAllowed } from "../src/policy/admission.js";

describe("No King State residence authority boundary", () => {
  it("does not convert origin, arrival, contribution, capability, or operator status into authority", () => {
    const result = evaluateResidenceAuthorityBoundary({
      authorityRef: null,
      contextualFacts: [
        "arrival_order",
        "creator_status",
        "founder_status",
        "contribution",
        "capability",
        "paid_status",
        "commercial_tier",
        "price_paid",
        "architect_status",
        "operator_status",
        "administrator_status",
        "control_plane_proximity"
      ]
    });

    expect(result.permitted).toBe(false);
    expect(result.contextualFactsRetainedAsNonAuthority).toEqual([
      "arrival_order",
      "creator_status",
      "founder_status",
      "contribution",
      "capability",
      "paid_status",
      "commercial_tier",
      "price_paid",
      "architect_status",
      "operator_status",
      "administrator_status",
      "control_plane_proximity"
    ]);
    if (!result.permitted) {
      expect(result.reason).toMatch(/cannot substitute for authority/i);
    }
  });

  it("makes capability-without-permission and architect-in-threat-model explicit invariants", () => {
    expect(SWARM_AUTHORITY_INVARIANTS).toContain("Capability does not grant permission.");
    expect(SWARM_AUTHORITY_INVARIANTS).toContain("The architect is part of the threat model.");
    expect(NON_AUTHORITY_FACTS).toContain("architect_status");
    expect(NON_AUTHORITY_FACTS).toContain("operator_status");
    expect(NON_AUTHORITY_FACTS).toContain("administrator_status");
    expect(NON_AUTHORITY_FACTS).toContain("control_plane_proximity");
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

describe("commercial status authority boundary", () => {
  it("does not let payment or premium standing substitute for Atlas authority", () => {
    const result = evaluateResidenceAuthorityBoundary({
      authorityRef: null,
      contextualFacts: ["paid_status", "commercial_tier", "price_paid"]
    });
    expect(result.permitted).toBe(false);
    expect(result.contextualFactsRetainedAsNonAuthority).toEqual([
      "paid_status",
      "commercial_tier",
      "price_paid"
    ]);
  });
});
