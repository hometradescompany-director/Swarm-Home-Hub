# PR Train Slot 281: Departure policy versioning

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define versioned local departure policy so historical exits remain explainable across policy changes.

## Boundary
Departure policy governs whether a departure transition is locally allowed; it does not grant broader authority or rewrite prior departures.

## Gate
Reuse DepartureService, policy/departure.ts, and transition rules. Preserve policy version, reason, actor, evidence, and effective interval.

## Falsification
Reject if old departures are reinterpreted under new policy, version is omitted, terminality is weakened, or policy can resurrect departed residence state.

Implementation status: **not implemented in this PR**.
