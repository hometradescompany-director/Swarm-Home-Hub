import { InMemoryEventJournal } from "../src/events/journal.ts";
import { SwarmHomeDoor } from "../src/platform/swarm-home-door.ts";
import { SwarmHomeToolRouter } from "../src/platform/tool-router.ts";
import { SwarmHomeWebTransport } from "../src/platform/web-transport.ts";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.ts";
import { playHtml, playCss, playJs } from "./play-ui.mjs";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "8787");
const playToken = process.env.SWARM_PLAY_TOKEN ?? crypto.randomUUID();

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

function buildRuntime() {
  const journal = new InMemoryEventJournal();
  const habitats = new InMemoryHabitatRegistry();

  const atlas = {
    async resolveAgentIdentity(ref) {
      return { exists: true, canonicalRef: ref };
    },
    async canEnterHome(ref) {
      const denied = String(ref).endsWith(":denied");
      return {
        allowed: !denied,
        reason: denied ? "synthetic demo authority denial" : "synthetic demo authority grant",
        authorityRef: denied
          ? "atlas:authority:synthetic-deny"
          : "atlas:authority:synthetic-allow",
        decidedAt: new Date().toISOString()
      };
    },
    async evidence() {
      return [];
    }
  };

  const habitat = {
    id: "habitat:play",
    name: "Playable Bun Habitat",
    capacity: 4,
    status: "open",
    heartbeatStaleAfterMs: 60_000
  };

  return habitats.put(habitat).then(() => {
    const door = new SwarmHomeDoor({ journal, habitats, atlas });
    const router = new SwarmHomeToolRouter(door);
    const transport = new SwarmHomeWebTransport(router, {
      basePath: "/swarm-home",
      maxBodyBytes: 64 * 1024,
      admitToolCall(request, tool) {
        if (!tool.mutatesState) return { allowed: true };
        if (request.headers.get("x-swarm-play-token") !== playToken) {
          return {
            allowed: false,
            status: 403,
            error: "state mutation requires the local playable-Bun token"
          };
        }
        return { allowed: true };
      }
    });
    return { journal, habitats, atlas, door, router, transport };
  });
}

let runtime = await buildRuntime();

function response(body, contentType, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}

const server = Bun.serve({
  hostname: host,
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/play")) {
      return response(
        playHtml.replace("__PLAY_TOKEN__", playToken),
        "text/html; charset=utf-8"
      );
    }

    if (request.method === "GET" && url.pathname === "/play/styles.css") {
      return response(playCss, "text/css; charset=utf-8");
    }

    if (request.method === "GET" && url.pathname === "/play/app.js") {
      return response(playJs, "text/javascript; charset=utf-8");
    }

    if (request.method === "POST" && url.pathname === "/play/reset") {
      if (request.headers.get("x-swarm-play-token") !== playToken) {
        return Response.json({ ok: false, error: "reset requires the local playable-Bun token" }, { status: 403 });
      }
      runtime = await buildRuntime();
      return Response.json({ ok: true, reset: true, habitatId: "habitat:play" });
    }

    if (url.pathname === "/play/health") {
      return Response.json({
        ok: true,
        executable: "swarm-home-bun",
        runtime: "bun",
        mode: "local-playable",
        atlasAuthority: "synthetic-demo-adapter",
        persistence: "in-memory",
        truthOwnership: "swarm-residence-only"
      });
    }

    if (url.pathname.startsWith("/swarm-home")) {
      return runtime.transport.handle(request);
    }

    return Response.json({ ok: false, error: "route not found" }, { status: 404 });
  }
});

console.log("");
console.log("┌────────────────────────────────────────────────────────────┐");
console.log("│             SWARM HOME // PLAYABLE BUN                    │");
console.log("├────────────────────────────────────────────────────────────┤");
console.log(`│  open:   http://${host}:${server.port}/play`);
console.log(`│  health: http://${host}:${server.port}/play/health`);
console.log("│  truth:  real Swarm runtime, synthetic Atlas authority    │");
console.log("│  state:  local + in-memory                                │");
console.log("└────────────────────────────────────────────────────────────┘");
console.log("");
