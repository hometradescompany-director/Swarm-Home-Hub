import { expect, test, vi } from "vitest";
import { InMemoryIncubationJournal } from "../src/incubation/journal.js";
import { IncubationService, type IncubationReviewerAuthorization } from "../src/incubation/service.js";
import { assertIso8601Timestamp } from "../src/incubation/validation.js";
import type { AgentIdentityRef } from "../src/domain/agent.js";
import { createProvenanceReceipt, type ProvenanceReceipt } from "../src/provenance/receipt.js";

const subjectRef = "agent:test" as AgentIdentityRef;
const reviewedAt = "2026-11-27T10:00:00.000Z";
const observationAt = "2026-11-27T10:01:00.000Z";

function receipt(id = "receipt:one", standing: ProvenanceReceipt["standing"] = "source_record"): ProvenanceReceipt {
  return createProvenanceReceipt({ id, sourceRef: `source:${id}`, capturedAt: reviewedAt, standing });
}

function service(options: {
  receipts?: readonly ProvenanceReceipt[];
  authorized?: boolean;
  authorization?: IncubationReviewerAuthorization;
} = {}) {
  const journal = new InMemoryIncubationJournal();
  const resolver = { resolve: vi.fn(async () => options.receipts ?? [receipt()]) };
  const authorization = options.authorization ?? { mayReview: vi.fn(async () => options.authorized ?? true) };
  return { journal, resolver, authorization, service: new IncubationService(journal, resolver, authorization) };
}

const firstAssessment = {
  eventId: "event:one", subjectRef, actorRef: "reviewer:one", occurredAt: reviewedAt,
  stage: "sprite" as const, tier: 1 as const, outcome: "reviewed" as const,
  evidenceReceiptIds: ["receipt:one"], expectedLastEventId: null
};

test("timestamps require a real ISO-8601 date and an explicit timezone", () => {
  expect(() => assertIso8601Timestamp("2026-02-30T09:00:00Z", "time")).toThrow();
  expect(() => assertIso8601Timestamp("2026-11-27 09:00:00", "time")).toThrow();
  expect(() => assertIso8601Timestamp("2026-11-27T09:00:00+10:00", "time")).not.toThrow();
});

test("authorization fails closed before evidence is resolved or an event is written", async () => {
  const context = service({ authorized: false });
  await expect(context.service.recordAssessment(firstAssessment)).rejects.toThrow("not authorized");
  expect(context.resolver.resolve).not.toHaveBeenCalled();
  expect(await context.journal.eventsForSubject(subjectRef)).toHaveLength(0);
});

test("contested assessments are evidence-backed and remain contested in the projection", async () => {
  const context = service();
  await context.service.recordAssessment({ ...firstAssessment, outcome: "contested" });
  const standing = await context.service.getStanding(subjectRef, observationAt);
  expect(standing.status).toBe("contested");
  if (standing.status === "contested") expect(standing.assessment.evidenceReceiptIds).toEqual(["receipt:one"]);
});

test.each([
  ["hypothesis", receipt("receipt:one", "hypothesis")],
  ["unknown standing", receipt("receipt:one", "unknown")],
  ["absence receipt", createProvenanceReceipt({ id: "receipt:one", sourceRef: "source:none", capturedAt: reviewedAt, standing: "source_record", absence: { kind: "not_searched", statement: "No record found.", observedAt: reviewedAt } })]
])("%s evidence is rejected before append", async (_label, evidenceReceipt) => {
  const context = service({ receipts: [evidenceReceipt] });
  await expect(context.service.recordAssessment(firstAssessment)).rejects.toThrow();
  expect(await context.journal.eventsForSubject(subjectRef)).toHaveLength(0);
});

test("resolver must return exactly the requested receipt IDs", async () => {
  const context = service({ receipts: [receipt("receipt:other")] });
  await expect(context.service.recordAssessment(firstAssessment)).rejects.toThrow("unavailable");
  expect(await context.journal.eventsForSubject(subjectRef)).toHaveLength(0);
});

test("withdrawal is authorized and appended without deleting assessment history", async () => {
  const context = service();
  await context.service.recordAssessment(firstAssessment);
  await context.service.withdrawAssessment({
    eventId: "event:withdrawn", subjectRef, actorRef: "reviewer:one", occurredAt: observationAt,
    assessmentEventId: "event:one", reason: "Evidence was superseded.",
    evidenceReceiptIds: ["receipt:one"], expectedLastEventId: "event:one"
  });
  const standing = await context.service.getStanding(subjectRef, observationAt);
  expect(standing.status).toBe("withdrawn");
  expect(standing.history).toHaveLength(2);
  if (standing.status !== "withdrawn") throw new Error("withdrawn assessment was not projected");
  expect(standing.absence.kind).toBe("superseded");
  expect(context.authorization.mayReview).toHaveBeenCalledWith({ actorRef: "reviewer:one", subjectRef, action: "withdraw" });
});

test("stale expected predecessor cannot append a second assessment", async () => {
  const context = service();
  await context.service.recordAssessment(firstAssessment);
  await expect(context.service.recordAssessment({
    ...firstAssessment, eventId: "event:two", occurredAt: observationAt, expectedLastEventId: null
  })).rejects.toThrow("stale incubation snapshot");
  expect(await context.journal.eventsForSubject(subjectRef)).toHaveLength(1);
});
