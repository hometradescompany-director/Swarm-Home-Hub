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

    const uniqueEvidenceIds = [...new Set(command.evidenceReceiptIds)];
    if (uniqueEvidenceIds.length !== command.evidenceReceiptIds.length) {
      throw new Error("residence request contains duplicate evidence receipt ids");
    }
    if (uniqueEvidenceIds.length > 0) {
      const receipts = await this.atlas.evidence(uniqueEvidenceIds);
      const resolved = new Set(receipts.map(receipt => receipt.id));
      const missing = uniqueEvidenceIds.filter(id => !resolved.has(id));
      if (missing.length > 0) {
        throw new Error(`request evidence could not be resolved: ${missing.join(", ")}`);
      }
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
