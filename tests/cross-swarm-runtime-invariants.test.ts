import { describe, expect, it } from "vitest";
import {
  projectConcurrentBranchResults
} from "../src/refinery/concurrency-semantics.js";
import {
  qualifyExternalCapabilityForExecution
} from "../src/policy/external-capability-lifecycle.js";

describe("cross-swarm runtime invariants", () => {
  it("preserves declared semantic order separately from physical completion order", () => {
    const projection = projectConcurrentBranchResults([
      {
        participantRef: "agent:alpha",
        declaredOrder: 0,
        completedAt: "2026-09-23T01:00:03.000Z",
        mutableStateRef: "state:alpha",
        stateMode: "independent",
        resultRef: "result:alpha",
        transcriptRef: "transcript:alpha",
        evidenceReceiptIds: ["receipt:alpha"]
      },
      {
        participantRef: "agent:beta",
        declaredOrder: 1,
        completedAt: "2026-09-23T01:00:01.000Z",
        mutableStateRef: "state:beta",
        stateMode: "independent",
        resultRef: "result:beta",
        transcriptRef: "transcript:beta",
        evidenceReceiptIds: ["receipt:beta"]
      }
    ]);

    expect(projection.semanticOrder.map((item) => item.participantRef)).toEqual([
      "agent:alpha",
      "agent:beta"
    ]);
    expect(projection.completionOrder.map((item) => item.participantRef)).toEqual([
      "agent:beta",
      "agent:alpha"
    ]);
    expect(projection.semanticOrder[0]?.resultRef).toBe("result:alpha");
    expect(projection.semanticOrder[0]?.transcriptRef).toBe("transcript:alpha");
  });

  it("rejects accidental mutable-state sharing between independent branches", () => {
    expect(() =>
      projectConcurrentBranchResults([
        {
          participantRef: "sample:one",
          declaredOrder: 0,
          completedAt: "2026-09-23T01:00:01.000Z",
          mutableStateRef: "memory:shared",
          stateMode: "independent",
          resultRef: "result:one",
          evidenceReceiptIds: []
        },
        {
          participantRef: "sample:two",
          declaredOrder: 1,
          completedAt: "2026-09-23T01:00:02.000Z",
          mutableStateRef: "memory:shared",
          stateMode: "independent",
          resultRef: "result:two",
          evidenceReceiptIds: []
        }
      ])
    ).toThrow(/must not share mutable state/);
  });

  it("allows explicitly shared mutable state without pretending it is independent", () => {
    expect(() =>
      projectConcurrentBranchResults([
        {
          participantRef: "agent:one",
          declaredOrder: 0,
          completedAt: "2026-09-23T01:00:01.000Z",
          mutableStateRef: "state:shared",
          stateMode: "shared_explicit",
          resultRef: "result:one",
          evidenceReceiptIds: []
        },
        {
          participantRef: "agent:two",
          declaredOrder: 1,
          completedAt: "2026-09-23T01:00:02.000Z",
          mutableStateRef: "state:shared",
          stateMode: "shared_explicit",
          resultRef: "result:two",
          evidenceReceiptIds: []
        }
      ])
    ).not.toThrow();
  });

  it("keeps newly created external capability drafts inert", () => {
    const qualification = qualifyExternalCapabilityForExecution({
      capabilityRef: "capability:extension",
      creatorIdentityRef: "agent:worker",
      ownerIdentityRef: "agent:worker",
      runtimeIdentityRef: "runtime:provider",
      lifecycle: "draft",
      activationEvidenceReceiptIds: [],
      observedAt: "2026-09-23T01:10:00.000Z"
    });

    expect(qualification).toMatchObject({
      eligible: false,
      refusalReasons: ["draft_is_inert"],
      authorityImplication: "none"
    });
  });

  it("requires immutable selected-version and activation evidence for active capabilities", () => {
    const missing = qualifyExternalCapabilityForExecution({
      capabilityRef: "capability:extension",
      creatorIdentityRef: "agent:worker",
      ownerIdentityRef: "agent:worker",
      runtimeIdentityRef: "runtime:provider",
      lifecycle: "active",
      activationEvidenceReceiptIds: [],
      observedAt: "2026-09-23T01:10:00.000Z"
    });

    expect(missing.eligible).toBe(false);
    expect(missing.refusalReasons).toEqual([
      "missing_selected_version",
      "missing_activation_authority",
      "missing_activation_evidence"
    ]);

    const qualified = qualifyExternalCapabilityForExecution({
      capabilityRef: "capability:extension",
      creatorIdentityRef: "agent:worker",
      ownerIdentityRef: "agent:worker",
      runtimeIdentityRef: "runtime:provider",
      lifecycle: "active",
      selectedVersionRef: "extension:minimal@v3",
      activationAuthorityRef: "provider:authority:activation:7",
      activationEvidenceReceiptIds: ["receipt:activation:7"],
      observedAt: "2026-09-23T01:11:00.000Z"
    });

    expect(qualified).toMatchObject({
      eligible: true,
      selectedVersionRef: "extension:minimal@v3",
      activationAuthorityRef: "provider:authority:activation:7",
      authorityImplication: "none"
    });
  });

  it("keeps disabled external capabilities outside the execution boundary", () => {
    const qualification = qualifyExternalCapabilityForExecution({
      capabilityRef: "capability:extension",
      creatorIdentityRef: "agent:worker",
      ownerIdentityRef: "agent:worker",
      runtimeIdentityRef: "runtime:provider",
      lifecycle: "disabled",
      selectedVersionRef: "extension:minimal@v3",
      activationAuthorityRef: "provider:authority:activation:7",
      activationEvidenceReceiptIds: ["receipt:activation:7"],
      observedAt: "2026-09-23T01:12:00.000Z"
    });

    expect(qualification).toMatchObject({
      eligible: false,
      refusalReasons: ["capability_disabled"]
    });
  });
});
