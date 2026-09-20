import { describe, expect, it } from "vitest";
import type { Habitat } from "../src/domain/habitat.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { SwarmHomeDoor } from "../src/platform/swarm-home-door.js";
import { SwarmHomeToolRouter } from "../src/platform/tool-router.js";
import { SwarmHomeWebTransport } from "../src/platform/web-transport.js";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.js";

const habitat: Habitat = {
  id: "habitat:web" as never,
  name: "Web Habitat",
  capacity: 2,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

const atlas: AtlasGateway = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: true,
      authorityRef: "atlas:authority:web",
      decidedAt: "2026-09-20T06:00:01.000Z"
    };
  },
  async evidence() {
    return [];
  }
};

async function transport(): Promise<SwarmHomeWebTransport> {
  const journal = new InMemoryEventJournal();
  const habitats = new InMemoryHabitatRegistry();
  await habitats.put(habitat);
  return new SwarmHomeWebTransport(
    new SwarmHomeToolRouter(new SwarmHomeDoor({ journal, habitats, atlas })),
    { basePath: "/swarm-home" }
  );
}

describe("Swarm Home web transport", () => {
  it("publishes bounded health and tool discovery", async () => {
    const web = await transport();

    const health = await web.handle(new Request("https://example.test/swarm-home/health"));
    expect(health.status).toBe(200);
    await expect(health.json()).resolves.toMatchObject({
      ok: true,
      transport: "web",
      toolCount: 9
    });

    const tools = await web.handle(new Request("https://example.test/swarm-home/tools"));
    expect(tools.status).toBe(200);
    const payload = await tools.json() as { tools: Array<{ name: string; mutatesState: boolean }> };
    expect(payload.tools).toHaveLength(9);
    expect(payload.tools).toContainEqual(expect.objectContaining({
      name: "swarm.home.inspect",
      mutatesState: false
    }));
    expect(payload.tools).toContainEqual(expect.objectContaining({
      name: "swarm.home.request",
      mutatesState: true
    }));
  });

  it("invokes the existing router without becoming a second truth owner", async () => {
    const web = await transport();

    const response = await web.handle(new Request(
      "https://example.test/swarm-home/tools/swarm.home.inspect",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ arguments: {} })
      }
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      name: "swarm.home.inspect",
      value: {
        habitats: [{ habitatId: "habitat:web", occupied: 0 }],
        residences: []
      }
    });
  });

  it("fails closed on unknown tools and malformed JSON", async () => {
    const web = await transport();

    const unknown = await web.handle(new Request(
      "https://example.test/swarm-home/tools/swarm.home.nope",
      { method: "POST", body: "{}" }
    ));
    expect(unknown.status).toBe(404);

    const malformed = await web.handle(new Request(
      "https://example.test/swarm-home/tools/swarm.home.inspect",
      { method: "POST", body: "{" }
    ));
    expect(malformed.status).toBe(400);
  });

  it("does not expose routes outside its configured base path", async () => {
    const web = await transport();
    const response = await web.handle(new Request("https://example.test/tools"));
    expect(response.status).toBe(404);
  });
});
