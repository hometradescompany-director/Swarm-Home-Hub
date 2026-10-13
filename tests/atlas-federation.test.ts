import { describe, expect, it } from "vitest";
import {
  AtlasFederationTransport
} from "../src/platform/atlas-federation-transport.js";
import type {
  AtlasWorkRequestedEvent,
  SwarmWorkHandoffHandler
} from "../src/integrations/atlas/work-handoff.js";

const token = "test-atlas-federation-token";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://example.test/swarm-home/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...headers
    },
    body: JSON.stringify(body)
  });
}

const validEvent = {
  contract: "atlas-event/v1",
  event_id: "atlas:event:1",
  name: "atlas.work.requested",
  occurred_at: "2026-10-05T00:00:00.000Z",
  subject_ref: "atlas:subject:1",
  source_sequence: null,
  handoff_contract: "atlas-swarm-handoff/v1",
  work_kind: "example.work",
  parameters: { value: 42 }
} as const;

function handler(
  outcome: Awaited<ReturnType<SwarmWorkHandoffHandler["handle"]>> = {
    accepted: true,
    correlationId: validEvent.event_id
  }
) {
  const calls: AtlasWorkRequestedEvent[] = [];
  const h: SwarmWorkHandoffHandler = {
    async handle(event) {
      calls.push(event);
      return outcome;
    }
  };
  return { h, calls };
}

describe("Atlas federation ingress", () => {
  it("accepts a valid handoff and preserves event correlation", async () => {
    const { h, calls } = handler({ accepted: true, correlationId: validEvent.event_id });
    const web = new AtlasFederationTransport({ token, handler: h });
    const response = await web.handle(request(validEvent));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      accepted: true,
      correlation_id: validEvent.event_id
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      eventId: validEvent.event_id,
      workKind: validEvent.work_kind,
      parameters: validEvent.parameters
    });
  });

  it("rejects missing and invalid authentication before dispatch", async () => {
    const { h, calls } = handler();
    const web = new AtlasFederationTransport({ token, handler: h });

    const missing = await web.handle(request(validEvent, { authorization: "" }));
    const wrong = await web.handle(request(validEvent, { authorization: "Basic nope" }));
    const bad = await web.handle(request(validEvent, { authorization: "Bearer wrong" }));

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(bad.status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it("fails closed when the host has no federation secret", async () => {
    const { h } = handler();
    const web = new AtlasFederationTransport({ token: "", handler: h });
    const response = await web.handle(request(validEvent));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "federation_not_configured"
    });
  });

  it("validates JSON framing and the Atlas handoff envelope", async () => {
    const { h, calls } = handler();
    const web = new AtlasFederationTransport({ token, handler: h });

    const contentType = await web.handle(new Request("https://example.test/swarm-home/events", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "text/plain" },
      body: "{}"
    }));
    expect(contentType.status).toBe(415);

    for (const invalid of [
      { ...validEvent, contract: "wrong" },
      { ...validEvent, name: "wrong" },
      { ...validEvent, event_id: "" },
      { ...validEvent, occurred_at: "not-a-date" },
      { ...validEvent, subject_ref: "" },
      { ...validEvent, handoff_contract: "wrong" },
      { ...validEvent, work_kind: "" },
      { ...validEvent, parameters: [] }
    ]) {
      const response = await web.handle(request(invalid));
      expect(response.status).toBe(400);
    }
    expect(calls).toHaveLength(0);
  });

  it("accepts only bounded, canonical UTC timestamps", async () => {
    const { h, calls } = handler();
    const web = new AtlasFederationTransport({ token, handler: h });

    for (const occurred_at of [
      "2026-10-05T00:00:00Z",
      "2026-10-05T00:00:00.1Z",
      "2026-10-05T00:00:00.12Z",
      "2026-10-05T00:00:00.123Z"
    ]) {
      const response = await web.handle(request({ ...validEvent, occurred_at }));
      expect(response.status).toBe(202);
    }

    for (const occurred_at of [
      "2026-02-30T00:00:00Z",
      "2026-13-01T00:00:00Z",
      "2026-10-05T24:00:00Z",
      "2026-10-05T00:00:00",
      "2026-10-05T00:00:00+00:00",
      "2026-10-05T00:00Z",
      "2026-10-05T00:00:00.1234Z",
      "2026-10-05T00:00:00Z trailing text",
      "2026-10-05T00:00:00.12345678901234567890Z",
      null,
      1
    ]) {
      const response = await web.handle(request({ ...validEvent, occurred_at }));
      expect(response.status).toBe(400);
    }

    expect(calls).toHaveLength(4);
  });

  it("returns handler refusal without turning it into transport failure", async () => {
    const { h } = handler({
      accepted: false,
      correlationId: validEvent.event_id,
      reason: "work_kind_not_admitted"
    });
    const web = new AtlasFederationTransport({ token, handler: h });
    const response = await web.handle(request(validEvent));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      accepted: false,
      correlation_id: validEvent.event_id,
      refusal: { reason: "work_kind_not_admitted" }
    });
  });

  it("contains handler failures and rejects correlation drift", async () => {
    const throwing: SwarmWorkHandoffHandler = {
      async handle() {
        throw new Error("internal detail");
      }
    };
    const failed = await new AtlasFederationTransport({ token, handler: throwing }).handle(request(validEvent));
    expect(failed.status).toBe(500);
    await expect(failed.json()).resolves.toEqual({
      ok: false,
      error: "federation_handler_failed"
    });

    const drift: SwarmWorkHandoffHandler = {
      async handle(event) {
        return { accepted: true, correlationId: event.eventId + ":different" };
      }
    };
    const response = await new AtlasFederationTransport({ token, handler: drift }).handle(request(validEvent));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "federation_handler_invalid_correlation"
    });
  });

  it("does not expose the bearer secret in responses", async () => {
    const web = new AtlasFederationTransport({ token, handler: handler().h });
    const response = await web.handle(request({ ...validEvent, parameters: { token } }));
    const text = await response.text();
    expect(text).not.toContain(token);
  });
});
