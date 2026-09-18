import { describe, expect, it } from "vitest";
import { assertHabitatCapacity } from "../src/domain/habitat.js";
import { assertAllowedTransition } from "../src/policy/transitions.js";

describe("phase-one foundation", () => {
  it("does not treat request as admission", () => {
    expect(() => assertAllowedTransition("requested", "ready")).toThrow();
    expect(() => assertAllowedTransition("requested", "admitted")).not.toThrow();
  });

  it("fails closed when habitat capacity is exhausted", () => {
    expect(() =>
      assertHabitatCapacity(
        { id: "habitat:one" as never, name: "One", capacity: 1, status: "open" },
        1
      )
    ).toThrow();
  });

  it("keeps departure terminal", () => {
    expect(() => assertAllowedTransition("departed", "ready")).toThrow();
  });
});
