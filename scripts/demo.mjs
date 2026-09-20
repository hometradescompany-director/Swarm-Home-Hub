import { createServer } from "node:http";
import { InMemoryEventJournal } from "../dist/src/events/journal.js";
import { SwarmHomeDoor } from "../dist/src/platform/swarm-home-door.js";
import { SwarmHomeToolRouter } from "../dist/src/platform/tool-router.js";
import { SwarmHomeWebTransport } from "../dist/src/platform/web-transport.js";
import { InMemoryHabitatRegistry } from "../dist/src/registry/habitat-registry.js";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "8787");
const maxBodyBytes = 64 * 1024;

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const habitat = {
  id: "habitat:demo",
  name: "Public Demo Habitat",
  capacity: 4,
  status: "open",
  heartbeatStaleAfterMs: 60_000
};

const atlas = {
  async resolveAgentIdentity(ref) {
    return { exists: true, canonicalRef: ref };
  },
  async canEnterHome() {
    return {
      allowed: false,
      reason: "public demo host is read-only",
      authorityRef: "atlas:authority:demo-readonly",
      decidedAt: new Date().toISOString()
    };
  },
  async evidence() {
    return [];
  }
};

const journal = new InMemoryEventJournal();
const habitats = new InMemoryHabitatRegistry();
await habitats.put(habitat);

const transport = new SwarmHomeWebTransport(
  new SwarmHomeToolRouter(new SwarmHomeDoor({ journal, habitats, atlas })),
  { basePath: "/swarm-home", maxBodyBytes }
);

function writeJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.end(JSON.stringify(payload));
}

async function toWebRequest(request) {
  const method = request.method ?? "GET";
  const authority = request.headers.host ?? `${host}:${port}`;
  const url = new URL(request.url ?? "/", `http://${authority}`);
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  let body;
  if (method !== "GET" && method !== "HEAD") {
    const chunks = [];
    let total = 0;
    for await (const chunk of request) {
      total += chunk.length;
      if (total > maxBodyBytes) {
        const error = new Error("request body is too large");
        error.status = 413;
        throw error;
      }
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }

  return new Request(url, { method, headers, body });
}

const server = createServer(async (request, response) => {
  try {
    const webRequest = await toWebRequest(request);
    const webResponse = await transport.handle(webRequest);

    response.statusCode = webResponse.status;
    for (const [name, value] of webResponse.headers) {
      response.setHeader(name, value);
    }

    response.end(Buffer.from(await webResponse.arrayBuffer()));
  } catch (error) {
    const status = Number(error?.status) === 413 ? 413 : 500;
    writeJson(response, status, {
      ok: false,
      error: status === 413 ? "request body is too large" : "demo host request failed"
    });
  }
});

server.listen(port, host, () => {
  const origin = `http://${host}:${port}/swarm-home`;
  console.log("Swarm Home Hub demo host is ready");
  console.log(`  health: ${origin}/health`);
  console.log(`  tools:  ${origin}/tools`);
  console.log("  mode:   read-only public demo; state mutation remains fail-closed");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
