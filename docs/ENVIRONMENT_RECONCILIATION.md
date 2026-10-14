# Hub residence-to-handoff reconciliation

This is a bounded map of the implemented public path, not a new state source.
“Implemented” means an executable contract and test path exist; it does not
claim production persistence or deployment. “Partial” means the path exists
but has a material boundary or runtime-adapter gap. “Absent” means the
capability is deliberately not exposed.

## Transition map

| Transition | Status | State owner and evidence |
| --- | --- | --- |
| External agent → identity | Implemented | Adapters pass an opaque identity to the Swarm door. `ResidenceRequestService` asks Atlas to resolve it before recording a request. Atlas owns the global identity mapping; Swarm retains the opaque product reference. See `src/service/request-service.ts` and `src/integrations/atlas/http-gateway.ts`. |
| Identity → residence request | Partial | Swarm owns the request and appends `swarm.residence.requested` to its journal. Receipt references are preserved on the event. Requests with no evidence refs work; non-empty refs require Atlas retrieval, which the current gateway deliberately refuses. See `src/events/event.ts`, `src/integrations/atlas/http-gateway.ts`, and `tests/request-evidence-boundary.test.ts`. |
| Authority → admission/rejection | Implemented | Atlas owns the global `swarm.residence.enter` decision. Swarm owns admission: it records a rejection on denied authority or local policy/capacity refusal, and admits only after both gates pass. See `src/service/admission-service.ts` and `tests/admission-decision.test.ts`. |
| Habitat capacity | Implemented in the reference runtime; production persistence partial | Swarm owns habitat capacity policy. The journal checks capacity at append time to close the in-process race; current journal and registry implementations are in-memory. See `src/events/journal.ts` and `tests/atomic-habitat-capacity.test.ts`. |
| Admission → rest → readiness | Implemented | Swarm policy and services append the transitions; projections derive current residence state from the event chain. See `src/service/rest-service.ts`, `src/policy/readiness.ts`, and `tests/residence-phase-contract.test.ts`. |
| Readiness → work handoff | Implemented | Swarm derives a bounded, current-ready capsule from residence events and habitat state, then revalidates it against both; unavailable or invalid handoffs return typed absences. This is a handoff projection, not a task queue or independent truth store. See `src/service/ready-handoff-service.ts`, `src/query/ready-handoff.ts`, and `src/provenance/absence.ts`. The separate Atlas work ingress and external execution-provider path have their own bounded contracts. |
| Work handoff → departure | Implemented | Swarm appends departure to the same residence history; it supersedes the ready event, so the former capsule fails revalidation. See `src/service/departure-service.ts` and `tests/residence-phase-contract.test.ts`. |
| Swarm residence events → Atlas | Partial | `AtlasResidenceEventPublisher` reads the residence journal as its outbox, derives deterministic Atlas event ids, and records delivery receipts for replay. The HTTP sink and publisher are tested. The repository has only an in-memory journal and delivery ledger and no production composition/sweep; durable host adapters and a sweep owner remain necessary before enabling production delivery. See `src/integrations/atlas/event-delivery.ts`, `src/integrations/atlas/event-sink.ts`, and `tests/atlas-event-delivery.test.ts`. |
| Atlas evidence → Swarm retrieval | Absent | `AtlasGateway.evidence` exists as an interface, but `AtlasHttpGateway.evidence` returns empty only for an empty request and fails closed for non-empty ids. No dedicated evidence retrieval endpoint is implemented, and this refusal is currently an error rather than a typed absence. Evidence records remain Atlas-owned; Swarm stores and validates receipt references, not global evidence truth. See `src/integrations/atlas/contract.ts`, `src/integrations/atlas/http-gateway.ts`, and `tests/request-evidence-boundary.test.ts`. |

## Ownership boundary

- **Swarm:** local residence lifecycle, habitat/capacity, rest/readiness,
  current-ready handoff capsules, and the local append-only residence journal
  and its projections. The journal is local lifecycle truth; projections are
  derived views.
- **Atlas:** global identity mapping, global authority decisions, and global
  evidence. Swarm records opaque references and attributable local events; an
  Atlas decision or evidence receipt does not itself change local residence
  state.
- **External agent/provider:** its own runtime and execution state. The Swarm
  handoff carries bounded context; it does not import an external task or
  identity registry.
- **Receipts:** residence events carry receipt ids and authority refs. Atlas
  remains authoritative for Atlas evidence; the local event journal is where
  Swarm's transition history and its links to that evidence live. Atlas
  delivery receipts are separate local delivery-attempt records, not residence
  events.

## Bounded next steps

1. **Evidence retrieval:** do not invent a local evidence registry. Once Atlas
   exposes a dedicated, scoped retrieval contract, add that endpoint to the
   existing `AtlasGateway`; resolve every requested id, validate provenance,
   and keep the request event append fail-closed if any receipt is missing,
   malformed, or unavailable. Model missing/unavailable evidence with the
   existing typed-absence vocabulary rather than an exception or an empty
   response that could be mistaken for successful retrieval.
2. **Production event delivery:** reuse the journal as the outbox source; do
   not add a second enqueue store. A production host must supply a durable,
   authoritative journal scan and durable `AtlasDeliveryLedger`, plus an
   owned retry sweep. Keep deterministic Atlas event identity and persist
   delivery receipts separately so retries after uncertain acknowledgements
   remain idempotent.

The phase-level end-to-end proof is `tests/residence-phase-contract.test.ts`.
Atlas evidence and outbound delivery boundaries are exercised by
`tests/request-evidence-boundary.test.ts` and
`tests/atlas-event-delivery.test.ts`. The supported commands are
`npm run test:residence-phase` and `npm run check`.
