import { describe, expect, it } from "vitest";
import { SwarmHomeOpenRpcClient } from "../src/integrations/openrpc/client.js";

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("Swarm Home OpenRPC client profile", () => {
  it("discovers a JSON-RPC peer through rpc.discover", async () => {
    const calls: unknown[] = [];
    const client = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://peer.example/rpc",
      fetcher: async (_url, init) => {
        const request = JSON.parse(String(init?.body));
        calls.push(request);
        return jsonResponse({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            openrpc: "1.4.0",
            info: { title: "Peer", version: "1.0.0" },
            methods: [
              { name: "run.trace" },
              { name: "run.fork" }
            ]
          }
        });
      }
    });

    const document = await client.discover();

    expect(calls).toEqual([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "rpc.discover",
        params: {}
      }
    ]);
    expect(document.openrpc).toBe("1.4.0");
    expect(document.methods.map(method => method.name)).toEqual([
      "run.trace",
      "run.fork"
    ]);
  });

  it("calls only allowlisted remote methods", async () => {
    const client = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://peer.example/rpc",
      allowedMethods: ["run.trace"],
      fetcher: async (_url, init) => {
        const request = JSON.parse(String(init?.body));
        return jsonResponse({
          jsonrpc: "2.0",
          id: request.id,
          result: { traceId: "trace:1" }
        });
      }
    });

    await expect(
      client.call("run.trace", { run_id: "run:1" })
    ).resolves.toMatchObject({
      ok: true,
      method: "run.trace",
      result: { traceId: "trace:1" }
    });

    await expect(client.call("runtime.nuke")).rejects.toThrow(/allowlist/);
  });

  it("preserves remote JSON-RPC errors without converting them into local authority", async () => {
    const client = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://peer.example/rpc",
      fetcher: async (_url, init) => {
        const request = JSON.parse(String(init?.body));
        return jsonResponse({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32001,
            message: "remote refusal"
          }
        });
      }
    });

    await expect(client.call("run.trace")).resolves.toEqual({
      ok: false,
      method: "run.trace",
      error: {
        code: -32001,
        message: "remote refusal"
      }
    });
  });

  it("fails closed on invalid envelopes and oversized responses", async () => {
    const invalid = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://peer.example/rpc",
      fetcher: async () => jsonResponse({ jsonrpc: "1.0", id: 1, result: {} })
    });

    await expect(invalid.discover()).rejects.toThrow(/invalid JSON-RPC/);

    const huge = new SwarmHomeOpenRpcClient({
      endpointUrl: "https://peer.example/rpc",
      maxResponseBytes: 16,
      fetcher: async () =>
        new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          result: { long: "12345678901234567890" }
        }), {
          headers: {
            "content-type": "application/json",
            "content-length": "999"
          }
        })
    });

    await expect(huge.discover()).rejects.toThrow(/too large/);
  });

  it("requires HTTPS outside loopback development", () => {
    expect(() =>
      new SwarmHomeOpenRpcClient({
        endpointUrl: "http://peer.example/rpc"
      })
    ).toThrow(/HTTPS/);

    expect(() =>
      new SwarmHomeOpenRpcClient({
        endpointUrl: "http://127.0.0.1:9090/rpc"
      })
    ).not.toThrow();
  });
});
