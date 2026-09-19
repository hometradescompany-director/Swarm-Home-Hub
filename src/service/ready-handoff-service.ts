import type { AgentReference } from "../domain/agent.js";
import type { ResidenceId } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import { projectResidence } from "../projection/residence.js";
import type { HabitatRegistry } from "../registry/habitat-registry.js";
import {
  projectCurrentReadyHandoff,
  type CurrentReadyHandoffCapsule,
  validateCurrentReadyHandoff
} from "../query/ready-handoff.js";
import { projectResidenceHeartbeat } from "../query/residence-heartbeat.js";

export class ReadyHandoffService {
  constructor(
    private readonly journal: EventJournal,
    private readonly habitats: HabitatRegistry
  ) {}

  async create(
    residenceId: ResidenceId,
    agent: AgentReference,
    generatedAt: string
  ): Promise<CurrentReadyHandoffCapsule> {
    const events = await this.journal.eventsForResidence(residenceId);
    if (events.length === 0) {
      throw new Error(`residence not found for handoff: ${residenceId}`);
    }

    const residence = projectResidence(events);
    if (!residence) {
      throw new Error(`residence projection unexpectedly empty: ${residenceId}`);
    }

    const habitat = await this.habitats.get(residence.habitatId);
    if (!habitat) {
      throw new Error(`habitat not found for handoff: ${residence.habitatId}`);
    }

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
      throw new Error(validation.message);
    }

    return handoff;
  }
}
