import { describe, expect, it } from "vitest";
import {
  createTypedAbsence,
  projectHabitatState,
  projectResidence,
  type AgentIdentityRef,
  type HabitatId,
  type ResidenceId,
  type SwarmResidenceEvent
} from "../src/index.js";
import { renderHabitatView } from "../site/habitat-view.js";

const habitatId = "habitat:demo" as HabitatId;
const events = (id: string, admitted: boolean): SwarmResidenceEvent[] => {
  const first: SwarmResidenceEvent = {
    id: `event:${id}:requested`,
    type: "swarm.residence.requested",
    occurredAt: "2026-09-22T01:00:00Z",
    observedAt: "2026-09-22T01:00:01Z",
    actorRef: "actor:demo",
    residenceId: `residence:${id}` as ResidenceId,
    agentIdentityRef: `agent:opaque:${id}` as AgentIdentityRef,
    habitatId,
    evidenceReceiptIds: ["evidence:demo:request"],
    previousEventId: null
  };
  return admitted ? [
    first,
    {
      ...first,
      id: `event:${id}:admitted`,
      type: "swarm.residence.admitted",
      occurredAt: "2026-09-22T02:00:00Z",
      observedAt: "2026-09-22T02:00:01Z",
      previousEventId: first.id,
      evidenceReceiptIds: ["evidence:demo:admission"]
    }
  ] : [first];
};

describe("site habitat visualization", () => {
  it("renders projected occupancy from synthetic residence events with accessible labels and provenance", () => {
    const snapshots = [events("cedar", true), events("finch", false)]
      .map((history) => projectResidence(history)!);
    const state = projectHabitatState(
      { id: habitatId, name: "Demo", capacity: 2, status: "open", heartbeatStaleAfterMs: 60_000 },
      snapshots
    );
    const html = renderHabitatView({
      kind: "projected",
      state,
      eventIds: snapshots.map((snapshot) => snapshot.lastEventId)
    });

    expect(html).toContain('aria-labelledby="habitat-heading"');
    expect(html).toContain('<dt>Occupied</dt><dd>1</dd>');
    expect(html).toContain('<dt>Available</dt><dd>1</dd>');
    expect(html).toContain("Admissions: accepting");
    expect(html).toContain("event:cedar:admitted, event:finch:requested");
    expect(html).not.toContain("agent:opaque:");
  });

  it("renders a typed unknown without implying an available habitat or leaking markup", () => {
    const html = renderHabitatView({
      kind: "unknown",
      absence: createTypedAbsence({
        kind: "status_unknown",
        statement: "Habitat <script>alert(1)</script> unavailable",
        observedAt: "2026-09-22T03:00:00Z"
      })
    });

    expect(html).toContain('<h2 id="habitat-heading">Habitat status unknown</h2>');
    expect(html).toContain("Unavailable (status_unknown)");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("Admissions: accepting");
  });

  it("shows paused habitats as not accepting even when capacity remains", () => {
    const state = projectHabitatState(
      { id: habitatId, name: "Demo", capacity: 2, status: "paused", heartbeatStaleAfterMs: 60_000 },
      [projectResidence(events("cedar", true))!]
    );
    expect(renderHabitatView({ kind: "projected", state, eventIds: [] }))
      .toContain("Admissions: not accepting");
  });
});
