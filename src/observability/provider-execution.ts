import type { ExternalExecutionResult } from "../integrations/execution-provider/contract.js";

export type ProviderExecutionStatus = ExternalExecutionResult["status"];

export interface ProviderExecutionSnapshot {
  readonly providerRef: string;
  readonly observedResults: number;
  readonly counts: Readonly<Record<ProviderExecutionStatus, number>>;
  readonly latestObservedAt: string | null;
  readonly latestRequestId: string | null;
  readonly latestStatus: ProviderExecutionStatus | null;
}

const STATUSES: readonly ProviderExecutionStatus[] = [
  "refused_by_authority",
  "refused_by_boundary",
  "accepted",
  "completed",
  "failed",
  "refused",
];

export function projectProviderExecutionSnapshot(
  providerRef: string,
  results: readonly ExternalExecutionResult[]
): ProviderExecutionSnapshot {
  const provider = providerRef.trim();
  if (!provider) throw new Error("providerRef must be non-empty");

  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<
    ProviderExecutionStatus,
    number
  >;
  const seen = new Set<string>();
  const matching = results
    .filter((result) => result.providerRef === provider)
    .slice()
    .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));

  for (const result of matching) {
    if (!Number.isFinite(Date.parse(result.observedAt))) {
      throw new Error("execution result observedAt must be a valid ISO-8601 value");
    }
    if (seen.has(result.requestId)) {
      throw new Error("duplicate requestId in provider snapshot: " + result.requestId);
    }
    seen.add(result.requestId);
    counts[result.status] += 1;
  }

  const latest = matching.at(-1) ?? null;
  return Object.freeze({
    providerRef: provider,
    observedResults: matching.length,
    counts: Object.freeze({ ...counts }),
    latestObservedAt: latest?.observedAt ?? null,
    latestRequestId: latest?.requestId ?? null,
    latestStatus: latest?.status ?? null,
  });
}
