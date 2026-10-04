import { describe, expect, it } from "vitest";
import { extractPatternCandidate } from "../src/refinery/pattern-extraction.js";

describe("pattern extraction", () => {
  it("keeps local architectural reason separate from upstream evidence", () => {
    const result = extractPatternCandidate({
      patternRef: "pattern:retry-receipt",
      sourceEvidenceRefs: ["upstream:retry"],
      localReason: "falsify duplicate delivery handling",
      localTargetRef: "tests:delivery",
    });
    expect(result.copiedSource).toBe(false);
    expect(result.localReason).toContain("duplicate");
  });
});
