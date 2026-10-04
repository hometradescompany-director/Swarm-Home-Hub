import type { AtlasAuthorityDecision } from "../integrations/atlas/contract.js";
import type { Habitat } from "../domain/habitat.js";
import { assertHabitatCapacity } from "../domain/habitat.js";
import { assertResidenceAuthorityBoundary } from "./no-king.js";

export function assertAuthorityAllows(decision: AtlasAuthorityDecision): void {
  if (!decision.allowed) {
    throw new Error(
      `Atlas authority denied admission: ${decision.reason ?? "no reason supplied"}`
    );
  }
  assertResidenceAuthorityBoundary({ authorityRef: decision.authorityRef });
}

export function assertHabitatAdmissionAvailable(
  habitat: Habitat,
  activeResidents: number
): void {
  assertHabitatCapacity(habitat, activeResidents);
}

export function assertAdmissionAllowed(
  decision: AtlasAuthorityDecision,
  habitat: Habitat,
  activeResidents: number
): void {
  assertAuthorityAllows(decision);
  assertHabitatAdmissionAvailable(habitat, activeResidents);
}
