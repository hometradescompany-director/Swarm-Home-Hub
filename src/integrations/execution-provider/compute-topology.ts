import type { SwarmHomeExternalHandoff } from "../handoff/conformance.js";
import {
  createExternalExecutionRequest,
  type ExternalExecutionRequest
} from "./contract.js";

export const SWARM_HOME_COMPUTE_PLACEMENT_DECISION =
  "SwarmHomeComputePlacementDecision/v1" as const;

export type ComputeAcceleratorClass = "gpu" | "tpu" | "npu" | "cpu" | "other";

export type ComputePlacementRefusalReason =
  | "capability_mismatch"
  | "accelerator_not_accepted"
  | "insufficient_memory"
  | "queue_depth_exceeded"
  | "start_latency_exceeded"
  | "observation_after_decision"
  | "observation_stale";

export interface ComputePlacementWorkload {
  readonly workloadRef: string;
  readonly capabilityRef: string;
  readonly artifactRefs: readonly string[];
  readonly acceptedAccelerators: readonly ComputeAcceleratorClass[];
  readonly minimumMemoryBytes?: number;
  readonly maximumQueueDepth?: number;
  readonly maximumStartLatencyMs?: number;
}

export interface ComputeProviderObservation {
  readonly providerRef: string;
  readonly capabilityRef: string;
  readonly accelerator: ComputeAcceleratorClass;
  readonly availableMemoryBytes: number;
  readonly queueDepth: number;
  readonly estimatedStartLatencyMs: number;
  readonly estimatedCostMicrounits: number;
  readonly localArtifactRefs: readonly string[];
  readonly evidenceReceiptIds: readonly string[];
  readonly observedAt: string;
  readonly freshUntil: string;
}

export interface ComputePlacementCandidateEvaluation {
  readonly providerRef: string;
  readonly capabilityRef: string;
  readonly accelerator: ComputeAcceleratorClass;
  readonly eligible: boolean;
  readonly refusalReasons: readonly ComputePlacementRefusalReason[];
  readonly localArtifactCount: number;
  readonly nonLocalArtifactCount: number;
  readonly availableMemoryBytes: number;
  readonly queueDepth: number;
  readonly estimatedStartLatencyMs: number;
  readonly estimatedCostMicrounits: number;
  readonly evidenceReceiptIds: readonly string[];
  readonly observedAt: string;
  readonly freshUntil: string;
}

export interface ComputePlacementDecision {
  readonly schema: typeof SWARM_HOME_COMPUTE_PLACEMENT_DECISION;
  readonly workloadRef: string;
  readonly capabilityRef: string;
  readonly decidedAt: string;
  readonly status: "selected" | "no_eligible_provider";
  readonly selectedProviderRef?: string;
  readonly selectedAccelerator?: ComputeAcceleratorClass;
  readonly selectedEvidenceReceiptIds: readonly string[];
  readonly selectedObservedAt?: string;
  readonly selectedFreshUntil?: string;
  readonly evaluations: readonly ComputePlacementCandidateEvaluation[];
  readonly selectionBasis: readonly [
    "artifact_locality",
    "estimated_start_latency",
    "queue_depth",
    "estimated_cost",
    "stable_provider_ref"
  ];
}

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

function nonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative integer");
  }
  return value;
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(field + " must be a positive integer");
  }
  return value;
}

function refs(values: readonly string[], field: string): readonly string[] {
  return Object.freeze(
    values.map((value, index) => nonBlank(value, field + "[" + index + "]"))
  );
}

function uniqueRefs(values: readonly string[]): ReadonlySet<string> {
  return new Set(values);
}

