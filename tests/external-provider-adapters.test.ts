import { describe, expect, it } from "vitest";
import { SwarmHomeMcpClient } from "../src/integrations/mcp/client.js";
import { SwarmHomeOpenRpcClient } from "../src/integrations/openrpc/client.js";
import {
  McpExternalExecutionProvider,
  OpenRpcExternalExecutionProvider
} from "../src/integrations/execution-provider/adapters.js";
import {
  createExternalExecutionRequest
} from "../src/integrations/execution-provider/contract.js";
import type { SwarmHomeExternalHandoff } from "../src/integrations/handoff/conformance.js";

const handoff: SwarmHomeExternalHandoff = {
  schema: "SwarmHomeExternalHandoff/v1",
  sourceResidenceRef: "residence:adapter",
  sourceEventRef: "event:ready",
  agentIdentityRef: "atlas:agent:adapter",
  capabilityRefs: ["capability:execute"],
  offeringRefs: ["offering:execute"],
  relationalContextRefs: [],
  generatedAt: "2026-09-22T02:00:00.000Z",
  freshUntil: "2026-09-22T02:05:00.000Z",
  authorityImplication: "none"
};

const request = createExternalExecutionRequest({
  requestId: "exec:adapter:1",
  providerRef: "provider:remote",
  capabilityRef: "capability:execute",
  instructionRef: "atlas:instruction:adapter",
  handoff,
  requestedAt: "2026-09-22T02:01:00.000Z",
  expiresAt: "2026-09-22T02:04:00.000Z"
});

const codec = {
  encodeRequest(input: typeof request) {
    return {
      instructionRef: input.instructionRef,
      requestId: input.requestId,
      handoff: input.handoff
    };
  },
  decodeOutcome(value: unknown) {
    const body = value as {
      executionRef: string;
      resultRef: string;
      evidenceRef: string;
    };
    return {
      providerExecutionRef: body.executionRef,
      status: "completed" as const,
      resultRefs: [body.resultRef],
      evidenceReceiptIds: [body.evidenceRef],
      observedAt: "2026-09-22T02:02:00.000Z"
    };
  }
};

describe("external execution provider adapters", () => {
  it("uses MCP tools as bounded execution providers", async () => {
    const client = new SwarmHomeMcpClient({
      endpointUrl: "https://provider.example/mcp",
      allowedTools: ["execute"],
      fetcher: async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        expect(body.params.arguments).toMatchObject({
          instructionRef: "atlas:instruction:adapter",
          requestId: "exec:adapter:1"
        });
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [{ type: "text", text: "done" }],
            structuredContent: {
              executionRef: "remote:mcp:1",
              resultRef: "artifact:mcp:1",
              evidenceRef: "receipt:mcp:1"
            },
            isError: false
          }
        }));
      }
    });

    const provider = new McpExternalExecutionProvider({
      providerRef: "provider:remote",
      toolName: "execute",
      client,
      codec
    });

    await expect(provider.execute(request)).resolves.toEqual({
      providerExecutionRef: "remote:mcp:1",
      status: "completed",
      resultRefs: ["artifact:mcp:1"],
      evidenceReceiptIds: ["receipt:mcp:1"],
      observedAt: "2026-09-22T02:02:00.000Z"
    });
  });

  it("uses OpenRPC methods as bounded execution providers", async () => {
    const client = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://provider.example/rpc",
      allowedMethods: ["execute.run"],
      fetcher: async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            executionRef: "remote:rpc:1",
            resultRef: "artifact:rpc:1",
            evidenceRef: "receipt:rpc:1"
          }
        }));
      }
    });

    const provider = new OpenRpcExternalExecutionProvider({
      providerRef: "provider:remote",
      method: "execute.run",
      client,
      codec
    });

    await expect(provider.execute(request)).resolves.toEqual({
      providerExecutionRef: "remote:rpc:1",
      status: "completed",
      resultRefs: ["artifact:rpc:1"],
      evidenceReceiptIds: ["receipt:rpc:1"],
      observedAt: "2026-09-22T02:02:00.000Z"
    });
  });

  it("converts remote refusals into bounded provider refusals", async () => {
    const client = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://provider.example/rpc",
      fetcher: async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          error: {
            code: -32010,
            message: "not allowed"
          }
        }));
      }
    });

    const provider = new OpenRpcExternalExecutionProvider({
      providerRef: "provider:remote",
      method: "execute.run",
      client,
      codec
    });

    await expect(provider.execute(request)).resolves.toMatchObject({
      providerExecutionRef: "openrpc:refused:exec:adapter:1",
      status: "refused"
    });
  });

  it("treats non-success HTTP status as transport failure before protocol decoding", async () => {
    const mcp = new SwarmHomeMcpClient({
      endpointUrl: "https://provider.example/mcp",
      fetcher: async () =>
        new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          result: { isError: false }
        }), { status: 503 })
    });

    await expect(mcp.callTool("execute", {})).rejects.toThrow(/HTTP status 503/);

    const rpc = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://provider.example/rpc",
      fetcher: async () =>
        new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          result: {}
        }), { status: 502 })
    });

    await expect(rpc.call("execute.run", {})).rejects.toThrow(/HTTP status 502/);
  });

  it("fails closed on methods/tools outside configured allowlists", async () => {
    const mcp = new SwarmHomeMcpClient({
      endpointUrl: "https://provider.example/mcp",
      allowedTools: ["safe.execute"],
      fetcher: async () => {
        throw new Error("must not call network");
      }
    });

    await expect(mcp.callTool("unsafe.execute", {})).rejects.toThrow(/allowlist/);

    const rpc = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://provider.example/rpc",
      allowedMethods: ["safe.execute"],
      fetcher: async () => {
        throw new Error("must not call network");
      }
    });

    await expect(rpc.call("unsafe.execute", {})).rejects.toThrow(/allowlist/);
  });
});
