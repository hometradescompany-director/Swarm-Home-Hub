import type { ResidenceSnapshot } from "../domain/residence.js";

export function assertCanDepart(snapshot: ResidenceSnapshot): void {
  if (!["admitted", "resting", "ready"].includes(snapshot.status)) {
    throw new Error(`cannot depart from ${snapshot.status}`);
  }
}
