import type { Habitat } from "../domain/habitat.js";
import { assertHabitatHeartbeatPolicy } from "../domain/habitat.js";
import type { ResidenceStatus } from "../domain/residence.js";
import type { SwarmResidenceEvent } from "../events/event.js";
import { projectResidence } from "../projection/residence.js";

export type ResidenceHeartbeatState = "current" | "stale" | "terminal" | "unknown";

export interface ResidenceHeartbeat {
  readonly residenceId: string | null;
  readonly state: ResidenceHeartbeatState;
  readonly status: ResidenceStatus | null;
  readonly lastEventId: string | null;
  readonly evaluatedAt: string;
  readonly lastObservedAt: string | null;
  readonly ageMs: number | null;
  readonly staleAfterMs: number;
  readonly freshUntil: string | null;
}

export function projectResidenceHeartbeat(
  events: readonly SwarmResidenceEvent[],
  now: string,
  habitat: Habitat
): ResidenceHeartbeat {
  assertHabitatHeartbeatPolicy(habitat);
  const staleAfterMs = habitat.heartbeatStaleAfterMs;

  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) {
    throw new Error("heartbeat evaluation time must be a valid ISO-8601 value");
  }

  if (events.length === 0) {
    return {
      residenceId: null,
      state: "unknown",
      status: null,
      lastEventId: null,
      evaluatedAt: now,
      lastObservedAt: null,
      ageMs: null,
      staleAfterMs,
      freshUntil: null
    };
  }

  const residence = projectResidence(events);
  if (!residence) {
    return {
      residenceId: null,
      state: "unknown",
      status: null,
      lastEventId: null,
      evaluatedAt: now,
      lastObservedAt: null,
      ageMs: null,
      staleAfterMs,
      freshUntil: null
    };
  }

  if (residence.habitatId !== habitat.id) {
    throw new Error("heartbeat habitat does not match residence habitat");
  }

  const latest = events.at(-1)!;
  const observedMs = Date.parse(latest.observedAt);
  if (!Number.isFinite(observedMs)) {
    throw new Error("heartbeat timestamps must be valid ISO-8601 values");
  }

  if (nowMs < observedMs) {
    throw new Error("heartbeat observation is in the future relative to now");
  }

  const freshUntilDate = new Date(observedMs + staleAfterMs);
  if (!Number.isFinite(freshUntilDate.getTime())) {
    throw new Error("heartbeat freshness boundary must be representable as ISO-8601");
  }

  const ageMs = nowMs - observedMs;
  const terminal = residence.status === "departed" || residence.status === "rejected";

  return {
    residenceId: residence.residenceId,
    state: terminal ? "terminal" : ageMs > staleAfterMs ? "stale" : "current",
    status: residence.status,
    lastEventId: residence.lastEventId,
    evaluatedAt: now,
    lastObservedAt: latest.observedAt,
    ageMs,
    staleAfterMs,
    freshUntil: freshUntilDate.toISOString()
  };
}
