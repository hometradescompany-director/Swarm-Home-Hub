import type { ResidenceStatus } from "../domain/residence.js";

const allowed: Readonly<Record<ResidenceStatus, readonly ResidenceStatus[]>> = {
  requested: ["admitted", "rejected"],
  admitted: ["resting", "departed"],
  resting: ["ready", "departed"],
  ready: ["resting", "departed"],
  departed: [],
  rejected: []
};

export function assertAllowedTransition(from: ResidenceStatus, to: ResidenceStatus): void {
  if (!allowed[from].includes(to)) {
    throw new Error(`invalid residence transition: ${from} -> ${to}`);
  }
}
