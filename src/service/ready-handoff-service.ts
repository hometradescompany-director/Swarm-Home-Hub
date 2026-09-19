import type { AgentReference } from "../domain/agent.js";
import type { ResidenceId, ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import type { TypedAbsence } from "../provenance/absence.js";
import { projectResidence } from "../projection/residence.js";
import type { HabitatRegistry } from "../registry/habitat-registry.js";
import {
  projectCurrentReadyHandoff,
  type CurrentReadyHandoffCapsule,
  validateCurrentReadyHandoff
} from "../query/ready-handoff.js";
import { projectResidenceHeartbeat } from "../query/residence-heartbeat.js";

export type ReadyHandoffAttempt =
  | {
      readonly created: true;
      readonly handoff: CurrentReadyHandoffCapsule;
    }
  | {
      readonly created: false;
      readonly absence: TypedAbsence;
    };

export class ReadyHandoffService {
  constructor(
    private readonly journal: EventJournal,
    private readonly habitats: HabitatRegistry
  ) {}

  async attempt(
    residenceId: ResidenceId,
    agent: AgentReference,
    generatedAt: string
  ): Promise<ReadyHandoffAttempt> {
    const events = await this.journal.eventsForResidence(residenceId);
    if (events.length === 0) {
      return {
        created: false,
        absence: {
          kind: "cannot_be_located",
          statement: `Residence history cannot be located for handoff: ${residenceId}`,
          observedAt: generatedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        }
      };
    }

    let residence: ResidenceSnapshot | null;
    try {
      residence = projectResidence(events);
    } catch (error) {
      return {
        created: false,
        absence: {
          kind: "corrupted",
          statement:
            error instanceof Error
              ? `Residence history could not be projected for handoff: ${error.message}`
              : "Residence history could not be projected for handoff.",
          observedAt: generatedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        }
      };
    }

    if (!residence) {
      return {
        created: false,
        absence: {
          kind: "status_unknown",
          statement: `Residence state is unknown for handoff: ${residenceId}`,
          observedAt: generatedAt,
          sourceRef: `swarm:event-journal:${residenceId}`
        }
      };
    }

    const habitat = await this.habitats.get(residence.habitatId);
    if (!habitat) {
      return {
        created: false,
        absence: {
          kind: "cannot_be_located",
          statement: `Habitat policy cannot be located for handoff: ${residence.habitatId}`,
          observedAt: generatedAt,
          sourceRef: `swarm:habitat-registry:${residence.habitatId}`
        }
      };
    }

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
          absence: {
            kind: "rejected_by_validation",
            statement: validation.message,
            observedAt: generatedAt,
            sourceRef: `swarm:ready-handoff:${residenceId}`
          }
        };
      }

      return { created: true, handoff };
    } catch (error) {
      return {
        created: false,
        absence: {
          kind: "rejected_by_validation",
          statement:
            error instanceof Error
              ? error.message
              : "Ready handoff validation failed.",
          observedAt: generatedAt,
          sourceRef: `swarm:ready-handoff:${residenceId}`
        }
      };
    }
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
}
