import type {
  ExternalExecutionProvider,
  ExternalExecutionProviderOutcome,
  ExternalExecutionRequest
} from "./contract.js";
import { SwarmHomeMcpClient } from "../mcp/client.js";
import { SwarmHomeOpenRpcClient } from "../openrpc/client.js";

export interface ExternalExecutionOutcomeCodec<T = unknown> {
  readonly encodeRequest: (
    request: ExternalExecutionRequest
  ) => Readonly<Record<string, unknown>>;
  readonly decodeOutcome: (
    value: T,
    request: ExternalExecutionRequest
  ) => ExternalExecutionProviderOutcome;
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

export class McpExternalExecutionProvider implements ExternalExecutionProvider {
  readonly providerRef: string;
  readonly #toolName: string;
  readonly #client: SwarmHomeMcpClient;
  readonly #codec: ExternalExecutionOutcomeCodec;

  constructor(input: {
    readonly providerRef: string;
    readonly toolName: string;
    readonly client: SwarmHomeMcpClient;
    readonly codec: ExternalExecutionOutcomeCodec;
  }) {
    this.providerRef = nonBlank(input.providerRef, "providerRef");
    this.#toolName = nonBlank(input.toolName, "toolName");
    this.#client = input.client;
    this.#codec = input.codec;
  }

  async execute(
    request: ExternalExecutionRequest
  ): Promise<ExternalExecutionProviderOutcome> {
    const result = await this.#client.callTool(
      this.#toolName,
      this.#codec.encodeRequest(request)
    );

    if (!result.ok) {
      return Object.freeze({
        providerExecutionRef: "mcp:refused:" + request.requestId,
        status: "refused" as const,
        resultRefs: Object.freeze([]),
        evidenceReceiptIds: Object.freeze([]),
        observedAt: request.requestedAt,
        message: result.error
          ? "MCP provider refused execution"
          : "MCP provider reported tool failure"
      });
    }

    const value = result.structuredContent ?? result.content;
    return this.#codec.decodeOutcome(value, request);
  }
}

export class OpenRpcExternalExecutionProvider implements ExternalExecutionProvider {
  readonly providerRef: string;
  readonly #method: string;
  readonly #client: SwarmHomeOpenRpcClient;
  readonly #codec: ExternalExecutionOutcomeCodec;

  constructor(input: {
    readonly providerRef: string;
    readonly method: string;
    readonly client: SwarmHomeOpenRpcClient;
    readonly codec: ExternalExecutionOutcomeCodec;
  }) {
    this.providerRef = nonBlank(input.providerRef, "providerRef");
    this.#method = nonBlank(input.method, "method");
    this.#client = input.client;
    this.#codec = input.codec;
  }

  async execute(
    request: ExternalExecutionRequest
  ): Promise<ExternalExecutionProviderOutcome> {
    const result = await this.#client.call(
      this.#method,
      this.#codec.encodeRequest(request)
    );

    if (!result.ok) {
      return Object.freeze({
        providerExecutionRef: "openrpc:refused:" + request.requestId,
        status: "refused" as const,
        resultRefs: Object.freeze([]),
        evidenceReceiptIds: Object.freeze([]),
        observedAt: request.requestedAt,
        message: "OpenRPC provider refused execution"
      });
    }

    return this.#codec.decodeOutcome(result.result, request);
  }
}
