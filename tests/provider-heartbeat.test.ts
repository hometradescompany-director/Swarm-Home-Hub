import { describe, expect, it } from "vitest";
import { projectProviderHeartbeat } from "../src/observability/provider-heartbeat.js";
import type { ProviderExecutionSnapshot } from "../src/observability/provider-execution.js";

const snapshot: ProviderExecutionSnapshot = {
  providerRef: "provider:x",
  observedResults: 1,
  counts: {
    refused_by_authority: 0,
    refused_by_boundary: 0,
    accepted: 0,
    completed: 1,
    failed: 0,
    refused: 0,
  },
  latestObservedAt: "2026-09-22T00:00:00.000Z",
  latestRequestId: "request:1",
  latestStatus: "completed",
};

describe("provider heartbeat", () => {
  it("measures evidence freshness independently of execution status", () => {
    expect(projectProviderHeartbeat(
      snapshot,"2026-09-22T00:00:05.000Z",10_000
    ).state).toBe("current");
    expect(projectProviderHeartbeat(
      snapshot,"2026-09-22T00:00:11.000Z",10_000
    ).state).toBe("stale");
  });
});
