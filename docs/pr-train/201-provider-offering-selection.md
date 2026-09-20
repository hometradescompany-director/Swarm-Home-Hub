# PR Train Slot 201: Provider selection projection

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Specify how a host may derive a provider choice from bounded requirements without making the selector a source of truth.

## Boundary
Provider policy/capability/commercial metadata stays attributable, scoped, and versioned. Selection/fallback are derived decisions, never new canonical provider truth or autonomous authority.

## Gate
Search current offering/provider contracts first. Preserve scope, date, source, version, typed absence, and explicit predecessor/fallback relationships. Add falsification tests before implementation.

## Falsification
Reject if policy metadata becomes Swarm authority, jurisdiction is universalized, fallback implies equivalence, selection hides requirements, or stale external metadata is treated as current fact.

Implementation status: **not implemented in this PR**.
