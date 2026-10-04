# End-to-end bounded execution proof

This proof composes existing Swarm Home boundaries without adding another scheduler, authority system, provider model, state store or execution path.

The verified chain is:

`compute observation -> placement decision -> external execution request -> explicit authority decision -> provider execution result -> provenance receipt`

## What this proves

The integration test demonstrates that:

- placement selects only from fresh, eligible provider observations;
- placement evidence is carried into the existing external execution request;
- the external provider is not called until an explicit authority decision allows the request;
- the provider retains its own canonical execution state and returns only opaque refs and evidence;
- Swarm Home can preserve the observed provider execution as a source-record provenance receipt;
- a refusal by authority stops the provider call and cannot be converted into a provider-execution receipt.

## What this does not prove

This is a bounded repository proof. It does not claim:

- a production GPU scheduler;
- live provider capacity;
- live Atlas federation;
- customer deployment;
- durable remote execution persistence;
- provider health from evidence freshness;
- that a provenance receipt grants authority.

The test exists to prove that the already-owned boundaries compose correctly and fail closed.
