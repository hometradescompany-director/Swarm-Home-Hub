import type { ExternalExecutionResult } from "../execution-provider/contract.js";
import type { ProvenanceReceipt } from "../../provenance/receipt.js";

export const SWARM_HOME_BROWSER_JOB = "SwarmHomeBrowserJob/v1" as const;
export const SWARM_HOME_BROWSER_RECEIPT =
  "SwarmHomeBrowserWorkbenchReceipt/v1" as const;
export const BROWSER_WORKSHOP_SCENARIO =
  "scenario:synthetic:fresh-workshop:local-fixture:v1";
export const BROWSER_WORKSHOP_EXPECTED_SELECTION =
  "Cedar bench reserved for this synthetic workshop";
export const BROWSER_WORKSHOP_ACTIONS = Object.freeze([
  "observe",
  "choose:cedar",
  "verify:cedar"
] as const);
export const BROWSER_WORKSHOP_MAX_STEPS = 3;
export const BROWSER_WORKSHOP_MAX_DURATION_MS = 30_000;

export interface BrowserJobPlan {
  readonly schema: typeof SWARM_HOME_BROWSER_JOB;
  readonly requestId: string;
  readonly targetRef: string;
  readonly requestedAt: string;
  readonly expiresAt: string;
  readonly actions: typeof BROWSER_WORKSHOP_ACTIONS;
  readonly maxSteps: typeof BROWSER_WORKSHOP_MAX_STEPS;
  readonly maxDurationMs: typeof BROWSER_WORKSHOP_MAX_DURATION_MS;
  readonly approval: {
    readonly approved: boolean;
    readonly planDigest: string;
    readonly approvedAt: string;
  };
}

export interface BrowserStepObservation {
  readonly step: number;
  readonly action: (typeof BROWSER_WORKSHOP_ACTIONS)[number];
  readonly sourceKind: "chromium_observation";
  readonly sourceRef: string;
  readonly observedAt: string;
  readonly value: string;
  readonly standing: "direct_observation";
}

export interface BrowserArtifact {
  readonly artifactRef: string;
  readonly fileName: string;
  readonly mediaType: "image/png";
  readonly byteLength: number;
  readonly sha256: string;
}

export interface BrowserWorkbenchReceipt {
  readonly schema: typeof SWARM_HOME_BROWSER_RECEIPT;
  readonly receiptId: string;
  readonly requestId: string;
  readonly requestDigest: string;
  readonly targetRef: string;
  readonly sourceEvents: readonly {
    readonly sourceRef: string;
    readonly standing: "synthetic_handoff_reference";
    readonly persisted: false;
  }[];
  readonly derivedState: null;
  readonly scenario: {
    readonly ref: typeof BROWSER_WORKSHOP_SCENARIO;
    readonly standing: "synthetic_fixture";
    readonly description: string;
  };
  readonly authority: {
    readonly ref: string;
    readonly standing: "synthetic_local_operator_approval";
  };
  readonly execution: {
    readonly providerRef: string;
    readonly providerExecutionRef: string;
    readonly status: ExternalExecutionResult["status"];
    readonly browserVersion: string;
  };
  readonly observations: readonly BrowserStepObservation[];
  readonly verification: {
    readonly sourceRef: string | null;
    readonly expected: string;
    readonly observed: string | null;
    readonly passed: boolean | null;
  };
  readonly artifacts: readonly BrowserArtifact[];
  readonly provenance: ProvenanceReceipt;
  readonly unobserved: readonly string[];
  readonly capturedAt: string;
}

export type BrowserJobStatus =
  | "reviewed"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "timed_out"
  | "refused_by_authority"
  | "refused_by_boundary";

export interface BrowserWorkbenchJob {
  readonly request: BrowserJobPlan;
  readonly requestDigest: string;
  readonly status: BrowserJobStatus;
  readonly currentStep: number;
  readonly observations: readonly BrowserStepObservation[];
  readonly artifacts: readonly BrowserArtifact[];
  readonly result?: ExternalExecutionResult;
  readonly receipt?: BrowserWorkbenchReceipt;
  readonly message?: string;
}

