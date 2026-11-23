import { join, resolve } from "node:path";
import { version as playwrightVersion } from "playwright/package.json";
import { InMemoryEventJournal } from "../src/events/journal.ts";
import { SwarmHomeDoor } from "../src/platform/swarm-home-door.ts";
import { SwarmHomeToolRouter } from "../src/platform/tool-router.ts";
import { AtlasFederationTransport } from "../src/platform/atlas-federation-transport.ts";
import { SwarmHomeWebTransport } from "../src/platform/web-transport.ts";
import { InMemoryHabitatRegistry } from "../src/registry/habitat-registry.ts";
import {
  BrowserWorkbench,
  sha256
} from "../src/integrations/browser-workbench/index.ts";
import { playHtml, playCss, playJs } from "./play-ui.mjs";
import workbenchHtml from "../site/workbench.html" with { type: "text" };
import workbenchCss from "../site/workbench.css" with { type: "text" };
import workbenchJs from "../site/workbench.js" with { type: "text" };
import scenarioCss from "../site/workshop-scenario.css" with { type: "text" };

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "8787");
const playToken = process.env.SWARM_PLAY_TOKEN ?? crypto.randomUUID();
const browserArtifactDirectory = resolve(
  process.env.SWARM_BROWSER_ARTIFACT_DIR ??
    join(process.cwd(), ".swarm-home-browser-artifacts")
);
const externalBindingAllowed = process.env.SWARM_PLAY_ALLOW_EXTERNAL === "1";
const loopbackHosts = new Set(["127.0.0.1", "localhost", "::1"]);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}
if (!loopbackHosts.has(host) && !externalBindingAllowed) {
  throw new Error(
    "playable Bun refuses non-loopback binding; set SWARM_PLAY_ALLOW_EXTERNAL=1 only behind a trusted ingress"
  );
}

const mkdir = Bun.spawn({
  cmd: ["mkdir", "-p", browserArtifactDirectory],
  stdout: "ignore",
  stderr: "pipe"
});
if ((await mkdir.exited) !== 0) {
  throw new Error("could not create the local browser-workbench artifact directory");
}

const requestKey = async (requestId) =>
  await sha256(new TextEncoder().encode(requestId));
const artifactLocation = (artifactRef) => {
  const match = /^artifact:browser-workbench:([a-f0-9]{64}):(initial|verified)$/.exec(
    artifactRef
  );
  return match
    ? join(browserArtifactDirectory, `${match[1].slice(0, 24)}-${match[2]}.png`)
    : undefined;
};
const store = {
  async loadJobs() {
    const file = Bun.file(join(browserArtifactDirectory, "jobs.json"));
    if (!(await file.exists())) return [];
    const value = await file.json();
    if (!Array.isArray(value)) throw new Error("browser workbench job index is malformed");
    return value;
  },
  async saveJobs(jobs) {
    await Bun.write(
      join(browserArtifactDirectory, "jobs.json"),
      JSON.stringify(jobs, null, 2)
    );
  },
  async saveArtifact(artifactRef, bytes) {
    const path = artifactLocation(artifactRef);
    if (!path) throw new Error("invalid browser artifact reference");
    await Bun.write(path, bytes);
  },
  async readArtifact(artifactRef) {
    const path = artifactLocation(artifactRef);
    if (!path) return undefined;
    const file = Bun.file(path);
    if (!(await file.exists())) return undefined;
    return new Uint8Array(await file.arrayBuffer());
  },
  async saveReceipt(requestId, receipt) {
    const key = await requestKey(requestId);
    await Bun.write(
      join(browserArtifactDirectory, `${key.slice(0, 24)}-receipt.json`),
      JSON.stringify(receipt, null, 2)
    );
  },
  async readReceipt(requestId) {
    const key = await requestKey(requestId);
    const file = Bun.file(
      join(browserArtifactDirectory, `${key.slice(0, 24)}-receipt.json`)
    );
    if (!(await file.exists())) return undefined;
    return file.json();
  }
};

const targetHost = host === "::1" ? "[::1]" : host;
const browserTarget =
  `http://${targetHost}:${port}/workbench/scenario/workshop`;
