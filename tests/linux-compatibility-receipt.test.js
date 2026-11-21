import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { collectCompatibilityReceipt } from "../scripts/linux-compatibility-receipt.mjs";

const fixture = {
  platform: "linux",
  architecture: "x86_64",
  totalMemoryBytes: 2_147_483_648,
  runtime: { name: "node", version: "22.0.0" },
  observedAt: "2000-01-01T00:00:00.000Z"
};

function runFixture(devices) {
  return (_file, args) => ({
    status: 0,
    stdout: args.includes("--version")
      ? "lsblk from util-linux 2.40.0\n"
      : JSON.stringify({ blockdevices: devices })
  });
}

describe("Linux compatibility receipt", () => {
  it("sums whole disks without reporting partitions, loops or device metadata", () => {
    const run = runFixture([
      { type: "disk", size: 12_000, serial: "fixture-serial" },
      { type: "part", size: 9_000, mountpoint: "/private-fixture/path" },
      { type: "loop", size: 1_000 },
      { type: "disk", size: 7_000, name: "fixture-name" }
    ]);
    const { receipt, exitCode } = collectCompatibilityReceipt(fixture, (file, args, options) => {
      expect(file).toBe("/usr/bin/lsblk");
      expect(args).toEqual(args.includes("--version")
        ? ["--version"]
        : ["--bytes", "--json", "--list", "--nodeps", "--output", "TYPE,SIZE"]);
      expect(options.env).toEqual({ LC_ALL: "C" });
      return run(file, args);
    });

    expect(exitCode).toBe(0);
    expect(receipt.inventory).toEqual({
      architecture: { status: "measured", value: "x86_64" },
      totalMemoryBytes: { status: "measured", value: 2_147_483_648 },
      wholeDiskBytes: { status: "measured", value: 19_000 }
    });
    expect(receipt.tools.lsblk).toEqual({ status: "measured", value: "2.40.0" });
    expect(JSON.stringify(receipt)).not.toMatch(/fixture-(serial|name)|private-fixture/);
  });

  it("keeps device identity and physical capabilities unverified on successful Linux inventory", () => {
    const { receipt } = collectCompatibilityReceipt(fixture, runFixture([{ type: "disk", size: 800 }]));

    expect(receipt.observedAt).toBe(fixture.observedAt);
    expect(receipt.source).toBe("local_host_unverified");
    expect(receipt.deviceVerification).toBe("unverified");
    expect(receipt.manualChecks).toEqual({
      operatorDeviceIdentity: "unmeasured",
      officialLiveImageChecksum: "unmeasured",
      recoveryMediaAndBackup: "unmeasured",
      cpuModel: "unmeasured",
      internalStorage: "unmeasured",
      displayGraphics: "unmeasured",
      touchscreen: "unmeasured",
      keyboard: "unmeasured",
      wifi: "unmeasured",
      sleepResume: "unmeasured",
      charging: "unmeasured",
      sustainedThermals: "unmeasured",
      reboot: "unmeasured",
      durability: "unmeasured"
    });
  });

  it.each([
    ["object", { path: "/fixture/private-timestamp" }, "invalid_value"],
    ["omitted", undefined, "missing_value"],
    ["arbitrary text", "/fixture/private-timestamp", "invalid_value"],
    ["impossible calendar date", "2000-02-30T00:00:00Z", "invalid_value"],
    ["offset instead of UTC marker", "2000-01-01T00:00:00+01:00", "invalid_value"]
  ])("types an %s observation timestamp as unknown before serialization", (_label, observedAt, reason) => {
    const host = { ...fixture, observedAt };
    if (observedAt === undefined) delete host.observedAt;
    const { receipt, exitCode } = collectCompatibilityReceipt(
      host, runFixture([{ type: "disk", size: 800 }])
    );
    const serialized = JSON.stringify(receipt);

    expect(exitCode).toBe(1);
    expect(JSON.parse(serialized).observedAt).toEqual({ status: "unknown", reason });
    expect(serialized).not.toContain("private-timestamp");
  });

  it("canonicalizes a valid UTC observation timestamp", () => {
    const { receipt, exitCode } = collectCompatibilityReceipt(
      { ...fixture, observedAt: "2000-01-01T00:00:00.7Z" }, runFixture([{ type: "disk", size: 800 }])
    );

    expect(exitCode).toBe(0);
    expect(receipt.observedAt).toBe("2000-01-01T00:00:00.700Z");
  });

  it("rejects a coercible version object without reading its string representation", () => {
    let coerced = false;
    const version = {
      path: "/fixture/private-version",
      toString() {
        coerced = true;
        return "22.0.0";
      }
    };
    const { receipt, exitCode } = collectCompatibilityReceipt(
      { ...fixture, runtime: { name: "node", version } }, runFixture([{ type: "disk", size: 800 }])
    );
    const serialized = JSON.stringify(receipt);

    expect(exitCode).toBe(1);
    expect(coerced).toBe(false);
    expect(JSON.parse(serialized).tools.runtime).toEqual({ status: "unknown", reason: "invalid_value" });
    expect(serialized).not.toContain("private-version");
  });

  it("emits the same runtime version value it validated", () => {
    let reads = 0;
    const runtime = {
      name: "node",
      get version() {
        reads += 1;
        return reads === 1 ? "22.0.0" : { path: "/fixture/private-version" };
      }
    };
    const { receipt, exitCode } = collectCompatibilityReceipt(
      { ...fixture, runtime }, runFixture([{ type: "disk", size: 800 }])
    );
    const serialized = JSON.stringify(receipt);

    expect(exitCode).toBe(0);
    expect(JSON.parse(serialized).tools.runtime).toEqual({
      status: "measured", value: { name: "node", version: "22.0.0" }
    });
    expect(serialized).not.toContain("private-version");
  });

  it("parses the same command output it validated", () => {
    const disks = runFixture([{ type: "disk", size: 800 }]);
    let reads = 0;
    const { receipt, exitCode } = collectCompatibilityReceipt(fixture, (file, args) => {
      if (!args.includes("--version")) return disks(file, args);
      return {
        status: 0,
        get stdout() {
          reads += 1;
          return reads === 1 ? "lsblk from util-linux 2.40.0\n" : { path: "/fixture/private-stdout" };
        }
      };
    });

    expect(exitCode).toBe(0);
    expect(receipt.tools.lsblk).toEqual({ status: "measured", value: "2.40.0" });
    expect(JSON.stringify(receipt)).not.toContain("private-stdout");
  });

  it("keeps unexpected host and command text out of a partial receipt", () => {
    const { receipt, exitCode } = collectCompatibilityReceipt(
      { ...fixture, architecture: "fixture-host", totalMemoryBytes: 0 },
      () => ({ status: 7, stdout: "fixture-output", stderr: "fixture-secret" })
    );

    expect(exitCode).toBe(1);
    expect(receipt.inventory.architecture).toEqual({ status: "unknown", reason: "invalid_value" });
    expect(receipt.inventory.totalMemoryBytes).toEqual({ status: "unknown", reason: "invalid_value" });
    expect(receipt.inventory.wholeDiskBytes).toEqual({ status: "unknown", reason: "command_failed" });
    expect(receipt.tools.lsblk).toEqual({ status: "unknown", reason: "command_failed" });
    expect(JSON.stringify(receipt)).not.toContain("fixture-");
  });

  it("distinguishes an unavailable binary from a failing command", () => {
    const { receipt, exitCode } = collectCompatibilityReceipt(fixture, () => ({
      error: Object.assign(new Error("fixture-private-path"), { code: "ENOENT" })
    }));

    expect(exitCode).toBe(1);
    expect(receipt.inventory.wholeDiskBytes).toEqual({ status: "unknown", reason: "tool_missing" });
    expect(JSON.stringify(receipt)).not.toContain("fixture-private-path");
  });

  it.each([
    [[{ type: "loop", size: 99 }], "no_disks_reported"],
    [[{ type: "disk", size: -3 }], "invalid_output"],
    [[{ type: "disk", size: Number.MAX_SAFE_INTEGER }, { type: "disk", size: 1 }], "invalid_output"]
  ])("does not report a total from incomplete storage data (%j)", (devices, reason) => {
    const { receipt, exitCode } = collectCompatibilityReceipt(fixture, runFixture(devices));

    expect(exitCode).toBe(1);
    expect(receipt.inventory.wholeDiskBytes).toEqual({ status: "unknown", reason });
  });

  it("rejects malformed JSON and non-version tool text", () => {
    const { receipt, exitCode } = collectCompatibilityReceipt(fixture, () => ({
      status: 0, stdout: "fixture-host /fixture/private/path\n"
    }));

    expect(exitCode).toBe(1);
    expect(receipt.inventory.wholeDiskBytes).toEqual({ status: "unknown", reason: "invalid_output" });
    expect(receipt.tools.lsblk).toEqual({ status: "unknown", reason: "invalid_output" });
    expect(JSON.stringify(receipt)).not.toContain("fixture");
  });

  it("does not probe block devices on an unsupported operating system", () => {
    const { receipt, exitCode } = collectCompatibilityReceipt(
      { ...fixture, platform: "win32" },
      () => { throw new Error("unexpected block-device probe"); }
    );

    expect(exitCode).toBe(1);
    expect(receipt.inventory.wholeDiskBytes).toEqual({ status: "unknown", reason: "unsupported_platform" });
  });

  it("rejects arguments without echoing their contents", () => {
    const script = fileURLToPath(new URL("../scripts/linux-compatibility-receipt.mjs", import.meta.url));
    const result = spawnSync(process.execPath, [script, "/fixture/private-path"], { encoding: "utf8" });

    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/Usage:/);
    expect(result.stderr).not.toContain("fixture");
  });
});
