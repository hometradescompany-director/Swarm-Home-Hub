import type { SwarmHomeExternalHandoff } from "../handoff/conformance.js";

export const SWARM_HOME_EXTERNAL_EXECUTION_REQUEST =
  "SwarmHomeExternalExecutionRequest/v1" as const;
export const SWARM_HOME_EXTERNAL_EXECUTION_RESULT =
  "SwarmHomeExternalExecutionResult/v1" as const;

export interface ExternalExecutionRequest {
  readonly schema: typeof SWARM_HOME_EXTERNAL_EXECUTION_REQUEST;
  readonly requestId: string;
  readonly providerRef: string;
  readonly capabilityRef: string;
  readonly instructionRef: string;
  readonly artifactRefs: readonly string[];
  readonly evidenceReceiptIds: readonly string[];
  readonly handoff: SwarmHomeExternalHandoff;
  readonly requestedAt: string;
  readonly expiresAt: string;
}

export interface ExternalExecutionAuthorityDecision {
  readonly allowed: boolean;
  readonly authorityRef: string;
  readonly decidedAt: string;
  readonly reason?: string;
}

export interface ExternalExecutionProviderOutcome {
  readonly providerExecutionRef: string;
  readonly status: "accepted" | "completed" | "failed" | "refused";
  readonly resultRefs: readonly string[];
  readonly evidenceReceiptIds: readonly string[];
  readonly observedAt: string;
  readonly message?: string;
}

export interface ExternalExecutionResult {
  readonly schema: typeof SWARM_HOME_EXTERNAL_EXECUTION_RESULT;
  readonly requestId: string;
  readonly providerRef: string;
  readonly capabilityRef: string;
  readonly authorityRef: string;
  readonly providerExecutionRef?: string;
  readonly status:
    | "refused_by_authority"
    | "refused_by_boundary"
    | "accepted"
    | "completed"
    | "failed"
    | "refused";
  readonly resultRefs: readonly string[];
  readonly evidenceReceiptIds: readonly string[];
  readonly observedAt: string;
  readonly message?: string;
}

export interface ExternalExecutionProvider {
  readonly providerRef: string;
  execute(request: ExternalExecutionRequest): Promise<ExternalExecutionProviderOutcome>;
}

export type ExternalExecutionAuthorizer = (
  request: ExternalExecutionRequest
) => Promise<ExternalExecutionAuthorityDecision>;

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function validTime(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(field + " must be a valid ISO-8601 value");
  }
  return parsed;
}

function refs(values: readonly string[], field: string): readonly string[] {
  return Object.freeze(
    values.map((value, index) => nonBlank(value, field + "[" + index + "]"))
  );
}

export function createExternalExecutionRequest(input: {
  readonly requestId: string;
  readonly providerRef: string;
  readonly capabilityRef: string;
  readonly instructionRef: string;
  readonly artifactRefs?: readonly string[];
  readonly evidenceReceiptIds?: readonly string[];
  readonly handoff: SwarmHomeExternalHandoff;
  readonly requestedAt: string;
  readonly expiresAt: string;
}): ExternalExecutionRequest {
  const requestedAtMs = validTime(input.requestedAt, "requestedAt");
  const expiresAtMs = validTime(input.expiresAt, "expiresAt");
  const handoffGeneratedMs = validTime(input.handoff.generatedAt, "handoff.generatedAt");
  const handoffFreshUntilMs = validTime(input.handoff.freshUntil, "handoff.freshUntil");

  if (expiresAtMs < requestedAtMs) {
    throw new Error("external execution request cannot expire before it is requested");
  }
  if (requestedAtMs < handoffGeneratedMs) {
    throw new Error("external execution request cannot predate its handoff");
  }
  if (requestedAtMs > handoffFreshUntilMs) {
    throw new Error("external execution request cannot use an expired handoff");
  }
  if (expiresAtMs > handoffFreshUntilMs) {
    throw new Error("external execution request cannot outlive its handoff");
  }
  if (input.handoff.authorityImplication !== "none") {
    throw new Error("external handoff must not imply authority");
  }

  return Object.freeze({
    schema: SWARM_HOME_EXTERNAL_EXECUTION_REQUEST,
    requestId: nonBlank(input.requestId, "requestId"),
    providerRef: nonBlank(input.providerRef, "providerRef"),
    capabilityRef: nonBlank(input.capabilityRef, "capabilityRef"),
    instructionRef: nonBlank(input.instructionRef, "instructionRef"),
    artifactRefs: refs(input.artifactRefs ?? [], "artifactRefs"),
    evidenceReceiptIds: refs(input.evidenceReceiptIds ?? [], "evidenceReceiptIds"),
    handoff: input.handoff,
    requestedAt: input.requestedAt,
    expiresAt: input.expiresAt
  });
}

