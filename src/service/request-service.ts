import type { RequestResidence } from "../commands/request-residence.js";
import type { EventJournal } from "../events/journal.js";
import { buildResidenceRequestedEvent } from "../events/build-request-event.js";
import type { AtlasGateway } from "../integrations/atlas/contract.js";
import { projectResidence } from "../projection/residence.js";
import type { ResidenceSnapshot } from "../domain/residence.js";

export class ResidenceRequestService {
  constructor(
    private readonly journal: EventJournal,
    private readonly atlas: AtlasGateway
  ) {}

  async request(command: RequestResidence, observedAt: string): Promise<ResidenceSnapshot> {
    const existing = await this.journal.eventsForResidence(command.residenceId);
    if (existing.length > 0) {
      throw new Error(`residence already exists: ${command.residenceId}`);
    }

    const identity = await this.atlas.resolveAgentIdentity(command.agentIdentityRef);
    if (!identity.exists) {
      throw new Error(`Atlas identity not found: ${command.agentIdentityRef}`);
    }

    await this.journal.append(
      buildResidenceRequestedEvent(command, observedAt, identity.canonicalRef),
      { expectedLastEventId: null }
    );

    const snapshot = projectResidence(await this.journal.eventsForResidence(command.residenceId));
    if (!snapshot) throw new Error("request projection unexpectedly empty");
    return snapshot;
  }
}
