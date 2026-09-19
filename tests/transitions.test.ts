import { describe, expect, it } from "vitest";
import { assertAllowedTransition } from "../src/policy/transitions.js";

describe("residence transitions", () => {
  it("allows admitted -> resting", () => {
    expect(() => assertAllowedTransition("admitted", "resting")).not.toThrow();
  });

  it("rejects requested -> ready", () => {
    expect(() => assertAllowedTransition("requested", "ready")).toThrow();
  });

  it("keeps departed terminal", () => {
    expect(() => assertAllowedTransition("departed", "resting")).toThrow();
  });
});
