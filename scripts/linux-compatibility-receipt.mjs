import { spawnSync } from "node:child_process";
import { machine, totalmem } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const architectures = new Set([
  "x86_64", "i386", "i686", "aarch64", "armv7l", "ppc64le", "s390x", "riscv64", "loongarch64"
]);
const versionPattern = /^\d{1,3}\.\d{1,3}(?:\.\d{1,3})?$/;
const utcTimestampPattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/;
const diskColumns = ["--bytes", "--json", "--list", "--nodeps", "--output", "TYPE,SIZE"];
const manualChecks = [
  "operatorDeviceIdentity", "officialLiveImageChecksum", "recoveryMediaAndBackup", "cpuModel",
  "internalStorage", "displayGraphics", "touchscreen", "keyboard", "wifi", "sleepResume",
  "charging", "sustainedThermals", "reboot", "durability"
];

const measured = (value) => ({ status: "measured", value });
const unknown = (reason) => ({ status: "unknown", reason });
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

function observationTime(value) {
  if (value === undefined) return unknown("missing_value");
  const match = typeof value === "string" && utcTimestampPattern.exec(value);
  if (!match) return unknown("invalid_value");

  const canonical = `${match[1]}.${(match[2] ?? "").padEnd(3, "0")}Z`;
  const date = new Date(canonical);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== canonical) return unknown("invalid_value");
  return canonical;
}

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
  const { stdout } = result;
  return typeof stdout === "string" ? parse(stdout) : unknown("invalid_output");
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
  const { name: runtimeName, version: runtimeVersion } = runtime ?? {};
  const timestamp = observationTime(observedAt);
  const inventory = {
    architecture: architectures.has(architecture) ? measured(architecture) : unknown("invalid_value"),
    totalMemoryBytes: positiveInteger(totalMemoryBytes) ? measured(totalMemoryBytes) : unknown("invalid_value"),
    wholeDiskBytes: probeLsblk(platform, run, diskColumns, diskSize)
  };
  const tools = {
    runtime: (runtimeName === "node" || runtimeName === "bun") &&
      typeof runtimeVersion === "string" && versionPattern.test(runtimeVersion)
      ? measured({ name: runtimeName, version: runtimeVersion })
      : unknown("invalid_value"),
    lsblk: probeLsblk(platform, run, ["--version"], lsblkVersion)
  };
  const receipt = {
    schema: "SwarmLinuxCompatibilityReceipt/v1",
    observedAt: timestamp,
    source: "local_host_unverified",
    deviceVerification: "unverified",
    inventory,
    tools,
    manualChecks: Object.fromEntries(manualChecks.map((check) => [check, "unmeasured"]))
  };
  const allMeasured = typeof timestamp === "string" && [...Object.values(inventory), ...Object.values(tools)]
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
