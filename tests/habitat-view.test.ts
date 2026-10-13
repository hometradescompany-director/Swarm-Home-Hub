import { describe, expect, it } from "vitest";
import type { ResidenceSnapshot } from "../src/domain/residence.js";
import { buildHabitatView, renderHabitatView } from "../site/habitat-view.ts";

const res = (id: string, status: string): ResidenceSnapshot => ({
  residenceId: id as never,
  agentIdentityRef: `agent:secret-${id}` as never,
  habitatId: "habitat:one" as never,
  status: status as never,
  version: 1,
  lastEventId: `event:${id}`
});
const habitat = (capacity: number) =>
  ({ id: "habitat:one" as never, name: "One", capacity, status: "open", heartbeatStaleAfterMs: 1 }) as const;

describe("habitat visualization view", () => {
  it("is deterministic and derived from the projection", () => {
    const rs = [res("a", "ready"), res("b", "resting"), res("c", "departed")];
    const v = buildHabitatView(habitat(3), rs);
    expect(v).toEqual(buildHabitatView(habitat(3), rs));
    expect(v.occupied).toBe(2);
    expect(v.available).toBe(1);
    expect(v.residents.map((r) => r.label)).toEqual(["Resident 1", "Resident 2", "Resident 3"]);
  });

  it("renders unknown for missing habitat, bad capacity and unrecognised status", () => {
    expect(buildHabitatView(null, []).status).toBe("unknown");
    const over = buildHabitatView(habitat(1), [res("a", "ready"), res("b", "ready")]);
    expect(over.status).toBe("unknown");
    expect(over.capacity).toBeNull();
    expect(buildHabitatView(habitat(2), [res("a", "weird")]).residents[0]?.status).toBe("unknown");
    expect(buildHabitatView(habitat(2), [null]).residents).toEqual([]);
  });

  it("exposes accessible labels and leaks no identity or markup", () => {
    const html = renderHabitatView(buildHabitatView(habitat(2), [res("a", "ready")]));
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="One: open, 1 of 2 places occupied"');
    expect(html).not.toContain("secret");
    expect(html).not.toContain("agent:");
    const evil = renderHabitatView(buildHabitatView({ ...habitat(2), name: '<img onerror=x>"' }, []));
    expect(evil).not.toContain("<img");
  });
});
