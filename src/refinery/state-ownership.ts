export type StateOwnershipStanding =
  | "external"
  | "shared"
  | "absent"
  | "unknown";

export type StateDomain = "task" | "memory" | "identity" | "event" | "schedule";

export interface StateOwnershipObservation {
  readonly domain: StateDomain;
  readonly standing: StateOwnershipStanding;
  readonly evidenceRef?: string;
}

export type StateOwnershipFingerprint = Readonly<
  Record<StateDomain, StateOwnershipStanding>
>;

const DOMAINS: readonly StateDomain[] = [
  "task",
  "memory",
  "identity",
  "event",
  "schedule",
];

export function fingerprintStateOwnership(
  observations: readonly StateOwnershipObservation[]
): StateOwnershipFingerprint {
  const result: Record<StateDomain, StateOwnershipStanding> = {
    task: "unknown",
    memory: "unknown",
    identity: "unknown",
    event: "unknown",
    schedule: "unknown",
  };
  const seen = new Set<StateDomain>();
  for (const observation of observations) {
    if (seen.has(observation.domain)) {
      throw new Error("duplicate state domain: " + observation.domain);
    }
    seen.add(observation.domain);
    if (observation.standing !== "unknown" && !observation.evidenceRef?.trim()) {
      throw new Error("non-unknown state standing requires evidenceRef");
    }
    result[observation.domain] = observation.standing;
  }
  for (const domain of DOMAINS) result[domain] = result[domain] ?? "unknown";
  return Object.freeze(result);
}
