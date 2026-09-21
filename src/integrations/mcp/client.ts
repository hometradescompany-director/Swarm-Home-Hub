import {
  SWARM_HOME_MCP_PROTOCOL_VERSION,
  type SwarmHomeMcpId,
  type SwarmHomeMcpResponse
} from "./modern.js";

export interface SwarmHomeMcpClientOptions {
  readonly endpointUrl: string;
  readonly allowedTools?: readonly string[];
  readonly maxResponseBytes?: number;
  readonly fetcher?: typeof fetch;
}

export interface SwarmHomeMcpToolResult {
  readonly ok: boolean;
  readonly toolName: string;
  readonly content?: unknown;
  readonly structuredContent?: Readonly<Record<string, unknown>>;
  readonly error?: Readonly<Record<string, unknown>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeEndpoint(value: string): string {
  const url = new URL(value);
  const loopback =
    url.protocol === "http:" &&
    (url.hostname === "127.0.0.1" ||
      url.hostname === "localhost" ||
      url.hostname === "::1");

  if (url.protocol !== "https:" && !loopback) {
    throw new Error("MCP endpoint must use HTTPS outside loopback development");
  }

  return url.toString();
}

export class SwarmHomeMcpClient {
  readonly #endpointUrl: string;
  readonly #allowedTools: Set<string> | null;
  readonly #maxResponseBytes: number;
  readonly #fetcher: typeof fetch;
  #nextId = 1;

  constructor(options: SwarmHomeMcpClientOptions) {
    this.#endpointUrl = normalizeEndpoint(options.endpointUrl);
    this.#allowedTools = options.allowedTools ? new Set(options.allowedTools) : null;
    this.#maxResponseBytes = options.maxResponseBytes ?? 512 * 1024;
    this.#fetcher = options.fetcher ?? fetch;

    if (!Number.isInteger(this.#maxResponseBytes) || this.#maxResponseBytes <= 0) {
      throw new Error("maxResponseBytes must be a positive integer");
    }
  }

  async callTool(
    toolName: string,
    args: Readonly<Record<string, unknown>>
  ): Promise<SwarmHomeMcpToolResult> {
    if (!toolName.trim()) {
      throw new Error("MCP toolName must be non-empty");
    }
    if (this.#allowedTools && !this.#allowedTools.has(toolName)) {
      throw new Error("MCP tool is not in the configured allowlist: " + toolName);
    }

    const id = this.#nextId++;
    const body = {
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
        _meta: {
          "io.modelcontextprotocol/protocolVersion": SWARM_HOME_MCP_PROTOCOL_VERSION
        }
      }
    };

    const response = await this.#fetcher(this.#endpointUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "mcp-protocol-version": SWARM_HOME_MCP_PROTOCOL_VERSION,
        "mcp-method": "tools/call",
        "mcp-name": toolName
      },
      body: JSON.stringify(body)
    });

    const declared = response.headers.get("content-length");
    if (
      declared !== null &&
      Number.isFinite(Number(declared)) &&
      Number(declared) > this.#maxResponseBytes
    ) {
      throw new Error("MCP peer response is too large");
    }

    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > this.#maxResponseBytes) {
      throw new Error("MCP peer response is too large");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("MCP peer returned invalid JSON");
    }

    if (!isRecord(parsed) || parsed.jsonrpc !== "2.0" || parsed.id !== id) {
      throw new Error("MCP peer returned an invalid JSON-RPC response envelope");
    }

    const rpc = parsed as unknown as SwarmHomeMcpResponse;
    if (rpc.error) {
      return Object.freeze({
        ok: false,
        toolName,
        error: Object.freeze({ ...rpc.error })
      });
    }

    if (!isRecord(rpc.result)) {
      throw new Error("MCP peer response is missing a result object");
    }

    const structuredContent = isRecord(rpc.result.structuredContent)
      ? Object.freeze({ ...rpc.result.structuredContent })
      : undefined;

    return Object.freeze({
      ok: rpc.result.isError !== true,
      toolName,
      ...("content" in rpc.result ? { content: rpc.result.content } : {}),
      ...(structuredContent ? { structuredContent } : {})
    });
  }
}
