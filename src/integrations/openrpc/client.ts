export interface SwarmHomeOpenRpcMethod {
  readonly name: string;
}

export interface SwarmHomeOpenRpcDocument {
  readonly openrpc: string;
  readonly info: Readonly<Record<string, unknown>>;
  readonly methods: readonly SwarmHomeOpenRpcMethod[];
  readonly servers?: readonly Readonly<Record<string, unknown>>[];
  readonly components?: Readonly<Record<string, unknown>>;
}

export interface SwarmHomeOpenRpcClientOptions {
  readonly endpointUrl: string;
  readonly allowedMethods?: readonly string[];
  readonly maxResponseBytes?: number;
  readonly fetcher?: typeof fetch;
}

export interface SwarmHomeOpenRpcCallResult {
  readonly ok: boolean;
  readonly method: string;
  readonly result?: unknown;
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
    throw new Error("OpenRPC endpoint must use HTTPS outside loopback development");
  }

  return url.toString();
}

function parseResponseText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("OpenRPC peer returned invalid JSON");
  }
}

/**
 * Read-only interoperability client for external JSON-RPC/OpenRPC peers.
 *
 * It owns no remote state and imports no peer runtime. The allowlist constrains
 * which remote methods this adapter may invoke.
 */
export class SwarmHomeOpenRpcClient {
  readonly #endpointUrl: string;
  readonly #allowedMethods: Set<string> | null;
  readonly #maxResponseBytes: number;
  readonly #fetcher: typeof fetch;
  #nextId = 1;

  constructor(options: SwarmHomeOpenRpcClientOptions) {
    this.#endpointUrl = normalizeEndpoint(options.endpointUrl);
    this.#allowedMethods = options.allowedMethods
      ? new Set(options.allowedMethods)
      : null;
    this.#maxResponseBytes = options.maxResponseBytes ?? 512 * 1024;
    this.#fetcher = options.fetcher ?? fetch;

    if (!Number.isInteger(this.#maxResponseBytes) || this.#maxResponseBytes <= 0) {
      throw new Error("maxResponseBytes must be a positive integer");
    }
  }

  async discover(): Promise<SwarmHomeOpenRpcDocument> {
    const envelope = await this.#rpc("rpc.discover", {});
    if (!envelope.ok) {
      throw new Error("OpenRPC discovery failed");
    }

    if (!isRecord(envelope.result)) {
      throw new Error("OpenRPC discovery result must be an object");
    }

    const openrpc = envelope.result.openrpc;
    const info = envelope.result.info;
    const methods = envelope.result.methods;

    if (
      typeof openrpc !== "string" ||
      !isRecord(info) ||
      !Array.isArray(methods)
    ) {
      throw new Error("OpenRPC discovery result is missing required fields");
    }

    const normalizedMethods = methods.map((method, index) => {
      if (!isRecord(method) || typeof method.name !== "string" || method.name.length === 0) {
        throw new Error("OpenRPC method at index " + index + " is invalid");
      }
      return Object.freeze({ name: method.name });
    });

    return Object.freeze({
      openrpc,
      info: Object.freeze({ ...info }),
      methods: Object.freeze(normalizedMethods),
      ...(Array.isArray(envelope.result.servers)
        ? { servers: Object.freeze([...envelope.result.servers]) as readonly Readonly<Record<string, unknown>>[] }
        : {}),
      ...(isRecord(envelope.result.components)
        ? { components: Object.freeze({ ...envelope.result.components }) }
        : {})
    });
  }

  async call(
    method: string,
    params: Readonly<Record<string, unknown>> = {}
  ): Promise<SwarmHomeOpenRpcCallResult> {
    if (!method.trim()) {
      throw new Error("OpenRPC method must be non-empty");
    }
    if (method === "rpc.discover") {
      throw new Error("Use discover() for rpc.discover");
    }
    if (this.#allowedMethods && !this.#allowedMethods.has(method)) {
      throw new Error("OpenRPC method is not in the configured allowlist: " + method);
    }

    return this.#rpc(method, params);
  }

  async #rpc(
    method: string,
    params: Readonly<Record<string, unknown>>
  ): Promise<SwarmHomeOpenRpcCallResult> {
    const id = this.#nextId++;
    const response = await this.#fetcher(this.#endpointUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params
      })
    });

    const declared = response.headers.get("content-length");
    if (
      declared !== null &&
      Number.isFinite(Number(declared)) &&
      Number(declared) > this.#maxResponseBytes
    ) {
      throw new Error("OpenRPC peer response is too large");
    }

    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > this.#maxResponseBytes) {
      throw new Error("OpenRPC peer response is too large");
    }

    const body = parseResponseText(text);
    if (!isRecord(body) || body.jsonrpc !== "2.0" || body.id !== id) {
      throw new Error("OpenRPC peer returned an invalid JSON-RPC response envelope");
    }

    if (isRecord(body.error)) {
      return Object.freeze({
        ok: false,
        method,
        error: Object.freeze({ ...body.error })
      });
    }

    if (!("result" in body)) {
      throw new Error("OpenRPC peer response must contain result or error");
    }

    return Object.freeze({
      ok: true,
      method,
      result: body.result
    });
  }
}
