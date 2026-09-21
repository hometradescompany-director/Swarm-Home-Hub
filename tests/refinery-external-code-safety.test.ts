import { describe, expect, it } from "vitest";
import { gateExternalCodeExecution } from "../src/refinery/external-code-safety.js";

const safe = {
  sourcePinned: true,
  provenanceEvidenceRef: "src:pin",
  requestsSecrets: false,
  requestsHostFilesystem: false,
  networkScopeRef: "network:none",
  requestsAuthorityCredentials: false,
} as const;

describe("external code safety gate", () => {
  it("allows an explicitly bounded proposal", () => {
    expect(gateExternalCodeExecution(safe)).toEqual({ allowed: true });
  });
  it("refuses secrets", () => {
    expect(gateExternalCodeExecution({ ...safe, requestsSecrets: true }))
      .toEqual({ allowed: false, reason: "secrets_requested" });
  });
  it("refuses authority credentials", () => {
    expect(gateExternalCodeExecution({ ...safe, requestsAuthorityCredentials: true }))
      .toEqual({ allowed: false, reason: "authority_credentials_requested" });
  });
});
