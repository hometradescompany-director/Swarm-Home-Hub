# Run the Swarm Home Hub demo

This is a deliberately bounded, read-only host over the existing Swarm Home web transport.

## Start

```bash
npm install
npx tsc
node scripts/demo.mjs
```

The host binds to `127.0.0.1:8787` by default.

## Inspect

```bash
curl http://127.0.0.1:8787/swarm-home/health
curl http://127.0.0.1:8787/swarm-home/tools
curl -X POST \
  -H 'content-type: application/json' \
  -d '{"arguments":{}}' \
  http://127.0.0.1:8787/swarm-home/tools/swarm.home.inspect
```

The demo deliberately provides no admission guard. The existing transport therefore rejects every state-mutating tool before it reaches the router.

## Configuration

Set `HOST` and `PORT` to change the listener. Keep the demo behind a trusted ingress if exposing it beyond a local machine.

This host owns only HTTP process lifecycle and request/response adaptation. It does not own Atlas authority, Swarm residence truth, the event journal, habitat state, or evidence.
