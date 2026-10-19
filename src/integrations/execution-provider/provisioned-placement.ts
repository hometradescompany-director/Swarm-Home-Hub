import type {
  ComputePlacementWorkload
} from "./compute-topology.js";
import type {
  WorkloadProvisioningEnvelope
} from "./workload-provisioning.js";

export const SWARM_HOME_PROVISIONED_PLACEMENT_WORKLOAD =
  "SwarmHomeProvisionedPlacementWorkload/v1" as const;

export interface ProvisionedPlacementPolicy {
  readonly minimumMemoryBytesAtFloor: number;
  readonly minimumMemoryBytesAtCeiling: number;
}

export interface ProvisionedPlacementWorkload {
  readonly schema: typeof SWARM_HOME_PROVISIONED_PLACEMENT_WORKLOAD;
  readonly workload: ComputePlacementWorkload;
  readonly provisioningPermille: number;
  readonly authorityImplication: "none";
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(field + " must be a positive integer");
  }
  return value;
}

function interpolateInteger(
  floor: number,
  ceiling: number,
  permille: number
): number {
  return floor + Math.floor(((ceiling - floor) * permille) / 1000);
}

export function applyProvisioningToPlacement(input: {
  readonly workload: ComputePlacementWorkload;
  readonly provisioning: WorkloadProvisioningEnvelope;
  readonly policy: ProvisionedPlacementPolicy;
}): ProvisionedPlacementWorkload {
  if (input.workload.workloadRef !== input.provisioning.workloadRef) {
    throw new Error("provisioning workloadRef must match placement workloadRef");
  }
  if (input.workload.capabilityRef !== input.provisioning.capabilityRef) {
    throw new Error(
      "provisioning capabilityRef must match placement capabilityRef"
    );
  }
  if (input.provisioning.authorityImplication !== "none") {
    throw new Error("provisioning must not imply authority");
  }

  const floor = positiveInteger(
    input.policy.minimumMemoryBytesAtFloor,
    "policy.minimumMemoryBytesAtFloor"
  );
  const ceiling = positiveInteger(
    input.policy.minimumMemoryBytesAtCeiling,
    "policy.minimumMemoryBytesAtCeiling"
  );
  if (ceiling < floor) {
    throw new Error(
      "policy.minimumMemoryBytesAtCeiling cannot be below the floor"
    );
  }

  const projectedMemory = interpolateInteger(
    floor,
    ceiling,
    input.provisioning.provisioningPermille
  );
  const existingMemory = input.workload.minimumMemoryBytes ?? 0;

  const workload = Object.freeze({
    ...input.workload,
    minimumMemoryBytes: Math.max(existingMemory, projectedMemory)
  });

  return Object.freeze({
    schema: SWARM_HOME_PROVISIONED_PLACEMENT_WORKLOAD,
    workload,
    provisioningPermille: input.provisioning.provisioningPermille,
    authorityImplication: "none"
  });
}
