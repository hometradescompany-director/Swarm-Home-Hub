# Great Bun

## Definition

**Bun means playable.**

The acceptance criterion is not that source files exist. The acceptance criterion is that the repository can become a program a human can run, inspect, contradict and replay.

```text
files -> executable -> URL -> interaction -> event history -> evidence
```

The modern Bun runtime is the implementation vehicle. Playable closure is the architectural goal.

## Run

```bash
bun install --frozen-lockfile
bun run play
```

Open:

```text
http://127.0.0.1:8787/play
```

## Compile

```bash
bun run play:compile
./dist/swarm-home-bun
```

## Prove

```bash
bun run great-bun:prove
```

This runs repository checks, compiles the standalone executable, boots that executable, exercises the real Swarm residence engine over HTTP, runs failure-path falsifiers and emits a cryptographic executable receipt.

## Runtime ownership

The executable does not create a new truth owner.

**Swarm Home owns**
- residence lifecycle;
- habitat state;
- append-only residence event history;
- current residence projections;
- ready-handoff derivation.

**The playable shell owns**
- local process lifecycle;
- local HTTP presentation;
- reset of in-memory demo state.

**Atlas remains external.** The executable supplies a synthetic Atlas-compatible authority adapter for demo identities only.

## Machine-readable standing

`GET /play/manifest` returns `PlayableBunManifest/v1`.

It declares:
- runtime;
- bounded ownership;
- persistence standing;
- evidence path;
- explicit non-claims.

That manifest exists so a beautiful UI cannot silently upgrade itself into a stronger architectural claim.

## Falsification

The executable proof must establish all of these:

1. mutation without the local play token is refused before routing;
2. requested -> ready is refused as an illegal transition;
3. valid request -> admit -> rest -> ready -> handoff -> depart succeeds;
4. external authority denial becomes a recorded rejection;
5. recovery finds the authoritative timeline;
6. the successful lifecycle ends in `departed`.

## Presentation integrity

The browser must bind to the actual domain projection fields:

- residence state is `status`;
- habitat occupancy is `occupied`;
- timeline identity is `eventId`.

Presentation mismatch is a defect even when the engine underneath is correct.

## Security standing

The browser capability token is a local demonstration control, **not production authentication**.

The executable binds to `127.0.0.1` by default. Non-loopback binding fails closed unless the operator explicitly sets:

```bash
SWARM_PLAY_ALLOW_EXTERNAL=1
```

That override does not create trustworthy ingress or production authentication.

## Non-claims

The Great Bun executable is:
- not production Atlas;
- not live federation with private repositories;
- not durable persistence;
- not external authentication;
- not a copy of HomeFlow, Diamond, Skills Foundry, Media Forge, Trade Hubs or CropZero truth.

## Evidence path

```text
Identity -> Event -> Transformation -> Evidence -> Outcome
```

A playable system earns completion by surviving that path, including refusal and contradiction.
