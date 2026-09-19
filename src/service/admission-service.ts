import type { Habitat } from "../domain/habitat.js";
import type { ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import type { AtlasGateway } from "../integrations/atlas/contract.js";
import { assertAdmissionAllowed } from "../policy/admission.js";
import { ResidenceService } from "./residence-service.js";

export class AdmissionService {
  constructor(
    private readonly journal: EventJournal,
    private readonly atlas: AtlasGateway
  ) {}

  async admit(
    current: ResidenceSnapshot,
    habitat: Habitat,
    activeResidents: number,
    eventId: string,
    observedAt: string,
    actorRef: string
  ): Promise<ResidenceSnapshot> {
    const decision = await this.atlas.canEnterHome(current.agentIdentityRef);
    assertAdmissionAllowed(decision, habitat, activeResidents);

    const service = new ResidenceService(this.journal);
    return service.transition(current, "admitted", {
      id: eventId,
      occurredAt: observedAt,
      observedAt,
      actorRef,
      evidenceReceiptIds: [],
      authorityRef: decision.authorityRef
    });
  }
}
