# PR Train Slot 200: Provider fallback relationship

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Define candidate fallback relationships without implying automatic semantic or safety equivalence.

## Boundary
Provider policy/capability/commercial metadata stays attributable, scoped, and versioned. Selection/fallback are derived decisions, never new canonical provider truth or autonomous authority.

## Gate
Search current offering/provider contracts first. Preserve scope, date, source, version, typed absence, and explicit predecessor/fallback relationships. Add falsification tests before implementation.

## Falsification
Reject if policy metadata becomes Swarm authority, jurisdiction is universalized, fallback implies equivalence, selection hides requirements, or stale external metadata is treated as current fact.

Implementation status: **not implemented in this PR**.
