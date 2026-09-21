import {
  swarmHomeToolManifest,
  type SwarmHomeToolDescriptor,
  type SwarmHomeToolName
} from "../../platform/tool-manifest.js";
import type {
  SwarmHomeToolCall,
  SwarmHomeToolResult
} from "../../platform/tool-router.js";

export const SWARM_HOME_MCP_PROTOCOL_VERSION = "2026-07-28" as const;
export const SWARM_HOME_MCP_SERVER_NAME = "@endless-technologies/swarm-home-hub" as const;
export const SWARM_HOME_MCP_SERVER_VERSION = "0.0.1" as const;

export type SwarmHomeMcpExposure = "read_only" | "all";
export type SwarmHomeMcpId = string | number;

export interface SwarmHomeMcpRequest {
  readonly jsonrpc: "2.0";
  readonly id: SwarmHomeMcpId;
  readonly method: string;
  readonly params?: Readonly<Record<string, unknown>>;
}

export interface SwarmHomeMcpError {
  readonly code: number;
  readonly message: string;
  readonly data?: unknown;
}

export interface SwarmHomeMcpResponse {
  readonly jsonrpc: "2.0";
  readonly id: SwarmHomeMcpId;
  readonly result?: Readonly<Record<string, unknown>>;
  readonly error?: SwarmHomeMcpError;
}

export interface SwarmHomeMcpInvoker {
  invoke(call: SwarmHomeToolCall): Promise<SwarmHomeToolResult>;
}

export interface SwarmHomeMcpAdapterOptions {
  readonly exposure?: SwarmHomeMcpExposure;
  readonly toolListTtlMs?: number;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function completeMeta(): Readonly<Record<string, unknown>> {
  return Object.freeze({
    "io.modelcontextprotocol/serverInfo": Object.freeze({
      name: SWARM_HOME_MCP_SERVER_NAME,
      version: SWARM_HOME_MCP_SERVER_VERSION
    })
  });
}

function errorResponse(
  id: SwarmHomeMcpId,
  code: number,
  message: string,
  data?: unknown
): SwarmHomeMcpResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: data === undefined ? { code, message } : { code, message, data }
  };
}

function resultResponse(
  id: SwarmHomeMcpId,
  result: Readonly<Record<string, unknown>>
): SwarmHomeMcpResponse {
  return {
    jsonrpc: "2.0",
    id,
    result: Object.freeze({
      ...result,
      resultType: "complete",
      _meta: completeMeta()
    })
  };
}

function textContent(value: unknown): readonly Readonly<Record<string, unknown>>[] {
  return Object.freeze([
    Object.freeze({
      type: "text",
      text: JSON.stringify(value)
    })
  ]);
}

function mcpTool(descriptor: SwarmHomeToolDescriptor): Readonly<Record<string, unknown>> {
  return Object.freeze({
    name: descriptor.name,
    description: descriptor.description,
    inputSchema: descriptor.inputSchema,
    annotations: Object.freeze({
      readOnlyHint: !descriptor.mutatesState
    })
  });
}

/**
 * Stateless MCP 2026-07-28 adapter over the canonical Swarm Home tool router.
 *
 * It owns protocol projection only. It does not own sessions, residence state,
 * identity, authority, memory, tasks, or a second tool implementation.
 */
export class SwarmHomeMcpAdapter {
  readonly #exposure: SwarmHomeMcpExposure;
  readonly #toolListTtlMs: number;

  constructor(
    private readonly router: SwarmHomeMcpInvoker,
    options: SwarmHomeMcpAdapterOptions = {}
  ) {
    this.#exposure = options.exposure ?? "read_only";
    this.#toolListTtlMs = options.toolListTtlMs ?? 60_000;

    if (!Number.isInteger(this.#toolListTtlMs) || this.#toolListTtlMs < 0) {
      throw new Error("toolListTtlMs must be a non-negative integer");
    }
  }

  descriptor(name: string): SwarmHomeToolDescriptor | null {
    const descriptor = swarmHomeToolManifest.find(tool => tool.name === name);
    if (!descriptor) return null;
    if (this.#exposure === "read_only" && descriptor.mutatesState) return null;
    return descriptor;
  }

  exposedTools(): readonly Readonly<Record<string, unknown>>[] {
    return Object.freeze(
      swarmHomeToolManifest
        .filter(tool => this.#exposure === "all" || !tool.mutatesState)
        .map(mcpTool)
    );
  }

  async handle(request: SwarmHomeMcpRequest): Promise<SwarmHomeMcpResponse> {
    switch (request.method) {
      case "server/discover":
        return resultResponse(request.id, {
          supportedVersions: Object.freeze([SWARM_HOME_MCP_PROTOCOL_VERSION]),
          capabilities: Object.freeze({
            tools: Object.freeze({ listChanged: false })
          }),
          instructions:
            "Swarm Home exposes bounded residence tools through a transport adapter. Connectivity never grants Atlas or residence authority.",
          ttlMs: this.#toolListTtlMs,
          cacheScope: "public"
        });

      case "tools/list":
        return resultResponse(request.id, {
          tools: this.exposedTools(),
          ttlMs: this.#toolListTtlMs,
          cacheScope: "public"
        });

      case "tools/call":
        return this.#callTool(request);

      default:
        return errorResponse(request.id, -32601, "MCP method not found: " + request.method);
    }
  }

  async #callTool(request: SwarmHomeMcpRequest): Promise<SwarmHomeMcpResponse> {
    const params = request.params;
    if (!isRecord(params)) {
      return errorResponse(request.id, -32602, "tools/call params must be an object");
    }

    const name = params.name;
    if (typeof name !== "string") {
      return errorResponse(request.id, -32602, "tools/call params.name must be a string");
    }

    const descriptor = this.descriptor(name);
    if (!descriptor) {
      return errorResponse(request.id, -32602, "tool is not exposed by this MCP adapter: " + name);
    }

    const args = params.arguments ?? {};
    if (!isRecord(args)) {
      return errorResponse(request.id, -32602, "tools/call params.arguments must be an object");
    }

    const result = await this.router.invoke({
      name: descriptor.name as SwarmHomeToolName,
      arguments: args
    });

    const structuredContent = Object.freeze({ ...result });
    return resultResponse(request.id, {
      content: textContent(structuredContent),
      structuredContent,
      isError: !result.ok
    });
  }
}
