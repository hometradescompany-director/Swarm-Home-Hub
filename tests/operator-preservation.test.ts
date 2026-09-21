import { describe, expect, it } from "vitest";
import {
  assertAtlasOperatorAgencyEnvelope,
  executableAgencyDelta,
} from "../src/integrations/atlas/operator-agency.js";
import { decideOperatorPreservation } from "../src/policy/operator-preservation.js";

const envelope = (
  standing: "operational" | "constrained" | "preservation-required" | "unknown"
) =>
  assertAtlasOperatorAgencyEnvelope({
    operatorRef: "operator:opaque:1",
    standing,
    executableOptionRefs: ["option:one"],
    evidenceRefs: ["evidence:one"],
    observedAt: "2026-09-21T03:37:00.000Z",
  });

describe("operator agency preservation", () => {
  it("measures agency as a change in executable options, not inferred wellbeing", () => {
    expect(executableAgencyDelta(["a"], ["a", "b", "c"])).toBe(2);
    expect(executableAgencyDelta(["a", "b"], ["b"])).toBe(-1);
    expect(executableAgencyDelta(["a", "a"], ["a"])).toBe(0);
  });

  it("keeps ordinary work moving when agency is operational", () => {
    expect(decideOperatorPreservation(envelope("operational"), "optional").disposition)
      .toBe("continue");
  });

  it("does not convert unknown standing into a crisis inference", () => {
    expect(decideOperatorPreservation(envelope("unknown"), "optional").disposition)
      .toBe("continue");
    expect(decideOperatorPreservation(envelope("unknown"), "irreversible").disposition)
      .toBe("require-explicit-confirmation");
  });

  it("defers repetitive and optional work when agency is constrained", () => {
    const repetitive = decideOperatorPreservation(envelope("constrained"), "repetitive");
    const optional = decideOperatorPreservation(envelope("preservation-required"), "optional");

    expect(repetitive.disposition).toBe("defer-nonessential");
    expect(repetitive.actions).toContain("avoid-repetition");
    expect(optional.disposition).toBe("defer-nonessential");
  });

  it("keeps essential work possible while adding preservation actions", () => {
    const decision = decideOperatorPreservation(
      envelope("preservation-required"),
      "essential"
    );

    expect(decision.disposition).toBe("continue");
    expect(decision.actions).toEqual(
      expect.arrayContaining([
        "preserve-context",
        "reduce-friction",
        "restore-options",
        "surface-owner",
      ])
    );
  });

  it("requires explicit confirmation before increasing cost or irreversibility", () => {
    expect(
      decideOperatorPreservation(envelope("constrained"), "cost-increasing").disposition
    ).toBe("require-explicit-confirmation");
    expect(
      decideOperatorPreservation(envelope("preservation-required"), "irreversible").disposition
    ).toBe("require-explicit-confirmation");
  });
});
