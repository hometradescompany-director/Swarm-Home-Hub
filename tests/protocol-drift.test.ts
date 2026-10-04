import { describe, expect, it } from "vitest";
import { compareProtocolFingerprints } from "../src/observability/protocol-drift.js";

describe("protocol drift", () => {
  it("records protocol additions and removals without inferring authority", () => {
    expect(compareProtocolFingerprints({
      families: ["mcp"],
      evidenceRefs: ["receipt:old"],
    },{
      families: ["a2a","openrpc"],
      evidenceRefs: ["receipt:new"],
    })).toMatchObject({
      changed: true,
      added: ["a2a","openrpc"],
      removed: ["mcp"],
    });
  });
});
