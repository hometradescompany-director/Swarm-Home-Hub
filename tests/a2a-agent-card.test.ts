import { describe, expect, it } from "vitest";
import {
  createSwarmHomeA2AAgentCard,
  SWARM_HOME_A2A_PROTOCOL_VERSION
} from "../src/integrations/a2a/agent-card.js";
import { SwarmHomeA2ADiscoveryTransport } from "../src/integrations/a2a/discovery.js";

describe("Swarm Home A2A Agent Card projection", () => {
  it("projects only read-only Swarm Home skills by default", () => {
    const card = createSwarmHomeA2AAgentCard({
      endpointUrl: "https://example.test/a2a"
    });

    expect(card.supportedInterfaces).toEqual([
      {
        url: "https://example.test/a2a",
        protocolBinding: "JSONRPC",
        protocolVersion: SWARM_HOME_A2A_PROTOCOL_VERSION
      }
    ]);

    expect(card.skills.map(skill => skill.id)).toEqual([
      "swarm.home.inspect",
      "swarm.home.recover",
      "swarm.home.heartbeat",
      "swarm.home.handoff"
    ]);

    expect(card.capabilities).toEqual({});
  });

  it("requires explicit exposure before advertising state-mutating skills", () => {
    const card = createSwarmHomeA2AAgentCard({
      endpointUrl: "https://example.test/a2a",
      exposure: "all"
    });

    expect(card.skills).toHaveLength(9);
    expect(card.skills).toContainEqual(
      expect.objectContaining({
        id: "swarm.home.request",
        tags: expect.arrayContaining(["state-mutating"])
      })
    );
  });

  it("requires HTTPS outside loopback development", () => {
    expect(() =>
      createSwarmHomeA2AAgentCard({
        endpointUrl: "http://example.test/a2a"
      })
    ).toThrow(/HTTPS/);

    expect(() =>
      createSwarmHomeA2AAgentCard({
        endpointUrl: "http://127.0.0.1:8787/a2a"
      })
    ).not.toThrow();
  });

  it("serves the standard well-known Agent Card route and nothing else", async () => {
    const card = createSwarmHomeA2AAgentCard({
      endpointUrl: "https://example.test/a2a"
    });
    const discovery = new SwarmHomeA2ADiscoveryTransport(card);

    const response = discovery.handle(
      new Request("https://example.test/.well-known/agent-card.json")
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      name: "Swarm Home Hub",
      supportedInterfaces: [
        {
          protocolBinding: "JSONRPC",
          protocolVersion: SWARM_HOME_A2A_PROTOCOL_VERSION
        }
      ]
    });

    const wrong = discovery.handle(
      new Request("https://example.test/a2a", { method: "POST" })
    );
    expect(wrong.status).toBe(404);
  });

  it("does not advertise unsupported streaming, push, or extended-card capability", () => {
    const card = createSwarmHomeA2AAgentCard({
      endpointUrl: "https://example.test/a2a"
    });

    expect(card.capabilities).not.toHaveProperty("streaming");
    expect(card.capabilities).not.toHaveProperty("pushNotifications");
    expect(card.capabilities).not.toHaveProperty("extendedAgentCard");
  });
});
