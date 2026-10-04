import type { ExternalObservationProjection } from "./external-observation.js";

export type ObservationFreshnessState = "current" | "stale" | "unknown";

export interface ObservationFreshness {
  readonly subjectRef: string;
  readonly state: ObservationFreshnessState;
  readonly evaluatedAt: string;
  readonly lastCapturedAt: string | null;
  readonly ageMs: number | null;
  readonly staleAfterMs: number;
  readonly freshUntil: string | null;
  readonly receiptId: string | null;
}

export function projectObservationFreshness(
  subjectRef: string,
  observations: readonly ExternalObservationProjection[],
  evaluatedAt: string,
  staleAfterMs: number
): ObservationFreshness {
  const subject = subjectRef.trim();
  if (!subject) throw new Error("subjectRef must be non-empty");
  const nowMs = Date.parse(evaluatedAt);
  if (!Number.isFinite(nowMs)) throw new Error("evaluatedAt must be a valid ISO-8601 value");
  if (!Number.isInteger(staleAfterMs) || staleAfterMs < 1) {
    throw new Error("staleAfterMs must be a positive integer");
  }

  const matching = observations
    .filter((observation) => observation.subjectRef === subject)
    .slice()
    .sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));

  const latest = matching.at(-1);
  if (!latest) {
    return Object.freeze({
      subjectRef: subject,
      state: "unknown",
      evaluatedAt,
      lastCapturedAt: null,
      ageMs: null,
      staleAfterMs,
      freshUntil: null,
      receiptId: null,
    });
  }

  const capturedMs = Date.parse(latest.capturedAt);
  if (!Number.isFinite(capturedMs)) throw new Error("capturedAt must be a valid ISO-8601 value");
  if (capturedMs > nowMs) throw new Error("observation cannot be captured in the future");

  const ageMs = nowMs - capturedMs;
  return Object.freeze({
    subjectRef: subject,
    state: ageMs > staleAfterMs ? "stale" : "current",
    evaluatedAt,
    lastCapturedAt: latest.capturedAt,
    ageMs,
    staleAfterMs,
    freshUntil: new Date(capturedMs + staleAfterMs).toISOString(),
    receiptId: latest.receiptId,
  });
}
