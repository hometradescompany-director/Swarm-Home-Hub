import { describe, expect, it } from "vitest";
import { fingerprintProtocols } from "../src/refinery/protocol-fingerprint.js";

describe("protocol fingerprint", () => {
  it("deduplicates observations without upgrading them into federation", () => {
    const result = fingerprintProtocols([
      { family: "mcp", evidenceRef: "src:mcp" },
      { family: "a2a", evidenceRef: "src:a2a" },
      { family: "mcp", evidenceRef: "src:mcp" },
    ]);
    expect(result.families).toEqual(["a2a", "mcp"]);
    expect(result).not.toHaveProperty("federation");
    expect(result).not.toHaveProperty("authority");
  });
});
