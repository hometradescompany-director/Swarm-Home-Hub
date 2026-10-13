# Order 672: Temporal pacing and clock semantics

Status: **design seed only**. This PR does not implement or activate runtime behaviour.

## Existing boundaries

Swarm owns local residence lifecycle, habitat/capacity, rest/readiness, ready-handoff and local journal. Atlas owns global identity, authority and evidence. See [README](../../README.md), [architecture map](../ARCHITECTURE-MAP.md) and [Atlas federation](../ATLAS_FEDERATION.md). Check current implementation before writing code; do not duplicate an existing contract.

## Proposed bounded scope

Separate monotonic elapsed time from UTC wall time, timezone display and compute throttling; no subjective-experience claims.

## Acceptance and regression tests

Clock skew, DST, restart, stale timestamps and throttle tests.

## Delivery rules

1. Identify exact existing files/contracts and mark implemented, partial, documented-only or absent.
2. Implement the smallest missing executable seam with tests in a **follow-up implementation PR**. Do not treat this seed as implemented.
3. Keep original event provenance and explicit typed absence. Fail closed on authority/evidence uncertainty.
4. No credentials, PII, deployment, doctrine promotion, paid compute or unreviewed migrations.
5. Attach CI results and event/receipt examples to implementation review.

## Relationship to Order 666

Independent seed off `main`; deliberately no runtime edits and no dependencies on sibling seeds. Reviewable without merging the whole stack.
