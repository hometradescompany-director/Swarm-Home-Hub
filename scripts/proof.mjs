import { spawn } from "node:child_process";

const host = process.env.PROOF_HOST ?? "127.0.0.1";
const port = Number(process.env.PROOF_PORT ?? "8787");
const origin = `http://${host}:${port}/swarm-home`;

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PROOF_PORT must be an integer between 1 and 65535");
}

let stdout = "";
let stderr = "";

const demo = spawn(process.execPath, ["scripts/demo.mjs"], {
  env: {
    ...process.env,
    HOST: host,
    PORT: String(port)
  },
  stdio: ["ignore", "pipe", "pipe"]
});

demo.stdout.setEncoding("utf8");
demo.stderr.setEncoding("utf8");
demo.stdout.on("data", chunk => {
  stdout += chunk;
});
demo.stderr.on("data", chunk => {
  stderr += chunk;
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readJson(path, init) {
  const response = await fetch(`${origin}${path}`, init);
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (demo.exitCode !== null) {
      throw new Error(`demo host exited before becoming ready (code ${demo.exitCode})`);
    }

    try {
      const { response, body } = await readJson("/health");
      if (response.ok && body?.ok === true) return;
    } catch {
      // The host may still be starting.
    }

    await sleep(250);
  }

  throw new Error("demo host did not become healthy");
}

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
}

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await waitForHealth();

  const health = await readJson("/health");
  requireCondition(health.response.status === 200, "health endpoint did not return HTTP 200");
  requireCondition(health.body?.ok === true, "health endpoint did not report ok=true");
  pass("health", "public transport reports healthy");

  const tools = await readJson("/tools");
  requireCondition(tools.response.status === 200, "tool discovery did not return HTTP 200");
  requireCondition(
    JSON.stringify(tools.body).includes("swarm.home.inspect"),
    "tool discovery did not expose swarm.home.inspect"
  );
  pass("discovery", "read-only inspection tool is discoverable");

  const inspect = await readJson("/tools/swarm.home.inspect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ arguments: {} })
  });
  requireCondition(inspect.response.status === 200, "inspection call did not return HTTP 200");
  requireCondition(inspect.body?.ok === true, "inspection call did not report ok=true");
  pass("inspection", "read-only inspection succeeds");

  const mutation = await readJson("/tools/swarm.home.request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ arguments: {} })
  });
  requireCondition(mutation.response.status === 403, "unguarded mutation did not fail closed with HTTP 403");
  requireCondition(
    JSON.stringify(mutation.body).includes("state-mutating tools require a transport admission guard"),
    "unguarded mutation did not return the expected fail-closed reason"
  );
  pass("fail-closed mutation", "state mutation is denied without an explicit admission guard");

  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    target: origin,
    boundary: "public read-only proof; mutation requires an explicit host admission guard",
    checks
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} catch (error) {
  const report = {
    ok: false,
    generatedAt: new Date().toISOString(),
    target: origin,
    error: error instanceof Error ? error.message : String(error),
    checks,
    hostStdout: stdout.trim() || undefined,
    hostStderr: stderr.trim() || undefined
  };

  process.stderr.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = 1;
} finally {
  if (demo.exitCode === null) {
    demo.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve => demo.once("exit", resolve)),
      sleep(1_000)
    ]);
  }
}
