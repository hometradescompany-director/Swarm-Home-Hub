import type { ResidenceStatus } from "../domain/residence.js";
import type { SwarmResidenceEvent } from "../events/event.js";
import { projectResidence } from "../projection/residence.js";

export type ResidenceHeartbeatState = "current" | "stale" | "terminal" | "unknown";

export interface ResidenceHeartbeat {
  readonly residenceId: string | null;
  readonly state: ResidenceHeartbeatState;
  readonly status: ResidenceStatus | null;
  readonly lastEventId: string | null;
  readonly lastObservedAt: string | null;
  readonly ageMs: number | null;
}

export function projectResidenceHeartbeat(
  events: readonly SwarmResidenceEvent[],
  now: string,
  staleAfterMs: number
): ResidenceHeartbeat {
  if (!Number.isFinite(staleAfterMs) || staleAfterMs < 0) {
    throw new Error("staleAfterMs must be a non-negative finite number");
  }

  if (events.length === 0) {
    return {
      residenceId: null,
      state: "unknown",
      status: null,
      lastEventId: null,
      lastObservedAt: null,
      ageMs: null
    };
  }

  const residence = projectResidence(events);
  if (!residence) {
    return {
      residenceId: null,
      state: "unknown",
      status: null,
      lastEventId: null,
      lastObservedAt: null,
      ageMs: null
    };
  }

  const latest = events.at(-1)!;
  const nowMs = Date.parse(now);
  const observedMs = Date.parse(latest.observedAt);
  if (!Number.isFinite(nowMs) || !Number.isFinite(observedMs)) {
    throw new Error("heartbeat timestamps must be valid ISO-8601 values");
  }

  const ageMs = Math.max(0, nowMs - observedMs);
  const terminal = residence.status === "departed" || residence.status === "rejected";

  return {
    residenceId: residence.residenceId,
    state: terminal ? "terminal" : ageMs > staleAfterMs ? "stale" : "current",
    status: residence.status,
    lastEventId: residence.lastEventId,
    lastObservedAt: latest.observedAt,
    ageMs
  };
}
