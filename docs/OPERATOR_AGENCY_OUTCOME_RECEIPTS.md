# Operator agency outcome receipts

Status: implemented contract slice

The preservation policy is only useful if its effect can be falsified.

This slice adds a pure outcome receipt for one bounded Swarm action. The receipt
records:

- opaque operator reference;
- decision and completion times;
- local pressure class;
- policy disposition and Atlas-derived standing;
- executable option refs before and after;
- resulting executable-option delta;
- evidence refs and source event refs.

A negative delta remains negative even if the operation itself technically
succeeded. That prevents "workflow completed" from being mistaken for "operator
agency preserved".

## Boundary

The receipt is not a diagnosis, authority grant or new truth store. It is a
deterministic value suitable for recording on the existing event/provenance
path under separate persistence authority.

The helper also refuses a completion timestamp earlier than the decision
timestamp so an impossible local chronology cannot be silently normalized.