export async function executeWithExternalProvider(input: {
  readonly request: ExternalExecutionRequest;
  readonly provider: ExternalExecutionProvider;
  readonly authorize: ExternalExecutionAuthorizer;
  readonly observedAt: string;
}): Promise<ExternalExecutionResult> {
  const observedAtMs = validTime(input.observedAt, "observedAt");
  const expiresAtMs = validTime(input.request.expiresAt, "request.expiresAt");

  if (input.provider.providerRef !== input.request.providerRef) {
    return Object.freeze({
      schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
      requestId: input.request.requestId,
      providerRef: input.request.providerRef,
      capabilityRef: input.request.capabilityRef,
      authorityRef: "authority:unresolved",
      status: "refused_by_boundary",
      resultRefs: Object.freeze([]),
      evidenceReceiptIds: Object.freeze([]),
      observedAt: input.observedAt,
      message: "provider identity does not match request providerRef"
    });
  }

  if (observedAtMs > expiresAtMs) {
    return Object.freeze({
      schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
      requestId: input.request.requestId,
      providerRef: input.request.providerRef,
      capabilityRef: input.request.capabilityRef,
      authorityRef: "authority:unresolved",
      status: "refused_by_boundary",
      resultRefs: Object.freeze([]),
      evidenceReceiptIds: Object.freeze([]),
      observedAt: input.observedAt,
      message: "external execution request has expired"
    });
  }

  const authority = await input.authorize(input.request);
  nonBlank(authority.authorityRef, "authority.authorityRef");
  validTime(authority.decidedAt, "authority.decidedAt");

  if (!authority.allowed) {
    return Object.freeze({
      schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
      requestId: input.request.requestId,
      providerRef: input.request.providerRef,
      capabilityRef: input.request.capabilityRef,
      authorityRef: authority.authorityRef,
      status: "refused_by_authority",
      resultRefs: Object.freeze([]),
      evidenceReceiptIds: Object.freeze([]),
      observedAt: input.observedAt,
      ...(authority.reason ? { message: authority.reason } : {})
    });
  }

  const outcome = await input.provider.execute(input.request);
  const providerExecutionRef = nonBlank(
    outcome.providerExecutionRef,
    "providerOutcome.providerExecutionRef"
  );
  validTime(outcome.observedAt, "providerOutcome.observedAt");

  return Object.freeze({
    schema: SWARM_HOME_EXTERNAL_EXECUTION_RESULT,
    requestId: input.request.requestId,
    providerRef: input.request.providerRef,
    capabilityRef: input.request.capabilityRef,
    authorityRef: authority.authorityRef,
    providerExecutionRef,
    status: outcome.status,
    resultRefs: refs(outcome.resultRefs, "providerOutcome.resultRefs"),
    evidenceReceiptIds: refs(
      outcome.evidenceReceiptIds,
      "providerOutcome.evidenceReceiptIds"
    ),
    observedAt: outcome.observedAt,
    ...(outcome.message ? { message: outcome.message } : {})
  });
}
