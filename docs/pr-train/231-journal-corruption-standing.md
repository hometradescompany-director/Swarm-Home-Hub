# PR Train Slot 231: Persisted corruption standing

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Represent detected storage corruption, unreadable segments, checksum mismatch, and structurally invalid persisted events as typed absences/failures.

## Boundary
Corruption standing records what cannot currently be trusted; it does not delete or auto-repair the affected evidence.

## Gate
Extend typed absence and provenance primitives. Preserve location/reference, detection method, observed_at, recoverability standing, and supporting evidence.

## Falsification
Reject if unreadable becomes nonexistent, repair overwrites the original, checksum mismatch is ignored, or corrupted ranges are included in normal rebuild.

Implementation status: **not implemented in this PR**.
