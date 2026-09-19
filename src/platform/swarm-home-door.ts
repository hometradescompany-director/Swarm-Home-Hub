import type { AgentReference } from "../domain/agent.js";
import type { Habitat } from "../domain/habitat.js";
import type { HabitatId, ResidenceId, ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import type { AtlasGateway } from "../integrations/atlas/contract.js";
import { projectResidence } from "../projection/residence.js";
import type { HabitatRegistry } from "../registry/habitat-registry.js";
import { projectHabitatState, type HabitatState } from "../query/habitat-state.js";
import { projectResidenceHeartbeat, type ResidenceHeartbeat } from "../query/residence-heartbeat.js";
import { recoverResidence, type ResidenceRecovery } from "../query/residence-recovery.js";
import { ResidenceRequestService } from "../service/request-service.js";
import { AdmissionService, type AdmissionDecisionOutcome } from "../service/admission-service.js";
import { RestService } from "../service/rest-service.js";
import { ReadyHandoffService, type ReadyHandoffAttempt } from "../service/ready-handoff-service.js";
import { DepartureService } from "../service/departure-service.js";
import type { RequestResidence } from "../commands/request-residence.js";

export interface SwarmHomeDoorDependencies {
  readonly journal: EventJournal;
  readonly habitats: HabitatRegistry;
  readonly atlas: AtlasGateway;
}

export interface SwarmHomeInspection {
  readonly habitats: readonly HabitatState[];
  readonly residences: readonly ResidenceSnapshot[];
}

export class SwarmHomeDoor {
  constructor(private readonly deps: SwarmHomeDoorDependencies) {}

  async inspect(): Promise<SwarmHomeInspection> {
    if (!this.deps.journal.allEvents) {
      throw new Error("event journal does not expose bounded inspection");
    }

    const allEvents = await this.deps.journal.allEvents();
    const byResidence = new Map<string, typeof allEvents>();
    for (const event of allEvents) {
      const existing = byResidence.get(event.residenceId) ?? [];
      byResidence.set(event.residenceId, [...existing, event]);
    }

    const residences = [...byResidence.values()]
      .map(events => projectResidence(events))
      .filter((value): value is ResidenceSnapshot => value !== null)
      .sort((a, b) => a.residenceId.localeCompare(b.residenceId));

    const habitats = await this.deps.habitats.list();
    return {
      habitats: habitats
        .map(habitat => projectHabitatState(habitat, residences))
        .sort((a, b) => a.habitatId.localeCompare(b.habitatId)),
      residences
    };
  }

  async recover(residenceId: ResidenceId, observedAt: string): Promise<ResidenceRecovery> {
    return recoverResidence(this.deps.journal, residenceId, observedAt);
  }

  async heartbeat(
    residenceId: ResidenceId,
    evaluatedAt: string
  ): Promise<ResidenceHeartbeat> {
    const events = await this.deps.journal.eventsForResidence(residenceId);
    const residence = projectResidence(events);
    if (!residence) {
      throw new Error(`residence cannot be located: ${residenceId}`);
    }
    const habitat = await this.requireHabitat(residence.habitatId);
    return projectResidenceHeartbeat(events, evaluatedAt, habitat);
  }

  async request(command: RequestResidence, observedAt: string): Promise<ResidenceSnapshot> {
    await this.requireHabitat(command.habitatId);
    return new ResidenceRequestService(this.deps.journal, this.deps.atlas).request(
      command,
      observedAt
    );
  }

  async admit(
    residenceId: ResidenceId,
    eventId: string,
    observedAt: string,
    actorRef: string
  ): Promise<AdmissionDecisionOutcome> {
    const current = await this.requireResidence(residenceId);
    const habitat = await this.requireHabitat(current.habitatId);
    const inspection = await this.inspect();

    return new AdmissionService(this.deps.journal, this.deps.atlas).decide(
      current,
      habitat,
      inspection.residences,
      eventId,
      observedAt,
      actorRef
    );
  }

  async rest(
    residenceId: ResidenceId,
    eventId: string,
    at: string,
    actorRef: string
  ): Promise<ResidenceSnapshot> {
    return new RestService(this.deps.journal).rest(
      await this.requireResidence(residenceId),
      eventId,
      at,
      actorRef
    );
  }

  async ready(
    residenceId: ResidenceId,
    eventId: string,
    at: string,
    actorRef: string
  ): Promise<ResidenceSnapshot> {
    return new RestService(this.deps.journal).ready(
      await this.requireResidence(residenceId),
      eventId,
      at,
      actorRef
    );
  }

  async handoff(
    residenceId: ResidenceId,
    agent: AgentReference,
    generatedAt: string
  ): Promise<ReadyHandoffAttempt> {
    return new ReadyHandoffService(this.deps.journal, this.deps.habitats).attempt(
      residenceId,
      agent,
      generatedAt
    );
  }

  async depart(
    residenceId: ResidenceId,
    eventId: string,
    at: string,
    actorRef: string,
    reason?: string
  ): Promise<ResidenceSnapshot> {
    return new DepartureService(this.deps.journal).depart(
      await this.requireResidence(residenceId),
      eventId,
      at,
      actorRef,
      reason
    );
  }

  private async requireResidence(residenceId: ResidenceId): Promise<ResidenceSnapshot> {
    const events = await this.deps.journal.eventsForResidence(residenceId);
    const residence = projectResidence(events);
    if (!residence) {
      throw new Error(`residence cannot be located: ${residenceId}`);
    }
    return residence;
  }

  private async requireHabitat(habitatId: HabitatId): Promise<Habitat> {
    const habitat = await this.deps.habitats.get(habitatId);
    if (!habitat) {
      throw new Error(`habitat cannot be located: ${habitatId}`);
    }
    return habitat;
  }
}
