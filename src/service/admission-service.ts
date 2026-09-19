import type { Habitat } from "../domain/habitat.js";
import type { ResidenceSnapshot } from "../domain/residence.js";
import type { EventJournal } from "../events/journal.js";
import type { AtlasAuthorityDecision, AtlasGateway } from "../integrations/atlas/contract.js";
import { assertAdmissionAllowed } from "../policy/admission.js";
import { activeResidencesForHabitat } from "../query/active-residences.js";
import { ResidenceService } from "./residence-service.js";
import { RejectionService } from "./rejection-service.js";

export interface AdmissionDecisionOutcome {
  readonly outcome: "admitted" | "rejected";
  readonly residence: ResidenceSnapshot;
  readonly decision: AtlasAuthorityDecision;
}

export class AdmissionService {
  constructor(
    private readonly journal: EventJournal,
    private readonly atlas: AtlasGateway
  ) {}

  private async admitWithDecision(
    current: ResidenceSnapshot,
    habitat: Habitat,
    residences: readonly ResidenceSnapshot[],
    eventId: string,
    observedAt: string,
    actorRef: string,
    decision: AtlasAuthorityDecision
  ): Promise<ResidenceSnapshot> {
    const activeResidents = activeResidencesForHabitat(residences, habitat.id).length;
    assertAdmissionAllowed(decision, habitat, activeResidents);

    return new ResidenceService(this.journal).transition(current, "admitted", {
      id: eventId,
      occurredAt: decision.decidedAt,
      observedAt,
      actorRef,
      evidenceReceiptIds: [],
      authorityRef: decision.authorityRef
    });
  }

  async admit(
    current: ResidenceSnapshot,
    habitat: Habitat,
    residences: readonly ResidenceSnapshot[],
    eventId: string,
    observedAt: string,
    actorRef: string
  ): Promise<ResidenceSnapshot> {
    const decision = await this.atlas.canEnterHome(current.agentIdentityRef);
    return this.admitWithDecision(
      current,
      habitat,
      residences,
      eventId,
      observedAt,
      actorRef,
      decision
    );
  }

  async decide(
    current: ResidenceSnapshot,
    habitat: Habitat,
    residences: readonly ResidenceSnapshot[],
    eventId: string,
    observedAt: string,
    actorRef: string
  ): Promise<AdmissionDecisionOutcome> {
    const decision = await this.atlas.canEnterHome(current.agentIdentityRef);

    if (!decision.allowed) {
      const residence = await new RejectionService(this.journal).reject(
        current,
        eventId,
        decision.decidedAt,
        observedAt,
        actorRef,
        decision.reason ?? "Atlas authority denied admission",
        [],
        decision.authorityRef
      );
      return { outcome: "rejected", residence, decision };
    }

    const residence = await this.admitWithDecision(
      current,
      habitat,
      residences,
      eventId,
      observedAt,
      actorRef,
      decision
    );
    return { outcome: "admitted", residence, decision };
  }
}
