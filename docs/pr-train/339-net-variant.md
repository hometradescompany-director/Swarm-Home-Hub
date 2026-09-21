# PR Train Slot 339: Capture net variant contract

Status: **planned contract slice, not runtime implementation**
Phase: **333-344 · Facehugger Observatory contracts**

## Intent
Represent deliberate changes to observation or reproduction conditions between attempts.

## Boundary
A net variant changes one or more declared capture conditions; it does not alter historical attempt records.

## Gate
Require parent attempt, changed variables, unchanged controls, rationale, and comparison target.

## Falsification
Reject if multiple uncontrolled changes masquerade as one test, parentage is lost, or comparison conditions are hidden.

Implementation status: **not implemented in this PR**.
