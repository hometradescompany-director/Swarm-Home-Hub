import { createServer } from "node:net";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const artifactDirectory = resolve(
  process.env.SWARM_BROWSER_ARTIFACT_DIR ??
    join(process.cwd(), ".swarm-home-browser-artifacts")
);
await mkdir(artifactDirectory, { recursive: true });
const serverArtifactDirectory = await mkdtemp(join(artifactDirectory, "smoke-run-"));

async function availablePort() {
  const listener = createServer();
  await new Promise((resolveListen, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolveListen);
  });
  const address = listener.address();
  if (!address || typeof address === "string") {
    throw new Error("could not reserve a loopback port for the browser proof");
  }
  await new Promise((resolveClose, reject) =>
    listener.close((error) => (error ? reject(error) : resolveClose()))
  );
  return address.port;
}

const port = await availablePort();
const origin = `http://127.0.0.1:${port}`;
const server = Bun.spawn({
  cmd: [process.execPath, "scripts/play.mjs"],
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(port),
    SWARM_BROWSER_ARTIFACT_DIR: serverArtifactDirectory
  },
  stdout: "ignore",
  stderr: "pipe"
});
let browser;

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) break;
    try {
      const response = await fetch(`${origin}/workbench/api/health`);
      ready = response.ok;
      if (ready) break;
    } catch {
      await Bun.sleep(100);
    }
  }
  if (!ready) {
    server.kill("SIGTERM");
    await server.exited;
    const stderr = await new Response(server.stderr).text();
    throw new Error(`browser workbench server did not start:\n${stderr}`);
  }

  const health = await (await fetch(`${origin}/workbench/api/health`)).json();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true
  });
  const page = await context.newPage();
  await page.goto(`${origin}/workbench`, { waitUntil: "networkidle" });
  await page.frameLocator("iframe").getByRole("heading", {
    name: "Juniper Workshop"
  }).waitFor();

  const desktopOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  if (desktopOverflow) throw new Error("desktop workbench overflows horizontally");
  const desktopScreenshot = join(artifactDirectory, "browser-workbench-desktop.png");
  await page.screenshot({ path: desktopScreenshot, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  if (mobileOverflow) throw new Error("mobile workbench overflows horizontally");
  const mobileScreenshot = join(artifactDirectory, "browser-workbench-mobile.png");
  await page.screenshot({ path: mobileScreenshot, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel(/I reviewed this exact target/).check();
  const startResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${origin}/workbench/api/jobs` &&
      response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Review & start job" }).click();
  const startResponse = await startResponsePromise;
  if (startResponse.status() !== 202) {
    throw new Error(
      `job request was refused: ${startResponse.status()} ${await startResponse.text()}`
    );
  }
  const started = await startResponse.json();
  const requestId = started.job.request.requestId;
  if (!started.job.request.approval.approved) {
    throw new Error("the browser test did not explicitly approve the job");
  }

  await page.waitForFunction(
    () => {
      const status = document.querySelector("#jobStatus")?.dataset.state;
      return status && !["reviewed", "running"].includes(status);
    },
    undefined,
    { timeout: 20_000 }
  );
  const status = await page.locator("#jobStatus").getAttribute("data-state");
  if (status !== "completed") {
    throw new Error(`real Chromium job finished with status ${status}`);
  }

  const receiptResponse = await fetch(
    `${origin}/workbench/api/jobs/${requestId}/receipt`
  );
  if (!receiptResponse.ok) throw new Error("downloadable receipt was not available");
  const receipt = await receiptResponse.json();
  if (
    receipt.execution.status !== "completed" ||
    receipt.execution.browserVersion !== browser.version() ||
    receipt.scenario.standing !== "synthetic_fixture" ||
    receipt.sourceEvents[0]?.persisted !== false ||
    receipt.derivedState !== null ||
    receipt.observations.length !== 3 ||
    receipt.artifacts.length < 2
  ) {
    throw new Error("receipt did not preserve the real bounded Chromium outcome");
  }

  for (const artifact of receipt.artifacts) {
    const response = await fetch(
      `${origin}/workbench/api/artifact?ref=${encodeURIComponent(artifact.artifactRef)}`
    );
    if (!response.ok) throw new Error(`artifact ${artifact.artifactRef} is unavailable`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const pngSignature = "89504e470d0a1a0a";
    const actualSignature = Array.from(bytes.slice(0, 8), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    if (actualSignature !== pngSignature) {
      throw new Error(`artifact ${artifact.artifactRef} is not a captured PNG`);
    }
  }

  await page.getByRole("button", { name: "Validate receipt & replay" }).click();
  await page.getByText(/Replay inspection passed/).waitFor();

  const duplicateResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${origin}/workbench/api/jobs` &&
      response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Re-deliver same request" }).click();
  const duplicateResponse = await duplicateResponsePromise;
  const duplicate = await duplicateResponse.json();
  if (!duplicate.duplicate) {
    throw new Error("same-request re-delivery did not return the saved result");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const completedMobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  if (completedMobileOverflow) {
    throw new Error("completed mobile workbench overflows horizontally");
  }
  const completedMobileScreenshot = join(
    artifactDirectory,
    "browser-workbench-complete-mobile.png"
  );
  await page.screenshot({ path: completedMobileScreenshot, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  const completedDesktopScreenshot = join(
    artifactDirectory,
    "browser-workbench-complete-desktop.png"
  );
  await page.screenshot({ path: completedDesktopScreenshot, fullPage: true });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download receipt" }).click();
  const download = await downloadPromise;
  const downloadedReceipt = join(artifactDirectory, "browser-workbench-receipt.json");
  await download.saveAs(downloadedReceipt);

  const evidence = {
    runtime: `Bun ${health.runtimeVersion}`,
    automation: `Playwright ${health.playwrightVersion}`,
    chromium: browser.version(),
    target: health.target,
    requestId,
    outcome: status,
    authorityStanding: receipt.authority.standing,
    scenarioStanding: receipt.scenario.standing,
    sourceEventsStanding: receipt.sourceEvents[0].standing,
    derivedState: receipt.derivedState,
    observations: receipt.observations.length,
    artifacts: receipt.artifacts.map((artifact) => ({
      ref: artifact.artifactRef,
      bytes: artifact.byteLength,
      sha256: artifact.sha256
    })),
    duplicateDelivery: "reused saved result; no second driver run",
    desktop: { width: 1440, horizontalOverflow: false, screenshot: desktopScreenshot },
    mobile: {
      width: 390,
      horizontalOverflow: false,
      reviewScreenshot: mobileScreenshot,
      completedScreenshot: completedMobileScreenshot
    },
    completedDesktopScreenshot,
    downloadableReceipt: downloadedReceipt
  };
  await writeFile(
    join(artifactDirectory, "browser-workbench-check.json"),
    JSON.stringify(evidence, null, 2)
  );
  console.log(JSON.stringify(evidence, null, 2));

  const completedJob = (await (
    await fetch(`${origin}/workbench/api/jobs/${requestId}`)
  ).json()).job;
  const racePage = await context.newPage();
  let raceRequest;
  let racePolls = 0;
  await racePage.route("**/workbench/api/jobs**", async (route) => {
    if (route.request().method() === "POST") {
      raceRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 202,
        json: { job: { ...completedJob, request: raceRequest, status: "running", receipt: null } }
      });
    } else {
      racePolls += 1;
      await route.fulfill({
        json: {
          job: {
            ...completedJob,
            request: raceRequest,
            status: racePolls === 1 ? "running" : "completed",
            receipt: racePolls === 1 ? null : completedJob.receipt
          }
        }
      });
    }
  });
  await racePage.goto(`${origin}/workbench`);
  await racePage.getByLabel(/I reviewed this exact target/).check();
  await racePage.getByRole("button", { name: "Review & start job" }).click();
  await racePage.waitForFunction(
    () => document.querySelector("#jobStatus")?.dataset.state === "completed",
    undefined,
    { timeout: 5_000 }
  );
  if (
    racePolls !== 2 ||
    (await racePage.locator("#start").isDisabled()) ||
    (await racePage.locator("#replay").isDisabled()) ||
    (await racePage.locator("#download").getAttribute("aria-disabled")) !== "false"
  ) {
    throw new Error("completion between polls was not rendered with its receipt controls");
  }
  await racePage.close();
  await context.close();
} finally {
  if (browser) await browser.close().catch(() => undefined);
  server.kill("SIGTERM");
  await server.exited;
}
