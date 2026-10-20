# PR Train Slot 242: Deterministic event decoding

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define canonical decoding from persisted bytes/records into domain events so identical durable input yields identical in-memory events.

## Boundary
Decoding interprets storage representation only; it cannot consult network services, wall clock, or mutable configuration to fill gaps.

## Gate
Specify canonical charset/number/date handling, unknown-field policy, version dispatch, and typed decode failures.

## Falsification
Reject if locale/timezone changes output, missing values are fetched externally, field order affects meaning, or decoding is nondeterministic.

Implementation status: **not implemented in this PR**.
