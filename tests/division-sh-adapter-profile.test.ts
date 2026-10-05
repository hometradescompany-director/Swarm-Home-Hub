import { describe, expect, it } from "vitest";
import {
  DIVISION_SWARM_OBSERVED_METHODS,
  divisionSwarmAdapterProfile
} from "../src/integrations/external-swarms/division-sh.js";
import { fingerprintProtocols } from "../src/refinery/protocol-fingerprint.js";

describe("Division SH swarm adapter profile", () => {
  it("pins observed MCP/OpenRPC/JSON-RPC evidence without promoting federation", () => {
    const profile = divisionSwarmAdapterProfile();
    const fingerprint = fingerprintProtocols(profile.protocols);

    expect(fingerprint.families).toEqual(["jsonrpc", "mcp", "openrpc"]);
    expect(profile).toMatchObject({
      upstreamRef: "repo:division-sh/swarm",
      endpoints: { openrpc: "/v1/rpc", mcp: "/mcp" },
      adapterPosture: "bounded_external_provider",
      authorityImplication: "none"
    });
    expect(profile).not.toHaveProperty("federation");
  });

  it("keeps useful Division methods explicit and reviewable", () => {
    expect(DIVISION_SWARM_OBSERVED_METHODS).toContain("event.publish");
    expect(DIVISION_SWARM_OBSERVED_METHODS).toContain("event.subscribe");
    expect(DIVISION_SWARM_OBSERVED_METHODS).toContain("run.fork");
    expect(DIVISION_SWARM_OBSERVED_METHODS).toContain("run.subscribe_trace");
  });
});
