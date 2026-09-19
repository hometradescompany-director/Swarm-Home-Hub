import type { ResidenceSnapshot } from "../domain/residence.js";

export interface ResidenceIndexEntry {
  readonly residenceId: string;
  readonly agentIdentityRef: string;
  readonly habitatId: string;
  readonly status: ResidenceSnapshot["status"];
  readonly version: number;
}

export function projectResidenceIndex(
  snapshots: readonly ResidenceSnapshot[]
): readonly ResidenceIndexEntry[] {
  return snapshots
    .map(snapshot => ({
      residenceId: snapshot.residenceId,
      agentIdentityRef: snapshot.agentIdentityRef,
      habitatId: snapshot.habitatId,
      status: snapshot.status,
      version: snapshot.version
    }))
    .sort((a, b) => a.residenceId.localeCompare(b.residenceId));
}
