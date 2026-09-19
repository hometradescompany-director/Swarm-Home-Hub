import type { AgentReference } from "../domain/agent.js";
import type { RequestResidence } from "../commands/request-residence.js";
import type { ResidenceId } from "../domain/residence.js";
import { SwarmHomeDoor } from "./swarm-home-door.js";
import type { SwarmHomeToolName } from "./tool-manifest.js";

export interface SwarmHomeToolCall {
  readonly name: SwarmHomeToolName;
  readonly arguments: Readonly<Record<string, unknown>>;
}

export interface SwarmHomeToolResult {
  readonly ok: boolean;
  readonly name: SwarmHomeToolName;
  readonly value?: unknown;
  readonly error?: string;
}

function requiredString(
  args: Readonly<Record<string, unknown>>,
  key: string
): string {
  const value = args[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`tool argument ${key} must be a non-empty string`);
  }
  return value;
}

export class SwarmHomeToolRouter {
  constructor(private readonly door: SwarmHomeDoor) {}

  async invoke(call: SwarmHomeToolCall): Promise<SwarmHomeToolResult> {
    try {
      const args = call.arguments;
      switch (call.name) {
        case "swarm.home.inspect":
          return { ok: true, name: call.name, value: await this.door.inspect() };

        case "swarm.home.recover":
          return {
            ok: true,
            name: call.name,
            value: await this.door.recover(
              requiredString(args, "residenceId") as ResidenceId,
              requiredString(args, "observedAt")
            )
          };

        case "swarm.home.heartbeat":
          return {
            ok: true,
            name: call.name,
            value: await this.door.heartbeat(
              requiredString(args, "residenceId") as ResidenceId,
              requiredString(args, "evaluatedAt")
            )
          };

        case "swarm.home.request":
          return {
            ok: true,
            name: call.name,
            value: await this.door.request(args.command as unknown as RequestResidence, requiredString(args, "observedAt"))
          };

        case "swarm.home.admit":
          return {
            ok: true,
            name: call.name,
            value: await this.door.admit(
              requiredString(args, "residenceId") as ResidenceId,
              requiredString(args, "eventId"),
              requiredString(args, "observedAt"),
              requiredString(args, "actorRef")
            )
          };

        case "swarm.home.rest":
          return {
            ok: true,
            name: call.name,
            value: await this.door.rest(
              requiredString(args, "residenceId") as ResidenceId,
              requiredString(args, "eventId"),
              requiredString(args, "at"),
              requiredString(args, "actorRef")
            )
          };

        case "swarm.home.ready":
          return {
            ok: true,
            name: call.name,
            value: await this.door.ready(
              requiredString(args, "residenceId") as ResidenceId,
              requiredString(args, "eventId"),
              requiredString(args, "at"),
              requiredString(args, "actorRef")
            )
          };

        case "swarm.home.handoff":
          return {
            ok: true,
            name: call.name,
            value: await this.door.handoff(
              requiredString(args, "residenceId") as ResidenceId,
              args.agent as unknown as AgentReference,
              requiredString(args, "generatedAt")
            )
          };

        case "swarm.home.depart":
          return {
            ok: true,
            name: call.name,
            value: await this.door.depart(
              requiredString(args, "residenceId") as ResidenceId,
              requiredString(args, "eventId"),
              requiredString(args, "at"),
              requiredString(args, "actorRef"),
              typeof args.reason === "string" ? args.reason : undefined
            )
          };
      }
    } catch (error) {
      return {
        ok: false,
        name: call.name,
        error: error instanceof Error ? error.message : "Swarm Home tool call failed"
      };
    }
  }
}
