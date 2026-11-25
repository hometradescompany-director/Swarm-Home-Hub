import { expect, test } from "vitest";
import { evaluateRecipientMessage } from "../src/policy/recipient-message.js";

const policy = { consent: true, quietHours: false, allowUrgentInterruptions: true };
test("consent and quiet hours govern even urgent messages", () => {
  expect(evaluateRecipientMessage({ ...policy, consent: false }, "message", "urgent"))
    .toEqual({ outcome: "refuse", reason: "consent-required" });
  expect(evaluateRecipientMessage({ ...policy, quietHours: true }, "message", "urgent"))
    .toEqual({ outcome: "batch", reason: "quiet-hours" });
});
test("only a consented urgent message with local opt-in can interrupt", () => {
  expect(evaluateRecipientMessage(policy, "liveness", "urgent").outcome).toBe("batch");
  expect(evaluateRecipientMessage(policy, "message", "normal").outcome).toBe("batch");
  expect(evaluateRecipientMessage({ ...policy, allowUrgentInterruptions: false }, "message", "urgent").outcome)
    .toBe("batch");
  expect(evaluateRecipientMessage(policy, "message", "urgent").outcome).toBe("interrupt");
});
