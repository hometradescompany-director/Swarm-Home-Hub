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
