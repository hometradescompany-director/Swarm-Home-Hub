import type { HabitatId } from "./residence.js";

export type HabitatStatus = "open" | "paused" | "closed";

export interface Habitat {
  readonly id: HabitatId;
  readonly name: string;
  readonly capacity: number;
  readonly status: HabitatStatus;
  readonly heartbeatStaleAfterMs: number;
}

export function assertHabitatHeartbeatPolicy(habitat: Habitat): void {
  if (
    !Number.isFinite(habitat.heartbeatStaleAfterMs) ||
    habitat.heartbeatStaleAfterMs < 0
  ) {
    throw new Error("habitat heartbeatStaleAfterMs must be a non-negative finite number");
  }
}

export function assertHabitatCapacity(habitat: Habitat, activeResidents: number): void {
  if (!Number.isInteger(habitat.capacity) || habitat.capacity < 1) {
    throw new Error("habitat capacity must be a positive integer");
  }
  if (activeResidents >= habitat.capacity) {
    throw new Error(`habitat capacity reached: ${habitat.id}`);
  }
  if (habitat.status !== "open") {
    throw new Error(`habitat is not open: ${habitat.id}`);
  }
}
