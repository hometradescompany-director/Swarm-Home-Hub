import { describe, expect, it } from "vitest";
import type { Habitat } from "../src/domain/habitat.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import {
  SWARM_HOME_MCP_PROTOCOL_VERSION,
  SwarmHomeMcpAdapter
} from "../src/integrations/mcp/modern.js";
import { SwarmHomeMcpWebTransport } from "../src/integrations/mcp/web-transport.js";
import { SwarmHomeDoor } from "../src/platform/swarm-home-door.js";
import { SwarmHomeToolRouter } from "../src/platform/tool-router.js";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.js";

const habitat: Habitat = {
  id: "habitat:mcp" as never,
  name: "MCP Habitat",
  capacity: 2,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

const atlas: AtlasGateway = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: true,
      authorityRef: "atlas:authority:mcp",
      decidedAt: "2026-09-22T00:00:01.000Z"
    };
  },
  async evidence() {
    return [];
  }
};

async function adapter(exposure: "read_only" | "all" = "read_only") {
  const journal = new InMemoryEventJournal();
  const habitats = new InMemoryHabitatRegistry();
  await habitats.put(habitat);
  return new SwarmHomeMcpAdapter(
    new SwarmHomeToolRouter(new SwarmHomeDoor({ journal, habitats, atlas })),
    { exposure }
  );
}

function headers(method: string, name?: string): HeadersInit {
  return {
    "content-type": "application/json",
    "mcp-protocol-version": SWARM_HOME_MCP_PROTOCOL_VERSION,
    "mcp-method": method,
    ...(name ? { "mcp-name": name } : {})
  };
}

function rpc(
  id: string | number,
  method: string,
  params: Record<string, unknown> = {}
): string {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params: {
      ...params,
      _meta: {
        "io.modelcontextprotocol/protocolVersion": SWARM_HOME_MCP_PROTOCOL_VERSION
      }
    }
  });
}

describe("Swarm Home MCP 2026-07-28 profile", () => {
  it("discovers a stateless tools capability without inventing sessions", async () => {
    const mcp = await adapter();
    const response = await mcp.handle({
      jsonrpc: "2.0",
      id: 1,
      method: "server/discover",
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": SWARM_HOME_MCP_PROTOCOL_VERSION
        }
      }
    });

    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      supportedVersions: [SWARM_HOME_MCP_PROTOCOL_VERSION],
      capabilities: { tools: { listChanged: false } },
      resultType: "complete"
    });
    expect(response.result).not.toHaveProperty("sessionId");
  });

  it("lists only read-only tools by default", async () => {
    const mcp = await adapter();
    const response = await mcp.handle({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": SWARM_HOME_MCP_PROTOCOL_VERSION
        }
      }
    });

    const tools = (response.result?.tools ?? []) as Array<{
      name: string;
      annotations?: { readOnlyHint?: boolean };
    }>;

    expect(tools.map(tool => tool.name)).toEqual([
      "swarm.home.inspect",
      "swarm.home.recover",
      "swarm.home.heartbeat",
      "swarm.home.handoff"
    ]);
    expect(tools.every(tool => tool.annotations?.readOnlyHint === true)).toBe(true);
  });

  it("routes tools/call through the existing canonical router", async () => {
    const mcp = await adapter();
    const response = await mcp.handle({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "swarm.home.inspect",
        arguments: {}
      }
    });

    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      isError: false,
      structuredContent: {
        ok: true,
        name: "swarm.home.inspect",
        value: {
          habitats: [{ habitatId: "habitat:mcp", occupied: 0 }],
          residences: []
        }
      }
    });
  });

  it("refuses mutating tools unless the adapter exposure explicitly includes them", async () => {
    const mcp = await adapter();
    const response = await mcp.handle({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "swarm.home.request",
        arguments: {}
      }
    });

    expect(response.error).toMatchObject({
      code: -32602
    });
  });

  it("uses structuredContent and isError for executed tool failures", async () => {
    const mcp = await adapter("all");
    const response = await mcp.handle({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "swarm.home.recover",
        arguments: {}
      }
    });

    expect(response.result).toMatchObject({
      isError: true,
      structuredContent: {
        ok: false,
        name: "swarm.home.recover"
      }
    });
  });

  it("enforces the 2026-07-28 HTTP protocol headers and request metadata", async () => {
    const mcp = await adapter();
    const web = new SwarmHomeMcpWebTransport(mcp);

    const response = await web.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: headers("tools/list"),
      body: rpc("list-1", "tools/list")
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: "list-1",
      result: {
        resultType: "complete"
      }
    });

    const wrongVersion = await web.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: {
        ...headers("tools/list"),
        "mcp-protocol-version": "2025-06-18"
      },
      body: rpc("list-2", "tools/list")
    }));

    expect(wrongVersion.status).toBe(400);
  });

  it("requires Mcp-Name to match tools/call and keeps mutation behind host admission", async () => {
    const mcp = await adapter("all");
    const noGuard = new SwarmHomeMcpWebTransport(mcp);

    const mutationBody = rpc("mut-1", "tools/call", {
      name: "swarm.home.request",
      arguments: {}
    });

    const refused = await noGuard.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: headers("tools/call", "swarm.home.request"),
      body: mutationBody
    }));

    expect(refused.status).toBe(403);

    const admitted = new SwarmHomeMcpWebTransport(mcp, {
      admitToolCall: () => ({ allowed: true })
    });

    const executed = await admitted.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: headers("tools/call", "swarm.home.request"),
      body: mutationBody
    }));

    expect(executed.status).toBe(200);
    await expect(executed.json()).resolves.toMatchObject({
      result: {
        isError: true
      }
    });
  });

  it("rejects batch requests, malformed JSON and oversized bodies", async () => {
    const mcp = await adapter();
    const web = new SwarmHomeMcpWebTransport(mcp, { maxBodyBytes: 128 });

    const batch = await web.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: headers("tools/list"),
      body: JSON.stringify([])
    }));
    expect(batch.status).toBe(400);

    const malformed = await web.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: headers("tools/list"),
      body: "{"
    }));
    expect(malformed.status).toBe(400);

    const oversized = await web.handle(new Request("https://example.test/mcp", {
      method: "POST",
      headers: {
        ...headers("tools/list"),
        "content-length": "999"
      },
      body: rpc("big", "tools/list")
    }));
    expect(oversized.status).toBe(413);
  });
});