const digestPattern = /^[a-f0-9]{64}$/;
const requestIdPattern = /^[a-zA-Z0-9._:-]{1,120}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[]
): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map((entry) => canonicalJson(entry)).join(",") + "]";
  }
  const record = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(record)
      .sort()
      .map((key) => JSON.stringify(key) + ":" + canonicalJson(record[key]))
      .join(",") +
    "}"
  );
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function browserPlanDigest(plan: {
  readonly schema: typeof SWARM_HOME_BROWSER_JOB;
  readonly requestId: string;
  readonly targetRef: string;
  readonly requestedAt: string;
  readonly expiresAt: string;
  readonly actions: readonly string[];
  readonly maxSteps: number;
  readonly maxDurationMs: number;
}): Promise<string> {
  return sha256(
    new TextEncoder().encode(
      canonicalJson({
        schema: plan.schema,
        requestId: plan.requestId,
        targetRef: plan.targetRef,
        requestedAt: plan.requestedAt,
        expiresAt: plan.expiresAt,
        actions: plan.actions,
        maxSteps: plan.maxSteps,
        maxDurationMs: plan.maxDurationMs
      })
    )
  );
}

export async function browserRequestDigest(
  request: BrowserJobPlan
): Promise<string> {
  return sha256(new TextEncoder().encode(canonicalJson(request)));
}

export function validateBrowserJobRequest(
  value: unknown
):
  | { readonly accepted: true; readonly request: BrowserJobPlan }
  | { readonly accepted: false; readonly reason: string } {
  if (!isRecord(value)) return { accepted: false, reason: "job_must_be_an_object" };
  if (
    !hasOnlyKeys(value, [
      "schema",
      "requestId",
      "targetRef",
      "requestedAt",
      "expiresAt",
      "actions",
      "maxSteps",
      "maxDurationMs",
      "approval"
    ])
  ) {
    return { accepted: false, reason: "unsupported_job_field" };
  }
  if (value.schema !== SWARM_HOME_BROWSER_JOB) {
    return { accepted: false, reason: "unsupported_job_schema" };
  }
  if (
    typeof value.requestId !== "string" ||
    !requestIdPattern.test(value.requestId)
  ) {
    return { accepted: false, reason: "invalid_request_id" };
  }
  if (typeof value.targetRef !== "string" || !value.targetRef.trim()) {
    return { accepted: false, reason: "target_ref_missing" };
  }
  if (
    typeof value.requestedAt !== "string" ||
    !Number.isFinite(Date.parse(value.requestedAt)) ||
    typeof value.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(value.expiresAt))
  ) {
    return { accepted: false, reason: "invalid_request_time" };
  }
  if (Date.parse(value.expiresAt) <= Date.parse(value.requestedAt)) {
    return { accepted: false, reason: "request_expiry_not_after_request" };
  }
  if (
    !Array.isArray(value.actions) ||
    value.actions.length !== BROWSER_WORKSHOP_ACTIONS.length ||
    !value.actions.every(
      (action, index) => action === BROWSER_WORKSHOP_ACTIONS[index]
    )
  ) {
    return { accepted: false, reason: "unsupported_action_vocabulary" };
  }
  if (
    value.maxSteps !== BROWSER_WORKSHOP_MAX_STEPS ||
    value.maxDurationMs !== BROWSER_WORKSHOP_MAX_DURATION_MS
  ) {
    return { accepted: false, reason: "unsupported_execution_limits" };
  }
  if (!isRecord(value.approval)) {
    return { accepted: false, reason: "operator_approval_missing" };
  }
  if (
    !hasOnlyKeys(value.approval, ["approved", "planDigest", "approvedAt"]) ||
    typeof value.approval.approved !== "boolean" ||
    typeof value.approval.planDigest !== "string" ||
    !digestPattern.test(value.approval.planDigest) ||
    typeof value.approval.approvedAt !== "string" ||
    !Number.isFinite(Date.parse(value.approval.approvedAt))
  ) {
    return { accepted: false, reason: "invalid_operator_approval" };
  }

  return {
    accepted: true,
    request: Object.freeze({
      schema: SWARM_HOME_BROWSER_JOB,
      requestId: value.requestId,
      targetRef: value.targetRef,
      requestedAt: value.requestedAt,
      expiresAt: value.expiresAt,
      actions: BROWSER_WORKSHOP_ACTIONS,
      maxSteps: BROWSER_WORKSHOP_MAX_STEPS,
      maxDurationMs: BROWSER_WORKSHOP_MAX_DURATION_MS,
      approval: Object.freeze({
        approved: value.approval.approved,
        planDigest: value.approval.planDigest,
        approvedAt: value.approval.approvedAt
      })
    })
  };
}

