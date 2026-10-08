import { describe, expect, it } from "vitest";
import { projectWorkloadProvisioning } from "../src/integrations/execution-provider/workload-provisioning.js";
import { applyProvisioningToPlacement } from "../src/integrations/execution-provider/provisioned-placement.js";

const weights = {
  breadth: 1,
  duration: 1,
  coordination: 1,
  contextDepth: 1,
  consequence: 1,
  evidenceBurden: 1
};

function workload() {
  return {
    workloadRef: "workload:order-666-slice",
    capabilityRef: "capability:bounded-code",
    artifactRefs: ["artifact:repo"],
    acceptedAccelerators: ["gpu", "cpu"] as const
  };
}

describe("provisioning to placement bridge", () => {
  it("raises placement memory requirements for a heavier workload", () => {
    const light = projectWorkloadProvisioning({
      demand: {
        workloadRef: "workload:order-666-slice",
        capabilityRef: "capability:bounded-code",
        breadth: 50,
        duration: 50,
        coordination: 50,
        contextDepth: 50,
        consequence: 50,
        evidenceBurden: 50
      },
      policy: {
        weights,
        minimumProvisioningPermille: 0,
        maximumProvisioningPermille: 1000
      }
    });

    const heavy = projectWorkloadProvisioning({
      demand: {
        workloadRef: "workload:order-666-slice",
        capabilityRef: "capability:bounded-code",
        breadth: 950,
        duration: 950,
        coordination: 950,
        contextDepth: 950,
        consequence: 950,
        evidenceBurden: 950
      },
      policy: {
        weights,
        minimumProvisioningPermille: 0,
        maximumProvisioningPermille: 1000
      }
    });

    const policy = {
      minimumMemoryBytesAtFloor: 1_000,
      minimumMemoryBytesAtCeiling: 11_000
    };

    const lightPlacement = applyProvisioningToPlacement({
      workload: workload(),
      provisioning: light,
      policy
    });
    const heavyPlacement = applyProvisioningToPlacement({
      workload: workload(),
      provisioning: heavy,
      policy
    });

    expect(heavyPlacement.workload.minimumMemoryBytes).toBeGreaterThan(
      lightPlacement.workload.minimumMemoryBytes ?? 0
    );
    expect(heavyPlacement.authorityImplication).toBe("none");
  });

  it("never weakens an existing placement constraint", () => {
    const provisioning = projectWorkloadProvisioning({
      demand: {
        workloadRef: "workload:order-666-slice",
        capabilityRef: "capability:bounded-code",
        breadth: 100,
        duration: 100,
        coordination: 100,
        contextDepth: 100,
        consequence: 100,
        evidenceBurden: 100
      },
      policy: {
        weights,
        minimumProvisioningPermille: 0,
        maximumProvisioningPermille: 1000
      }
    });

    const result = applyProvisioningToPlacement({
      workload: {
        ...workload(),
        minimumMemoryBytes: 50_000
      },
      provisioning,
      policy: {
        minimumMemoryBytesAtFloor: 1_000,
        minimumMemoryBytesAtCeiling: 11_000
      }
    });

    expect(result.workload.minimumMemoryBytes).toBe(50_000);
  });

  it("fails closed when provisioning and placement identities diverge", () => {
    const provisioning = projectWorkloadProvisioning({
      demand: {
        workloadRef: "workload:different",
        capabilityRef: "capability:bounded-code",
        breadth: 100,
        duration: 100,
        coordination: 100,
        contextDepth: 100,
        consequence: 100,
        evidenceBurden: 100
      },
      policy: {
        weights,
        minimumProvisioningPermille: 0,
        maximumProvisioningPermille: 1000
      }
    });

    expect(() =>
      applyProvisioningToPlacement({
        workload: workload(),
        provisioning,
        policy: {
          minimumMemoryBytesAtFloor: 1_000,
          minimumMemoryBytesAtCeiling: 11_000
        }
      })
    ).toThrow(/workloadRef/);
  });
});
