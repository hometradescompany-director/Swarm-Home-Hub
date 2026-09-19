import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { projectHabitatState } from "../src/query/habitat-state.js";

const residence = (
  id: string,
  status: ResidenceSnapshot["status"]
): ResidenceSnapshot => ({
  residenceId: id as never,
  agentIdentityRef: `agent:${id}` as never,
  habitatId: "habitat:one" as never,
  status,
  version: 1,
  lastEventId: `event:${id}`
});

describe("habitat state projection", () => {
  it("derives capacity from occupying residences only", () => {
    const state = projectHabitatState(
      { id: "habitat:one" as never, name: "One", capacity: 3, status: "open", heartbeatStaleAfterMs: 60_000 },
      [
        residence("request", "requested"),
        residence("admitted", "admitted"),
        residence("resting", "resting")
      ]
    );

    expect(state).toEqual({
      habitatId: "habitat:one",
      status: "open",
      capacity: 3,
      occupied: 2,
      available: 1,
      atCapacity: false,
      acceptingAdmissions: true
    });
  });

  it("closes admissions when the habitat is paused even with free capacity", () => {
    const state = projectHabitatState(
      { id: "habitat:one" as never, name: "One", capacity: 3, status: "paused", heartbeatStaleAfterMs: 60_000 },
      [residence("admitted", "admitted")]
    );

    expect(state.available).toBe(2);
    expect(state.acceptingAdmissions).toBe(false);
  });

  it("fails loudly if the derived state exceeds declared capacity", () => {
    expect(() =>
      projectHabitatState(
        { id: "habitat:one" as never, name: "One", capacity: 1, status: "open", heartbeatStaleAfterMs: 60_000 },
        [residence("one", "admitted"), residence("two", "ready")]
      )
    ).toThrow(/exceeds capacity/);
  });
});
