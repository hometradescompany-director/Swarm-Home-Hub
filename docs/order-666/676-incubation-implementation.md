# Order 676: Sprite, Sapling, and Ent incubation

## Purpose

This document records the first bounded implementation of the Order 676 incubation seed. It makes developmental assessments explicit, reviewable, evidence-linked, and replayable. It does not define the full Atlas life-cycle ontology.

## Corpus synthesis and limits

The source corpus distinguishes **Primordials** (world-architecture concepts) from **Legacies** (systems with a life cycle that can mature, contribute, and pass on). For those life-cycle-bearing entities it names the progression **Sprite → Sapling → Ent**, and it sketches nine developmental tiers.

The corpus also marks the detailed tier placements and “primal” forms as exploratory and unresolved. The implementation therefore records a stage and a tier as separate reviewed values. It does not infer one from the other, encode a primal modifier, or treat the nine tiers as ratified ontology. Primordial concepts are not subjects of this Swarm agent-incubation record.

## Implemented contract

- A record applies to an opaque `AgentIdentityRef`; identity ownership remains with Atlas.
- An explicit reviewer supplies one of `sprite`, `sapling`, or `ent`, a tier from 1 through 9, a review outcome, a timestamp, and one or more provenance receipt IDs.
- Evidence resolution is a required dependency. Missing receipts and receipts whose standing is `hypothesis` or `unknown` fail closed before an event is appended. Direct observation, source record, user report, and supported inference are accepted as evidence inputs; the reviewer remains responsible for the assessment.
- A record can be marked `contested`. It remains visible in the history and is never represented as an accepted review.
- An assessment can be withdrawn by an explicit, evidence-backed action. Withdrawal appends a new event; it never erases prior history.
- Optimistic predecessor checks and monotonic event time prevent stale writes and broken subject histories.
- The `IncubationJournal` persistence port is independent from the residence `EventJournal`. This preserves residence transition and ready-handoff chains and allows a durable notebook adapter to be added without changing the domain service.

## Boundaries

There is no automatic promotion, maturity threshold, capability grant, payment, prestige, admission, readiness, or Atlas authority change. Stage and tier are descriptive review metadata only. The service has no timer, scheduler, or background worker.

The repository currently supplies an in-memory journal for development and tests. It is process-local and not durable. No notebook adapter or notebook transport is present in this repository; a connected notebook can implement `IncubationJournal` and `IncubationEvidenceResolver` once its actual storage contract is available. The interfaces do not assume a notebook product or invent a transport.

## Public API

`IncubationService.recordAssessment()` records a reviewed or contested assessment; `withdrawAssessment()` appends an evidence-backed withdrawal; `getStanding()` reconstructs the current descriptive status and full event history. There is deliberately no `promote()` operation. Callers must provide `expectedLastEventId` on each write.

## Source of truth

This V1 contract is a conservative executable reading of the exploratory corpus and the Swarm architecture map. The corpus remains authoritative for future ontology decisions. Any ratification of tier mapping, “primal” categories, or broader Legacy life-cycle rules should be recorded in the source corpus and reviewed as a separate change before runtime behavior is expanded.
