# Run Swarm Home Hub

## The Great Bun: playable mode

The shortest path from repository to something a human can actually use:

```bash
bun install --frozen-lockfile
bun run play
```

Open:

```text
http://127.0.0.1:8787/play
```

The playable console drives the **real Swarm Home residence services and tool router** through a local HTTP surface.

It can:

- request residence for an opaque synthetic agent identity;
- evaluate synthetic Atlas admission authority;
- admit, rest, ready, hand off and depart;
- inspect the derived current projection;
- inspect the append-only residence timeline;
- deliberately test authority denial;
- deliberately attempt an illegal transition;
- deliberately attempt mutation without the local play token.

### What is real

- Swarm Home domain/runtime code;
- transition policy;
- append-only event journal behaviour;
- habitat capacity logic;
- current-state projection;
- tool router;
- web transport boundary;
- Bun HTTP process;
- compiled executable proof.

### What is deliberately synthetic

- Atlas identity resolution and authority decisions;
- demo agent identities;
- demo capability/offering refs;
- local in-memory persistence.

The demo **does not claim live federation** with private Atlas, HomeFlow, Diamond, Skills Foundry, Media Forge, Trade Hubs or CropZero.

## Compile it into one executable

```bash
bun run bun:compile
./dist/swarm-home-bun
```

That is the literal "pile becomes playable" proof.

## Machine proof

```bash
bun run test:playable
```

The proof compiles the executable, boots it on a separate port, drives a complete lifecycle over HTTP, verifies invalid transitions fail, verifies unauthorised mutation fails, verifies an authority denial becomes a rejection, then shuts the executable down.

## Legacy bounded read-only host

The older read-only host remains available:

```bash
bunx tsc
bun scripts/demo.mjs
```

It binds to `127.0.0.1:8787` by default and deliberately provides no mutation admission guard.

## Configuration

Set `HOST` and `PORT` to change the listener.

For deterministic local automation, `SWARM_PLAY_TOKEN` may be supplied explicitly. Otherwise playable mode generates a process-local token at startup.

Keep any demo behind trusted ingress if exposing it beyond a local machine.
