const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createZoomMeeting } = require("../src/zoom");
const { sendWhatsAppMessage } = require("../src/whatsapp");
const { getSession, setSession, clearSession } = require("../src/store");
const { fallbackParseDatetime } = require("../src/gpt");

describe("createZoomMeeting", () => {
  it("returns a meeting object with a link", () => {
    const meeting = createZoomMeeting("Alice", "2025-01-15T17:00:00.000Z");
    assert.ok(meeting.link.startsWith("https://zoom.us/j/"));
    assert.equal(meeting.topic, "Appointment with Alice");
    assert.equal(meeting.startTime, "2025-01-15T17:00:00.000Z");
    assert.ok(meeting.meetingId);
  });
});

describe("sendWhatsAppMessage", () => {
  it("returns a success result", () => {
    const result = sendWhatsAppMessage("+1234567890", "Hello");
    assert.deepEqual(result, { success: true, to: "+1234567890", body: "Hello" });
  });
});

describe("store", () => {
  it("returns null for unknown phone", () => {
    assert.equal(getSession("+unknown"), null);
  });

  it("sets and gets a session", () => {
    setSession("+9999999999", { phone: "+9999999999", step: "ask_name" });
    const s = getSession("+9999999999");
    assert.equal(s.step, "ask_name");
    clearSession("+9999999999");
  });

  it("clears a session", () => {
    setSession("+8888888888", { phone: "+8888888888", step: "done" });
    clearSession("+8888888888");
    assert.equal(getSession("+8888888888"), null);
  });
});

describe("fallbackParseDatetime", () => {
  it("parses 'tomorrow 5pm'", () => {
    const iso = fallbackParseDatetime("tomorrow 5pm");
    const d = new Date(iso);
    assert.equal(d.getHours(), 17);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    assert.equal(d.getDate(), tomorrow.getDate());
  });

  it("parses '3am'", () => {
    const iso = fallbackParseDatetime("3am");
    const d = new Date(iso);
    assert.equal(d.getHours(), 3);
  });

  it("defaults to 10am when no time match", () => {
    const iso = fallbackParseDatetime("sometime next week");
    const d = new Date(iso);
    assert.equal(d.getHours(), 10);
  });
});