const browserWorkbench = new BrowserWorkbench({
  targetAllowlist: [browserTarget],
  store
});
await browserWorkbench.initialize();

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
    const atlasFederation = new AtlasFederationTransport({
      handler: {
        async handle(event) {
          return {
            accepted: false,
            correlationId: event.eventId,
            reason: `work_kind_not_admitted:${event.workKind}`
          };
        }
      }
    });
    const transport = new SwarmHomeWebTransport(router, {
      basePath: "/swarm-home",
      maxBodyBytes: 64 * 1024,
      atlasFederation,
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

function response(
  body,
  contentType,
  status = 200,
  contentSecurityPolicy = "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
) {
  return new Response(body, {
    status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy": contentSecurityPolicy
    }
  });
}

function workbenchEnabled() {
  return loopbackHosts.has(host);
}

async function readJsonBody(request) {
  if (!request.body) return { ok: false, error: "request body is required" };
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16 * 1024) {
        await reader.cancel();
        return { ok: false, error: "request body exceeds 16 KiB" };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, error: "request body is not valid JSON" };
  }
}

function hasPlayToken(request) {
  return request.headers.get("x-swarm-play-token") === playToken;
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

    if (url.pathname.startsWith("/workbench")) {
      if (!workbenchEnabled()) {
        return Response.json(
          { ok: false, error: "browser workbench is restricted to loopback" },
          { status: 403 }
        );
      }
      if (request.method === "GET" && url.pathname === "/workbench") {
        return response(
          workbenchHtml
            .replace("__PLAY_TOKEN__", playToken)
            .replace("__BROWSER_TARGET__", browserTarget),
          "text/html; charset=utf-8"
        );
      }
      if (
        request.method === "GET" &&
        url.pathname === "/workbench/styles.css"
      ) {
        return response(workbenchCss, "text/css; charset=utf-8");
      }
      if (request.method === "GET" && url.pathname === "/workbench/app.js") {
        return response(workbenchJs, "text/javascript; charset=utf-8");
      }
      if (
        request.method === "GET" &&
        url.pathname === "/workbench/scenario/workshop.css"
      ) {
        return response(scenarioCss, "text/css; charset=utf-8");
      }
      if (
        request.method === "GET" &&
        url.pathname === "/workbench/scenario/workshop"
      ) {
        if (url.search !== "" && url.search !== "?choice=cedar") {
          return new Response("Unsupported synthetic scenario state.", {
            status: 400,
            headers: { "content-type": "text/plain; charset=utf-8" }
          });
        }
        const selected = url.search === "?choice=cedar";
        return response(
          `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Juniper Workshop · Synthetic scenario</title><link rel="stylesheet" href="/workbench/scenario/workshop.css"></head>
<body><main class="workshop">
  <p class="label">SYNTHETIC SCENARIO · LOCAL FIXTURE</p>
  <h1>Juniper Workshop</h1>
  <p class="intro">A fictional workshop for a bounded browser-execution proof. No customer data or live world records are used.</p>
  <section class="choice" aria-labelledby="choice-title">
    <h2 id="choice-title">Workbench choice</h2>
    <p id="selection-state" role="status">${selected ? "Cedar bench reserved for this synthetic workshop" : "No bench selected"}</p>
    ${
      selected
        ? '<a href="/workbench/scenario/workshop">Undo the choice</a>'
        : '<a href="?choice=cedar">Choose the Cedar bench</a>'
    }
  </section>
  <p class="notice">The choice only changes this page URL and can be undone. This browser page is real; its workshop world is synthetic.</p>
</main></body></html>`,
              "text/html; charset=utf-8",
              200,
              "default-src 'none'; style-src 'self'; script-src 'none'; connect-src 'none'; img-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"
            );
      }
      if (
        request.method === "GET" &&
        url.pathname === "/workbench/api/health"
      ) {
        return Response.json({
          ok: true,
          runtime: "Bun",
          runtimeVersion: Bun.version,
          browserDriver: "Playwright Chromium",
          playwrightVersion,
          target: browserTarget,
          targetStanding: "explicit_local_allowlist",
          authority: "synthetic_local_operator_only",
          persistence: "local_bounded_job_index_and_artifacts",
          scenario: "synthetic_fixture"
        });
      }
      if (
        request.method === "POST" &&
        url.pathname === "/workbench/api/jobs"
      ) {
        if (!hasPlayToken(request)) {
          return Response.json(
            { ok: false, error: "operator approval requires the local play token" },
            { status: 403 }
          );
        }
        const body = await readJsonBody(request);
        if (!body.ok) {
          return Response.json({ ok: false, error: body.error }, { status: 400 });
        }
        const started = await browserWorkbench.start(body.value);
        return Response.json(
          started.accepted
            ? {
                ok: true,
                duplicate: started.duplicate,
                job: started.job
              }
            : { ok: false, error: started.reason },
          { status: started.accepted ? 202 : started.status }
        );
      }
      const jobMatch = /^\/workbench\/api\/jobs\/([a-zA-Z0-9._:-]{1,120})(\/cancel|\/replay|\/receipt)?$/.exec(
        url.pathname
      );
      if (
        jobMatch &&
        request.method === "POST" &&
        jobMatch[2] === "/cancel"
      ) {
        if (!hasPlayToken(request)) {
          return Response.json(
            { ok: false, error: "cancellation requires the local play token" },
            { status: 403 }
          );
        }
        const cancelled = await browserWorkbench.cancel(jobMatch[1]);
        return Response.json(
          { ok: cancelled, requestId: jobMatch[1] },
          { status: cancelled ? 202 : 409 }
        );
      }
      if (
        jobMatch &&
        request.method === "POST" &&
        jobMatch[2] === "/replay"
      ) {
        return Response.json(
          await browserWorkbench.replay(jobMatch[1])
        );
      }
      if (jobMatch && request.method === "GET" && !jobMatch[2]) {
        const job = browserWorkbench.get(jobMatch[1]);
        return job
          ? Response.json({ ok: true, job })
          : Response.json({ ok: false, error: "browser job not found" }, { status: 404 });
      }
      if (
        jobMatch &&
        request.method === "GET" &&
        jobMatch[2] === "/receipt"
      ) {
        const receipt = await browserWorkbench.receipt(jobMatch[1]);
        if (!receipt) {
          return Response.json(
            { ok: false, error: "browser receipt not found" },
            { status: 404 }
          );
        }
        const key = await requestKey(jobMatch[1]);
        return new Response(JSON.stringify(receipt, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "content-disposition": `attachment; filename="browser-workbench-${key.slice(0, 16)}.json"`,
            "cache-control": "no-store",
            "x-content-type-options": "nosniff"
          }
        });
      }
      if (
        request.method === "GET" &&
        url.pathname === "/workbench/api/artifact"
      ) {
        const artifactRef = url.searchParams.get("ref") ?? "";
        const bytes = await browserWorkbench.artifact(artifactRef);
        if (!bytes) {
          return Response.json(
            { ok: false, error: "browser artifact not found" },
            { status: 404 }
          );
        }
        return new Response(bytes, {
          headers: {
            "content-type": "image/png",
            "cache-control": "no-store",
            "x-content-type-options": "nosniff"
          }
        });
      }
      return Response.json({ ok: false, error: "workbench route not found" }, { status: 404 });
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

    if (request.method === "GET" && url.pathname === "/play/manifest") {
      return Response.json({
        schema: "PlayableBunManifest/v1",
        executable: "swarm-home-bun",
        runtime: "bun",
        surface: "Swarm Home Hub",
        ownership: {
          residenceLifecycle: "swarm-home",
          habitatState: "swarm-home",
          eventHistory: "swarm-home",
          authorityDecision: "external-atlas-contract-synthetic-in-demo",
          presentation: "playable-shell"
        },
        evidencePath: ["identity", "event", "transformation", "evidence", "outcome"],
        persistence: "in-memory-demo",
        networkBindingDefault: "127.0.0.1",
        nonClaims: [
          "not production Atlas",
          "not live cross-repository federation",
          "not durable persistence",
          "not external authentication",
          "not a copy of private product truth"
        ]
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
console.log(`│  browser: http://${host}:${server.port}/workbench`);
console.log(`│  health: http://${host}:${server.port}/play/health`);
console.log("│  truth:  real Swarm runtime, synthetic Atlas authority    │");
console.log("│  state:  local + in-memory                                │");
console.log("└────────────────────────────────────────────────────────────┘");
console.log("");
