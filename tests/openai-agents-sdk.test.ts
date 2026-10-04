import { describe, expect, it } from "vitest";
import {
  canonicalSwarmHomeToolName,
  createOpenAIAgentsTools,
  openAIAgentsToolAlias,
  prepareOpenAIAgentsHandoff,
  type OpenAIAgentsToolFactoryOptions
} from "../src/integrations/openai/agents-sdk.js";
import type { SwarmHomeToolCall } from "../src/platform/tool-router.js";

interface CapturedTool {
  readonly options: OpenAIAgentsToolFactoryOptions;
}

describe("OpenAI Agents SDK adapter", () => {
  it("exposes only read-only Swarm tools by default", async () => {
    const calls: SwarmHomeToolCall[] = [];
    const router = {
      async invoke(call: SwarmHomeToolCall) {
        calls.push(call);
        return { ok: true, name: call.name, value: { echoed: call.arguments } };
      }
    };
    const factory = (options: OpenAIAgentsToolFactoryOptions): CapturedTool => ({
      options
    });

    const tools = createOpenAIAgentsTools(router, factory);

    expect(tools.map(tool => tool.options.name)).toEqual([
      "swarm_home_inspect",
      "swarm_home_recover",
      "swarm_home_heartbeat",
      "swarm_home_handoff"
    ]);

    const result = await tools[1]!.options.execute({
      residenceId: "residence:openai",
      observedAt: "2026-09-21T13:00:00.000Z"
    });

    expect(result).toMatchObject({ ok: true, name: "swarm.home.recover" });
    expect(calls).toEqual([
      {
        name: "swarm.home.recover",
        arguments: {
          residenceId: "residence:openai",
          observedAt: "2026-09-21T13:00:00.000Z"
        }
      }
    ]);
  });

  it("requires an explicit opt-in before exposing mutating residence tools", () => {
    const router = {
      async invoke(call: SwarmHomeToolCall) {
        return { ok: true, name: call.name };
      }
    };
    const factory = (options: OpenAIAgentsToolFactoryOptions): CapturedTool => ({
      options
    });

    const tools = createOpenAIAgentsTools(router, factory, { exposure: "all" });

    expect(tools).toHaveLength(9);
    expect(tools.map(tool => tool.options.name)).toContain("swarm_home_admit");
    expect(tools.map(tool => tool.options.name)).toContain("swarm_home_depart");
  });

  it("keeps SDK aliases reversible without changing canonical tool identity", () => {
    expect(openAIAgentsToolAlias("swarm.home.handoff")).toBe(
      "swarm_home_handoff"
    );
    expect(canonicalSwarmHomeToolName("swarm_home_handoff")).toBe(
      "swarm.home.handoff"
    );
    expect(canonicalSwarmHomeToolName("not_a_swarm_tool")).toBeNull();
  });

  it("rejects non-object SDK tool input before it reaches the router", async () => {
    let invoked = false;
    const router = {
      async invoke(call: SwarmHomeToolCall) {
        invoked = true;
        return { ok: true, name: call.name };
      }
    };
    const factory = (options: OpenAIAgentsToolFactoryOptions): CapturedTool => ({
      options
    });
    const [inspect] = createOpenAIAgentsTools(router, factory);

    await expect(inspect!.options.execute("not-json-object")).rejects.toThrow(
      "OpenAI Agents tool input must be a JSON object"
    );
    expect(invoked).toBe(false);
  });

  it("prepares a bounded Swarm handoff without implying departure", async () => {
    const calls: SwarmHomeToolCall[] = [];
    const router = {
      async invoke(call: SwarmHomeToolCall) {
        calls.push(call);
        return {
          ok: true,
          name: call.name,
          value: {
            created: true,
            handoff: {
              residenceId: "residence:openai",
              agentIdentityRef: "agent:openai",
              status: "ready"
            }
          }
        };
      }
    };

    const handoff = await prepareOpenAIAgentsHandoff(router, {
      residenceId: "residence:openai" as never,
      agent: {
        identityRef: "agent:openai" as never,
        capabilityRefs: [],
        offeringRefs: []
      },
      generatedAt: "2026-09-21T13:00:01.000Z"
    });

    expect(handoff).toMatchObject({
      residenceId: "residence:openai",
      status: "ready"
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.name).toBe("swarm.home.handoff");
  });

  it("fails closed when Swarm does not mint a current-ready handoff", async () => {
    const router = {
      async invoke(call: SwarmHomeToolCall) {
        return {
          ok: true,
          name: call.name,
          value: { created: false, reason: "residence-not-ready" }
        };
      }
    };

    await expect(
      prepareOpenAIAgentsHandoff(router, {
        residenceId: "residence:not-ready" as never,
        agent: {
          identityRef: "agent:not-ready" as never,
          capabilityRefs: [],
          offeringRefs: []
        },
        generatedAt: "2026-09-21T13:00:02.000Z"
      })
    ).rejects.toThrow("not currently eligible for handoff");
  });
});
