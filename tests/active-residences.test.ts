import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { activeResidencesForHabitat } from "../src/query/active-residences.js";

const snapshot = (
  id: string,
  status: ResidenceSnapshot["status"],
  habitat = "habitat:one"
): ResidenceSnapshot => ({
  residenceId: id as never,
  agentIdentityRef: `agent:${id}` as never,
  habitatId: habitat as never,
  status,
  version: 1,
  lastEventId: `event:${id}`
});

describe("habitat occupancy", () => {
  it("counts only admitted, resting and ready residences as occupying capacity", () => {
    const rows = [
      snapshot("requested", "requested"),
      snapshot("admitted", "admitted"),
      snapshot("resting", "resting"),
      snapshot("ready", "ready"),
      snapshot("departed", "departed"),
      snapshot("rejected", "rejected")
    ];

    expect(
      activeResidencesForHabitat(rows, "habitat:one" as never).map(row => row.status)
    ).toEqual(["admitted", "resting", "ready"]);
  });

  it("never lets a request consume capacity before admission", () => {
    expect(
      activeResidencesForHabitat(
        [snapshot("requested", "requested")],
        "habitat:one" as never
      )
    ).toHaveLength(0);
  });
});
