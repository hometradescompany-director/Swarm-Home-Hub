import type { ExternalObservationProjection } from "./external-observation.js";

export interface AuditTimelineEntry extends ExternalObservationProjection {
  readonly sequence: number;
}

export function projectAuditTimeline(
  observations: readonly ExternalObservationProjection[]
): readonly AuditTimelineEntry[] {
  const seen = new Set<string>();
  const sorted = observations.slice().sort((a, b) => {
    const time = Date.parse(a.capturedAt) - Date.parse(b.capturedAt);
    return time !== 0 ? time : a.receiptId.localeCompare(b.receiptId);
  });

  return Object.freeze(sorted.map((observation, index) => {
    if (seen.has(observation.receiptId)) {
      throw new Error("duplicate receiptId in audit timeline: " + observation.receiptId);
    }
    seen.add(observation.receiptId);
    return Object.freeze({ ...observation, sequence: index + 1 });
  }));
}