export async function inspectBrowserWorkbenchReceipt(input: {
  readonly value: unknown;
  readonly request: BrowserJobPlan;
  readonly readArtifact: (artifactRef: string) => Promise<Uint8Array | undefined>;
}): Promise<{ readonly valid: true } | { readonly valid: false; readonly reason: string }> {
  try {
    if (!isRecord(input.value)) {
      return { valid: false, reason: "receipt_not_an_object" };
    }
    const receipt = input.value as unknown as BrowserWorkbenchReceipt;
    const requestDigest = await browserRequestDigest(input.request);
    const requestKey = await sha256(new TextEncoder().encode(input.request.requestId));
    if (receipt.schema !== SWARM_HOME_BROWSER_RECEIPT) {
      return { valid: false, reason: "unsupported_receipt_schema" };
    }
    if (
      !hasOnlyKeys(input.value, [
        "schema",
        "receiptId",
        "requestId",
        "requestDigest",
        "targetRef",
        "sourceEvents",
        "derivedState",
        "scenario",
        "authority",
        "execution",
        "observations",
        "verification",
        "artifacts",
        "provenance",
        "unobserved",
        "capturedAt"
      ])
    ) {
      return { valid: false, reason: "unsupported_receipt_field" };
    }
    if (
      receipt.requestId !== input.request.requestId ||
      receipt.requestDigest !== requestDigest ||
      receipt.targetRef !== input.request.targetRef ||
      receipt.receiptId !== `receipt:browser-workbench:${input.request.requestId}`
    ) {
      return { valid: false, reason: "request_reference_mismatch" };
    }
    if (
      !Array.isArray(receipt.sourceEvents) ||
      receipt.sourceEvents.length !== 1 ||
      !isRecord(receipt.sourceEvents[0]) ||
      receipt.sourceEvents[0].sourceRef !==
        `event:synthetic-browser-approval:${input.request.requestId}` ||
      receipt.sourceEvents[0].standing !== "synthetic_handoff_reference" ||
      receipt.sourceEvents[0].persisted !== false ||
      receipt.derivedState !== null
    ) {
      return { valid: false, reason: "source_event_or_derived_state_mismatch" };
    }
    if (
      receipt.scenario?.ref !== BROWSER_WORKSHOP_SCENARIO ||
      receipt.scenario?.standing !== "synthetic_fixture" ||
      receipt.authority?.standing !== "synthetic_local_operator_approval" ||
      receipt.authority?.ref !== "authority:synthetic-local-operator-approval"
    ) {
      return { valid: false, reason: "synthetic_ownership_standing_mismatch" };
    }
    if (
      !receipt.execution?.providerExecutionRef ||
      receipt.execution.providerRef !== "provider:local-chromium-workbench" ||
      receipt.execution.providerExecutionRef !==
        `browser:chromium:${input.request.requestId}` ||
      receipt.provenance?.sourceRef !== receipt.execution.providerExecutionRef ||
      receipt.provenance?.standing !== "source_record" ||
      receipt.provenance?.id !== receipt.receiptId ||
      receipt.provenance?.authorityRef !== receipt.authority?.ref ||
      receipt.provenance?.capturedAt !== receipt.capturedAt
    ) {
      return { valid: false, reason: "execution_provenance_mismatch" };
    }
    if (!Array.isArray(receipt.observations)) {
      return { valid: false, reason: "observations_missing" };
    }
    if (
      receipt.observations.some(
        (observation, index) =>
          !isRecord(observation) ||
          observation.step !== index + 1 ||
          observation.sourceKind !== "chromium_observation" ||
          observation.standing !== "direct_observation" ||
          observation.action !== BROWSER_WORKSHOP_ACTIONS[index] ||
          typeof observation.sourceRef !== "string" ||
          observation.sourceRef !==
            `browser-observation:${input.request.requestId}:${index + 1}` ||
          typeof observation.value !== "string" ||
          typeof observation.observedAt !== "string" ||
          !Number.isFinite(Date.parse(observation.observedAt))
      )
    ) {
      return { valid: false, reason: "invalid_observation_provenance" };
    }
    const verification = receipt.verification;
    const completed = receipt.execution.status === "completed";
    if (
      !isRecord(verification) ||
      verification.expected !== BROWSER_WORKSHOP_EXPECTED_SELECTION ||
      (verification.sourceRef !== null &&
        (verification.sourceRef !== receipt.observations.at(-1)?.sourceRef ||
          verification.observed !== receipt.observations.at(-1)?.value)) ||
      (completed &&
        (verification.expected !== verification.observed ||
          verification.passed !== true ||
          verification.sourceRef === null ||
          receipt.observations.length !== BROWSER_WORKSHOP_ACTIONS.length ||
          receipt.artifacts.length < 2)) ||
      (verification.sourceRef !== null &&
        receipt.observations.at(-1)?.action !== "verify:cedar")
    ) {
      return { valid: false, reason: "visible_state_verification_failed" };
    }
    if (!Array.isArray(receipt.artifacts)) {
      return { valid: false, reason: "invalid_artifact_metadata" };
    }
    const artifactRefs = new Set<string>();
    for (const candidate of receipt.artifacts) {
      if (
        !isRecord(candidate) ||
        typeof candidate.artifactRef !== "string" ||
        !candidate.artifactRef.trim() ||
        typeof candidate.fileName !== "string" ||
        !candidate.fileName.trim() ||
        candidate.mediaType !== "image/png" ||
        typeof candidate.byteLength !== "number" ||
        !Number.isSafeInteger(candidate.byteLength) ||
        candidate.byteLength <= 0 ||
        typeof candidate.sha256 !== "string" ||
        !digestPattern.test(candidate.sha256)
      ) {
        return { valid: false, reason: "invalid_artifact_metadata" };
      }
      const artifact = candidate as unknown as BrowserArtifact;
      const kind = artifact.artifactRef.endsWith(":initial")
        ? "initial"
        : artifact.artifactRef.endsWith(":verified")
          ? "verified"
          : undefined;
      if (
        !kind ||
        artifact.artifactRef !==
          `artifact:browser-workbench:${requestKey}:${kind}` ||
        artifact.fileName !== `${requestKey.slice(0, 24)}-${kind}.png` ||
        artifactRefs.has(artifact.artifactRef)
      ) {
        return { valid: false, reason: "artifact_request_reference_mismatch" };
      }
      artifactRefs.add(artifact.artifactRef);
      const bytes = await input.readArtifact(artifact.artifactRef);
      if (!bytes) return { valid: false, reason: "artifact_bytes_missing" };
      if (bytes.byteLength !== artifact.byteLength) {
        return { valid: false, reason: "artifact_length_mismatch" };
      }
      if ((await sha256(bytes)) !== artifact.sha256) {
        return { valid: false, reason: "artifact_digest_mismatch" };
      }
    }
    const finalArtifact = receipt.artifacts.at(-1);
    if (
      receipt.provenance.contentHash !==
      (finalArtifact ? "sha256:" + finalArtifact.sha256 : undefined)
    ) {
      return { valid: false, reason: "provenance_digest_mismatch" };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "malformed_receipt" };
  }
}
