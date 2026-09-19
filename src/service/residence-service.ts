import type { ResidenceSnapshot } from "../domain/residence.js";
import type { SwarmResidenceEvent, SwarmResidenceEventType } from "../events/event.js";
import type { EventJournal } from "../events/journal.js";
import { assertAllowedTransition } from "../policy/transitions.js";
import { projectResidence } from "../projection/residence.js";

const statusEvent: Record<Exclude<ResidenceSnapshot["status"], "requested">, SwarmResidenceEventType> = {
  admitted: "swarm.residence.admitted",
  resting: "swarm.residence.rested",
  ready: "swarm.residence.ready",
  departed: "swarm.residence.departed",
  rejected: "swarm.residence.rejected"
};

export class ResidenceService {
  constructor(private readonly journal: EventJournal) {}

  async transition(
    current: ResidenceSnapshot,
    next: Exclude<ResidenceSnapshot["status"], "requested">,
    envelope: Omit<SwarmResidenceEvent, "type" | "residenceId" | "agentIdentityRef" | "habitatId">
  ): Promise<ResidenceSnapshot> {
    assertAllowedTransition(current.status, next);
    await this.journal.append(
      {
        ...envelope,
        type: statusEvent[next],
        residenceId: current.residenceId,
        agentIdentityRef: current.agentIdentityRef,
        habitatId: current.habitatId,
        previousEventId: current.lastEventId
      },
      { expectedLastEventId: current.lastEventId }
    );
    const rebuilt = projectResidence(await this.journal.eventsForResidence(current.residenceId));
    if (!rebuilt) throw new Error("residence projection unexpectedly empty");
    return rebuilt;
  }
}
