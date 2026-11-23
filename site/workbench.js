const body = document.body;
const token = body.dataset.playToken ?? "";
const targetRef = body.dataset.browserTarget ?? "";
const approval = document.querySelector("#approval");
const startButton = document.querySelector("#start");
const cancelButton = document.querySelector("#cancel");
const redeliverButton = document.querySelector("#redeliver");
const replayButton = document.querySelector("#replay");
const downloadLink = document.querySelector("#download");
const jobStatus = document.querySelector("#jobStatus");
const jobTitle = document.querySelector("#jobTitle");
const liveMessage = document.querySelector("#liveMessage");
const replayResult = document.querySelector("#replayResult");
const traceList = document.querySelector("#trace");
const artifactList = document.querySelector("#artifactList");
const stepList = document.querySelector("#stepList");
const evidenceStatus = document.querySelector("#evidenceStatus");

document.querySelector("#targetRef").textContent = targetRef;

let pendingRequest;
let currentRequestId;
let pollTimer;

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map((entry) => canonicalJson(entry)).join(",") + "]";
  }
  return (
    "{" +
    Object.keys(value)
      .sort()
      .map((key) => JSON.stringify(key) + ":" + canonicalJson(value[key]))
      .join(",") +
    "}"
  );
}

async function digest(value) {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const result = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(result), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function postJson(path, value) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-swarm-play-token": token
    },
    body: JSON.stringify(value)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status})`);
  return result;
}

function setStatus(status, message) {
  jobStatus.textContent = status.replaceAll("_", " ").toUpperCase();
  jobStatus.dataset.state = status;
  jobTitle.textContent =
    status === "completed" ? "Verified workshop choice" : "Browser job";
  liveMessage.textContent = message ?? "";
  const running = status === "running" || status === "reviewed";
  cancelButton.disabled = !running;
  startButton.disabled = running;
  redeliverButton.disabled = !pendingRequest || running;
}

function renderSteps(job) {
  const labels = [
    "Observe the page",
    "Choose the Cedar bench",
    "Verify the visible state"
  ];
  stepList.replaceChildren();
  labels.forEach((label, index) => {
    const observation = job.observations.find((item) => item.step === index + 1);
    const item = document.createElement("li");
    if (observation) item.classList.add("done");
    if (job.status === "failed" && !observation) item.classList.add("failed");
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = label;
    const source = document.createElement("small");
    source.textContent = observation
      ? `${observation.sourceKind} · ${observation.sourceRef}`
      : "Waiting for a direct browser observation";
    content.append(title, source);
    const state = document.createElement("b");
    state.textContent = observation ? "OBSERVED" : "WAITING";
    item.append(number, content, state);
    stepList.append(item);
  });
}

function renderEvidence(job) {
  traceList.replaceChildren();
  if (!job.observations.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No browser observations recorded.";
    traceList.append(empty);
  }
  for (const observation of job.observations) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${observation.step}. ${observation.action} · ${observation.value}`;
    const source = document.createElement("small");
    source.textContent = `${observation.sourceKind} · ${observation.sourceRef} · ${observation.observedAt}`;
    item.append(title, source);
    traceList.append(item);
  }

  artifactList.replaceChildren();
  if (!job.artifacts.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No screenshot bytes were captured.";
    artifactList.append(empty);
  }
  for (const artifact of job.artifacts) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = `/workbench/api/artifact?ref=${encodeURIComponent(artifact.artifactRef)}`;
    image.alt = `Chromium screenshot artifact ${artifact.fileName}`;
    const caption = document.createElement("figcaption");
    caption.textContent = `${artifact.fileName} · ${artifact.byteLength} bytes · sha256:${artifact.sha256}`;
    figure.append(image, caption);
    artifactList.append(figure);
  }

  evidenceStatus.textContent = job.receipt ? "RECEIPT READY" : "PARTIAL / NO RECEIPT";
  replayButton.disabled = !job.receipt;
  downloadLink.classList.toggle("disabled", !job.receipt);
  downloadLink.setAttribute("aria-disabled", String(!job.receipt));
  if (job.receipt) {
    downloadLink.href = `/workbench/api/jobs/${encodeURIComponent(job.request.requestId)}/receipt`;
    downloadLink.download = `browser-workbench-${job.request.requestId}.json`;
  } else {
    downloadLink.removeAttribute("href");
  }
}

