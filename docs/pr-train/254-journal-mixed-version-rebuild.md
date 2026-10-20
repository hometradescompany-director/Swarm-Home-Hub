# PR Train Slot 254: Mixed-version rebuild semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define deterministic rebuild when a journal legitimately contains multiple persisted event schema versions.

## Boundary
Mixed-version support decodes each event through its declared representation contract while preserving one domain history.

## Gate
Use explicit schema dispatch, migration/decoder provenance, canonical domain event output, and typed unsupported-version gaps.

## Falsification
Reject if newest decoder is applied blindly, unsupported versions are skipped, historical meaning shifts silently, or rebuild order depends on migration execution timing.

Implementation status: **not implemented in this PR**.
