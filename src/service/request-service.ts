import type { RequestResidence } from "../commands/request-residence.js";
import type { EventJournal } from "../events/journal.js";
import { buildResidenceRequestedEvent } from "../events/build-request-event.js";
import { projectResidence } from "../projection/residence.js";
import type { ResidenceSnapshot } from "../domain/residence.js";

export class ResidenceRequestService {
  constructor(private readonly journal: EventJournal) {}

  async request(command: RequestResidence, observedAt: string): Promise<ResidenceSnapshot> {
    const existing = await this.journal.eventsForResidence(command.residenceId);
    if (existing.length > 0) {
      throw new Error(`residence already exists: ${command.residenceId}`);
    }

    await this.journal.append(
      buildResidenceRequestedEvent(command, observedAt),
      { expectedLastEventId: null }
    );

    const snapshot = projectResidence(await this.journal.eventsForResidence(command.residenceId));
    if (!snapshot) throw new Error("request projection unexpectedly empty");
    return snapshot;
  }
}
