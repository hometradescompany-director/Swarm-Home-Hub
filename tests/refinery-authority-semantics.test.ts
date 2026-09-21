import { describe, expect, it } from "vitest";
import { fingerprintAuthority } from "../src/refinery/authority-semantics.js";

describe("authority semantics", () => {
  it("keeps unknown authority fail-closed", () => {
    expect(fingerprintAuthority({ standing: "unknown" })).toMatchObject({
      standing: "unknown",
      federationSafeByEvidence: false,
    });
  });

  it("marks only explicit bounded/delegated authority as evidence-safe", () => {
    expect(
      fingerprintAuthority({
        standing: "bounded_explicit",
        evidenceRef: "src:authority",
      }).federationSafeByEvidence
    ).toBe(true);
    expect(
      fingerprintAuthority({
        standing: "implicit_transfer",
        evidenceRef: "src:implicit",
      }).federationSafeByEvidence
    ).toBe(false);
  });
});
