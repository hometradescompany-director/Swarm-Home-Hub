# PR Train Slot 262: Replication lag standing

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Represent the known distance between canonical durable journal state and a replica or archive copy.

## Boundary
Lag is an operational observation, not evidence that missing replicated events failed canonically.

## Gate
Record source/copy refs, last verified event, observed_at, measurement method, and unknown/error states.

## Falsification
Reject if lag zero is assumed without verification, missing copy events become canonical absence, stale measurements are treated current, or event time is used as replication time.

Implementation status: **not implemented in this PR**.
