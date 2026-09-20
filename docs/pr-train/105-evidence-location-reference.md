# PR Train Slot 105: Evidence location reference

Status: **planned contract slice, not runtime implementation**

Phase: **081-128 · provenance / typed absence / contradiction**

## Intent
Define stable references to externally stored evidence without copying authoritative payloads.

## Boundary
Owns one reviewable contract and falsification target only. It does not create a parallel truth store, copy authoritative evidence, grant Atlas authority, or promote derived projections into canon.

## Implementation gate
1. Search existing nouns and verbs in `src/`, tests, contracts, and docs.
2. Extend existing ownership before adding anything new.
3. Preserve append-only history, attribution, and typed absence.
4. Add a focused falsification test.
5. Mark implemented only when linked code and passing evidence exist.

## Falsification
Reject implementation that duplicates truth, rewrites history, invents missing evidence, loses source/time/actor lineage, or lets a projection author canonical state.

Implementation status: **not implemented in this PR**.
