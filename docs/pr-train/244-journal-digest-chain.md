# PR Train Slot 244: Journal digest chain

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define optional cryptographic chaining across canonical event encodings to make missing, reordered, or modified persisted events detectable.

## Boundary
A digest chain provides tamper evidence, not authorship, legal authenticity, or authority by itself.

## Gate
Reference canonical encoding, predecessor digest, chain scope, algorithm identifier, rotation/version rules, and verification output.

## Falsification
Reject if hash presence is treated as trust, chain breaks are auto-healed, algorithm changes rewrite history, or digest order substitutes for causal predecessor links.

Implementation status: **not implemented in this PR**.
