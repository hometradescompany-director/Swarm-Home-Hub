import { describe, expect, it } from "vitest";
import type { CurrentReadyHandoffCapsule } from "../src/query/ready-handoff.js";
import {
  projectAgencySwarmHandoff,
  projectExternalHandoff,
  projectGenericHandoffPacket,
  projectLangGraphHandoff,
  SWARM_HOME_EXTERNAL_HANDOFF
} from "../src/integrations/handoff/conformance.js";

const handoff: CurrentReadyHandoffCapsule = {
  residenceId: "residence:handoff",
  agentIdentityRef: "atlas:agent:one",
  habitatId: "habitat:one",
  capabilityRefs: ["capability:one" as never],
  offeringRefs: ["offering:one" as never],
  relationalContextRefs: ["atlas:relational:opaque" as never],
  lastResidenceEventId: "event:ready",
  generatedAt: "2026-09-22T01:00:00.000Z",
  readinessObservedAt: "2026-09-22T00:59:00.000Z",
  heartbeatEvaluatedAt: "2026-09-22T01:00:00.000Z",
  staleAfterMs: 120_000,
  freshUntil: "2026-09-22T01:01:00.000Z"
};

describe("cross-framework handoff conformance", () => {
  it("projects one canonical bounded external handoff", () => {
    expect(projectExternalHandoff(handoff)).toEqual({
      schema: SWARM_HOME_EXTERNAL_HANDOFF,
      sourceResidenceRef: "residence:handoff",
      sourceEventRef: "event:ready",
      agentIdentityRef: "atlas:agent:one",
      capabilityRefs: ["capability:one"],
      offeringRefs: ["offering:one"],
      relationalContextRefs: ["atlas:relational:opaque"],
      generatedAt: "2026-09-22T01:00:00.000Z",
      freshUntil: "2026-09-22T01:01:00.000Z",
      authorityImplication: "none"
    });
  });

  it("projects Agency Swarm shape without inventing raw history", () => {
    const projected = projectAgencySwarmHandoff(handoff, {
      recipientAgent: "SecurityEngineer",
      taskSummary: "Review the bounded artefact."
    });

    expect(projected.recipient_agent).toBe("SecurityEngineer");
    expect(projected.message).toBe("Review the bounded artefact.");
    expect(JSON.parse(projected.additional_instructions)).toMatchObject({
      swarmHomeHandoff: {
        schema: SWARM_HOME_EXTERNAL_HANDOFF,
        authorityImplication: "none"
      }
    });
    expect(projected.additional_instructions).not.toContain("messages");
    expect(projected.additional_instructions).not.toContain("conversationHistory");
  });

  it("projects LangGraph state without copying a messages array", () => {
    const projected = projectLangGraphHandoff(handoff, "planner_agent");

    expect(projected).toMatchObject({
      goto: "planner_agent",
      update: {
        active_agent: "planner_agent",
        swarm_home_handoff: {
          sourceEventRef: "event:ready"
        }
      }
    });
    expect(projected.update).not.toHaveProperty("messages");
  });

  it("supports an opaque generic packet without adding task ownership", () => {
    expect(projectGenericHandoffPacket(handoff, "provider:remote")).toMatchObject({
      kind: "swarm-home-handoff",
      targetRef: "provider:remote",
      handoff: {
        authorityImplication: "none"
      }
    });
  });

  it("fails closed on missing host-owned routing/task fields", () => {
    expect(() =>
      projectAgencySwarmHandoff(handoff, {
        recipientAgent: "",
        taskSummary: "x"
      })
    ).toThrow(/recipientAgent/);

    expect(() => projectLangGraphHandoff(handoff, "")).toThrow(/targetAgent/);
    expect(() => projectGenericHandoffPacket(handoff, " ")).toThrow(/targetRef/);
  });
});
