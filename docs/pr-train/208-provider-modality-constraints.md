# PR Train Slot 208: Provider modality constraints

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent bounded input/output modality constraints for a provider offering, including combinations that are unsupported or only conditionally available.

## Boundary
Modality support is observed offering metadata; it does not grant a caller permission to submit that modality.

## Gate
Extend capability projections with explicit input/output direction, limits, observation time, and evidence source rather than inventing a parallel capability registry.

## Falsification
Reject if input support implies output support, conditional support becomes universal, missing evidence becomes supported, or policy permission is inferred from technical capability.

Implementation status: **not implemented in this PR**.
