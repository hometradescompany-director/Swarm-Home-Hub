# NewBook 11: no-USB Linux preparation (non-destructive)

Target declared in [#502](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/502): BNCF NewBook 11, Intel N150, 12 GB RAM, ~238 GB SSD. Hardware has **not** been measured on-device.

## Supported first install: Debian under WSL2, from Windows

On the existing Windows installation, open **PowerShell as Administrator** and run the reviewed `scripts/newbook-wsl-bootstrap.ps1` script (or run `wsl --install -d Debian` directly). Restart if requested, then launch Debian and create the ordinary Linux user. No USB is required. **Windows remains installed and continues consuming RAM**; WSL2 is a compatibility and capability step, **not** a replacement OS.

Inside Debian, install `git`, `curl`, `ca-certificates`, and `unzip` using apt. Install Bun from its official instructions and confirm `bun --version`; do not copy untrusted one-line install commands from chat. Clone the reviewed Swarm repository and run:

```sh
bun install --frozen-lockfile
bun run check
bun run prove:playable
bun run bun:compile
```

The compiled binary will be `dist/swarm-home-bun`. Existing smoke/receipt scripts are the first evidence gates. This demo is **loopback-only, synthetic authority and in-memory persistence**, not live Atlas federation. Do not register a persistent service or expose ports until authority and storage gates are verified.

## Cloud terminal

Install the official Google Cloud CLI inside Debian using Google's published Debian/Ubuntu instructions, then authenticate explicitly with your existing account/project. Installing the CLI does not create credentials, grant IAM rights or connect Atlas automatically. GitHub CLI is optional for watching workflow runs. Never export Windows browser tokens or secrets into a repository, workflow log or shared runner.

## Native Linux without USB: separate, gated operation

A true Windows replacement **cannot** be delivered by the WSL bootstrap above. A diskless-media native installation requires a separately verified boot/recovery method, backups, device compatibility and explicit disk-wipe approval. This PR deliberately does **not** modify EFI/bootloaders, partition tables, BitLocker, Windows or cloud credentials.

If RAM is the immediate issue, use WSL2 with a bounded `.wslconfig` memory limit while testing; this will not recover Windows's own footprint. A later native minimal Debian installation could recover more RAM, but is not yet built or tested on the NewBook.

## Evidence

Existing historical CI: [#503](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/503), [Linux run 38725348553](https://github.com/hometradescompany-director/Swarm-Home-Hub/actions/runs/38725348553). Physical device compatibility and actual WSL installation remain unverified. This PR only prepares a no-USB, reversible route.
