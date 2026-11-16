import { describe, expect, it } from "vitest";
import {
  BROWSER_WORKSHOP_ACTIONS,
  BROWSER_WORKSHOP_MAX_DURATION_MS,
  BROWSER_WORKSHOP_MAX_STEPS,
  BROWSER_WORKSHOP_SCENARIO,
  browserPlanDigest,
  type BrowserArtifact,
  type BrowserJobPlan,
  type BrowserStepObservation,
  type BrowserWorkbenchJob,
  type BrowserWorkbenchReceipt
} from "../src/integrations/browser-workbench/contract.js";
import {
  BrowserWorkbench,
  type BrowserWorkbenchDriver,
  type BrowserWorkbenchStore
} from "../src/integrations/browser-workbench/runtime.js";

const target = "http://127.0.0.1:8787/workbench/scenario/workshop";
const selected = "Cedar bench reserved for this synthetic workshop";

class MemoryStore implements BrowserWorkbenchStore {
  jobs: readonly BrowserWorkbenchJob[] = [];
  readonly artifacts = new Map<string, Uint8Array>();
  readonly receipts = new Map<string, unknown>();

  async loadJobs() {
    return this.jobs;
  }

  async saveJobs(jobs: readonly BrowserWorkbenchJob[]) {
    this.jobs = structuredClone(jobs);
  }

  async saveArtifact(artifactRef: string, bytes: Uint8Array) {
    this.artifacts.set(artifactRef, bytes.slice());
  }

  async readArtifact(artifactRef: string) {
    return this.artifacts.get(artifactRef)?.slice();
  }

  async saveReceipt(requestId: string, receipt: BrowserWorkbenchReceipt) {
    this.receipts.set(requestId, structuredClone(receipt));
  }

  async readReceipt(requestId: string) {
    return structuredClone(this.receipts.get(requestId));
  }
}

class TestDriver implements BrowserWorkbenchDriver {
  calls = 0;
  entered: (() => void) | undefined;
  block = false;

  async run(input: {
    readonly requestId: string;
    readonly targetRef: string;
    readonly signal: AbortSignal;
    readonly onObservation: (
      observation: BrowserStepObservation
    ) => Promise<void>;
    readonly saveScreenshot: (
      kind: "initial" | "verified",
      bytes: Uint8Array
    ) => Promise<BrowserArtifact>;
  }) {
    this.calls += 1;
    this.entered?.();
    if (this.block) {
      if (input.signal.aborted) {
        return {
          browserVersion: "test-only fake driver",
          status: input.signal.reason === "timed_out" ? "timed_out" as const : "cancelled" as const,
          message: String(input.signal.reason)
        };
      }
      return await new Promise<{
        readonly browserVersion: string;
        readonly status: "cancelled" | "timed_out";
        readonly message: string;
      }>((resolve) => {
        input.signal.addEventListener(
          "abort",
          () =>
            resolve({
              browserVersion: "test-only fake driver",
              status:
                input.signal.reason === "timed_out" ? "timed_out" : "cancelled",
              message: String(input.signal.reason)
            }),
          { once: true }
        );
      });
    }

    const observations: BrowserStepObservation[] = [
      {
        step: 1,
        action: "observe",
        sourceKind: "chromium_observation",
        sourceRef: `browser-observation:${input.requestId}:1`,
        observedAt: new Date().toISOString(),
        value: "Juniper Workshop — No bench selected",
        standing: "direct_observation"
      },
      {
        step: 2,
        action: "choose:cedar",
        sourceKind: "chromium_observation",
        sourceRef: `browser-observation:${input.requestId}:2`,
        observedAt: new Date().toISOString(),
        value: `visible selection: ${selected}`,
        standing: "direct_observation"
      },
      {
        step: 3,
        action: "verify:cedar",
        sourceKind: "chromium_observation",
        sourceRef: `browser-observation:${input.requestId}:3`,
        observedAt: new Date().toISOString(),
        value: selected,
        standing: "direct_observation"
      }
    ];
    for (const observation of observations) {
      await input.onObservation(observation);
    }
    await input.saveScreenshot("initial", new TextEncoder().encode("test-only initial"));
    await input.saveScreenshot("verified", new TextEncoder().encode("test-only verified"));
    return {
      browserVersion: "test-only fake driver",
      status: "completed" as const,
      message: "test-only injected driver completed",
      verification: {
        sourceRef: observations[2]!.sourceRef,
        observed: selected,
        passed: true
      }
    };
  }
}

