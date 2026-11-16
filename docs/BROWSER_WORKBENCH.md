# Local browser workbench beta

The workbench is a local-only operator surface over the existing external
execution request, authority and provenance boundaries. It runs one approved
job at a time in a real, headless Chromium session. Its Juniper Workshop page is
a synthetic fixture, not a World Weaver / Reality Generator world.

## Run it

```bash
bun install --frozen-lockfile
npx playwright install chromium
bun run play
```

Open `http://127.0.0.1:8787/workbench`. Review the target, three requested
actions and limits; check the explicit approval box; then select **Review & start
job**. The browser test is also runnable with:

```bash
bun run test:browser-workbench
```

The automated proof starts the local server, checks desktop and mobile layouts,
approves the fixed job through the UI, launches the bundled Chromium driver,
checks the receipt and artifacts, validates replay, re-delivers the same request
and downloads the receipt.

## Verified runtime and outcome

Verified on Linux x64 with Bun `1.4.4`, Playwright `1.65.1` (exactly pinned in
`package.json` and both lockfiles), and Playwright's pinned Chromium
`159.0.8154.6`.

Exact successful command:

```bash
npx --yes bun run test:browser-workbench
```

Outcome: one approved request completed with three source-attributed Chromium
observations and two captured PNGs. Receipt replay passed; re-delivery returned
the persisted result without a second driver call. The actual workbench UI had
no horizontal overflow at 1440px desktop or 390px mobile widths. The run
reported request `browser_job_23018a45e9c14641aa49c283c976f485` and artifacts:

- initial screenshot: 105,912 bytes, SHA-256
  `a9c2423717c56c98e4fa75c1b4803564d16bc69a3240103f60174831be4ddd01`;
- verified screenshot: 109,232 bytes, SHA-256
  `c16499a2483fb43c23d2608fe6dd2c7d310684b09bbd1e46ff5627e6f03e86f4`.

The command saves desktop/mobile UI screenshots, the downloaded JSON receipt,
job index and browser artifacts in `.swarm-home-browser-artifacts/` by default.
Set `SWARM_BROWSER_ARTIFACT_DIR` to use another local directory. CI uploads its
browser-check artifacts for 14 days.

## Boundaries and cost

- The only navigable target is the exact local `/workbench/scenario/workshop`
  URL. Its one stylesheet and the Cedar-choice query are the only additional
  browser requests allowed. Browser requests outside this local allowlist are
  aborted.
- The action vocabulary is fixed: observe, choose the Cedar bench, verify the
  visible state. The request cap is three steps, one active job and 30 seconds.
  The UI gives a request a two-minute approval window. Request bodies are
  limited to 16 KiB; the local job history is capped at 20 identities and fails
  closed when full.
- The choice only changes the fixture URL and is reversible. Browser
  observations are attributed to Chromium; fixture content is labelled
  synthetic. The receipt labels its handoff reference synthetic and
  non-persisted; no Swarm source event or derived residence/world state is
  created. No outcome or digest is supplied when its underlying observation or
  bytes do not exist.
- Authorization is an explicit local operator confirmation through
  `executeWithExternalProvider`. Its authority ref is marked synthetic and is
  not a live Atlas decision.
- No model API, credentials, paid service, image generation, network target,
  scheduler or autonomous agent is involved. Playwright and its browser are
  open-source local tooling.

## Remaining before a hosted customer beta

This proof does not exercise live Atlas identity, authority or evidence;
World Weaver / Reality Generator scenario references; customer authentication;
hosted persistence or multi-process idempotency; or an externally managed
browser. Those owners and contracts require separate approval and integration.
The local scenario seam is a reference only; the fictional workshop does not
become a second canonical world engine.
