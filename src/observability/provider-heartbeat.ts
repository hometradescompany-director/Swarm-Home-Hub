import type { ProviderExecutionSnapshot } from "./provider-execution.js";

export type ProviderHeartbeatState = "current" | "stale" | "unknown";

export interface ProviderHeartbeat {
  readonly providerRef: string;
  readonly state: ProviderHeartbeatState;
  readonly evaluatedAt: string;
  readonly lastObservedAt: string | null;
  readonly ageMs: number | null;
  readonly staleAfterMs: number;
  readonly latestStatus: ProviderExecutionSnapshot["latestStatus"];
}

export function projectProviderHeartbeat(
  snapshot: ProviderExecutionSnapshot,
  evaluatedAt: string,
  staleAfterMs: number
): ProviderHeartbeat {
  const nowMs = Date.parse(evaluatedAt);
  if (!Number.isFinite(nowMs)) throw new Error("evaluatedAt must be a valid ISO-8601 value");
  if (!Number.isInteger(staleAfterMs) || staleAfterMs < 1) {
    throw new Error("staleAfterMs must be a positive integer");
  }

  if (!snapshot.latestObservedAt) {
    return Object.freeze({
      providerRef: snapshot.providerRef,
      state: "unknown",
      evaluatedAt,
      lastObservedAt: null,
      ageMs: null,
      staleAfterMs,
      latestStatus: snapshot.latestStatus,
    });
  }

  const observedMs = Date.parse(snapshot.latestObservedAt);
  if (!Number.isFinite(observedMs)) throw new Error("latestObservedAt must be a valid ISO-8601 value");
  if (observedMs > nowMs) throw new Error("provider observation cannot be in the future");

  const ageMs = nowMs - observedMs;
  return Object.freeze({
    providerRef: snapshot.providerRef,
    state: ageMs > staleAfterMs ? "stale" : "current",
    evaluatedAt,
    lastObservedAt: snapshot.latestObservedAt,
    ageMs,
    staleAfterMs,
    latestStatus: snapshot.latestStatus,
  });
}
