/** Pure device inventory receipt validation. No host filesystem access. */
export interface DeviceFileMetadata {
  readonly relativePath: string;
  readonly byteLength: number;
  readonly modifiedAt: string | null;
  readonly sha256: string | null;
}
export interface DeviceInventoryReceipt {
  readonly contract: "swarm-device-inventory/v1";
  readonly deviceRef: string;
  readonly scopeRef: string;
  readonly observedAt: string;
  readonly files: readonly DeviceFileMetadata[];
  readonly truncated: boolean;
}
export type DeviceInventoryValidation =
  | { readonly accepted: true; readonly receipt: DeviceInventoryReceipt }
  | { readonly accepted: false; readonly reason: string };

const sha256Pattern = /^[a-f0-9]{64}$/i;
const iso = (s: string) => !Number.isNaN(Date.parse(s)) && /^\d{4}-\d\d-\d\dT/.test(s);
const safePath = (p: string) => p.length > 0 && p.length <= 512 &&
  !p.startsWith("/") && !p.includes("\\") && !p.split("/").some(x => x === ".." || x === "." || x === "");
export function validateDeviceInventoryReceipt(value: unknown): DeviceInventoryValidation {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return { accepted: false, reason: "not_an_object" };
  const r = value as Record<string, unknown>;
  if (r.contract !== "swarm-device-inventory/v1") return { accepted: false, reason: "unsupported_contract" };
  if (typeof r.deviceRef !== "string" || !r.deviceRef.trim()) return { accepted: false, reason: "device_ref_missing" };
  if (typeof r.scopeRef !== "string" || !r.scopeRef.trim()) return { accepted: false, reason: "scope_ref_missing" };
  if (typeof r.observedAt !== "string" || !iso(r.observedAt)) return { accepted: false, reason: "invalid_observation_time" };
  if (!Array.isArray(r.files) || r.files.length > 1000) return { accepted: false, reason: "invalid_file_count" };
  if (typeof r.truncated !== "boolean") return { accepted: false, reason: "truncation_state_missing" };
  for (const f of r.files) {
    if (typeof f !== "object" || f === null || Array.isArray(f)) return { accepted: false, reason: "invalid_file" };
    const x = f as Record<string, unknown>;
    if (typeof x.relativePath !== "string" || !safePath(x.relativePath)) return { accepted: false, reason: "unsafe_path" };
    if (typeof x.byteLength !== "number" || !Number.isSafeInteger(x.byteLength) || x.byteLength < 0) return { accepted: false, reason: "invalid_size" };
    if (x.modifiedAt !== null && (typeof x.modifiedAt !== "string" || !iso(x.modifiedAt))) return { accepted: false, reason: "invalid_modification_time" };
    if (x.sha256 !== null && (typeof x.sha256 !== "string" || !sha256Pattern.test(x.sha256))) return { accepted: false, reason: "invalid_digest" };
  }
  return { accepted: true, receipt: value as DeviceInventoryReceipt };
}
