import { describe, expect, it } from "vitest";

import type { AgentIdentityRef } from "../src/domain/agent.js";
import { AtlasHttpGateway } from "../src/integrations/atlas/http-gateway.js";

const AGENT = "agent:swarm_01" as AgentIdentityRef;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("AtlasHttpGateway", () => {
  it("resolves an opaque agent identity through atlas-entity/v1", async () => {
    let seen: { url?: string; init?: RequestInit } = {};
    const gateway = new AtlasHttpGateway({
      baseUrl: "https://atlas.example/",
      token: "atlas_gw_test_secret",
      fetcher: async (input, init) => {
        seen = { url: String(input), init };
        return json({
          ok: true,
          request_id: "req-1",
          data: {
            atlas_entity_id: "11111111-1111-4111-8111-111111111111",
            external_id: AGENT,
            enabled: true,
          },
        });
      },
    });

    await expect(gateway.resolveAgentIdentity(AGENT)).resolves.toEqual({
      exists: true,
      canonicalRef: AGENT,
    });
    expect(seen.url).toBe("https://atlas.example/api/public/v1/entities");
    expect(JSON.parse(String(seen.init?.body))).toEqual({
      contract: "atlas-entity/v1",
      external_type: "agent_identity",
      external_id: AGENT,
      atlas_entity_kind: "agent",
      metadata: {},
    });
    expect((seen.init?.headers as Record<string, string>).authorization).toBe(
      "Bearer atlas_gw_test_secret",
    );
  });

  it("maps the bounded Atlas authority decision without bypassing local policy", async () => {
    const gateway = new AtlasHttpGateway({
      baseUrl: "https://atlas.example",
      token: "atlas_gw_test_secret",
      fetcher: async (_input, init) => {
        const body = JSON.parse(String(init?.body));
        expect(body).toEqual({
          contract: "atlas-authority/v1",
          action: "swarm.residence.enter",
          subject_ref: AGENT,
        });
        return json({
          ok: true,
          data: {
            allowed: true,
            authority_ref: "gateway:req-2",
            decided_at: "2026-09-20T04:45:00.000Z",
            reason: "opaque identity enabled",
          },
        });
      },
    });

    await expect(gateway.canEnterHome(AGENT)).resolves.toEqual({
      allowed: true,
      authorityRef: "gateway:req-2",
      decidedAt: "2026-09-20T04:45:00.000Z",
      reason: "opaque identity enabled",
    });
  });

  it("fails closed on Gateway refusal and does not echo the token", async () => {
    const token = "atlas_gw_super_secret";
    const gateway = new AtlasHttpGateway({
      baseUrl: "https://atlas.example",
      token,
      fetcher: async () =>
        json(
          {
            ok: false,
            refusal: {
              stage: "capability",
              reason: "no active capability for read:authority.swarm.residence",
            },
          },
          403,
        ),
    });

    let message = "";
    try {
      await gateway.canEnterHome(AGENT);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain("capability");
    expect(message).not.toContain(token);
  });

  it("keeps evidence transport as an explicit typed absence", async () => {
    const gateway = new AtlasHttpGateway({
      baseUrl: "https://atlas.example",
      token: "atlas_gw_test_secret",
      fetcher: async () => {
        throw new Error("should not fetch");
      },
    });

    await expect(gateway.evidence([])).resolves.toEqual([]);
    await expect(gateway.evidence(["receipt:001"])).rejects.toThrow(
      /intentionally unavailable/,
    );
  });
});
