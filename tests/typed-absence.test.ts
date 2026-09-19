import { describe, expect, it } from "vitest";
import { createTypedAbsence } from "../src/provenance/absence.js";

describe("typed absence", () => {
  it("creates an immutable normalized absence", () => {
    const absence = createTypedAbsence({
      kind: "cannot_be_located",
      statement: "  No local evidence located.  ",
      observedAt: "2026-09-20T02:20:00.000Z",
      sourceRef: "  swarm:test:absence  "
    });

    expect(absence).toEqual({
      kind: "cannot_be_located",
      statement: "No local evidence located.",
      observedAt: "2026-09-20T02:20:00.000Z",
      sourceRef: "swarm:test:absence"
    });
    expect(Object.isFrozen(absence)).toBe(true);
  });

  it("refuses blank statements", () => {
    expect(() =>
      createTypedAbsence({
        kind: "status_unknown",
        statement: "   ",
        observedAt: "2026-09-20T02:20:00.000Z"
      })
    ).toThrow(/non-empty statement/);
  });

  it("refuses malformed observation time", () => {
    expect(() =>
      createTypedAbsence({
        kind: "corrupted",
        statement: "Malformed source.",
        observedAt: "not-a-time"
      })
    ).toThrow(/observedAt/);
  });

  it("requires both sides of a supersession relationship", () => {
    expect(() =>
      createTypedAbsence({
        kind: "superseded",
        statement: "Prior observation superseded.",
        observedAt: "2026-09-20T02:20:00.000Z",
        sourceRef: "swarm:event:old"
      })
    ).toThrow(/sourceRef and supersededByRef/);

    expect(
      createTypedAbsence({
        kind: "superseded",
        statement: "Prior observation superseded.",
        observedAt: "2026-09-20T02:20:00.000Z",
        sourceRef: "swarm:event:old",
        supersededByRef: "swarm:event:new"
      })
    ).toMatchObject({
      kind: "superseded",
      sourceRef: "swarm:event:old",
      supersededByRef: "swarm:event:new"
    });
  });

  it("refuses supersession metadata on other absence kinds", () => {
    expect(() =>
      createTypedAbsence({
        kind: "status_unknown",
        statement: "Unknown.",
        observedAt: "2026-09-20T02:20:00.000Z",
        supersededByRef: "swarm:event:new"
      })
    ).toThrow(/only valid for superseded/);
  });

  it("requires both sides of a contradiction relationship", () => {
    expect(() =>
      createTypedAbsence({
        kind: "contradictory",
        statement: "Two observations disagree.",
        observedAt: "2026-09-20T02:30:00.000Z",
        sourceRef: "swarm:evidence:left"
      })
    ).toThrow(/sourceRef and contradictsRef/);

    expect(
      createTypedAbsence({
        kind: "contradictory",
        statement: "Two observations disagree.",
        observedAt: "2026-09-20T02:30:00.000Z",
        sourceRef: "swarm:evidence:left",
        contradictsRef: "swarm:evidence:right"
      })
    ).toMatchObject({
      kind: "contradictory",
      sourceRef: "swarm:evidence:left",
      contradictsRef: "swarm:evidence:right"
    });
  });

  it("refuses self-contradiction and contradiction metadata on other kinds", () => {
    expect(() =>
      createTypedAbsence({
        kind: "contradictory",
        statement: "Invalid self contradiction.",
        observedAt: "2026-09-20T02:30:00.000Z",
        sourceRef: "swarm:evidence:same",
        contradictsRef: "swarm:evidence:same"
      })
    ).toThrow(/distinct refs/);

    expect(() =>
      createTypedAbsence({
        kind: "status_unknown",
        statement: "Unknown.",
        observedAt: "2026-09-20T02:30:00.000Z",
        contradictsRef: "swarm:evidence:right"
      })
    ).toThrow(/only valid for contradictory/);
  });

  it("refuses blank source references", () => {
    expect(() =>
      createTypedAbsence({
        kind: "provenance_lost",
        statement: "Source relationship lost.",
        observedAt: "2026-09-20T02:20:00.000Z",
        sourceRef: "  "
      })
    ).toThrow(/sourceRef/);
  });
});
