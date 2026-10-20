# PR Train Slot 199: Provider jurisdiction availability

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent geographic/legal availability with explicit scope and date rather than universal support.

## Boundary
Provider policy/capability/commercial metadata stays attributable, scoped, and versioned. Selection/fallback are derived decisions, never new canonical provider truth or autonomous authority.

## Gate
Search current offering/provider contracts first. Preserve scope, date, source, version, typed absence, and explicit predecessor/fallback relationships. Add falsification tests before implementation.

## Falsification
Reject if policy metadata becomes Swarm authority, jurisdiction is universalized, fallback implies equivalence, selection hides requirements, or stale external metadata is treated as current fact.

Implementation status: **not implemented in this PR**.
