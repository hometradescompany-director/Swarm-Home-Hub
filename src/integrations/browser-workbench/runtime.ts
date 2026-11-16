import { chromium, type Browser, type Page } from "playwright";
import {
  createExternalExecutionObservationReceipt
} from "../execution-provider/execution-receipt.js";
import {
  createExternalExecutionRequest,
  executeWithExternalProvider,
  type ExternalExecutionProviderOutcome,
  type ExternalExecutionResult
} from "../execution-provider/contract.js";
import type { SwarmHomeExternalHandoff } from "../handoff/conformance.js";
import {
  BROWSER_WORKSHOP_ACTIONS,
  BROWSER_WORKSHOP_MAX_DURATION_MS,
  BROWSER_WORKSHOP_MAX_STEPS,
  BROWSER_WORKSHOP_SCENARIO,
  browserPlanDigest,
  browserRequestDigest,
  inspectBrowserWorkbenchReceipt,
  sha256,
  validateBrowserJobRequest,
  type BrowserArtifact,
  type BrowserJobPlan,
  type BrowserJobStatus,
  type BrowserStepObservation,
  type BrowserWorkbenchJob,
  type BrowserWorkbenchReceipt
} from "./contract.js";

const providerRef = "provider:local-chromium-workbench";
const capabilityRef = "capability:synthetic-workshop-browser";
const approvalAuthorityRef = "authority:synthetic-local-operator-approval";
const expectedSelection = "Cedar bench reserved for this synthetic workshop";
const maxStoredJobs = 20;

export interface BrowserWorkbenchStore {
  loadJobs(): Promise<readonly BrowserWorkbenchJob[]>;
  saveJobs(jobs: readonly BrowserWorkbenchJob[]): Promise<void>;
  saveArtifact(artifactRef: string, bytes: Uint8Array): Promise<void>;
  readArtifact(artifactRef: string): Promise<Uint8Array | undefined>;
  saveReceipt(requestId: string, receipt: BrowserWorkbenchReceipt): Promise<void>;
  readReceipt(requestId: string): Promise<unknown>;
}

export interface BrowserWorkbenchDriver {
  run(input: {
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
  }): Promise<{
    readonly browserVersion: string;
    readonly status: "completed" | "failed" | "cancelled" | "timed_out";
    readonly message: string;
    readonly verification?: {
      readonly sourceRef: string;
      readonly observed: string;
      readonly passed: boolean;
    };
  }>;
}

