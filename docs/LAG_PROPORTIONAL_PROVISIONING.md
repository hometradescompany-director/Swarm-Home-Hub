# LAG proportional provisioning root

This document preserves the first bounded algorithmic form of the LAG doctrine mined from the Swarm Home Hub pub metaphor.

Historical shorthand:

> You smelt it, now get the fuck out of here.

The originating intuition was that a tiny bounded task should not receive the same preparation envelope as a very large, long-running, high-coordination sprint.

## Root rule

Provisioning should scale to measured workload demand.

Provisioning does not grant authority.

The initial projection consumes six normalized demand signals:

- breadth;
- expected duration;
- coordination complexity;
- context depth;
- consequence;
- evidence burden.

Each signal is expressed from 0 to 1000. The host supplies non-negative policy weights plus an allowed provisioning floor and ceiling.

The projection calculates a transparent weighted demand score and linearly maps that score into the host-owned provisioning range.

No universal weights are embedded in Swarm Home. Different hosts and workload classes may legitimately weight consequence, context depth, coordination or other represented dimensions differently.

## Boundary

This is a pure derived projection.

It does not:

- allocate GPU memory;
- schedule a provider;
- select an execution runtime;
- grant permission;
- mutate Atlas authority;
- persist a new source of truth;
- claim that the six initial dimensions are a complete model of workload demand.

Its output is intended to become an input to later resource adapters and compute-placement constraints.

The invariant is deliberately stronger than the first implementation:

> Feed the workload for the journey it is actually taking.

The cultural origin remains attached because it explains the doctrine without replacing the formal rule.
