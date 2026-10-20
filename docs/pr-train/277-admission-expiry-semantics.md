# PR Train Slot 277: Admission decision expiry semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define when an external authority decision or local policy evaluation becomes too stale to use for admission.

## Boundary
Expiry invalidates reuse of a decision; it does not negate the historical decision or imply a denial.

## Gate
Track decision issued_at, observed_at, policy freshness requirement, explicit expiry/TTL when supplied, and typed stale standing.

## Falsification
Reject if stale becomes denied, TTL is guessed, refresh rewrites the old decision, or an expired decision can still authorize admission.

Implementation status: **not implemented in this PR**.
