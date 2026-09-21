# PR Train Slot 230: Rebuild verification receipt

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define a verification receipt proving which journal range and projection version produced a rebuilt state.

## Boundary
The receipt attests to a rebuild execution, not business correctness beyond the validated inputs and reducer contract.

## Gate
Preserve journal range identity, reducer/version identity, input digest, output digest, execution timestamp, and failure standing.

## Falsification
Reject if receipt omits its input boundary, hashes mutable formatting rather than canonical content, or successful execution is presented as external truth.

Implementation status: **not implemented in this PR**.
