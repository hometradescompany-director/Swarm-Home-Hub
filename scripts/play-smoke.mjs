const host = "127.0.0.1";
const port = Number(process.env.PLAY_SMOKE_PORT ?? "8791");
const token = "play-smoke-token";
const origin = `http://${host}:${port}`;

const processHandle = Bun.spawn(["./dist/swarm-home-bun"], {
  env: {
    ...process.env,
    HOST: host,
    PORT: String(port),
    SWARM_PLAY_TOKEN: token
  },
  stdout: "pipe",
  stderr: "pipe"
});

async function waitForHealth() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(origin + "/play/health");
      if (response.ok) return response.json();
    } catch {}
    await Bun.sleep(100);
  }
  throw new Error("compiled playable Bun did not become healthy");
}

async function tool(name, args, authorized = true) {
  const headers = { "content-type": "application/json" };
  if (authorized) headers["x-swarm-play-token"] = token;
  const response = await fetch(origin + "/swarm-home/tools/" + encodeURIComponent(name), {
    method: "POST",
    headers,
    body: JSON.stringify({ arguments: args })
  });
  return { status: response.status, body: await response.json() };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const health = await waitForHealth();
  assert(health.ok === true, "health did not report ok");
  assert(health.runtime === "bun", "compiled executable did not identify Bun runtime");

  const html = await fetch(origin + "/play").then(r => r.text());
  assert(html.includes("PLAYABLE"), "playable UI was not served");
  assert(html.includes("THE PILE BECOMES PLAYABLE"), "playable closure marker missing");

  const seed = Date.now().toString(36);
  const residenceId = "residence:smoke:" + seed;
  const identityRef = "agent:smoke:" + seed;
  const actorRef = "operator:smoke";
  const at = n => new Date(Date.now() + n).toISOString();

  const unauthorized = await tool("swarm.home.request", {
    command: {
      requestId: "request:unauthorized:" + seed,
      residenceId: "residence:unauthorized:" + seed,
      agentIdentityRef: "agent:unauthorized:" + seed,
      habitatId: "habitat:play",
      requestedAt: at(1),
      actorRef,
      evidenceReceiptIds: []
    },
    observedAt: at(2)
  }, false);
  assert(unauthorized.status === 403, "mutation without local token was not refused");

  const request = await tool("swarm.home.request", {
    command: {
      requestId: "request:smoke:" + seed,
      residenceId,
      agentIdentityRef: identityRef,
      habitatId: "habitat:play",
      requestedAt: at(3),
      actorRef,
      evidenceReceiptIds: []
    },
    observedAt: at(4)
  });
  assert(request.body.ok === true, "request failed");

  const illegalReady = await tool("swarm.home.ready", {
    residenceId,
    eventId: "event:illegal-ready:" + seed,
    at: at(5),
    actorRef
  });
  assert(illegalReady.body.ok === false, "illegal requested -> ready transition was accepted");

  const admit = await tool("swarm.home.admit", {
    residenceId,
    eventId: "event:admit:" + seed,
    observedAt: at(6),
    actorRef
  });
  assert(admit.body.ok === true, "admission failed");
  assert(admit.body.value.outcome === "admitted", "authority did not produce admission");

  const rest = await tool("swarm.home.rest", {
    residenceId,
    eventId: "event:rest:" + seed,
    at: at(7),
    actorRef
  });
  assert(rest.body.ok === true, "rest transition failed");

  const ready = await tool("swarm.home.ready", {
    residenceId,
    eventId: "event:ready:" + seed,
    at: at(8),
    actorRef
  });
  assert(ready.body.ok === true, "ready transition failed");

  const handoff = await tool("swarm.home.handoff", {
    residenceId,
    agent: {
      identityRef,
      capabilityRefs: ["capability:smoke"],
      offeringRefs: ["offering:smoke"]
    },
    generatedAt: at(9)
  }, false);
  assert(handoff.body.ok === true, "ready handoff failed");

  const depart = await tool("swarm.home.depart", {
    residenceId,
    eventId: "event:depart:" + seed,
    at: at(10),
    actorRef,
    reason: "compiled playable smoke complete"
  });
  assert(depart.body.ok === true, "departure failed");

  const deniedId = "residence:denied:" + seed;
  const deniedRequest = await tool("swarm.home.request", {
    command: {
      requestId: "request:denied:" + seed,
      residenceId: deniedId,
      agentIdentityRef: "agent:smoke:denied",
      habitatId: "habitat:play",
      requestedAt: at(11),
      actorRef,
      evidenceReceiptIds: []
    },
    observedAt: at(12)
  });
  assert(deniedRequest.body.ok === true, "denied-path request failed");

  const deniedAdmission = await tool("swarm.home.admit", {
    residenceId: deniedId,
    eventId: "event:deny:" + seed,
    observedAt: at(13),
    actorRef
  });
  assert(deniedAdmission.body.ok === true, "denial path failed to record outcome");
  assert(deniedAdmission.body.value.outcome === "rejected", "denied authority became admission");

  const inspection = await tool("swarm.home.inspect", {}, false);
  assert(inspection.body.ok === true, "final inspection failed");

  console.log(JSON.stringify({
    ok: true,
    proof: "compiled-playable-bun",
    executable: "./dist/swarm-home-bun",
    lifecycle: ["requested","admitted","resting","ready","handoff","departed"],
    falsifiers: ["unauthorized-mutation-refused","illegal-transition-refused","authority-denial-preserved"],
    finalInspection: inspection.body.value
  }, null, 2));
} finally {
  processHandle.kill();
  await processHandle.exited;
}
