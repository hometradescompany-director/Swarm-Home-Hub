import { swarmHomeToolManifest, swarmHomeToolNames, type SwarmHomeToolName } from "./tool-manifest.js";
import { SwarmHomeToolRouter, type SwarmHomeToolCall } from "./tool-router.js";

export interface SwarmHomeWebTransportOptions {
  readonly basePath?: string;
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
      "cache-control": "no-store"
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

  constructor(
    private readonly router: SwarmHomeToolRouter,
    options: SwarmHomeWebTransportOptions = {}
  ) {
    this.#basePath = normalizeBasePath(options.basePath);
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
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

      let body: unknown;
      try {
        body = await request.json();
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