function renderJob(job) {
  currentRequestId = job.request.requestId;
  setStatus(job.status, job.message ?? `Request ${job.request.requestId}`);
  renderSteps(job);
  renderEvidence(job);
}

async function pollJob(requestId) {
  clearInterval(pollTimer);
  const poll = async () => {
    try {
      const response = await fetch(`/workbench/api/jobs/${encodeURIComponent(requestId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not read job state");
      renderJob(result.job);
      if (result.job.status !== "running" && result.job.status !== "reviewed") {
        clearInterval(pollTimer);
        pollTimer = undefined;
      }
      return result.job.status;
    } catch (error) {
      clearInterval(pollTimer);
      pollTimer = undefined;
      liveMessage.textContent = error instanceof Error ? error.message : "Could not read job state.";
    }
  };
  const status = await poll();
  if (
    currentRequestId === requestId &&
    (status === "running" || status === "reviewed")
  ) {
    pollTimer = setInterval(poll, 350);
  }
}

async function createRequest() {
  const requestedAt = new Date().toISOString();
  const basePlan = {
    schema: "SwarmHomeBrowserJob/v1",
    requestId: `browser_job_${crypto.randomUUID().replaceAll("-", "")}`,
    targetRef,
    requestedAt,
    expiresAt: new Date(Date.now() + 120_000).toISOString(),
    actions: ["observe", "choose:cedar", "verify:cedar"],
    maxSteps: 3,
    maxDurationMs: 30_000
  };
  return {
    ...basePlan,
    approval: {
      approved: approval.checked,
      planDigest: await digest(basePlan),
      approvedAt: new Date().toISOString()
    }
  };
}

async function submitRequest(request) {
  replayResult.textContent = "";
  pendingRequest = request;
  const result = await postJson("/workbench/api/jobs", request);
  redeliverButton.disabled = false;
  renderJob(result.job);
  if (result.duplicate) {
    replayResult.textContent = "Same request identity and payload; returning its stored result without another browser run.";
  } else {
    replayResult.textContent = "Approved request delivered to the existing execution authorization boundary.";
  }
  await pollJob(request.requestId);
}

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  try {
    await submitRequest(await createRequest());
  } catch (error) {
    setStatus("failed", error instanceof Error ? error.message : "Job could not be started.");
  }
});

redeliverButton.addEventListener("click", async () => {
  if (!pendingRequest) return;
  redeliverButton.disabled = true;
  try {
    await submitRequest(pendingRequest);
  } catch (error) {
    redeliverButton.disabled = false;
    replayResult.textContent = error instanceof Error ? error.message : "Request re-delivery failed.";
  }
});

cancelButton.addEventListener("click", async () => {
  if (!currentRequestId) return;
  cancelButton.disabled = true;
  try {
    await postJson(
      `/workbench/api/jobs/${encodeURIComponent(currentRequestId)}/cancel`,
      {}
    );
    liveMessage.textContent = "Cancellation requested; the browser is closing and no further steps will start.";
  } catch (error) {
    liveMessage.textContent = error instanceof Error ? error.message : "Cancellation failed.";
  }
});

replayButton.addEventListener("click", async () => {
  if (!currentRequestId) return;
  replayButton.disabled = true;
  try {
    const result = await postJson(
      `/workbench/api/jobs/${encodeURIComponent(currentRequestId)}/replay`,
      {}
    );
    replayResult.textContent = result.valid
      ? "Replay inspection passed: request, source references and captured artifact bytes match."
      : `Replay inspection failed: ${result.reason}`;
  } catch (error) {
    replayResult.textContent = error instanceof Error ? error.message : "Replay inspection failed.";
  } finally {
    replayButton.disabled = false;
  }
});
