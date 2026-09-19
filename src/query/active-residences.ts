import type { ResidenceSnapshot } from "../domain/residence.js";
import type { HabitatId } from "../domain/residence.js";

const OCCUPYING_STATUSES: readonly ResidenceSnapshot["status"][] = [
  "admitted",
  "resting",
  "ready"
];

export function activeResidencesForHabitat(
  snapshots: readonly ResidenceSnapshot[],
  habitatId: HabitatId
): readonly ResidenceSnapshot[] {
  return snapshots.filter(
    snapshot =>
      snapshot.habitatId === habitatId &&
      OCCUPYING_STATUSES.includes(snapshot.status)
  );
}
