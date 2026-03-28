const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/index");
const { clearSession, getAllSessions } = require("../src/store");

let server;
let baseUrl;

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(path, baseUrl);
    const req = http.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
    }, (res) => {
      let chunks = "";
      res.on("data", (c) => { chunks += c; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, body: chunks });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    http.get(url, (res) => {
      let chunks = "";
      res.on("data", (c) => { chunks += c; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, body: chunks });
        }
      });
    }).on("error", reject);
  });
}

before(() => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

beforeEach(() => {
  const sessions = getAllSessions();
  for (const phone of Object.keys(sessions)) {
    clearSession(phone);
  }
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await get("/health");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });
});

describe("POST /webhook/whatsapp", () => {
  it("returns 400 when From is missing", async () => {
    const res = await post("/webhook/whatsapp", { Body: "Hi" });
    assert.equal(res.status, 400);
  });

  it("returns 400 when Body is missing", async () => {
    const res = await post("/webhook/whatsapp", { From: "+1234567890" });
    assert.equal(res.status, 400);
  });

  it("asks for name when user says Hi", async () => {
    const res = await post("/webhook/whatsapp", { From: "+1234567890", Body: "Hi" });
    assert.equal(res.status, 200);
    assert.equal(res.body.reply, "Hi! What is your name?");
  });

  it("asks for datetime after receiving name", async () => {
    await post("/webhook/whatsapp", { From: "+1111111111", Body: "Hi" });
    const res = await post("/webhook/whatsapp", { From: "+1111111111", Body: "Alice" });
    assert.equal(res.status, 200);
    assert.match(res.body.reply, /Thanks Alice/);
    assert.match(res.body.reply, /date and time/);
  });

  it("confirms appointment with Zoom link after datetime", async () => {
    await post("/webhook/whatsapp", { From: "+2222222222", Body: "Hi" });
    await post("/webhook/whatsapp", { From: "+2222222222", Body: "Bob" });
    const res = await post("/webhook/whatsapp", { From: "+2222222222", Body: "tomorrow 5pm" });
    assert.equal(res.status, 200);
    assert.match(res.body.reply, /appointment is confirmed/);
    assert.match(res.body.reply, /zoom\.us/);
  });

  it("tells user appointment is already booked when done", async () => {
    await post("/webhook/whatsapp", { From: "+3333333333", Body: "Hi" });
    await post("/webhook/whatsapp", { From: "+3333333333", Body: "Carol" });
    await post("/webhook/whatsapp", { From: "+3333333333", Body: "tomorrow 3pm" });
    const res = await post("/webhook/whatsapp", { From: "+3333333333", Body: "extra message" });
    assert.equal(res.status, 200);
    assert.match(res.body.reply, /already booked/);
  });

  it("restarts flow when user says Hi again after done", async () => {
    await post("/webhook/whatsapp", { From: "+4444444444", Body: "Hi" });
    await post("/webhook/whatsapp", { From: "+4444444444", Body: "Dave" });
    await post("/webhook/whatsapp", { From: "+4444444444", Body: "tomorrow 2pm" });
    const res = await post("/webhook/whatsapp", { From: "+4444444444", Body: "Hi" });
    assert.equal(res.status, 200);
    assert.equal(res.body.reply, "Hi! What is your name?");
  });

  it("handles lowercase field names (from/body)", async () => {
    const res = await post("/webhook/whatsapp", { from: "+5555555555", body: "hello" });
    assert.equal(res.status, 200);
    assert.equal(res.body.reply, "Hi! What is your name?");
  });
});
