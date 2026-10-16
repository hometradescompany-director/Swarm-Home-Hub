# PR Train Slot 210: Provider error taxonomy mapping

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Map external provider failures into bounded, attributable error categories while preserving the original provider code and message reference.

## Boundary
Normalization supports routing and diagnostics; it must not erase provider-specific semantics or turn transient observations into permanent provider truth.

## Gate
Extend existing typed-absence and failure primitives first. Preserve original code, normalized category, retryability unknowns, source, and observation time.

## Falsification
Reject if unknown errors are guessed into known categories, provider text is discarded, authentication errors become availability failures, or normalization silently changes across history.

Implementation status: **not implemented in this PR**.
