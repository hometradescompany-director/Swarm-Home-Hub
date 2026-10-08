# Resident continuation runtime

Swarm Home Hub already knows whether a resident is current, stale, terminal, or ready. That heartbeat is a **projection**, not a scheduler. A heartbeat can prove that a resident went quiet; it cannot itself wake an agent or keep a model session alive.

This runtime seam closes that missing boundary without pretending the repository owns an AI provider.

## Ownership

Swarm Home Hub owns only the bounded transition from a **current ready residence** into one host-supplied iteration.

It does **not** own:

- the external task queue;
- model/provider credentials;
- the model session itself;
- a hidden infinite loop;
- Atlas identity or authority;
- fabricated "thinking" state when no executor is actually running.

The host supplies a task and an executor. `ResidentContinuationBridge.runOnce()` asks the existing `ReadyHandoffService` for a current, validated handoff and dispatches exactly one iteration.

## Pulse

A host may subscribe to the bridge's pulse callback and render the actual lifecycle:

`blocked -> running -> completed|failed`

Those states are operational observations. They are not consciousness claims and they are not residence truth. Residence truth remains derived from the event journal.

## Keeping a resident going

A long-lived worker, cron trigger, queue consumer, workflow, or product automation can call `runOnce()` repeatedly. The scheduler belongs to that host because different deployments have different cost, credential, retry, and shutdown constraints.

That distinction matters: **continuous iteration should mean repeated evidenced executions, not a spinner that merely looks busy.**

## Relationship to the existing heartbeat

`projectResidenceHeartbeat()` answers whether the latest residence observation is still fresh.

`ResidentContinuationBridge` uses the existing ready-handoff boundary to turn that fresh/ready state into one real execution attempt.

No second residence store, authority registry, or duplicated heartbeat state is introduced.
