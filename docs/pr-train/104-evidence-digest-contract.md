# PR Train Slot 104: Evidence digest contract

Status: **planned contract slice, not runtime implementation**

Phase: **provenance**

## Intent

Specify digest-bearing evidence references so integrity can be checked without copying source payloads.

## Architecture boundary

This slot owns no independent runtime truth store. It exists to make one future state transition reviewable before implementation.

### What it owns

- the specification and falsification criteria for this single slice;
- no residence state, Atlas authority, provider truth, human PII, or duplicated evidence payload.

### What it knows

- Swarm Home's existing append-only residence/event boundaries;
- the repository rule that current state is a projection over events;
- typed absence must remain explicit rather than silently invented.

### Candidate event seam

Any future event introduced for this slice must extend the existing event/journal architecture rather than create a parallel event stream. Exact event names remain **unresolved until implementation search**.

### Relationships

The implementation must reference existing identities/evidence/authority objects by stable identifier rather than copying their authoritative fields.

## Implementation gate

Before code is added:

1. search existing domain nouns and verbs in `src/`, contracts, tests, and docs;
2. extend an existing module when ownership overlaps;
3. preserve fail-closed behaviour where evidence or authority is missing;
4. add a focused test that can falsify this contract;
5. update this card from `planned` to `implemented` only when linked code and passing evidence exist.

## Falsification

This slice fails review if implementation:

- creates a second source of truth;
- silently converts missing information into a positive fact;
- loses attribution or temporal provenance;
- lets a derived projection mutate canonical state;
- cannot be replayed or independently inspected where the underlying domain requires it.

## Typed absence

Implementation status: **not implemented in this PR**.

This PR makes the slot explicit and reviewable. It is not proof that runtime behaviour exists.
