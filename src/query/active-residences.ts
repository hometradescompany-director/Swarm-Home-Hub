import type { ResidenceSnapshot } from "../domain/residence.js";
import type { HabitatId } from "../domain/residence.js";

export function activeResidencesForHabitat(
  snapshots: readonly ResidenceSnapshot[],
  habitatId: HabitatId
): readonly ResidenceSnapshot[] {
  return snapshots.filter(
    snapshot =>
      snapshot.habitatId === habitatId &&
      snapshot.status !== "departed" &&
      snapshot.status !== "rejected"
  );
}
