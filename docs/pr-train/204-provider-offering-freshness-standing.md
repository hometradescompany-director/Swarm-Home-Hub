# PR Train Slot 204: Provider offering freshness standing

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent whether provider/model offering metadata is current, stale, superseded, unknown, or awaiting re-observation without rewriting the underlying evidence.

## Boundary
Freshness is a standing over evidence, not permission to mutate provider truth. Unknown and stale states remain explicit and do not imply unavailability.

## Gate
Extend existing temporal/provenance primitives first. Keep observed_at distinct from effective_at and ingested_at, and require an evidence reference for every freshness transition.

## Falsification
Reject if stale becomes false, unknown becomes unavailable, refresh rewrites historical observations, or newer ingestion time is treated as newer provider truth.

Implementation status: **not implemented in this PR**.
