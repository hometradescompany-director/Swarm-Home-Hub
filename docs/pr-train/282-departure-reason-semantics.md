# PR Train Slot 282: Departure reason semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define structured departure reasons while retaining human-readable explanation and provenance separately.

## Boundary
Reason classification explains a terminal transition; it does not alter terminal state or imply blame/motive beyond evidence.

## Gate
Reuse event reason and evidenceReceiptIds. Add scoped reason categories only where they are operationally necessary and evidence-backed.

## Falsification
Reject if free text becomes authority, inferred motive is stored as fact, reason changes terminality, or missing reason is silently invented.

Implementation status: **not implemented in this PR**.
