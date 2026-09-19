import { describe, expect, it } from "vitest";
import type { AgentReference } from "../src/domain/agent.js";
import type { Habitat } from "../src/domain/habitat.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { SwarmHomeDoor } from "../src/platform/swarm-home-door.js";
import { SwarmHomeToolRouter } from "../src/platform/tool-router.js";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.js";

const habitat: Habitat = {
  id: "habitat:door" as never,
  name: "Door Habitat",
  capacity: 2,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

const agent: AgentReference = {
  identityRef: "agent:door" as never,
  capabilityRefs: ["capability:door" as never],
  offeringRefs: ["offering:door" as never]
};

const atlas: AtlasGateway = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: true,
      authorityRef: "atlas:authority:door",
      decidedAt: "2026-09-20T05:00:01.000Z"
    };
  },
  async evidence() {
    return [];
  }
};

describe("Swarm Home platform door", () => {
  it("carries a caller through the residence lifecycle through one tool router", async () => {
    const journal = new InMemoryEventJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    const router = new SwarmHomeToolRouter(
      new SwarmHomeDoor({ journal, habitats, atlas })
    );

    const requested = await router.invoke({
      name: "swarm.home.request",
      arguments: {
        observedAt: "2026-09-20T05:00:00.100Z",
        command: {
          requestId: "request:door",
          residenceId: "residence:door",
          agentIdentityRef: agent.identityRef,
          habitatId: habitat.id,
          requestedAt: "2026-09-20T05:00:00.000Z",
          actorRef: "actor:door",
          evidenceReceiptIds: []
        }
      }
    });
    expect(requested).toMatchObject({ ok: true });

    const admitted = await router.invoke({
      name: "swarm.home.admit",
      arguments: {
        residenceId: "residence:door",
        eventId: "event:door:admitted",
        observedAt: "2026-09-20T05:00:01.100Z",
        actorRef: "actor:door"
      }
    });
    expect(admitted).toMatchObject({
      ok: true,
      value: { outcome: "admitted", residence: { status: "admitted" } }
    });

    const resting = await router.invoke({
      name: "swarm.home.rest",
      arguments: {
        residenceId: "residence:door",
        eventId: "event:door:rested",
        at: "2026-09-20T05:00:02.000Z",
        actorRef: "actor:door"
      }
    });
    expect(resting).toMatchObject({ ok: true, value: { status: "resting" } });

    const ready = await router.invoke({
      name: "swarm.home.ready",
      arguments: {
        residenceId: "residence:door",
        eventId: "event:door:ready",
        at: "2026-09-20T05:00:03.000Z",
        actorRef: "actor:door"
      }
    });
    expect(ready).toMatchObject({ ok: true, value: { status: "ready" } });

    const heartbeat = await router.invoke({
      name: "swarm.home.heartbeat",
      arguments: {
        residenceId: "residence:door",
        evaluatedAt: "2026-09-20T05:00:04.000Z"
      }
    });
    expect(heartbeat).toMatchObject({
      ok: true,
      value: { state: "current", status: "ready" }
    });

    const handoff = await router.invoke({
      name: "swarm.home.handoff",
      arguments: {
        residenceId: "residence:door",
        agent,
        generatedAt: "2026-09-20T05:00:04.000Z"
      }
    });
    expect(handoff).toMatchObject({
      ok: true,
      value: { created: true, handoff: { residenceId: "residence:door" } }
    });

    const inspection = await router.invoke({
      name: "swarm.home.inspect",
      arguments: {}
    });
    expect(inspection).toMatchObject({
      ok: true,
      value: {
        habitats: [{ habitatId: "habitat:door", occupied: 1 }],
        residences: [{ residenceId: "residence:door", status: "ready" }]
      }
    });

    const departed = await router.invoke({
      name: "swarm.home.depart",
      arguments: {
        residenceId: "residence:door",
        eventId: "event:door:departed",
        at: "2026-09-20T05:00:05.000Z",
        actorRef: "actor:door",
        reason: "bounded task complete"
      }
    });
    expect(departed).toMatchObject({ ok: true, value: { status: "departed" } });

    const recovered = await router.invoke({
      name: "swarm.home.recover",
      arguments: {
        residenceId: "residence:door",
        observedAt: "2026-09-20T05:00:06.000Z"
      }
    });
    expect(recovered).toMatchObject({
      ok: true,
      value: {
        found: true,
        residence: { status: "departed" },
        timeline: [
          { status: "requested" },
          { status: "admitted" },
          { status: "resting" },
          { status: "ready" },
          { status: "departed" }
        ]
      }
    });
  });

  it("fails closed on malformed tool arguments", async () => {
    const journal = new InMemoryEventJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);
    const router = new SwarmHomeToolRouter(
      new SwarmHomeDoor({ journal, habitats, atlas })
    );

    await expect(
      router.invoke({
        name: "swarm.home.heartbeat",
        arguments: { residenceId: "", evaluatedAt: "not-used" }
      })
    ).resolves.toMatchObject({
      ok: false,
      error: "tool argument residenceId must be a non-empty string"
    });
  });
});
