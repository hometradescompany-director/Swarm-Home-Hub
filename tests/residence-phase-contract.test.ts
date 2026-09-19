import { describe, expect, it } from "vitest";
import type { AgentReference } from "../src/domain/agent.js";
import type { Habitat } from "../src/domain/habitat.js";
import type { RequestResidence } from "../src/commands/request-residence.js";
import { InMemoryEventJournal } from "../src/events/journal.js";
import type { AtlasGateway } from "../src/integrations/atlas/contract.js";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.js";
import { ResidenceRequestService } from "../src/service/request-service.js";
import { AdmissionService } from "../src/service/admission-service.js";
import { RestService } from "../src/service/rest-service.js";
import { ReadyHandoffService } from "../src/service/ready-handoff-service.js";
import { DepartureService } from "../src/service/departure-service.js";

const habitat: Habitat = {
  id: "habitat:phase" as never,
  name: "Phase Contract Habitat",
  capacity: 2,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

const agent: AgentReference = {
  identityRef: "agent:phase" as never,
  capabilityRefs: ["capability:phase" as never],
  offeringRefs: ["offering:phase" as never]
};

const atlas: AtlasGateway = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: true,
      authorityRef: "atlas:authority:phase",
      decidedAt: "2026-09-20T02:00:01.000Z"
    };
  },
  async evidence() {
    return [];
  }
};

describe("residence/readiness phase contract", () => {
  it("carries one agent through request, admission, rest, ready handoff and departure", async () => {
    const journal = new InMemoryEventJournal();
    const habitats = new InMemoryHabitatRegistry();
    await habitats.put(habitat);

    const command: RequestResidence = {
      requestId: "request:phase",
      residenceId: "residence:phase" as never,
      agentIdentityRef: agent.identityRef,
      habitatId: habitat.id,
      requestedAt: "2026-09-20T02:00:00.000Z",
      actorRef: "actor:phase",
      evidenceReceiptIds: []
    };

    const requested = await new ResidenceRequestService(journal, atlas).request(
      command,
      "2026-09-20T02:00:00.100Z"
    );

    const admitted = await new AdmissionService(journal, atlas).admit(
      requested,
      habitat,
      [],
      "event:phase:admitted",
      "2026-09-20T02:00:01.100Z",
      "actor:phase"
    );

    const rest = new RestService(journal);
    const resting = await rest.rest(
      admitted,
      "event:phase:rested",
      "2026-09-20T02:00:02.000Z",
      "actor:phase"
    );
    const ready = await rest.ready(
      resting,
      "event:phase:ready",
      "2026-09-20T02:00:03.000Z",
      "actor:phase"
    );

    const handoffService = new ReadyHandoffService(journal, habitats);
    const handoff = await handoffService.create(
      ready.residenceId,
      agent,
      "2026-09-20T02:00:04.000Z"
    );

    await expect(
      handoffService.assertUsable(handoff, "2026-09-20T02:00:05.000Z")
    ).resolves.toBeUndefined();

    const departed = await new DepartureService(journal).depart(
      ready,
      "event:phase:departed",
      "2026-09-20T02:00:06.000Z",
      "actor:phase",
      "bounded task complete"
    );

    expect([requested.status, admitted.status, resting.status, ready.status, departed.status]).toEqual([
      "requested",
      "admitted",
      "resting",
      "ready",
      "departed"
    ]);

    expect(
      await handoffService.inspect(handoff, "2026-09-20T02:00:07.000Z")
    ).toMatchObject({
      usable: false,
      refusalCode: "source_event_superseded"
    });

    expect(
      (await journal.eventsForResidence(command.residenceId)).map(event => event.type)
    ).toEqual([
      "swarm.residence.requested",
      "swarm.residence.admitted",
      "swarm.residence.rested",
      "swarm.residence.ready",
      "swarm.residence.departed"
    ]);
  });
});
