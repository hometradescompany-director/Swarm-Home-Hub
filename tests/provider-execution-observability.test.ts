import { describe, expect, it } from "vitest";
import { projectProviderExecutionSnapshot } from "../src/observability/provider-execution.js";
import type { ExternalExecutionResult } from "../src/integrations/execution-provider/contract.js";

const result = (requestId: string, status: ExternalExecutionResult["status"], observedAt: string): ExternalExecutionResult => ({
  schema: "SwarmHomeExternalExecutionResult/v1",
  requestId,
  providerRef: "provider:x",
  capabilityRef: "capability:run",
  authorityRef: "authority:x",
  status,
  resultRefs: [],
  evidenceReceiptIds: [],
  observedAt,
});

describe("provider execution observability", () => {
  it("projects bounded counts and latest status without creating provider state", () => {
    const snapshot = projectProviderExecutionSnapshot("provider:x", [
      result("request:1","completed","2026-09-22T00:00:00.000Z"),
      result("request:2","failed","2026-09-22T00:01:00.000Z"),
    ]);
    expect(snapshot.observedResults).toBe(2);
    expect(snapshot.counts.completed).toBe(1);
    expect(snapshot.counts.failed).toBe(1);
    expect(snapshot.latestStatus).toBe("failed");
  });
});
