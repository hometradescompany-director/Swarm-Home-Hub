# PR Train Slot 253: Projection versioning boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define explicit version identity for derived residence projections so rebuilds remain explainable across reducer changes.

## Boundary
Projection versions describe derivation logic, not new domain truth.

## Gate
Record projection name/version, compatible event schema ranges, deterministic implementation identity, and rebuild provenance.

## Falsification
Reject if reducer changes silently alter current state, version identity is omitted, old snapshots are read under new semantics, or projection version becomes event version.

Implementation status: **not implemented in this PR**.
