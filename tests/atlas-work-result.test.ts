import { describe, expect, it } from "vitest";
import {
  AtlasWorkResultReporter,
  buildAtlasWorkResultEvent,
  workResultOutcome
} from "../src/integrations/atlas/work-result.js";
import type { AtlasWorkRequestedEvent } from "../src/integrations/atlas/work-handoff.js";

const request: AtlasWorkRequestedEvent = {
  contract: "atlas-event/v1",
  eventId: "2f1d0a3b-4c5e-4f60-8a91-0b2c3d4e5f60",
  name: "atlas.work.requested",
  occurredAt: "2026-10-05T00:00:00.000Z",
  subjectRef: "agent:abc12345",
  sourceSequence: null,
  handoffContract: "atlas-swarm-handoff/v1",
  workKind: "residence.prepare",
  parameters: {}
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("atlas-swarm-handoff/v1 return path", () => {
  it("builds a swarm.work.result atlas-event/v1 envelope correlated by request event_id", async () => {
    const a = await buildAtlasWorkResultEvent(request, "completed", "2026-10-05T00:00:01.000Z");
    const b = await buildAtlasWorkResultEvent(request, "completed", "2026-10-05T00:00:09.000Z");
    expect(a["name"]).toBe("swarm.work.result");
    expect(a["contract"]).toBe("atlas-event/v1");
    expect(a["event_id"]).toMatch(UUID);
    expect(a["event_id"]).toBe(b["event_id"]);
    expect(a["payload"]).toEqual({ correlation_event_id: request.eventId, outcome: "completed", work_kind: "residence.prepare" });
  });

  it("maps handler outcomes", () => {
    expect(workResultOutcome({ accepted: true, correlationId: "x" })).toBe("completed");
    expect(workResultOutcome({ accepted: false, correlationId: "x", reason: "no" })).toBe("refused");
    expect(workResultOutcome(null)).toBe("failed");
  });

  it("posts to the Atlas gateway ingest with the bearer token and checks identity", async () => {
    let seen: { url: string; auth: string | null; body: Record<string, unknown> } | null = null;
    const fetcher = (async (url: URL, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      seen = { url: String(url), auth: new Headers(init.headers).get("authorization"), body };
      return new Response(JSON.stringify({ ok: true, data: { event_id: body["event_id"], atlas_event_id: "rec-1", accepted: true, duplicate: false } }), { status: 200 });
    }) as unknown as typeof fetch;
    const reporter = new AtlasWorkResultReporter({ baseUrl: "https://atlas.example", token: "t", fetcher });
    const out = await reporter.report(request, "refused");
    expect(seen!.url).toBe("https://atlas.example/api/public/v1/events");
    expect(seen!.auth).toBe("Bearer t");
    expect(out).toMatchObject({ correlationEventId: request.eventId, atlasRecordId: "rec-1", accepted: true });
  });

  it("surfaces Atlas refusals", async () => {
    const fetcher = (async () => new Response(JSON.stringify({ ok: false, refusal: { reason: "no active capability for observe:event", stage: "capability" } }), { status: 403 })) as unknown as typeof fetch;
    const reporter = new AtlasWorkResultReporter({ baseUrl: "https://atlas.example", token: "t", fetcher });
    await expect(reporter.report(request, "completed")).rejects.toThrow(/capability/);
  });
});
