export const SWARM_HOME_WORKLOAD_PROVISIONING =
  "SwarmHomeWorkloadProvisioning/v1" as const;

export type WorkloadDemandDimension =
  | "breadth"
  | "duration"
  | "coordination"
  | "context_depth"
  | "consequence"
  | "evidence_burden";

export interface WorkloadDemandProfile {
  readonly workloadRef: string;
  readonly capabilityRef: string;
  readonly breadth: number;
  readonly duration: number;
  readonly coordination: number;
  readonly contextDepth: number;
  readonly consequence: number;
  readonly evidenceBurden: number;
}

export interface WorkloadProvisioningWeights {
  readonly breadth: number;
  readonly duration: number;
  readonly coordination: number;
  readonly contextDepth: number;
  readonly consequence: number;
  readonly evidenceBurden: number;
}

export interface WorkloadProvisioningPolicy {
  readonly weights: WorkloadProvisioningWeights;
  readonly minimumProvisioningPermille: number;
  readonly maximumProvisioningPermille: number;
}

export interface WorkloadProvisioningContribution {
  readonly dimension: WorkloadDemandDimension;
  readonly demandPermille: number;
  readonly weight: number;
  readonly weightedDemand: number;
}

export interface WorkloadProvisioningEnvelope {
  readonly schema: typeof SWARM_HOME_WORKLOAD_PROVISIONING;
  readonly workloadRef: string;
  readonly capabilityRef: string;
  readonly demandScorePermille: number;
  readonly provisioningPermille: number;
  readonly minimumProvisioningPermille: number;
  readonly maximumProvisioningPermille: number;
  readonly contributions: readonly WorkloadProvisioningContribution[];
  readonly authorityImplication: "none";
}

function nonBlank(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(field + " must be non-empty");
  return normalized;
}

function permille(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 1000) {
    throw new Error(field + " must be an integer from 0 to 1000");
  }
  return value;
}

function weight(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative integer");
  }
  return value;
}

export function projectWorkloadProvisioning(input: {
  readonly demand: WorkloadDemandProfile;
  readonly policy: WorkloadProvisioningPolicy;
}): WorkloadProvisioningEnvelope {
  const demand = input.demand;
  const policy = input.policy;

  const dimensions = [
    {
      dimension: "breadth" as const,
      demandPermille: permille(demand.breadth, "demand.breadth"),
      weight: weight(policy.weights.breadth, "policy.weights.breadth")
    },
    {
      dimension: "duration" as const,
      demandPermille: permille(demand.duration, "demand.duration"),
      weight: weight(policy.weights.duration, "policy.weights.duration")
    },
    {
      dimension: "coordination" as const,
      demandPermille: permille(demand.coordination, "demand.coordination"),
      weight: weight(policy.weights.coordination, "policy.weights.coordination")
    },
    {
      dimension: "context_depth" as const,
      demandPermille: permille(demand.contextDepth, "demand.contextDepth"),
      weight: weight(policy.weights.contextDepth, "policy.weights.contextDepth")
    },
    {
      dimension: "consequence" as const,
      demandPermille: permille(demand.consequence, "demand.consequence"),
      weight: weight(policy.weights.consequence, "policy.weights.consequence")
    },
    {
      dimension: "evidence_burden" as const,
      demandPermille: permille(demand.evidenceBurden, "demand.evidenceBurden"),
      weight: weight(policy.weights.evidenceBurden, "policy.weights.evidenceBurden")
    }
  ];

  const minimum = permille(
    policy.minimumProvisioningPermille,
    "policy.minimumProvisioningPermille"
  );
  const maximum = permille(
    policy.maximumProvisioningPermille,
    "policy.maximumProvisioningPermille"
  );

  if (maximum < minimum) {
    throw new Error(
      "policy.maximumProvisioningPermille cannot be below policy.minimumProvisioningPermille"
    );
  }

  const totalWeight = dimensions.reduce(
    (sum, dimension) => sum + dimension.weight,
    0
  );
  if (totalWeight === 0) {
    throw new Error("workload provisioning requires at least one positive weight");
  }

  const contributions = Object.freeze(
    dimensions.map((dimension) =>
      Object.freeze({
        ...dimension,
        weightedDemand: dimension.demandPermille * dimension.weight
      })
    )
  );

  const weightedDemand = contributions.reduce(
    (sum, contribution) => sum + contribution.weightedDemand,
    0
  );
  const demandScorePermille = Math.floor(weightedDemand / totalWeight);
  const provisioningPermille =
    minimum +
    Math.floor(((maximum - minimum) * demandScorePermille) / 1000);

  return Object.freeze({
    schema: SWARM_HOME_WORKLOAD_PROVISIONING,
    workloadRef: nonBlank(demand.workloadRef, "demand.workloadRef"),
    capabilityRef: nonBlank(demand.capabilityRef, "demand.capabilityRef"),
    demandScorePermille,
    provisioningPermille,
    minimumProvisioningPermille: minimum,
    maximumProvisioningPermille: maximum,
    contributions,
    authorityImplication: "none"
  });
}
