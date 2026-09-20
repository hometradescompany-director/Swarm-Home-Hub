# PR Train Slot 124: Receipt redaction standing

Status: **planned contract slice, not runtime implementation**

Phase: **081-128 · provenance / typed absence / contradiction**

## Intent
Represent whether referenced evidence is intact, redacted, withheld, or inaccessible.

## Boundary
This slot defines one reviewable relationship/receipt contract only. It cannot rewrite historical events, duplicate evidence payloads, or turn a reconciliation projection into canonical source data.

## Implementation gate
Search first. Extend existing modules. Preserve stable identity and append-only lineage. Add a falsification test. Mark implemented only with linked runtime evidence.

## Falsification
Reject any implementation that collapses contradiction into deletion, loses predecessor/successor lineage, guesses redacted evidence, or makes integrity metadata a second evidence store.

Implementation status: **not implemented in this PR**.
