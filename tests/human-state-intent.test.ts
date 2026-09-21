import { describe, expect, it } from "vitest";

import {
  separateHumanStateFromWorkflowIntent,
} from "../src/policy/human-state-intent.js";

const base = {
  humanStateReported: true,
  requiresEscalation: true,
  routingCapabilityAvailable: true,
  receivingRoleCanRoute: true,
};

describe("human state is not workflow intent", () => {
  it("does not reinterpret a human state report as cancellation", () => {
    expect(separateHumanStateFromWorkflowIntent(base)).toMatchObject({
      preserveHumanStateObservation: true,
      workflowIntent: null,
      escalation: "route",
    });
  });

  it("preserves explicit workflow intent separately from human state", () => {
    expect(
      separateHumanStateFromWorkflowIntent({
        ...base,
        explicitWorkflowIntent: "continue",
      }),
    ).toMatchObject({
      preserveHumanStateObservation: true,
      workflowIntent: "continue",
      escalation: "route",
    });
  });

  it("accepts explicit cancellation only when it is actually explicit", () => {
    expect(
      separateHumanStateFromWorkflowIntent({
        ...base,
        explicitWorkflowIntent: "cancel",
      }),
    ).toMatchObject({
      workflowIntent: "cancel",
    });
  });

  it("records an escalation capability gap instead of inventing action", () => {
    expect(
      separateHumanStateFromWorkflowIntent({
        ...base,
        routingCapabilityAvailable: false,
      }),
    ).toMatchObject({
      workflowIntent: null,
      escalation: "capability_gap",
    });
  });

  it("supports ordinary explicit workflow intent without a state report", () => {
    expect(
      separateHumanStateFromWorkflowIntent({
        ...base,
        humanStateReported: false,
        requiresEscalation: false,
        explicitWorkflowIntent: "reschedule",
      }),
    ).toMatchObject({
      preserveHumanStateObservation: false,
      workflowIntent: "reschedule",
      escalation: "none",
    });
  });
});
