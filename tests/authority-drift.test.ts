import { describe, expect, it } from "vitest";
import { compareAuthorityFingerprints } from "../src/observability/authority-drift.js";

describe("authority drift", () => {
  it("surfaces explicit-to-implicit authority drift", () => {
    expect(compareAuthorityFingerprints({
      standing: "bounded_explicit",
      evidenceRef: "receipt:old",
      scopeRef: "scope:tool",
      federationSafeByEvidence: true,
    },{
      standing: "implicit_transfer",
      evidenceRef: "receipt:new",
      scopeRef: "scope:tool",
      federationSafeByEvidence: false,
    })).toMatchObject({
      changed: true,
      standingChanged: true,
      federationSafetyChanged: true,
    });
  });
});
