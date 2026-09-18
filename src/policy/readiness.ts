import type { ResidenceSnapshot } from "../domain/residence.js";

export function assertCanRest(snapshot: ResidenceSnapshot): void {
  if (snapshot.status !== "admitted" && snapshot.status !== "ready") {
    throw new Error(`cannot enter rest from ${snapshot.status}`);
  }
}

export function assertCanBecomeReady(snapshot: ResidenceSnapshot): void {
  if (snapshot.status !== "resting") {
    throw new Error(`cannot become ready from ${snapshot.status}`);
  }
}