async function request(
  requestId: string,
  overrides: Partial<{
    readonly targetRef: string;
    readonly requestedAt: string;
    readonly expiresAt: string;
    readonly approved: boolean;
    readonly maxSteps: number;
  }> = {}
): Promise<BrowserJobPlan> {
  const requestedAt =
    overrides.requestedAt ?? new Date(Date.now() - 1_000).toISOString();
  const expiresAt =
    overrides.expiresAt ?? new Date(Date.now() + 60_000).toISOString();
  const basePlan = {
    schema: "SwarmHomeBrowserJob/v1" as const,
    requestId,
    targetRef: overrides.targetRef ?? target,
    requestedAt,
    expiresAt,
    actions: BROWSER_WORKSHOP_ACTIONS,
    maxSteps: overrides.maxSteps ?? BROWSER_WORKSHOP_MAX_STEPS,
    maxDurationMs: BROWSER_WORKSHOP_MAX_DURATION_MS
  };
  return {
    ...basePlan,
    approval: {
      approved: overrides.approved ?? true,
      planDigest: await browserPlanDigest(basePlan),
      approvedAt: new Date().toISOString()
    }
  } as BrowserJobPlan;
}

function service(
  driver: BrowserWorkbenchDriver,
  store = new MemoryStore(),
  maxExecutionDurationMs?: number
) {
  return {
    workbench: new BrowserWorkbench({
      targetAllowlist: [target],
      driver,
      store,
      ...(maxExecutionDurationMs ? { maxExecutionDurationMs } : {})
    }),
    store
  };
}

async function waitForStatus(
  workbench: BrowserWorkbench,
  requestId: string,
  expected: string
): Promise<BrowserWorkbenchJob> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const job = workbench.get(requestId);
    if (job?.status === expected) return job;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`browser job did not reach ${expected}`);
}