export class PlaywrightChromiumDriver implements BrowserWorkbenchDriver {
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
  }): Promise<{
    readonly browserVersion: string;
    readonly status: "completed" | "failed" | "cancelled" | "timed_out";
    readonly message: string;
    readonly verification?: {
      readonly sourceRef: string;
      readonly observed: string;
      readonly passed: boolean;
    };
  }> {
    let browser: Browser | undefined;
    let browserVersion = "unavailable";
    let verification:
      | { sourceRef: string; observed: string; passed: boolean }
      | undefined;
    const origin = new URL(input.targetRef).origin;
    const targetPath = new URL(input.targetRef).pathname;
    let abortBrowser: (() => void) | undefined;

    try {
      if (input.signal.aborted) throw input.signal.reason;
      browser = await chromium.launch({
        headless: true,
        args: [
          "--disable-background-networking",
          "--disable-component-update",
          "--disable-default-apps",
          "--disable-extensions",
          "--no-first-run"
        ]
      });
      abortBrowser = () => {
        void browser?.close().catch(() => undefined);
      };
      input.signal.addEventListener("abort", abortBrowser, { once: true });
      browserVersion = browser.version();
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        acceptDownloads: false,
        serviceWorkers: "block"
      });
      const page = await context.newPage();
      page.setDefaultTimeout(5_000);
      page.setDefaultNavigationTimeout(5_000);

      await context.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        const allowed =
          url.origin === origin &&
          ((url.pathname === targetPath &&
            (url.search === "" || url.search === "?choice=cedar")) ||
            (url.pathname === targetPath + ".css" && url.search === ""));
        if (allowed) await route.continue();
        else await route.abort("blockedbyclient");
      });

      const record = async (
        step: number,
        action: (typeof BROWSER_WORKSHOP_ACTIONS)[number],
        value: string
      ): Promise<BrowserStepObservation> => {
        const observation: BrowserStepObservation = Object.freeze({
          step,
          action,
          sourceKind: "chromium_observation",
          sourceRef: `browser-observation:${input.requestId}:${step}`,
          observedAt: new Date().toISOString(),
          value,
          standing: "direct_observation"
        });
        await input.onObservation(observation);
        return observation;
      };

      if (input.signal.aborted) throw input.signal.reason;
      await page.goto(input.targetRef, { waitUntil: "domcontentloaded" });
      const title = await page.getByRole("heading", {
        name: "Juniper Workshop"
      }).innerText();
      const initialStatus = await page.locator("#selection-state").innerText();
      if (!title.includes("Juniper Workshop") || !initialStatus.includes("No bench selected")) {
        throw new Error("scenario page did not expose its expected initial state");
      }
      await record(1, "observe", `${title.trim()} — ${initialStatus.trim()}`);
      await input.saveScreenshot("initial", await page.screenshot({
        fullPage: true,
        animations: "disabled"
      }));

      if (input.signal.aborted) throw input.signal.reason;
      await page.getByRole("link", {
        name: "Choose the Cedar bench"
      }).click();
      const selection = await page.locator("#selection-state").innerText();
      await record(2, "choose:cedar", `visible selection: ${selection.trim()}`);

      if (input.signal.aborted) throw input.signal.reason;
      const selectedText = await page.getByRole("status").innerText();
      const passed = selectedText.trim() === expectedSelection;
      verification = {
        sourceRef: `browser-observation:${input.requestId}:3`,
        observed: selectedText.trim(),
        passed
      };
      await record(3, "verify:cedar", selectedText.trim());
      await input.saveScreenshot("verified", await page.screenshot({
        fullPage: true,
        animations: "disabled"
      }));
      return {
        browserVersion,
        status: passed ? "completed" : "failed",
        message: passed
          ? "Chromium observed the requested reversible workshop choice."
          : "Chromium did not observe the expected workshop selection.",
        verification: {
          sourceRef: verification.sourceRef,
          observed: selectedText.trim(),
          passed
        }
      };
    } catch (error) {
      if (!browser) throw error;
      const reason = input.signal.aborted ? String(input.signal.reason) : "";
      return {
        browserVersion,
        status:
          reason === "timed_out"
            ? "timed_out"
            : reason === "cancelled"
              ? "cancelled"
              : "failed",
        message:
          reason ||
          (error instanceof Error ? error.message : "Chromium execution failed"),
        ...(verification ? { verification } : {})
      };
    } finally {
      if (abortBrowser) {
        input.signal.removeEventListener("abort", abortBrowser);
      }
      if (browser) await browser.close().catch(() => undefined);
    }
  }
}

type StartResult =
  | { readonly accepted: true; readonly duplicate: boolean; readonly job: BrowserWorkbenchJob }
  | { readonly accepted: false; readonly status: 400 | 409 | 429 | 503; readonly reason: string };

export class BrowserWorkbench {
  readonly #targetAllowlist: ReadonlySet<string>;
  readonly #store: BrowserWorkbenchStore;
  readonly #driver: BrowserWorkbenchDriver;
  readonly #maxExecutionDurationMs: number;
  readonly #jobs = new Map<string, BrowserWorkbenchJob>();
  readonly #controllers = new Map<string, AbortController>();
  #activeRequestId: string | undefined;
  #initialization: Promise<void> | undefined;

