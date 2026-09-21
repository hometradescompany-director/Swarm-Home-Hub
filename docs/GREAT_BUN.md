# The Great Bun — Playable Estate Surface

## Meaning

Here, **Bun means playable**:

```text
bunch of files
  -> one executable boundary
  -> one URL
  -> one observable lifecycle
  -> one falsifiable proof surface
```

This is deliberately different from merely naming the Bun JavaScript runtime. The Bun runtime is the implementation vehicle; **playable closure** is the acceptance criterion.

## What this executable owns

The playable shell does not create new domain truth.

Swarm Home continues to own:
- residence lifecycle;
- habitat state;
- append-only residence event history;
- current residence projections;
- ready-handoff generation.

The shell owns only:
- local process lifecycle;
- local HTTP presentation;
- a synthetic Atlas-compatible authority adapter for demo identities;
- reset of in-memory demo state.

## What it knows

The shell sees only:
- opaque demo agent identity refs;
- Swarm-owned habitat and residence projections;
- existing Swarm tool descriptors;
- existing transition results and recovery timelines.

It does **not** import private Atlas, HomeFlow, Diamond, Media Forge, Skills Foundry, Trade Hubs or CropZero state.

## Events

The executable emits no new domain event family. It drives the existing Swarm event path:

```text
swarm.residence.requested
swarm.residence.admitted | swarm.residence.rejected
swarm.residence.rested
swarm.residence.ready
swarm.residence.departed
```

Handoff remains a derived bounded capsule rather than a new residence-state mutation.

## One-command use

Install the committed dependency graph:

```bash
bun install --frozen-lockfile
```

Run the interactive source-mode surface:

```bash
bun run play
```

Open:

```text
http://127.0.0.1:8787/play
```

Compile a standalone executable:

```bash
bun run play:compile
./dist/swarm-home-bun
```

Run the complete executable proof:

```bash
bun run great-bun:prove
```

That command:
1. runs repository typecheck and behavioural tests;
2. compiles `dist/swarm-home-bun`;
3. boots the compiled executable;
4. proves the UI and machine-readable manifest are served;
5. refuses a mutation without the local play token;
6. refuses an illegal requested -> ready transition;
7. performs request -> admit -> rest -> ready -> handoff -> depart;
8. proves an explicit authority denial becomes rejection rather than admission;
9. recovers the authoritative timeline;
10. requires the lifecycle to end in `departed`.

## Runtime truth manifest

`GET /play/manifest` returns `PlayableBunManifest/v1`.

The manifest explicitly states ownership and non-claims so the demonstration cannot silently inflate itself into production federation.

## Falsification forge

The browser surface exposes three deliberate attacks against its own happy path:

- **Deny at authority**: proves external authority denial becomes a recorded rejection.
- **Illegal ready transition**: proves transition order remains enforced.
- **Mutate without token**: proves local state mutation fails before the tool router without the local play capability.

A demo that can only demonstrate success is theatre. This surface must demonstrate refusal too.

## Security standing

The interactive capability token is a **local demonstration mechanism**, not a production authentication system.

Default binding is loopback only. A non-loopback `HOST` fails closed unless `SWARM_PLAY_ALLOW_EXTERNAL=1` is explicitly supplied. External exposure therefore remains an operator decision and still requires trusted ingress/authentication appropriate to that environment.

## Evidence path

```text
Identity -> Event -> Transformation -> Evidence -> Outcome
```

The Great Bun does not award completion because files exist.

Completion is earned when the executable can be built, run, contradicted, inspected and replayed from a committed dependency graph.
