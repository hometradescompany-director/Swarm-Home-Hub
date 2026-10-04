import type { AgentReference } from "../../domain/agent.js";
import type { ResidenceId } from "../../domain/residence.js";
import {
  swarmHomeToolManifest,
  type SwarmHomeToolDescriptor,
  type SwarmHomeToolName
} from "../../platform/tool-manifest.js";
import type {
  SwarmHomeToolCall,
  SwarmHomeToolResult
} from "../../platform/tool-router.js";

/**
 * Narrow structural seam for OpenAI Agents SDK function tools.
 *
 * Swarm Home deliberately does not import @openai/agents here. The caller
 * supplies the SDK's `tool` or `handoff` integration point, keeping OpenAI
 * at the transport edge instead of making it a source of residence truth.
 */
export interface OpenAIAgentsToolFactoryOptions {
  readonly name: string;
  readonly description: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly strict: true;
  readonly execute: (input: unknown) => Promise<unknown>;
}

export type OpenAIAgentsToolFactory<TTool> = (
  options: OpenAIAgentsToolFactoryOptions
) => TTool;

export interface SwarmHomeToolInvoker {
  invoke(call: SwarmHomeToolCall): Promise<SwarmHomeToolResult>;
}

export type OpenAIAgentsExposure = "read_only" | "all";

export interface OpenAIAgentsAdapterOptions {
  /**
   * Read-only is the default. State-mutating residence tools require an
   * explicit opt-in by the host application.
   */
  readonly exposure?: OpenAIAgentsExposure;
}

export interface OpenAIAgentsHandoffInput {
  readonly residenceId: ResidenceId;
  readonly agent: AgentReference;
  readonly generatedAt: string;
}

function ensureObject(input: unknown): Readonly<Record<string, unknown>> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("OpenAI Agents tool input must be a JSON object");
  }
  return input as Readonly<Record<string, unknown>>;
}

export function openAIAgentsToolAlias(name: SwarmHomeToolName): string {
  return name.replaceAll(".", "_");
}

const canonicalByAlias = new Map<string, SwarmHomeToolName>(
  swarmHomeToolManifest.map(descriptor => [
    openAIAgentsToolAlias(descriptor.name),
    descriptor.name
  ])
);

export function canonicalSwarmHomeToolName(
  alias: string
): SwarmHomeToolName | null {
  return canonicalByAlias.get(alias) ?? null;
}

function exposed(
  descriptor: SwarmHomeToolDescriptor,
  exposure: OpenAIAgentsExposure
): boolean {
  return exposure === "all" || !descriptor.mutatesState;
}

/**
 * Convert the canonical Swarm Home tool manifest into OpenAI Agents SDK
 * function tools without duplicating domain logic or state.
 *
 * Usage from an SDK host:
 *
 *   import { tool } from "@openai/agents";
 *   const tools = createOpenAIAgentsTools(router, tool);
 *
 * The SDK-visible underscore names are transport aliases only. Every execution
 * is translated back to the canonical dotted Swarm Home tool name before the
 * existing router is invoked.
 */
export function createOpenAIAgentsTools<TTool>(
  router: SwarmHomeToolInvoker,
  factory: OpenAIAgentsToolFactory<TTool>,
  options: OpenAIAgentsAdapterOptions = {}
): readonly TTool[] {
  const exposure = options.exposure ?? "read_only";

  return swarmHomeToolManifest
    .filter(descriptor => exposed(descriptor, exposure))
    .map(descriptor =>
      factory({
        name: openAIAgentsToolAlias(descriptor.name),
        description:
          `${descriptor.description} Canonical Swarm Home tool: ${descriptor.name}.`,
        parameters: descriptor.inputSchema,
        strict: true,
        execute: async input =>
          router.invoke({
            name: descriptor.name,
            arguments: ensureObject(input)
          })
      })
    );
}

/**
 * Resolve the Swarm-side evidence capsule for an OpenAI Agents SDK handoff.
 *
 * This is intentionally non-mutating. OpenAI's handoff transfers runtime
 * control between agents; Swarm Home's handoff proves the current resident is
 * ready to carry bounded context. Departure remains a separate Swarm state
 * transition and is never implied by an SDK handoff.
 */
export async function prepareOpenAIAgentsHandoff(
  router: SwarmHomeToolInvoker,
  input: OpenAIAgentsHandoffInput
): Promise<unknown> {
  const result = await router.invoke({
    name: "swarm.home.handoff",
    arguments: {
      residenceId: input.residenceId,
      agent: input.agent,
      generatedAt: input.generatedAt
    }
  });

  if (!result.ok) {
    throw new Error(result.error ?? "Swarm Home handoff failed");
  }

  const value = ensureObject(result.value);
  if (value.created !== true || !("handoff" in value)) {
    throw new Error("Swarm Home resident is not currently eligible for handoff");
  }

  return value.handoff;
}
