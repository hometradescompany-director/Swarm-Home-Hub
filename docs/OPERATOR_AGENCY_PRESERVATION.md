# Operator agency preservation

Status: **implemented contract slice**

## Principle

Crisis response is not a substitute for crisis prevention.

Swarm Home Hub treats operator agency as an input to local orchestration without
claiming ownership of global human state. Atlas remains the truth/authority
boundary; Swarm receives only an opaque, evidence-backed agency envelope.

The local question is intentionally narrow:

> Does this next action leave the operator with more executable options, the
> same number, or fewer?

That is an operational metric, not a diagnosis.

## Boundaries

Swarm MUST NOT:

- infer mental illness, dangerousness, competence, or worth;
- treat narrative intensity as an agency standing;
- copy human PII into the residence truth store;
- use an agency standing to grant authority;
- turn `unknown` into `preservation-required` without evidence.

Swarm MAY:

- preserve context before a fragile transition;
- defer repetitive or nonessential work when Atlas reports constrained agency;
- avoid silently increasing cost or irreversibility;
- prioritize actions that restore executable options;
- record an executable-option delta as a falsifiable outcome.

## Current implementation

- `src/integrations/atlas/operator-agency.ts`
  - bounded read-only Atlas envelope;
  - validation;
  - executable agency delta.
- `src/policy/operator-preservation.ts`
  - local pressure classes;
  - deterministic preservation decisions;
  - no authority grant.
- `tests/operator-preservation.test.ts`
  - unknown is not crisis;
  - essential work remains possible;
  - optional/repetitive work can yield;
  - cost/irreversibility require explicit confirmation under constraint.

## Next slices

1. Attach envelope refs to a bounded request/tool context without changing
   residence ownership.
2. Record preservation decisions as normal events/provenance rather than a
   hidden side channel.
3. Add a friction ledger for repeated dead ends, failed handoffs and avoidable
   re-explanation.
4. Add an option-restoration query: which reachable action creates the most
   new executable options without increasing irreversible cost?
5. Add falsification fixtures showing that the policy does not over-trigger on
   unknown or merely emotional language.
6. Add Atlas adapter tests proving Swarm cannot manufacture the envelope.
