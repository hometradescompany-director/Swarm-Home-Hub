import type { AgentReference } from "../domain/agent.js";
import type { Habitat } from "../domain/habitat.js";
import type { ResidenceId, ResidenceSnapshot } from "../domain/residence.js";
import type { SwarmResidenceEvent } from "../events/event.js";
import type { EventJournal } from "../events/journal.js";
import { createTypedAbsence, type TypedAbsence } from "../provenance/absence.js";
import { projectResidence } from "../projection/residence.js";
import type { HabitatRegistry } from "../registry/habitat-registry.js";
import {
  projectCurrentReadyHandoff,
  type CurrentReadyHandoffCapsule,
  type CurrentReadyHandoffRefusalCode,
  validateCurrentReadyHandoff
} from "../query/ready-handoff.js";
import { projectResidenceHeartbeat } from "../query/residence-heartbeat.js";

interface ReadyHandoffContext {
  readonly events: readonly SwarmResidenceEvent[];
  readonly residence: ResidenceSnapshot;
  readonly habitat: Habitat;
}

type ReadyHandoffContextResult =
  | { readonly found: true; readonly context: ReadyHandoffContext }
  | { readonly found: false; readonly absence: TypedAbsence };

export type ReadyHandoffAttempt =
  | {
      readonly created: true;
      readonly handoff: CurrentReadyHandoffCapsule;
    }
  | {
      readonly created: false;
      readonly absence: TypedAbsence;
    };

export type ReadyHandoffServiceRefusalCode =
  | CurrentReadyHandoffRefusalCode
  | "source_event_missing"
  | "source_event_not_ready"
  | "source_event_time_mismatch";

export type ReadyHandoffUseAttempt =
  | {
      readonly usable: true;
      readonly handoff: CurrentReadyHandoffCapsule;
    }
  | {
      readonly usable: false;
      readonly absence: TypedAbsence;
      readonly refusalCode?: ReadyHandoffServiceRefusalCode;
    };

export class ReadyHandoffService {
  constructor(
    private readonly journal: EventJournal,
    private readonly habitats: HabitatRegistry
  ) {}

  private async context(
    residenceId: ResidenceId,
    observedAt: string
  ): Promise<ReadyHandoffContextResult> {
    const events = await this.journal.eventsForResidence(residenceId);
    if (events.length === 0) {
      return {
        found: false,
        absence: createTypedAbsence({
          kind: "cannot_be_located",
          statement: `Residence history cannot be located for handoff: ${residenceId}`,
          observedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        })
      };
    }

    let residence: ResidenceSnapshot | null;
    try {
      residence = projectResidence(events);
    } catch (error) {
      return {
        found: false,
        absence: createTypedAbsence({
          kind: "corrupted",
          statement:
            error instanceof Error
              ? `Residence history could not be projected for handoff: ${error.message}`
              : "Residence history could not be projected for handoff.",
          observedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        })
      };
    }

    if (!residence) {
      return {
        found: false,
        absence: createTypedAbsence({
          kind: "status_unknown",
          statement: `Residence state is unknown for handoff: ${residenceId}`,
          observedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        })
      };
    }

    const habitat = await this.habitats.get(residence.habitatId);
    if (!habitat) {
      return {
        found: false,
        absence: createTypedAbsence({
          kind: "cannot_be_located",
          statement: `Habitat policy cannot be located for handoff: ${residence.habitatId}`,
          observedAt,
          sourceRef: `swarm:habitat-registry:${residence.habitatId}`
        })
      };
    }

    return {
      found: true,
      context: { events, residence, habitat }
    };
  }

