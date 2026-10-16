# PR Train Slot 252: Archive lineage semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define movement of cold journal material into archival storage without severing identity, ordering, or verification lineage.

## Boundary
Archive tier changes storage location, not event meaning or ownership.

## Gate
Preserve event IDs, source range, archive manifest, digest chain, retrieval contract, and restore provenance.

## Falsification
Reject if archived events receive new IDs, retrieval order changes, archive timestamps become event time, or inaccessible archives appear as nonexistent history.

Implementation status: **not implemented in this PR**.
