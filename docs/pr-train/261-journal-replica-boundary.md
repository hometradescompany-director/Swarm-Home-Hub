# PR Train Slot 261: Replica boundary semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define read replicas or redundant journal copies as derived durability/read surfaces that preserve one canonical append authority.

## Boundary
Replicas do not become independent truth owners merely because they contain complete history.

## Gate
Specify source identity, replication position, lag standing, verification digest, promotion authority, and read consistency contract.

## Falsification
Reject if replicas accept independent domain appends, lag is hidden, divergent copies are merged silently, or physical copy count becomes authority.

Implementation status: **not implemented in this PR**.
