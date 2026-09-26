# PR Train Slot 211: Provider retryability standing

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent whether a failed provider operation is observed as retryable, non-retryable, conditionally retryable, or unknown without embedding retry loops into metadata.

## Boundary
Retryability is evidence-backed standing about a failure class; execution policy remains owned by the caller/runtime.

## Gate
Reference the error taxonomy, preserve provider guidance and local observation separately, and model backoff hints as advisory metadata with provenance.

## Falsification
Reject if retryable means retry immediately, provider guidance becomes local policy, unknown becomes retryable, or repeated failure rewrites earlier observations.

Implementation status: **not implemented in this PR**.