function evaluateCandidate(
  workload: ComputePlacementWorkload,
  candidate: ComputeProviderObservation,
  decidedAtMs: number
): ComputePlacementCandidateEvaluation {
  const observedAtMs = validTime(candidate.observedAt, "candidate.observedAt");
  const freshUntilMs = validTime(candidate.freshUntil, "candidate.freshUntil");

  if (freshUntilMs < observedAtMs) {
    throw new Error("candidate freshness cannot end before observation time");
  }

  const refusalReasons: ComputePlacementRefusalReason[] = [];
  const acceptedAccelerators = new Set(workload.acceptedAccelerators);

  if (candidate.capabilityRef !== workload.capabilityRef) {
    refusalReasons.push("capability_mismatch");
  }
  if (!acceptedAccelerators.has(candidate.accelerator)) {
    refusalReasons.push("accelerator_not_accepted");
  }
  if (
    workload.minimumMemoryBytes !== undefined &&
    candidate.availableMemoryBytes < workload.minimumMemoryBytes
  ) {
    refusalReasons.push("insufficient_memory");
  }
  if (
    workload.maximumQueueDepth !== undefined &&
    candidate.queueDepth > workload.maximumQueueDepth
  ) {
    refusalReasons.push("queue_depth_exceeded");
  }
  if (
    workload.maximumStartLatencyMs !== undefined &&
    candidate.estimatedStartLatencyMs > workload.maximumStartLatencyMs
  ) {
    refusalReasons.push("start_latency_exceeded");
  }
  if (observedAtMs > decidedAtMs) {
    refusalReasons.push("observation_after_decision");
  }
  if (freshUntilMs < decidedAtMs) {
    refusalReasons.push("observation_stale");
  }

  const localArtifactRefs = uniqueRefs(candidate.localArtifactRefs);
  const localArtifactCount = workload.artifactRefs.filter((ref) =>
    localArtifactRefs.has(ref)
  ).length;

  return Object.freeze({
    providerRef: nonBlank(candidate.providerRef, "candidate.providerRef"),
    capabilityRef: nonBlank(candidate.capabilityRef, "candidate.capabilityRef"),
    accelerator: candidate.accelerator,
    eligible: refusalReasons.length === 0,
    refusalReasons: Object.freeze(refusalReasons),
    localArtifactCount,
    nonLocalArtifactCount: workload.artifactRefs.length - localArtifactCount,
    availableMemoryBytes: nonNegativeInteger(
      candidate.availableMemoryBytes,
      "candidate.availableMemoryBytes"
    ),
    queueDepth: nonNegativeInteger(candidate.queueDepth, "candidate.queueDepth"),
    estimatedStartLatencyMs: nonNegativeInteger(
      candidate.estimatedStartLatencyMs,
      "candidate.estimatedStartLatencyMs"
    ),
    estimatedCostMicrounits: nonNegativeInteger(
      candidate.estimatedCostMicrounits,
      "candidate.estimatedCostMicrounits"
    ),
    evidenceReceiptIds: refs(
      candidate.evidenceReceiptIds,
      "candidate.evidenceReceiptIds"
    ),
    observedAt: candidate.observedAt,
    freshUntil: candidate.freshUntil
  });
}

function compareEligible(
  left: ComputePlacementCandidateEvaluation,
  right: ComputePlacementCandidateEvaluation
): number {
  return (
    left.nonLocalArtifactCount - right.nonLocalArtifactCount ||
    left.estimatedStartLatencyMs - right.estimatedStartLatencyMs ||
    left.queueDepth - right.queueDepth ||
    left.estimatedCostMicrounits - right.estimatedCostMicrounits ||
    left.providerRef.localeCompare(right.providerRef)
  );
}

