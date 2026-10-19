# Provisioning to placement proof

This slice connects the existing workload-provisioning projection to the existing compute-placement workload without creating a scheduler or a second source of truth.

## Owns

No canonical state.

It derives a stricter placement workload from:

- the existing placement workload;
- the existing workload-provisioning envelope;
- host-owned resource policy.

## Knows

- workload and capability identity;
- provisioning permille;
- existing placement constraints;
- host-defined memory floor and ceiling.

## Emits

No events.

## Relationships

`workload demand -> provisioning envelope -> placement constraint -> compute placement`

The bridge currently proves one bounded resource dimension: minimum memory.

A higher provisioning envelope can raise the minimum memory requirement used by the existing compute-placement selector. It can never lower an existing stricter memory requirement.

## Boundary

This does not:

- allocate memory;
- select a provider;
- execute a workload;
- create a scheduler;
- persist resource state;
- grant authority;
- define universal memory values.

All numeric memory policy remains host-owned.

The proof exists only to demonstrate that workload scale can alter real placement constraints while preserving the existing authority and execution boundaries.
