# PR Train Slot 269: Deterministic rebuild golden fixtures

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define canonical event sequences and expected projection outputs for verifying rebuild behavior across adapters and projection versions.

## Boundary
Golden fixtures are test evidence, not production history and not authority over future domain changes.

## Gate
Version each fixture, preserve exact event order and identities, expected output digest, projection version, and rationale for edge cases.

## Falsification
Reject if tests regenerate expected output from the implementation under test, fixture order is unstable, unknown events are dropped, or snapshots omit provenance.

Implementation status: **not implemented in this PR**.
