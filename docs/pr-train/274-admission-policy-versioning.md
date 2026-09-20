# PR Train Slot 274: Admission policy versioning

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define explicit version identity for local admission policy so historical decisions remain explainable when policy changes.

## Boundary
Policy version describes decision logic at evaluation time; it does not rewrite earlier decisions or residence events.

## Gate
Attach policy version/reference to decision evidence, preserve effective interval and source, and keep historical evaluations immutable.

## Falsification
Reject if current policy is retroactively applied to old admissions, version identity is missing, or policy changes silently alter prior state.

Implementation status: **not implemented in this PR**.
