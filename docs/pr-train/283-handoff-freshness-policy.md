# PR Train Slot 283: Handoff freshness policy

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define explicit freshness policy for ready-handoff capsules using the authoritative readiness event and generation time.

## Boundary
Freshness determines whether a handoff projection may be used; it does not alter the underlying readiness event.

## Gate
Reuse validateCurrentReadyHandoff and readiness timestamps. Preserve policy version, max age, source readiness event, generated_at, and typed stale result.

## Falsification
Reject if capsule freshness rewrites readiness time, generated_at precedes source readiness, stale becomes invalid history, or freshness TTL is guessed.

Implementation status: **not implemented in this PR**.
