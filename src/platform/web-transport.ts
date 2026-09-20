import {
  swarmHomeToolDescriptor,
  swarmHomeToolManifest,
  swarmHomeToolNames,
  type SwarmHomeToolDescriptor,
  type SwarmHomeToolName
} from "./tool-manifest.js";
import { SwarmHomeToolRouter, type SwarmHomeToolCall } from "./tool-router.js";

export interface SwarmHomeWebAdmission {
  readonly allowed: boolean;
  readonly status?: 401 | 403 | 429;
  readonly error?: string;
}

export type SwarmHomeWebAdmissionGuard = (
  request: Request,
  tool: SwarmHomeToolDescriptor
) => SwarmHomeWebAdmission | Promise<SwarmHomeWebAdmission>;

export interface SwarmHomeWebTransportOptions {
  readonly basePath?: string;
  /**
   * Host-owned authentication/rate-limit/admission seam.
   *
   * Swarm Home does not become the authority owner here. In the absence of a
   * guard, read-only tools remain inspectable and every mutating tool fails
   * closed before it can reach the router.
   */
  readonly admitToolCall?: SwarmHomeWebAdmissionGuard;
  readonly maxBodyBytes?: number;
}

export interface SwarmHomeWebHealth {
  readonly ok: true;
  readonly service: "@endless-technologies/swarm-home-hub";
  readonly transport: "web";
  readonly toolCount: number;
}

function normalizeBasePath(value: string | undefined): string {
  if (!value || value === "/") return "";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
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

function isToolName(value: string): value is SwarmHomeToolName {
  return (swarmHomeToolNames as readonly string[]).includes(value);
}

/**
 * Dependency-free HTTP/Web Request adapter over the existing tool router.
 *
 * This adapter owns transport framing only. It never reads the event journal,
 * habitat registry or Atlas authority gateway directly.
 */
export class SwarmHomeWebTransport {
  readonly #basePath: string;
  readonly #admitToolCall?: SwarmHomeWebAdmissionGuard;
  readonly #maxBodyBytes: number;

  constructor(
    private readonly router: SwarmHomeToolRouter,
    options: SwarmHomeWebTransportOptions = {}
  ) {
    this.#basePath = normalizeBasePath(options.basePath);
    this.#admitToolCall = options.admitToolCall;
    this.#maxBodyBytes = options.maxBodyBytes ?? 64 * 1024;

    if (!Number.isInteger(this.#maxBodyBytes) || this.#maxBodyBytes <= 0) {
      throw new Error("maxBodyBytes must be a positive integer");
    }
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.length > 2048) {
      return json({ ok: false, error: "request path is too long" }, 414);
    }

    const path = this.#stripBasePath(url.pathname);
    if (path === null) {
      return json({ ok: false, error: "route not found" }, 404);
    }

    if (request.method === "GET" && path === "/health") {
      const health: SwarmHomeWebHealth = {
        ok: true,
        service: "@endless-technologies/swarm-home-hub",
        transport: "web",
        toolCount: swarmHomeToolManifest.length
      };
      return json(health);
    }

    if (request.method === "GET" && path === "/tools") {
      return json({
        ok: true,
        tools: swarmHomeToolManifest
      });
    }

    if (request.method === "POST" && path.startsWith("/tools/")) {
      const rawName = decodeURIComponent(path.slice("/tools/".length));
      if (!isToolName(rawName)) {
        return json({ ok: false, error: `unknown Swarm Home tool: ${rawName}` }, 404);
      }

      const tool = swarmHomeToolDescriptor(rawName);
      if (!this.#admitToolCall && tool.mutatesState) {
        return json(
          { ok: false, error: "state-mutating tools require a transport admission guard" },
          403
        );
      }

      if (this.#admitToolCall) {
        const admission = await this.#admitToolCall(request, tool);
        if (!admission.allowed) {
          return json(
            { ok: false, error: admission.error ?? "tool call refused by transport admission policy" },
            admission.status ?? 403
          );
        }
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

      if (!isRecord(body)) {
        return json({ ok: false, error: "request body must be a JSON object" }, 400);
      }

      const args = body.arguments ?? body;
      if (!isRecord(args)) {
        return json({ ok: false, error: "tool arguments must be a JSON object" }, 400);
      }

      const call: SwarmHomeToolCall = {
        name: rawName,
        arguments: args
      };
      const result = await this.router.invoke(call);
      return json(result, result.ok ? 200 : 422);
    }

    return json({ ok: false, error: "route not found" }, 404);
  }

  #stripBasePath(pathname: string): string | null {
    if (!this.#basePath) return pathname;
    if (pathname === this.#basePath) return "/";
    if (!pathname.startsWith(`${this.#basePath}/`)) return null;
    return pathname.slice(this.#basePath.length);
  }
}
