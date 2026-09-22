import type { SourceProvenanceReceipt } from "../refinery/source-provenance.js";

export type SourceDriftStanding =
  | "unchanged"
  | "commit_changed"
  | "license_changed"
  | "commit_and_license_changed";

export interface SourceDrift {
  readonly repoRef: string;
  readonly standing: SourceDriftStanding;
  readonly beforeCommitSha: string;
  readonly afterCommitSha: string;
  readonly beforeSourceRef: string;
  readonly afterSourceRef: string;
}

function licenseKey(receipt: SourceProvenanceReceipt): string {
  return [receipt.licenseStanding, receipt.licenseId ?? ""].join(":");
}

export function compareSourceProvenance(
  before: SourceProvenanceReceipt,
  after: SourceProvenanceReceipt
): SourceDrift {
  if (before.repoRef !== after.repoRef) {
    throw new Error("source drift comparison requires the same repoRef");
  }
  const beforeMs = Date.parse(before.observedAt);
  const afterMs = Date.parse(after.observedAt);
  if (!Number.isFinite(beforeMs) || !Number.isFinite(afterMs) || afterMs < beforeMs) {
    throw new Error("source drift observations must be chronologically ordered");
  }

  const commitChanged = before.commitSha !== after.commitSha;
  const licenseChanged = licenseKey(before) !== licenseKey(after);
  const standing: SourceDriftStanding =
    commitChanged && licenseChanged
      ? "commit_and_license_changed"
      : commitChanged
        ? "commit_changed"
        : licenseChanged
          ? "license_changed"
          : "unchanged";

  return Object.freeze({
    repoRef: before.repoRef,
    standing,
    beforeCommitSha: before.commitSha,
    afterCommitSha: after.commitSha,
    beforeSourceRef: before.sourceRef,
    afterSourceRef: after.sourceRef,
  });
}