  constructor(input: {
    readonly targetAllowlist: readonly string[];
    readonly store: BrowserWorkbenchStore;
    readonly driver?: BrowserWorkbenchDriver;
    readonly maxExecutionDurationMs?: number;
  }) {
    this.#targetAllowlist = new Set(input.targetAllowlist);
    this.#store = input.store;
    this.#driver = input.driver ?? new PlaywrightChromiumDriver();
    this.#maxExecutionDurationMs =
      input.maxExecutionDurationMs ?? BROWSER_WORKSHOP_MAX_DURATION_MS;
    if (
      !Number.isSafeInteger(this.#maxExecutionDurationMs) ||
      this.#maxExecutionDurationMs <= 0 ||
      this.#maxExecutionDurationMs > BROWSER_WORKSHOP_MAX_DURATION_MS
    ) {
      throw new Error("browser workbench duration cannot exceed the beta cap");
    }
  }

  initialize(): Promise<void> {
    if (!this.#initialization) {
      this.#initialization = this.#restore();
    }
    return this.#initialization;
  }

  async #restore(): Promise<void> {
    const saved = await this.#store.loadJobs();
    if (saved.length > maxStoredJobs) {
      throw new Error("browser workbench state exceeds its bounded job history");
    }
    for (const job of saved) {
      const request = validateBrowserJobRequest(job?.request);
      if (
        !request.accepted ||
        request.request.requestId !== job.request.requestId ||
        !/^[a-f0-9]{64}$/.test(job.requestDigest) ||
        (await browserRequestDigest(request.request)) !== job.requestDigest ||
        this.#jobs.has(job.request.requestId)
      ) {
        throw new Error("browser workbench state is malformed");
      }
      this.#jobs.set(
        job.request.requestId,
        job.status === "running"
          ? {
              ...job,
              status: "failed",
              message:
                "The local runtime stopped during this job; it was not replayed."
            }
          : job
      );
    }
    await this.#saveJobs();
  }

  async start(value: unknown): Promise<StartResult> {
    await this.initialize();
    const parsed = validateBrowserJobRequest(value);
    if (!parsed.accepted) {
      return { accepted: false, status: 400, reason: parsed.reason };
    }
    const request = parsed.request;
    const requestDigest = await browserRequestDigest(request);
    const existing = this.#jobs.get(request.requestId);
    if (existing) {
      if (existing.requestDigest !== requestDigest) {
        return {
          accepted: false,
          status: 409,
          reason: "request identity was already used with a different payload"
        };
      }
      return { accepted: true, duplicate: true, job: existing };
    }
    if (!this.#targetAllowlist.has(request.targetRef)) {
      return {
        accepted: false,
        status: 400,
        reason: "target is outside the browser workbench allowlist"
      };
    }
    if (this.#activeRequestId) {
      return {
        accepted: false,
        status: 409,
        reason: "another browser workbench job is active"
      };
    }
    if (this.#jobs.size >= maxStoredJobs) {
      return {
        accepted: false,
        status: 429,
        reason: "bounded browser job history is full"
      };
    }

    const job: BrowserWorkbenchJob = Object.freeze({
      request,
      requestDigest,
      status: "reviewed",
      currentStep: 0,
      observations: Object.freeze([]),
      artifacts: Object.freeze([])
    });
    const controller = new AbortController();
    this.#jobs.set(request.requestId, job);
    this.#controllers.set(request.requestId, controller);
    this.#activeRequestId = request.requestId;
    try {
      await this.#saveJobs();
    } catch {
      this.#jobs.delete(request.requestId);
      this.#controllers.delete(request.requestId);
      this.#activeRequestId = undefined;
      return {
        accepted: false,
        status: 503,
        reason: "browser workbench state could not be saved"
      };
    }
    void this.#execute(job, controller).catch((error) =>
      console.error("browser workbench state persistence failed", error)
    );
    return { accepted: true, duplicate: false, job };
  }

  get(requestId: string): BrowserWorkbenchJob | undefined {
    return this.#jobs.get(requestId);
  }

  async cancel(requestId: string): Promise<boolean> {
    await this.initialize();
    const controller = this.#controllers.get(requestId);
    if (!controller || this.#activeRequestId !== requestId) return false;
    controller.abort("cancelled");
    return true;
  }

  async artifact(artifactRef: string): Promise<Uint8Array | undefined> {
    await this.initialize();
    if (
      !Array.from(this.#jobs.values()).some((job) =>
        job.artifacts.some((artifact) => artifact.artifactRef === artifactRef)
      )
    ) {
      return undefined;
    }
    return this.#store.readArtifact(artifactRef);
  }

  async receipt(requestId: string): Promise<unknown> {
    await this.initialize();
    const job = this.#jobs.get(requestId);
    if (!job?.receipt) return undefined;
    return this.#store.readReceipt(requestId);
  }

  async replay(requestId: string): Promise<
    | { readonly valid: true; readonly requestId: string }
    | { readonly valid: false; readonly requestId: string; readonly reason: string }
  > {
    await this.initialize();
    const job = this.#jobs.get(requestId);
    if (!job?.receipt || !job.result?.providerExecutionRef) {
      return {
        valid: false,
        requestId,
        reason: "no attributable browser execution receipt is available"
      };
    }
    const persistedReceipt = await this.#store.readReceipt(requestId);
    const validation = await inspectBrowserWorkbenchReceipt({
      value: persistedReceipt,
      request: job.request,
      readArtifact: (artifactRef) => this.artifact(artifactRef)
    });
    if (!validation.valid) {
      return { valid: false, requestId, reason: validation.reason };
    }
    return { valid: true, requestId };
  }

  async #saveJobs(): Promise<void> {
    await this.#store.saveJobs(Array.from(this.#jobs.values()));
  }

  async #update(
    requestId: string,
    update: (job: BrowserWorkbenchJob) => BrowserWorkbenchJob
  ): Promise<BrowserWorkbenchJob> {
    const current = this.#jobs.get(requestId);
    if (!current) throw new Error("browser workbench job disappeared");
    const next = Object.freeze(update(current));
    this.#jobs.set(requestId, next);
    await this.#saveJobs();
    return next;
  }

  async #execute(
    initialJob: BrowserWorkbenchJob,
    controller: AbortController
  ): Promise<void> {
    const request = initialJob.request;
    const requestId = request.requestId;
    const now = Date.now();
    const timeUntilExpiry = Date.parse(request.expiresAt) - now;
    const timeoutMs = Math.max(
      0,
      Math.min(this.#maxExecutionDurationMs, timeUntilExpiry)
    );
    const timeout = setTimeout(() => controller.abort("timed_out"), timeoutMs);

    try {
      await this.#update(requestId, (job) => ({ ...job, status: "running" }));
      const handoff: SwarmHomeExternalHandoff = {
        schema: "SwarmHomeExternalHandoff/v1",
        sourceResidenceRef: "residence:synthetic-browser-workbench",
        sourceEventRef: `event:synthetic-browser-approval:${requestId}`,
        agentIdentityRef: "identity:synthetic-local-operator",
        capabilityRefs: [capabilityRef],
        offeringRefs: ["offering:local-chromium-workbench"],
        relationalContextRefs: [],
        generatedAt: request.requestedAt,
        freshUntil: request.expiresAt,
        authorityImplication: "none"
      };
      const executionRequest = createExternalExecutionRequest({
        requestId,
        providerRef,
        capabilityRef,
        instructionRef: BROWSER_WORKSHOP_SCENARIO,
        evidenceReceiptIds: [],
        handoff,
        requestedAt: request.requestedAt,
        expiresAt: request.expiresAt
      });
      const planDigest = await browserPlanDigest(request);
      let verification:
        | { sourceRef: string; observed: string; passed: boolean }
        | undefined;
      let browserVersion = "not launched";

      const result = await executeWithExternalProvider({
        request: executionRequest,
        provider: {
          providerRef,
          execute: async (): Promise<ExternalExecutionProviderOutcome> => {
            const driverResult = await this.#driver.run({
              requestId,
              targetRef: request.targetRef,
              signal: controller.signal,
              onObservation: async (observation) => {
                await this.#update(requestId, (job) => ({
                  ...job,
                  currentStep: observation.step,
                  observations: Object.freeze([
                    ...job.observations,
                    observation
                  ])
                }));
              },
              saveScreenshot: async (kind, bytes) => {
                if (controller.signal.aborted) throw controller.signal.reason;
                const requestKey = await sha256(
                  new TextEncoder().encode(requestId)
                );
                const artifactRef =
                  `artifact:browser-workbench:${requestKey}:${kind}`;
                const fileName = `${requestKey.slice(0, 24)}-${kind}.png`;
                const sha = await sha256(bytes);
                const artifact: BrowserArtifact = Object.freeze({
                  artifactRef,
                  fileName,
                  mediaType: "image/png",
                  byteLength: bytes.byteLength,
                  sha256: sha
                });
                await this.#store.saveArtifact(artifactRef, bytes);
                await this.#update(requestId, (job) => ({
                  ...job,
                  artifacts: Object.freeze([...job.artifacts, artifact])
                }));
                return artifact;
              }
            });
            browserVersion = driverResult.browserVersion;
            verification = driverResult.verification;
            return {
              providerExecutionRef: `browser:chromium:${requestId}`,
              status: driverResult.status,
              resultRefs:
                this.#jobs
                  .get(requestId)
                  ?.artifacts.map((artifact) => artifact.artifactRef) ?? [],
              evidenceReceiptIds: [],
              observedAt: new Date().toISOString(),
              message: driverResult.message
            };
          }
        },
        authorize: async () => {
          const approvalAt = Date.parse(request.approval.approvedAt);
          const approvedPlanDigest = await browserPlanDigest(request);
          const allowed =
            request.approval.approved &&
            request.approval.planDigest === approvedPlanDigest &&
            approvalAt >= Date.parse(request.requestedAt) &&
            approvalAt <= Date.now() &&
            approvalAt <= Date.parse(request.expiresAt);
          return {
            allowed,
            authorityRef: allowed
              ? approvalAuthorityRef
              : "authority:synthetic-local-operator-denial",
            decidedAt: new Date().toISOString(),
            reason: allowed
              ? "operator reviewed and approved the displayed synthetic job plan"
              : "operator approval is missing, stale or does not match the reviewed plan"
          };
        },
        observedAt: new Date().toISOString()
      });

      await this.#update(requestId, (job) => ({
        ...job,
        result
      }));
      if (result.status === "refused_by_authority") {
        await this.#update(requestId, (job) => ({
          ...job,
          status: "refused_by_authority",
          ...(result.message ? { message: result.message } : {})
        }));
        return;
      }
      if (result.status === "refused_by_boundary") {
        await this.#update(requestId, (job) => ({
          ...job,
          status: "refused_by_boundary",
          ...(result.message ? { message: result.message } : {})
        }));
        return;
      }
      if (!result.providerExecutionRef) {
        await this.#update(requestId, (job) => ({
          ...job,
          status: "failed",
          message: "Chromium did not return an attributable execution reference."
        }));
        return;
      }

      const job = this.#jobs.get(requestId);
      if (!job) throw new Error("browser workbench job disappeared");
      const finalArtifact = job.artifacts.at(-1);
      const provenance = createExternalExecutionObservationReceipt({
        receiptId: `receipt:browser-workbench:${requestId}`,
        result,
        ...(finalArtifact
          ? { contentHash: "sha256:" + finalArtifact.sha256 }
          : {})
      });
      const receipt: BrowserWorkbenchReceipt = Object.freeze({
        schema: "SwarmHomeBrowserWorkbenchReceipt/v1",
        receiptId: provenance.id,
        requestId,
        requestDigest: job.requestDigest,
        targetRef: request.targetRef,
        sourceEvents: Object.freeze([
          Object.freeze({
            sourceRef: handoff.sourceEventRef,
            standing: "synthetic_handoff_reference",
            persisted: false
          })
        ]),
        derivedState: null,
        scenario: Object.freeze({
          ref: BROWSER_WORKSHOP_SCENARIO,
          standing: "synthetic_fixture",
          description:
            "Fictional workshop fixture; no World Weaver or Reality Generator records are imported."
        }),
        authority: Object.freeze({
          ref: result.authorityRef,
          standing: "synthetic_local_operator_approval"
        }),
        execution: Object.freeze({
          providerRef,
          providerExecutionRef: result.providerExecutionRef,
          status: result.status,
          browserVersion
        }),
        observations: job.observations,
        verification: Object.freeze({
          sourceRef: verification?.sourceRef ?? null,
          expected: expectedSelection,
          observed: verification?.observed ?? null,
          passed: verification?.passed ?? null
        }),
        artifacts: job.artifacts,
        provenance,
        unobserved: Object.freeze([
          "Atlas identity and authority were not queried; this was a synthetic local host decision.",
          "World Weaver and Reality Generator were not contacted; the workshop is a local fixture.",
          "No hosted customer policy, authentication or persistence was exercised."
        ]),
        capturedAt: provenance.capturedAt
      });
      await this.#store.saveReceipt(requestId, receipt);
      const validation = await inspectBrowserWorkbenchReceipt({
        value: await this.#store.readReceipt(requestId),
        request,
        readArtifact: (artifactRef) => this.#store.readArtifact(artifactRef)
      });
      if (!validation.valid) {
        await this.#update(requestId, (current) => ({
          ...current,
          status: "failed",
          receipt,
          message: "receipt validation failed: " + validation.reason
        }));
        return;
      }
      const status: BrowserJobStatus =
        result.status === "completed" &&
        driverVerificationPassed(receipt)
          ? "completed"
          : result.status === "cancelled"
            ? "cancelled"
            : result.status === "timed_out"
              ? "timed_out"
              : "failed";
      await this.#update(requestId, (current) => ({
        ...current,
        status,
        receipt,
        ...(result.message ? { message: result.message } : {})
      }));
    } catch (error) {
      const reason = controller.signal.aborted
        ? String(controller.signal.reason)
        : error instanceof Error
          ? error.message
          : "browser workbench execution failed";
      const current = this.#jobs.get(requestId);
      if (current) {
        await this.#update(requestId, (job) => ({
          ...job,
          status:
            reason === "timed_out"
              ? "timed_out"
              : reason === "cancelled"
                ? "cancelled"
                : "failed",
          message: reason
        }));
      }
    } finally {
      clearTimeout(timeout);
      this.#controllers.delete(requestId);
      if (this.#activeRequestId === requestId) {
        this.#activeRequestId = undefined;
      }
    }
  }
}

function driverVerificationPassed(receipt: BrowserWorkbenchReceipt): boolean {
  return (
    receipt.verification.passed === true &&
    receipt.verification.expected === receipt.verification.observed
  );
}
