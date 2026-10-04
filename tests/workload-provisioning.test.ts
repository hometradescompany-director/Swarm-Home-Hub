import { describe, expect, it } from "vitest";
import {
  projectWorkloadProvisioning,
  SWARM_HOME_WORKLOAD_PROVISIONING
} from "../src/integrations/execution-provider/workload-provisioning.js";

const equalWeights = {
  breadth: 1,
  duration: 1,
  coordination: 1,
  contextDepth: 1,
  consequence: 1,
  evidenceBurden: 1
};

describe("LAG proportional workload provisioning root", () => {
  it("keeps a tiny bounded task near the policy floor", () => {
    const envelope = projectWorkloadProvisioning({
      demand: {
        workloadRef: "workload:one-pr-sixteen-lines",
        capabilityRef: "capability:bounded-code",
        breadth: 40,
        duration: 20,
        coordination: 0,
        contextDepth: 30,
        consequence: 20,
        evidenceBurden: 40
      },
      policy: {
        weights: equalWeights,
        minimumProvisioningPermille: 50,
        maximumProvisioningPermille: 1000
      }
    });

    expect(envelope.schema).toBe(SWARM_HOME_WORKLOAD_PROVISIONING);
    expect(envelope.demandScorePermille).toBe(25);
    expect(envelope.provisioningPermille).toBe(73);
    expect(envelope.authorityImplication).toBe("none");
  });

  it("scales a large Order 666 class workload toward the ceiling", () => {
    const envelope = projectWorkloadProvisioning({
      demand: {
        workloadRef: "workload:order-666-sprint",
        capabilityRef: "capability:multi-system-build",
        breadth: 980,
        duration: 950,
        coordination: 1000,
        contextDepth: 940,
        consequence: 900,
        evidenceBurden: 970
      },
      policy: {
        weights: equalWeights,
        minimumProvisioningPermille: 50,
        maximumProvisioningPermille: 1000
      }
    });

    expect(envelope.demandScorePermille).toBe(956);
    expect(envelope.provisioningPermille).toBe(958);
  });

  it("keeps policy choices explicit instead of pretending the weights are universal physics", () => {
    const baseDemand = {
      workloadRef: "workload:risk-sensitive",
      capabilityRef: "capability:bounded-code",
      breadth: 100,
      duration: 100,
      coordination: 100,
      contextDepth: 100,
      consequence: 1000,
      evidenceBurden: 100
    };

    const balanced = projectWorkloadProvisioning({
      demand: baseDemand,
      policy: {
        weights: equalWeights,
        minimumProvisioningPermille: 0,
        maximumProvisioningPermille: 1000
      }
    });

    const consequenceWeighted = projectWorkloadProvisioning({
      demand: baseDemand,
      policy: {
        weights: {
          breadth: 1,
          duration: 1,
          coordination: 1,
          contextDepth: 1,
          consequence: 10,
          evidenceBurden: 1
        },
        minimumProvisioningPermille: 0,
        maximumProvisioningPermille: 1000
      }
    });

    expect(consequenceWeighted.provisioningPermille).toBeGreaterThan(
      balanced.provisioningPermille
    );
  });

  it("fails closed on malformed demand or a policy with no active dimensions", () => {
    expect(() =>
      projectWorkloadProvisioning({
        demand: {
          workloadRef: "workload:bad",
          capabilityRef: "capability:bad",
          breadth: 1001,
          duration: 0,
          coordination: 0,
          contextDepth: 0,
          consequence: 0,
          evidenceBurden: 0
        },
        policy: {
          weights: equalWeights,
          minimumProvisioningPermille: 0,
          maximumProvisioningPermille: 1000
        }
      })
    ).toThrow(/0 to 1000/);

    expect(() =>
      projectWorkloadProvisioning({
        demand: {
          workloadRef: "workload:no-policy-signal",
          capabilityRef: "capability:bounded-code",
          breadth: 100,
          duration: 100,
          coordination: 100,
          contextDepth: 100,
          consequence: 100,
          evidenceBurden: 100
        },
        policy: {
          weights: {
            breadth: 0,
            duration: 0,
            coordination: 0,
            contextDepth: 0,
            consequence: 0,
            evidenceBurden: 0
          },
          minimumProvisioningPermille: 0,
          maximumProvisioningPermille: 1000
        }
      })
    ).toThrow(/at least one positive weight/);
  });
});
