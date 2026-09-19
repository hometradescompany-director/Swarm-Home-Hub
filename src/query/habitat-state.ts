import type { Habitat } from "../domain/habitat.js";
import type { ResidenceSnapshot } from "../domain/residence.js";
import { activeResidencesForHabitat } from "./active-residences.js";

export interface HabitatState {
  readonly habitatId: string;
  readonly status: Habitat["status"];
  readonly capacity: number;
  readonly occupied: number;
  readonly available: number;
  readonly atCapacity: boolean;
  readonly acceptingAdmissions: boolean;
}

export function projectHabitatState(
  habitat: Habitat,
  residences: readonly ResidenceSnapshot[]
): HabitatState {
  if (!Number.isInteger(habitat.capacity) || habitat.capacity < 1) {
    throw new Error("habitat capacity must be a positive integer");
  }

  const occupied = activeResidencesForHabitat(residences, habitat.id).length;
  if (occupied > habitat.capacity) {
    throw new Error(`habitat occupancy exceeds capacity: ${habitat.id}`);
  }

  const available = habitat.capacity - occupied;
  return {
    habitatId: habitat.id,
    status: habitat.status,
    capacity: habitat.capacity,
    occupied,
    available,
    atCapacity: available === 0,
    acceptingAdmissions: habitat.status === "open" && available > 0
  };
}
