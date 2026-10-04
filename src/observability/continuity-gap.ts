import type { AuditTimelineEntry } from "./audit-timeline.js";

export interface ContinuityGapCandidate {
  readonly subjectRef: string;
  readonly beforeReceiptId: string;
  readonly afterReceiptId: string;
  readonly gapMs: number;
  readonly thresholdMs: number;
  readonly standing: "candidate_gap";
}

export function projectContinuityGapCandidates(
  timeline: readonly AuditTimelineEntry[],
  thresholdMs: number
): readonly ContinuityGapCandidate[] {
  if (!Number.isInteger(thresholdMs) || thresholdMs < 1) {
    throw new Error("thresholdMs must be a positive integer");
  }

  const bySubject = new Map<string, AuditTimelineEntry[]>();
  for (const entry of timeline) {
    const group = bySubject.get(entry.subjectRef) ?? [];
    group.push(entry);
    bySubject.set(entry.subjectRef, group);
  }

  const gaps: ContinuityGapCandidate[] = [];
  for (const [subjectRef, entries] of bySubject) {
    const ordered = entries.slice().sort(
      (a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt)
    );
    for (let index = 1; index < ordered.length; index += 1) {
      const before = ordered[index - 1]!;
      const after = ordered[index]!;
      const beforeMs = Date.parse(before.capturedAt);
      const afterMs = Date.parse(after.capturedAt);
      if (!Number.isFinite(beforeMs) || !Number.isFinite(afterMs)) {
        throw new Error("timeline capturedAt must be a valid ISO-8601 value");
      }
      const gapMs = afterMs - beforeMs;
      if (gapMs > thresholdMs) {
        gaps.push(Object.freeze({
          subjectRef,
          beforeReceiptId: before.receiptId,
          afterReceiptId: after.receiptId,
          gapMs,
          thresholdMs,
          standing: "candidate_gap",
        }));
      }
    }
  }

  return Object.freeze(gaps);
}