describe("bounded synthetic Chromium workbench", () => {
  it("fails closed for malformed, unapproved and non-allowlisted jobs", async () => {
    const driver = new TestDriver();
    const { workbench } = service(driver);
    const valid = await request("browser_job_malformed");

    expect(
      await workbench.start({
        ...valid,
        actions: ["open:anywhere"]
      })
    ).toMatchObject({ accepted: false, status: 400 });
    expect(
      await workbench.start(
        await request("browser_job_outside", {
          targetRef: "https://example.com/"
        })
      )
    ).toMatchObject({ accepted: false, status: 400 });

    const denied = await request("browser_job_denied", { approved: false });
    const deniedStart = await workbench.start(denied);
    expect(deniedStart.accepted).toBe(true);
    const deniedJob = await waitForStatus(
      workbench,
      denied.requestId,
      "refused_by_authority"
    );
    expect(deniedJob.result?.status).toBe("refused_by_authority");
    expect(driver.calls).toBe(0);
  });

  it("refuses expired requests before consulting the browser driver", async () => {
    const driver = new TestDriver();
    const { workbench } = service(driver);
    const requestedAt = new Date(Date.now() - 120_000).toISOString();
    const expiresAt = new Date(Date.now() - 60_000).toISOString();
    const expired = await request("browser_job_expired", {
      requestedAt,
      expiresAt
    });

    expect(await workbench.start(expired)).toMatchObject({ accepted: true });
    const job = await waitForStatus(
      workbench,
      expired.requestId,
      "refused_by_boundary"
    );
    expect(job.message).toMatch(/expired/);
    expect(driver.calls).toBe(0);
  });

  it("does not invent a browser execution receipt when Chromium fails to launch", async () => {
    let launchAttempts = 0;
    const driver: BrowserWorkbenchDriver = {
      async run() {
        launchAttempts += 1;
        throw new Error("Chromium failed to launch");
      }
    };
    const { workbench } = service(driver);
    const approved = await request("browser_job_launch_failure");

    await workbench.start(approved);
    const job = await waitForStatus(
      workbench,
      approved.requestId,
      "failed"
    );
    expect(launchAttempts).toBe(1);
    expect(job.message).toMatch(/failed to launch/);
    expect(job.result).toBeUndefined();
    expect(job.receipt).toBeUndefined();
  });

  it("does not repeat an approved request and surfaces identity conflicts", async () => {
    const driver = new TestDriver();
    const { workbench, store } = service(driver);
    const approved = await request("browser_job_idempotent");

    const first = await workbench.start(approved);
    expect(first.accepted).toBe(true);
    await waitForStatus(workbench, approved.requestId, "completed");
    const duplicate = await workbench.start(approved);
    expect(duplicate).toMatchObject({ accepted: true, duplicate: true });
    expect(driver.calls).toBe(1);
    const restoredDriver = new TestDriver();
    const restored = service(restoredDriver, store).workbench;
    expect(await restored.start(approved)).toMatchObject({
      accepted: true,
      duplicate: true
    });
    expect(restoredDriver.calls).toBe(0);

    const changed = await request(approved.requestId, {
      expiresAt: new Date(Date.now() + 90_000).toISOString()
    });
    expect(await workbench.start(changed)).toMatchObject({
      accepted: false,
      status: 409,
      reason: expect.stringMatching(/different payload/)
    });
    expect(driver.calls).toBe(1);
  });

  it("validates receipt references and detects tampered artifact bytes", async () => {
    const driver = new TestDriver();
    const { workbench, store } = service(driver);
    const approved = await request("browser_job_evidence");

    await workbench.start(approved);
    const job = await waitForStatus(
      workbench,
      approved.requestId,
      "completed"
    );
    expect(await workbench.replay(approved.requestId)).toEqual({
      valid: true,
      requestId: approved.requestId
    });
    expect(job.receipt?.scenario).toMatchObject({
      ref: BROWSER_WORKSHOP_SCENARIO,
      standing: "synthetic_fixture"
    });
    expect(job.receipt).toMatchObject({
      sourceEvents: [
        {
          standing: "synthetic_handoff_reference",
          persisted: false
        }
      ],
      derivedState: null
    });

    const artifact = job.artifacts[0]!;
    store.artifacts.set(artifact.artifactRef, new Uint8Array([0, 1, 2]));
    expect(await workbench.replay(approved.requestId)).toMatchObject({
      valid: false,
      reason: "artifact_length_mismatch"
    });

    store.artifacts.set(artifact.artifactRef, new Uint8Array([1, 2, 3]));
    const receipt = store.receipts.get(approved.requestId) as BrowserWorkbenchReceipt;
    store.receipts.set(approved.requestId, {
      ...receipt,
      provenance: {
        ...receipt.provenance,
        sourceRef: "browser:another-request"
      }
    });
    expect(await workbench.replay(approved.requestId)).toMatchObject({
      valid: false,
      reason: "execution_provenance_mismatch"
    });
  });

  it("allows one active job to be cancelled without starting a second", async () => {
    const driver = new TestDriver();
    driver.block = true;
    let entered = false;
    driver.entered = () => {
      entered = true;
    };
    const { workbench } = service(driver);
    const first = await request("browser_job_cancelled");
    await workbench.start(first);
    for (let attempt = 0; attempt < 100 && !entered; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(entered).toBe(true);
    expect(
      await workbench.start(await request("browser_job_second"))
    ).toMatchObject({ accepted: false, status: 409 });
    expect(await workbench.cancel(first.requestId)).toBe(true);
    expect(await waitForStatus(workbench, first.requestId, "cancelled")).toBeTruthy();
    expect(driver.calls).toBe(1);
  });

  it("stops a job at its execution deadline", async () => {
    const driver = new TestDriver();
    driver.block = true;
    const { workbench } = service(driver, new MemoryStore(), 10);
    const requestWithDeadline = await request("browser_job_timed_out");

    await workbench.start(requestWithDeadline);
    const job = await waitForStatus(
      workbench,
      requestWithDeadline.requestId,
      "timed_out"
    );
    expect(job.message).toBe("timed_out");
    expect(driver.calls).toBe(1);
  });

  it("rejects a caller-supplied step cap outside the fixed beta limit", async () => {
    const driver = new TestDriver();
    const { workbench } = service(driver);
    const malformed = {
      ...(await request("browser_job_bad_cap")),
      maxSteps: BROWSER_WORKSHOP_MAX_STEPS + 1
    };
    expect(await workbench.start(malformed)).toMatchObject({
      accepted: false,
      status: 400
    });
    expect(driver.calls).toBe(0);
  });
});