export function selectComputeTopologyPlacement(input: {
  readonly workload: ComputePlacementWorkload;
  readonly candidates: readonly ComputeProviderObservation[];
  readonly decidedAt: string;
}): ComputePlacementDecision {
  const decidedAtMs = validTime(input.decidedAt, "decidedAt");
  const workload = input.workload;

  nonBlank(workload.workloadRef, "workload.workloadRef");
  nonBlank(workload.capabilityRef, "workload.capabilityRef");
  refs(workload.artifactRefs, "workload.artifactRefs");

  if (workload.acceptedAccelerators.length === 0) {
    throw new Error("workload.acceptedAccelerators must not be empty");
  }

  if (workload.minimumMemoryBytes !== undefined) {
    positiveInteger(workload.minimumMemoryBytes, "workload.minimumMemoryBytes");
  }
  if (workload.maximumQueueDepth !== undefined) {
    nonNegativeInteger(workload.maximumQueueDepth, "workload.maximumQueueDepth");
  }
  if (workload.maximumStartLatencyMs !== undefined) {
    nonNegativeInteger(
      workload.maximumStartLatencyMs,
      "workload.maximumStartLatencyMs"
    );
  }

  const evaluations = Object.freeze(
    input.candidates.map((candidate) =>
      evaluateCandidate(workload, candidate, decidedAtMs)
    )
  );

  const selected = evaluations
    .filter((candidate) => candidate.eligible)
    .slice()
    .sort(compareEligible)[0];

  const selectionBasis = Object.freeze([
    "artifact_locality",
    "estimated_start_latency",
    "queue_depth",
    "estimated_cost",
    "stable_provider_ref"
  ] as const);

  if (!selected) {
    return Object.freeze({
      schema: SWARM_HOME_COMPUTE_PLACEMENT_DECISION,
      workloadRef: workload.workloadRef,
      capabilityRef: workload.capabilityRef,
      decidedAt: input.decidedAt,
      status: "no_eligible_provider",
      selectedEvidenceReceiptIds: Object.freeze([]),
      evaluations,
      selectionBasis
    });
  }

  return Object.freeze({
    schema: SWARM_HOME_COMPUTE_PLACEMENT_DECISION,
    workloadRef: workload.workloadRef,
    capabilityRef: workload.capabilityRef,
    decidedAt: input.decidedAt,
    status: "selected",
    selectedProviderRef: selected.providerRef,
    selectedAccelerator: selected.accelerator,
    selectedEvidenceReceiptIds: selected.evidenceReceiptIds,
    selectedObservedAt: selected.observedAt,
    selectedFreshUntil: selected.freshUntil,
    evaluations,
    selectionBasis
  });
}


export interface ComputePlacedExecutionPlan {
  readonly placement: ComputePlacementDecision;
  readonly request?: ExternalExecutionRequest;
}

function mergeEvidenceRefs(
  first: readonly string[],
  second: readonly string[]
): readonly string[] {
  return Object.freeze([...new Set([...first, ...second])]);
}

export function createComputePlacedExecutionRequest(input: {
  readonly workload: ComputePlacementWorkload;
  readonly candidates: readonly ComputeProviderObservation[];
  readonly requestId: string;
  readonly instructionRef: string;
  readonly evidenceReceiptIds?: readonly string[];
  readonly handoff: SwarmHomeExternalHandoff;
  readonly decidedAt: string;
  readonly requestedAt: string;
  readonly expiresAt: string;
}): ComputePlacedExecutionPlan {
  const decidedAtMs = validTime(input.decidedAt, "decidedAt");
  const requestedAtMs = validTime(input.requestedAt, "requestedAt");
  const expiresAtMs = validTime(input.expiresAt, "expiresAt");

  if (requestedAtMs < decidedAtMs) {
    throw new Error("external execution request cannot predate compute placement");
  }

  const placement = selectComputeTopologyPlacement({
    workload: input.workload,
    candidates: input.candidates,
    decidedAt: input.decidedAt
  });

  if (
    placement.status === "no_eligible_provider" ||
    !placement.selectedProviderRef ||
    !placement.selectedFreshUntil
  ) {
    return Object.freeze({ placement });
  }

  const selectedFreshUntilMs = validTime(
    placement.selectedFreshUntil,
    "placement.selectedFreshUntil"
  );

  if (requestedAtMs > selectedFreshUntilMs) {
    throw new Error("external execution request cannot use a stale compute placement");
  }
  if (expiresAtMs > selectedFreshUntilMs) {
    throw new Error("external execution request cannot outlive compute placement freshness");
  }

  const request = createExternalExecutionRequest({
    requestId: input.requestId,
    providerRef: placement.selectedProviderRef,
    capabilityRef: placement.capabilityRef,
    instructionRef: input.instructionRef,
    artifactRefs: input.workload.artifactRefs,
    evidenceReceiptIds: mergeEvidenceRefs(
      input.evidenceReceiptIds ?? [],
      placement.selectedEvidenceReceiptIds
    ),
    handoff: input.handoff,
    requestedAt: input.requestedAt,
    expiresAt: input.expiresAt
  });

  return Object.freeze({ placement, request });
}
