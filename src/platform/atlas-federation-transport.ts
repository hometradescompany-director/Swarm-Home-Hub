import {
  parseAtlasWorkRequestedEvent,
  type SwarmWorkHandoffHandler
} from "../integrations/atlas/work-handoff.js";

const ATLAS_INGRESS_TOKEN_ENV = "SWARM_ATLAS_INGRESS_TOKEN" as const;

export interface AtlasFederationTransportOptions {
  readonly token?: string;
  readonly maxBodyBytes?: number;
  readonly handler?: SwarmWorkHandoffHandler;
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

function configuredToken(explicit: string | undefined): string | null {
  const value = explicit ?? process.env[ATLAS_INGRESS_TOKEN_ENV];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  return token ? token : null;
}

/**
 * Authenticated Atlas federation ingress.
 *
 * The bearer credential authenticates the federation edge only. The injected
 * handler remains responsible for Swarm-domain admission and work policy.
 */
export class AtlasFederationTransport {
  readonly #token: string | undefined;
  readonly #maxBodyBytes: number;
  readonly #handler: SwarmWorkHandoffHandler | undefined;

  constructor(options: AtlasFederationTransportOptions = {}) {
    this.#token = options.token ?? process.env[ATLAS_INGRESS_TOKEN_ENV];
    this.#maxBodyBytes = options.maxBodyBytes ?? 64 * 1024;
    this.#handler = options.handler;

    if (!Number.isInteger(this.#maxBodyBytes) || this.#maxBodyBytes <= 0) {
      throw new Error("maxBodyBytes must be a positive integer");
    }
  }

  async handle(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return json({ ok: false, error: "route not found" }, 404);
    }

    const expected = configuredToken(this.#token);
    if (!expected) {
      return json({ ok: false, error: "federation_not_configured" }, 503);
    }

    const supplied = bearerToken(request);
    if (!supplied || supplied !== expected) {
      return json({ ok: false, error: "unauthenticated" }, 401);
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
      return json({ ok: false, error: "invalid_request" }, 400);
    }

    const parsed = parseAtlasWorkRequestedEvent(body);
    if (!parsed.ok) {
      return json({ ok: false, error: "invalid_request" }, 400);
    }

    if (!this.#handler) {
      return json({ ok: false, error: "federation_handler_not_configured" }, 503);
    }

    try {
      const outcome = await this.#handler.handle(parsed.event);
      if (outcome.correlationId !== parsed.event.eventId) {
        return json({ ok: false, error: "federation_handler_invalid_correlation" }, 500);
      }

      if (!outcome.accepted) {
        return json({
          ok: true,
          accepted: false,
          correlation_id: outcome.correlationId,
          refusal: { reason: outcome.reason }
        }, 202);
      }

      return json({
        ok: true,
        accepted: true,
        correlation_id: outcome.correlationId,
        ...(outcome.result === undefined ? {} : { result: outcome.result })
      }, 202);
    } catch {
      return json({ ok: false, error: "federation_handler_failed" }, 500);
    }
  }
}
