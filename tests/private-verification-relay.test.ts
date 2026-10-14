import { describe, expect, it } from "vitest";

const command = /^\/verify-private (selftest|r[1-7]) ([0-9a-fA-F]{40})$/;

describe("private verification relay command boundary", () => {
  it("accepts only the bounded command grammar", () => {
    expect(command.test("/verify-private selftest e124364def6b1a36ebd1dc40bc6946541aeef852")).toBe(true);
    expect(command.test("/verify-private r1 9ce630b88465bd391fe182c919ce949d0c0d89c6")).toBe(true);
    expect(command.test("/verify-private  selftest e124364def6b1a36ebd1dc40bc6946541aeef852")).toBe(false);
    expect(command.test("/verify-private selftest e124364def6b1a36ebd1dc40bc6946541aeef852 ")).toBe(false);
    expect(command.test("/verify-private r8 e124364def6b1a36ebd1dc40bc6946541aeef852")).toBe(false);
  });
});
