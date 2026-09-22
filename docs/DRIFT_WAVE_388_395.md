# Drift and federation requalification wave 388-395

This wave makes a narrow proof claim: Swarm Home can preserve observed integration drift, derive when a prior federation qualification must be revisited, and create a bounded reevaluation intent without silently converting observation into authority or remote mutation.

## Architecture gate

- **Owns:** no remote source, protocol, state, authority, or federation truth. It owns only derived local observations and proof projections.
- **Knows:** provenance receipts and previously derived refinery/qualification outputs already permitted at the Swarm boundary.
- **Emits:** no runtime domain events in this wave.
- **Relationships:** before/after observation -> drift projection -> federation reevaluation requirement -> reevaluation intent.

## Sequence

- 388 compares external source provenance for commit/license drift.
- 389 compares protocol-family fingerprints.
- 390 compares state-ownership fingerprints without copying remote state.
- 391 compares observed authority semantics without deciding authority.
- 392 compares integration posture decisions.
- 393 invalidates stale federation qualification assumptions when evidence-backed posture drifts.
- 394 creates an explicit reevaluation intent with no authority implication.
- 395 proves that all seven proof surfaces are represented and fails closed when any required surface is absent.

## What this proves

The repository contains tested, composable surfaces for detecting bounded drift and projecting a need to reevaluate a prior federation decision.

## What this does not prove

This wave does **not** prove that any external repository is safe, compatible, healthy, trustworthy, or federated. It does not establish live Atlas authority, remote credentials, production persistence, customer deployment, independent security validation, or successful requalification of any peer.

The wave proof counts required proof surfaces. It does not claim that the seven functions were exercised as one end-to-end live federation transaction.
