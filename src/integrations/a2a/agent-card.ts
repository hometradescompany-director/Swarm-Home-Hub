import {
  swarmHomeToolManifest,
  type SwarmHomeToolDescriptor
} from "../../platform/tool-manifest.js";

export const SWARM_HOME_A2A_PROTOCOL_VERSION = "1.0" as const;
export const SWARM_HOME_A2A_AGENT_VERSION = "0.0.1" as const;

export type SwarmHomeA2AExposure = "read_only" | "all";

export interface SwarmHomeA2AInterface {
  readonly url: string;
  readonly protocolBinding: "JSONRPC";
  readonly protocolVersion: typeof SWARM_HOME_A2A_PROTOCOL_VERSION;
}

export interface SwarmHomeA2ASkill {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly inputModes?: readonly string[];
  readonly outputModes?: readonly string[];
}

export interface SwarmHomeA2AAgentCard {
  readonly name: string;
  readonly description: string;
  readonly supportedInterfaces: readonly SwarmHomeA2AInterface[];
  readonly version: string;
  readonly capabilities: Readonly<Record<string, never>>;
  readonly defaultInputModes: readonly string[];
  readonly defaultOutputModes: readonly string[];
  readonly skills: readonly SwarmHomeA2ASkill[];
}

export interface SwarmHomeA2AAgentCardOptions {
  readonly endpointUrl: string;
  readonly exposure?: SwarmHomeA2AExposure;
  readonly name?: string;
  readonly description?: string;
}

function validateEndpoint(value: string): string {
  const url = new URL(value);

  if (url.protocol === "https:") {
    return url.toString();
  }

  const local =
    url.protocol === "http:" &&
    (url.hostname === "127.0.0.1" ||
      url.hostname === "localhost" ||
      url.hostname === "::1");

  if (!local) {
    throw new Error("A2A endpointUrl must use HTTPS outside loopback development");
  }

  return url.toString();
}

function expose(
  descriptor: SwarmHomeToolDescriptor,
  exposure: SwarmHomeA2AExposure
): boolean {
  return exposure === "all" || !descriptor.mutatesState;
}

function skill(descriptor: SwarmHomeToolDescriptor): SwarmHomeA2ASkill {
  return Object.freeze({
    id: descriptor.name,
    name: descriptor.name,
    description: descriptor.description,
    tags: Object.freeze([
      "swarm-home",
      "residence",
      descriptor.mutatesState ? "state-mutating" : "read-only"
    ]),
    inputModes: Object.freeze(["application/json"]),
    outputModes: Object.freeze(["application/json"])
  });
}

/**
 * Project Swarm Home's existing canonical tool manifest into an A2A Agent Card.
 *
 * This is discovery metadata only. It creates no A2A task store, session,
 * message history, identity, residence authority, or remote mutation right.
 */
export function createSwarmHomeA2AAgentCard(
  options: SwarmHomeA2AAgentCardOptions
): SwarmHomeA2AAgentCard {
  const exposure = options.exposure ?? "read_only";
  const endpointUrl = validateEndpoint(options.endpointUrl);

  return Object.freeze({
    name: options.name ?? "Swarm Home Hub",
    description:
      options.description ??
      "A bounded agent residence surface for inspection, recovery, readiness and governed handoff.",
    supportedInterfaces: Object.freeze([
      Object.freeze({
        url: endpointUrl,
        protocolBinding: "JSONRPC" as const,
        protocolVersion: SWARM_HOME_A2A_PROTOCOL_VERSION
      })
    ]),
    version: SWARM_HOME_A2A_AGENT_VERSION,
    capabilities: Object.freeze({}),
    defaultInputModes: Object.freeze(["application/json"]),
    defaultOutputModes: Object.freeze(["application/json"]),
    skills: Object.freeze(
      swarmHomeToolManifest
        .filter(descriptor => expose(descriptor, exposure))
        .map(skill)
    )
  });
}
