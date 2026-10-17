import { describe, expect, it } from "vitest";
import { validateDeviceInventoryReceipt } from "./inventory-receipt.js";

const valid = {
  contract: "swarm-device-inventory/v1",
  deviceRef: "phone-local",
  scopeRef: "user-selected-downloads",
  observedAt: "2026-10-16T10:00:00Z",
  files: [{ relativePath: "notes/readme.md", byteLength: 120, modifiedAt: null, sha256: null }],
  truncated: false
};
describe("bounded device inventory receipt", () => {
  it("accepts scoped metadata without file contents", () => {
    expect(validateDeviceInventoryReceipt(valid).accepted).toBe(true);
  });
  it("rejects traversal and absolute paths", () => {
    for (const relativePath of ["../secret", "/etc/passwd", "a/../b", "C:\\Windows"]) {
      expect(validateDeviceInventoryReceipt({ ...valid, files: [{ ...valid.files[0], relativePath }] }).accepted).toBe(false);
    }
  });
  it("rejects missing scope and unbounded counts", () => {
    expect(validateDeviceInventoryReceipt({ ...valid, scopeRef: "" }).accepted).toBe(false);
    expect(validateDeviceInventoryReceipt({ ...valid, files: Array(1001).fill(valid.files[0]) }).accepted).toBe(false);
  });
  it("rejects forged digest shapes", () => {
    expect(validateDeviceInventoryReceipt({ ...valid, files: [{ ...valid.files[0], sha256: "not-a-digest" }] }).accepted).toBe(false);
  });
});
