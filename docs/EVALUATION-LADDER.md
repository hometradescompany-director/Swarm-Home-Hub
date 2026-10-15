# Evaluation Ladder

Swarm Home already has a full technical evaluation, runnable demo, playable proof, and bounded pilot specification.

This page adds smaller microscopes.

Each microscope asks one narrow question and reuses an existing proof surface. It does not create a second implementation, second state machine, second authority path, or second source of truth.

Choose the smallest test that answers the question you actually have.

## 0. Orientation only

**Question:** What is this system claiming to be?

Read:

- [TECHNICAL-EVALUATION.md](TECHNICAL-EVALUATION.md)
- [DEMO.md](DEMO.md)

This is not a proof. It is only enough context to choose a test.

## 1. Boundary microscope

**Question:** Does the public Web boundary distinguish inspection from mutation and refuse state-changing calls when the host has supplied no admission guard?

Run:

```bash
bun install --frozen-lockfile
bun run evaluate:boundary
```

The command reuses `tests/web-transport.test.ts`.

A passing result demonstrates, within that test surface, that:

- health and machine-readable discovery are exposed;
- read-only inspection reaches the existing router;
- unknown tools and malformed input fail closed;
- state mutation without a host admission guard returns HTTP 403;
- body type and size limits are enforced;
- defensive response headers are present.

**It does not prove** production authentication, live Atlas federation, distributed persistence, or customer fit.

## 2. Lifecycle microscope

**Question:** Is residence/readiness represented as an attributable event path rather than a single unexplained mutable label?

Run:

```bash
bun run evaluate:lifecycle
```

The command reuses `tests/residence-phase-contract.test.ts`.

A passing result demonstrates, within that test surface, a bounded lifecycle:

```text
requested -> admitted -> resting -> ready -> departed
```

It also checks that the handoff derived from the earlier ready state becomes unusable after the source event is superseded, while the complete event sequence remains inspectable.

**It does not prove** production storage, multi-node consistency, external identity resolution, or live policy integration.

## 3. Quick microscope

**Question:** Can I check the two simplest architectural claims without running the whole repository suite?

Run:

```bash
bun run evaluate:quick
```

This is only a convenience composition of the boundary and lifecycle microscopes. It adds no new proof logic.

Use it when the evaluator wants a small, readable first contact with the codebase.

## 4. Executable microscope

**Question:** Does the repository compile into something runnable and survive a bounded end-to-end lifecycle over HTTP?

Run:

```bash
bun run evaluate:playable
```

This reuses the existing playable proof. It compiles the executable, boots it on a local port, exercises the lifecycle, checks illegal transitions, checks unauthorised mutation, checks an authority denial, and emits the existing playable receipt.

The runtime uses the real Swarm Home residence engine with a synthetic local Atlas-compatible authority adapter and in-memory persistence.

**It does not prove** live private-Atlas federation, production ingress, production persistence, operational scale, or a real customer's workflow.

## 5. Full local microscope

**Question:** Does the repository survive its current local quality gates and executable proof together?

Run:

```bash
bun run evaluate:full
```

This reuses the existing typecheck, test suite, browser demo build, playable proof, and playable receipt.

It is intentionally broader and slower than the smaller microscopes.

A green result still means **local technical evidence**, not external validation.

## 6. Reality microscope

**Question:** Does the architecture improve one real workflow outside the repository?

Use [PILOT-SPEC.md](PILOT-SPEC.md).

The design partner supplies:

1. one agent or automation boundary;
2. one existing authority source;
3. one critical transition;
4. one failure that must never silently pass.

This is the first microscope that can produce external operational evidence.

A pilot may conclude:

- integrate further;
- change the boundary;
- stop.

All three are valid evidence-producing outcomes.

## What these microscopes are for

They reduce the cost of saying, "show me."

They are not a substitute for independent review, security assessment, production testing, performance testing, or customer validation.

The intended progression is:

```text
understand -> test one claim -> test another claim -> run the executable -> run the full local proof -> test a real workflow
```

An evaluator does not need to believe the architecture before starting.

They only need a question small enough to test.
