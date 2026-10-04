import type { SwarmHomeA2AAgentCard } from "./agent-card.js";

export interface SwarmHomeA2ADiscoveryOptions {
  readonly path?: string;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'"
    }
  });
}

function normalizePath(value: string | undefined): string {
  if (!value) return "/.well-known/agent-card.json";
  if (!value.startsWith("/")) return "/" + value;
  return value;
}

/**
 * Public A2A discovery route for a pre-built Agent Card.
 *
 * This transport serves metadata only. It does not implement message/send,
 * task operations, streaming, push notifications, or any hidden mutation path.
 */
export class SwarmHomeA2ADiscoveryTransport {
  readonly #path: string;

  constructor(
    private readonly card: SwarmHomeA2AAgentCard,
    options: SwarmHomeA2ADiscoveryOptions = {}
  ) {
    this.#path = normalizePath(options.path);
  }

  handle(request: Request): Response {
    const url = new URL(request.url);

    if (request.method !== "GET" || url.pathname !== this.#path) {
      return json({ ok: false, error: "route not found" }, 404);
    }

    return json(this.card);
  }
}
