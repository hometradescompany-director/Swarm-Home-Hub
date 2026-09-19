import { describe, expect, it } from "vitest";
import type { AgentReference } from "../src/domain/agent.js";
import type { Habitat } from "../src/domain/habitat.js";
import type { ResidenceId } from "../src/domain/residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.js";
import { ReadyHandoffService } from "../src/service/ready-handoff-service.js";

const residenceId = "residence:service" as ResidenceId;
const agent: AgentReference = {
  identityRef: "agent:service" as never,
  capabilityRefs: ["capability:one" as never],
  offeringRefs: ["offering:one" as never]
};
const habitat: Habitat = {
  id: "habitat:one" as never,
  name: "One",
  capacity: 3,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

async function readyJournal(): Promise<InMemoryEventJournal> {
  const journal = new InMemoryEventJournal();
  const events = [
    {
      id: "event:requested",
      type: "swarm.residence.requested" as const,
      observedAt: "2026-09-19T03:00:00.000Z",
      previousEventId: null
    },
    {
      id: "event:admitted",
      type: "swarm.residence.admitted" as const,
      observedAt: "2026-09-19T03:00:00.100Z",
      previousEventId: "event:requested"
    },
    {
      id: "event:rested",
      type: "swarm.residence.rested" as const,
      observedAt: "2026-09-19T03:00:00.200Z",
      previousEventId: "event:admitted"
    },
    {
      id: "event:ready",
      type: "swarm.residence.ready" as const,
      observedAt: "2026-09-19T03:00:00.300Z",
      previousEventId: "event:rested"
    }
  ];

  for (const event of events) {
    await journal.append({
      id: event.id,
      type: event.type,
      occurredAt: event.observedAt,
      observedAt: event.observedAt,
      actorRef: "actor:test",
      residenceId,
      agentIdentityRef: agent.identityRef,
      habitatId: habitat.id,
      evidenceReceiptIds: [],
      previousEventId: event.previousEventId
    });
  }
  return journal;
}

describe("ready handoff service", () => {
  it("derives and mints a handoff from one bounded residence history", async () => {
    const journal = await readyJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    const handoff = await new ReadyHandoffService(journal, habitats).create(
      residenceId,
      agent,
      "2026-09-19T03:00:01.000Z"
    );

    expect(handoff).toMatchObject({
      residenceId,
      agentIdentityRef: agent.identityRef,
      habitatId: habitat.id,
      lastResidenceEventId: "event:ready",
      readinessObservedAt: "2026-09-19T03:00:00.300Z",
      heartbeatEvaluatedAt: "2026-09-19T03:00:01.000Z",
      staleAfterMs: 60_000,
      freshUntil: "2026-09-19T03:01:00.300Z"
    });
  });

  it("refuses to invent a residence when history is absent", async () => {
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    await expect(
      new ReadyHandoffService(new InMemoryEventJournal(), habitats).create(
        residenceId,
        agent,
        "2026-09-19T03:00:01.000Z"
      )
    ).rejects.toThrow(/residence not found/);
  });

  it("refuses to mint without the current habitat policy", async () => {
    const journal = await readyJournal();

    await expect(
      new ReadyHandoffService(journal, new InMemoryHabitatRegistry()).create(
        residenceId,
        agent,
        "2026-09-19T03:00:01.000Z"
      )
    ).rejects.toThrow(/habitat not found/);
  });

  it("refuses to mint from a paused habitat", async () => {
    const journal = await readyJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put({ ...habitat, status: "paused" });

    await expect(
      new ReadyHandoffService(journal, habitats).create(
        residenceId,
        agent,
        "2026-09-19T03:00:01.000Z"
      )
    ).rejects.toThrow(/not open/);
  });

  it("refuses a stale ready residence without caller-supplied heartbeat state", async () => {
    const journal = await readyJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    await expect(
      new ReadyHandoffService(journal, habitats).create(
        residenceId,
        agent,
        "2026-09-19T03:02:00.000Z"
      )
    ).rejects.toThrow(/current residence heartbeat/);
  });
  it("returns typed absence when residence history is missing", async () => {
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    const result = await new ReadyHandoffService(
      new InMemoryEventJournal(),
      habitats
    ).attempt(
      residenceId,
      agent,
      "2026-09-19T03:00:01.000Z"
    );

    expect(result).toMatchObject({
      created: false,
      absence: {
        kind: "cannot_be_located",
        sourceRef: `swarm:event-journal:${residenceId}`
      }
    });
  });

  it("returns typed absence when habitat policy is missing", async () => {
    const journal = await readyJournal();

    const result = await new ReadyHandoffService(
      journal,
      new InMemoryHabitatRegistry()
    ).attempt(
      residenceId,
      agent,
      "2026-09-19T03:00:01.000Z"
    );

    expect(result).toMatchObject({
      created: false,
      absence: {
        kind: "cannot_be_located",
        sourceRef: `swarm:habitat-registry:${habitat.id}`
      }
    });
  });

  it("returns typed validation rejection for stale readiness", async () => {
    const journal = await readyJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    const result = await new ReadyHandoffService(journal, habitats).attempt(
      residenceId,
      agent,
      "2026-09-19T03:02:00.000Z"
    );

    expect(result).toMatchObject({
      created: false,
      absence: {
        kind: "rejected_by_validation"
      }
    });
  });

});
