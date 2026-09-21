# PR Train Slot 112: Typed absence: deliberately deleted

Status: **planned contract slice, not runtime implementation**

Phase: **081-128 · provenance / typed absence / contradiction**

## Intent
Represent evidenced deletion as a first-class absence state with actor/time provenance.

## Boundary
No parallel truth store, no copied authoritative payload, no authority grant.

## Required invariants
- append-only history;
- source/time/actor attribution where known;
- typed absence stays distinct from falsehood;
- projections cannot author canon;
- references outrank copied fields.

## Implementation gate
Search existing nouns/verbs first, extend existing ownership, add a falsification test, and only then mark implemented.

## Falsification
Fails if a retrieval miss becomes “never existed,” if provenance is erased, if history is rewritten, or if missing evidence is guessed into existence.

Implementation status: **not implemented in this PR**.