  async attempt(
    residenceId: ResidenceId,
    agent: AgentReference,
    generatedAt: string
  ): Promise<ReadyHandoffAttempt> {
    const context = await this.context(residenceId, generatedAt);
    if (!context.found) {
      return { created: false, absence: context.absence };
    }

    const { events, residence, habitat } = context.context;

    try {
      const heartbeat = projectResidenceHeartbeat(events, generatedAt, habitat);
      const handoff = projectCurrentReadyHandoff(
        residence,
        agent,
        heartbeat,
        generatedAt
      );
      const validation = validateCurrentReadyHandoff(
        handoff,
        residence,
        habitat,
        generatedAt
      );
      if (!validation.usable) {
        return {
          created: false,
          absence: createTypedAbsence({
            kind: "rejected_by_validation",
            statement: validation.message,
            observedAt: generatedAt,
            sourceRef: `swarm:ready-handoff:${residenceId}`
          })
        };
      }

      return { created: true, handoff };
    } catch (error) {
      return {
        created: false,
        absence: createTypedAbsence({
          kind: "rejected_by_validation",
          statement:
            error instanceof Error
              ? error.message
              : "Ready handoff validation failed.",
          observedAt: generatedAt,
          sourceRef: `swarm:ready-handoff:${residenceId}`
        })
      };
    }
  }

  async inspect(
    handoff: CurrentReadyHandoffCapsule,
    observedAt: string
  ): Promise<ReadyHandoffUseAttempt> {
    const context = await this.context(
      handoff.residenceId as ResidenceId,
      observedAt
    );
    if (!context.found) {
      return { usable: false, absence: context.absence };
    }

    const sourceEvent = context.context.events.find(
      event => event.id === handoff.lastResidenceEventId
    );
    if (!sourceEvent) {
      return {
        usable: false,
        absence: createTypedAbsence({
          kind: "rejected_by_validation",
          statement: "handoff source residence event cannot be located in authoritative history",
          observedAt,
          sourceRef: `swarm:ready-handoff:${handoff.residenceId}`
        }),
        refusalCode: "source_event_missing"
      };
    }
    if (sourceEvent.type !== "swarm.residence.ready") {
      return {
        usable: false,
        absence: createTypedAbsence({
          kind: "rejected_by_validation",
          statement: "handoff source residence event is not a readiness event",
          observedAt,
          sourceRef: `swarm:ready-handoff:${handoff.residenceId}`
        }),
        refusalCode: "source_event_not_ready"
      };
    }
    if (sourceEvent.observedAt !== handoff.readinessObservedAt) {
      return {
        usable: false,
        absence: createTypedAbsence({
          kind: "contradictory",
          statement: "handoff readiness observation does not match authoritative source event",
          observedAt,
          sourceRef: `swarm:ready-handoff:${handoff.residenceId}`,
          contradictsRef: `swarm:residence-event:${sourceEvent.id}`
        }),
        refusalCode: "source_event_time_mismatch"
      };
    }

    const validation = validateCurrentReadyHandoff(
      handoff,
      context.context.residence,
      context.context.habitat,
      observedAt
    );

    if (!validation.usable) {
      const absence =
        validation.code === "source_event_superseded"
          ? createTypedAbsence({
              kind: "superseded",
              statement: validation.message,
              observedAt,
              sourceRef: `swarm:residence-event:${handoff.lastResidenceEventId}`,
              supersededByRef: `swarm:residence-event:${context.context.residence.lastEventId}`
            })
          : createTypedAbsence({
              kind: "rejected_by_validation",
              statement: validation.message,
              observedAt,
              sourceRef: `swarm:ready-handoff:${handoff.residenceId}`
            });

      return {
        usable: false,
        absence,
        refusalCode: validation.code
      };
    }

    return { usable: true, handoff };
  }

  async create(
    residenceId: ResidenceId,
    agent: AgentReference,
    generatedAt: string
  ): Promise<CurrentReadyHandoffCapsule> {
    const attempt = await this.attempt(residenceId, agent, generatedAt);
    if (!attempt.created) {
      throw new Error(attempt.absence.statement);
    }
    return attempt.handoff;
  }

  async assertUsable(
    handoff: CurrentReadyHandoffCapsule,
    observedAt: string
  ): Promise<void> {
    const attempt = await this.inspect(handoff, observedAt);
    if (!attempt.usable) {
      throw new Error(attempt.absence.statement);
    }
  }
}
