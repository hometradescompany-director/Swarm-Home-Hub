import { spawnSync } from "node:child_process";
import { machine, totalmem } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const architectures = new Set([
  "x86_64", "i386", "i686", "aarch64", "armv7l", "ppc64le", "s390x", "riscv64", "loongarch64"
]);
const versionPattern = /^\d{1,3}\.\d{1,3}(?:\.\d{1,3})?$/;
const diskColumns = ["--bytes", "--json", "--list", "--nodeps", "--output", "TYPE,SIZE"];
const manualChecks = [
  "operatorDeviceIdentity", "officialLiveImageChecksum", "recoveryMediaAndBackup", "cpuModel",
  "internalStorage", "displayGraphics", "touchscreen", "keyboard", "wifi", "sleepResume",
  "charging", "sustainedThermals", "reboot", "durability"
];

const measured = (value) => ({ status: "measured", value });
const unknown = (reason) => ({ status: "unknown", reason });
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

function diskSize(stdout) {
  let devices;
  try {
    devices = JSON.parse(stdout)?.blockdevices;
  } catch {
    return unknown("invalid_output");
  }
  if (!Array.isArray(devices) || devices.some((entry) => typeof entry?.type !== "string")) {
    return unknown("invalid_output");
  }

  const disks = devices.filter((entry) => entry.type === "disk");
  if (disks.length === 0) return unknown("no_disks_reported");

  let total = 0;
  for (const { size } of disks) {
    const bytes = typeof size === "string" && /^\d{1,16}$/.test(size) ? Number(size) : size;
    if (!positiveInteger(bytes)) return unknown("invalid_output");
    total += bytes;
  }
  return positiveInteger(total) ? measured(total) : unknown("invalid_output");
}

function lsblkVersion(stdout) {
  const prefix = "lsblk from util-linux ";
  const version = stdout.trim().slice(prefix.length);
  return stdout.startsWith(prefix) && versionPattern.test(version)
    ? measured(version)
    : unknown("invalid_output");
}

function probeLsblk(platform, run, args, parse) {
  if (platform !== "linux") return unknown("unsupported_platform");

  const result = run("/usr/bin/lsblk", args, {
    encoding: "utf8",
    env: { LC_ALL: "C" },
    timeout: 5_000,
    maxBuffer: 64 * 1024
  });
  if (result.error?.code === "ENOENT") return unknown("tool_missing");
  if (result.error || result.status !== 0) return unknown("command_failed");
  if (typeof result.stdout !== "string") return unknown("invalid_output");
  return parse(result.stdout);
}

export function collectCompatibilityReceipt(host = {
  platform: process.platform,
  architecture: machine(),
  totalMemoryBytes: totalmem(),
  runtime: process.versions.bun
    ? { name: "bun", version: process.versions.bun }
    : { name: "node", version: process.versions.node },
  observedAt: new Date().toISOString()
}, run = spawnSync) {
  const { platform, architecture, totalMemoryBytes, runtime, observedAt } = host;
  const inventory = {
    architecture: architectures.has(architecture) ? measured(architecture) : unknown("invalid_value"),
    totalMemoryBytes: positiveInteger(totalMemoryBytes) ? measured(totalMemoryBytes) : unknown("invalid_value"),
    wholeDiskBytes: probeLsblk(platform, run, diskColumns, diskSize)
  };
  const tools = {
    runtime: (runtime?.name === "node" || runtime?.name === "bun") &&
      versionPattern.test(runtime.version)
      ? measured({ name: runtime.name, version: runtime.version })
      : unknown("invalid_value"),
    lsblk: probeLsblk(platform, run, ["--version"], lsblkVersion)
  };
  const receipt = {
    schema: "SwarmLinuxCompatibilityReceipt/v1",
    observedAt,
    source: "local_host_unverified",
    deviceVerification: "unverified",
    inventory,
    tools,
    manualChecks: Object.fromEntries(manualChecks.map((check) => [check, "unmeasured"]))
  };
  const allMeasured = [...Object.values(inventory), ...Object.values(tools)]
    .every((fact) => fact.status === "measured");
  return { receipt, exitCode: allMeasured ? 0 : 1 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) {
    console.error("Usage: node scripts/linux-compatibility-receipt.mjs");
    process.exitCode = 2;
  } else {
    const { receipt, exitCode } = collectCompatibilityReceipt();
    console.log(JSON.stringify(receipt, null, 2));
    process.exitCode = exitCode;
  }
}
