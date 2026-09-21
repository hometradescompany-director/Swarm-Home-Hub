# Human state is not workflow intent

## Invariant

A report about a human being's current state is **not** evidence of workflow
intent.

Examples:

- "I am in severe pain" does not mean "cancel the appointment".
- "I am exhausted" does not mean "stop the project".
- "I am angry" does not mean "delete the account".
- "I am worried" does not mean "reject the request".

A workflow mutation requires its own explicit intent evidence.

## Why this belongs in Swarm Home

Swarm Home owns bounded local routing and readiness behaviour, not Atlas identity
or global provenance truth. This policy therefore does not create a second
human record or a moral judgement system.

It only enforces a local routing boundary:

1. preserve a human state report as state;
2. preserve explicit workflow intent separately;
3. never derive cancellation, rescheduling, rejection or continuation from the
   state report alone;
4. when an upstream authority has already classified the signal as requiring
   escalation, route it if capability exists;
5. otherwise surface a capability gap instead of pretending the signal was
   handled.

## Atlas relationship

Atlas remains authoritative for identity, events, relationships, evidence and
stewardship. The Atlas Healthcare escalation policy records whether an
actionable routable signal expired without routing. Swarm Home's role is
earlier and narrower: prevent human state from being collapsed into unrelated
workflow intent before routing even begins.

This keeps the two systems complementary rather than duplicating truth.
