import {
  SWARM_HOME_MCP_PROTOCOL_VERSION,
  SwarmHomeMcpAdapter,
  type SwarmHomeMcpRequest,
  type SwarmHomeMcpResponse
} from "./modern.js";
import type { SwarmHomeToolDescriptor } from "../../platform/tool-manifest.js";

export interface SwarmHomeMcpAdmission {
  readonly allowed: boolean;
  readonly status?: 401 | 403 | 429;
  readonly error?: string;
}

export type SwarmHomeMcpAdmissionGuard = (
  request: Request,
  tool: SwarmHomeToolDescriptor
) => SwarmHomeMcpAdmission | Promise<SwarmHomeMcpAdmission>;

export interface SwarmHomeMcpWebTransportOptions {
  readonly path?: string;
  readonly maxBodyBytes?: number;
  readonly admitToolCall?: SwarmHomeMcpAdmissionGuard;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'"
    }
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string | number {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

function requestError(
  id: string | number,
  code: number,
  message: string
): SwarmHomeMcpResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message }
  };
}

function normalizePath(value: string | undefined): string {
  if (!value) return "/mcp";
  if (!value.startsWith("/")) return "/" + value;
  return value;
}

function requestMeta(
  params: Readonly<Record<string, unknown>> | undefined
): Readonly<Record<string, unknown>> | null {
  if (!params) return null;
  const meta = params._meta;
  return isRecord(meta) ? meta : null;
}

/**
 * Bounded Streamable HTTP profile for MCP 2026-07-28.
 *
 * This supports only the stateless request/response subset Swarm Home currently
 * owns: server/discover, tools/list, and tools/call. It does not invent
 * prompts, resources, tasks, subscriptions, sessions, or legacy initialize.
 */
export class SwarmHomeMcpWebTransport {
  readonly #path: string;
  readonly #maxBodyBytes: number;
  readonly #admitToolCall: SwarmHomeMcpAdmissionGuard | undefined;

  constructor(
    private readonly adapter: SwarmHomeMcpAdapter,
    options: SwarmHomeMcpWebTransportOptions = {}
  ) {
    this.#path = normalizePath(options.path);
    this.#maxBodyBytes = options.maxBodyBytes ?? 64 * 1024;
    this.#admitToolCall = options.admitToolCall;

    if (!Number.isInteger(this.#maxBodyBytes) || this.#maxBodyBytes <= 0) {
      throw new Error("maxBodyBytes must be a positive integer");
    }
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== this.#path) {
      return json({ ok: false, error: "route not found" }, 404);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "content-type must be application/json" }, 415);
    }

    const declaredLength = request.headers.get("content-length");
    if (
      declaredLength !== null &&
      Number.isFinite(Number(declaredLength)) &&
      Number(declaredLength) > this.#maxBodyBytes
    ) {
      return json({ ok: false, error: "request body is too large" }, 413);
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > this.#maxBodyBytes) {
      return json({ ok: false, error: "request body is too large" }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ ok: false, error: "request body must be valid JSON" }, 400);
    }

    if (!isRecord(body) || body.jsonrpc !== "2.0" || !isId(body.id) || typeof body.method !== "string") {
      return json({ ok: false, error: "request must be one JSON-RPC 2.0 request with an id and method" }, 400);
    }

    const params = body.params === undefined
      ? undefined
      : isRecord(body.params)
        ? body.params
        : null;

    if (params === null) {
      return json(requestError(body.id, -32602, "request params must be an object"), 400);
    }

    const protocolHeader = request.headers.get("mcp-protocol-version");
    const methodHeader = request.headers.get("mcp-method");
    const nameHeader = request.headers.get("mcp-name");

    if (protocolHeader !== SWARM_HOME_MCP_PROTOCOL_VERSION) {
      return json(requestError(body.id, -32020, "MCP-Protocol-Version header mismatch"), 400);
    }
    if (methodHeader !== body.method) {
      return json(requestError(body.id, -32020, "Mcp-Method header mismatch"), 400);
    }

    const meta = requestMeta(params);
    if (meta?.["io.modelcontextprotocol/protocolVersion"] !== SWARM_HOME_MCP_PROTOCOL_VERSION) {
      return json(requestError(body.id, -32602, "request _meta protocol version is required and must match"), 400);
    }

    if (body.method === "tools/call") {
      const name = params?.name;
      if (typeof name !== "string" || nameHeader !== name) {
        return json(requestError(body.id, -32020, "Mcp-Name header must match tools/call params.name"), 400);
      }

      const descriptor = this.adapter.descriptor(name);
      if (descriptor?.mutatesState) {
        if (!this.#admitToolCall) {
          return json(requestError(body.id, -32602, "state-mutating MCP tools require a host admission guard"), 403);
        }
        const admission = await this.#admitToolCall(request, descriptor);
        if (!admission.allowed) {
          return json(
            requestError(body.id, -32602, admission.error ?? "MCP tool call refused by host admission policy"),
            admission.status ?? 403
          );
        }
      }
    } else if (nameHeader !== null) {
      return json(requestError(body.id, -32020, "Mcp-Name is only valid when the MCP method carries a name"), 400);
    }

    const mcpRequest: SwarmHomeMcpRequest = {
      jsonrpc: "2.0",
      id: body.id,
      method: body.method,
      ...(params ? { params } : {})
    };

    const response = await this.adapter.handle(mcpRequest);
    return json(response, 200);
  }
}
