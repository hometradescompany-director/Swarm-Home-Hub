import { statSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const executable = process.argv[2] ?? "dist/swarm-home-bun";
const output = process.argv[3] ?? "dist/playable-receipt.json";

const bytes = await readFile(executable);
const stat = statSync(executable);
const sha256 = createHash("sha256").update(bytes).digest("hex");

const receipt = {
  schema: "SwarmPlayableReceipt/v1",
  generatedAt: new Date().toISOString(),
  sourceCommit: process.env.GITHUB_SHA ?? "local-unattributed",
  executable,
  byteLength: stat.size,
  sha256,
  bunVersion: Bun.version,
  proofCommand: "bun run test:playable",
  runtimeTruth: {
    residenceEngine: "real Swarm Home runtime",
    atlasAuthority: "synthetic local demo adapter",
    persistence: "in-memory",
    crossRepositoryImports: false
  },
  preservedInvariants: [
    "identity refs remain opaque",
    "authority is external to residence truth",
    "residence transitions remain event-backed",
    "invalid transitions fail closed",
    "unauthorised mutation fails before routing",
    "demo presentation does not become product truth"
  ]
};

await Bun.write(output, JSON.stringify(receipt, null, 2) + "\n");
console.log(JSON.stringify(receipt, null, 2));
