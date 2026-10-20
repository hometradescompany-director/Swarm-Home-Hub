# PR Train Slot 239: Crash recovery semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define restart behavior after process or host failure so the journal returns to a valid durable prefix without inventing completion.

## Boundary
Recovery re-establishes readable durable history; it does not replay domain commands or emit compensating events automatically.

## Gate
Specify durable-prefix detection, incomplete-tail handling, integrity scan, typed corruption output, and operator-visible recovery receipt.

## Falsification
Reject if startup guesses whether a command succeeded, re-executes side effects, drops valid committed events, or hides an incomplete tail.

Implementation status: **not implemented in this PR**.
