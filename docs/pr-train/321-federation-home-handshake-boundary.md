# PR Train Slot 321: Federation home handshake boundary

Status: **planned contract slice, not runtime implementation**  
Phase: **321-368 · federation between homes without shared mutable truth**

## Merge topology
- Depends on: **Train 320**
- Merge after: **320**
- Supersedes: **none**
- Proves: two homes can establish a bounded federation relationship without either home acquiring ownership of the other's mutable residence truth.
- Resulting state: define the first cross-home handshake contract before any residence, readiness, capacity, or authority data is exchanged.

## Intent
Define the minimum handshake required for one Swarm Home Hub to recognize another as a federation peer while preserving independent truth ownership.

## Ownership
- Each home owns its own local residence lifecycle, habitat capacity, readiness, and event history.
- A peer may know only an opaque home reference, advertised protocol version, bounded capabilities, and evidence needed to validate the handshake.
- Atlas authority remains separate from peer recognition.
- Federation relationships reference remote claims; they do not copy remote canonical state into local ownership.

## Boundary
A successful handshake establishes **reachability and protocol compatibility only**. It does not imply admission authority, trust equivalence, shared capacity, shared identity ownership, or permission to mutate the remote home.

## Gate
Require stable home identity references, protocol-version compatibility, attributable handshake evidence, explicit capability advertisement, replay-safe correlation, and typed refusal for unknown or incompatible peers.

## Falsification
Reject the contract if a handshake can silently create authority, mutate remote-owned truth, collapse two homes into one mutable namespace, accept incompatible protocol versions, or succeed without attributable evidence.

Implementation status: **not implemented in this PR**.
