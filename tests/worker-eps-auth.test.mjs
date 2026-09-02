import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const workerSource = fs.readFileSync(path.join(root, "worker-crm.js"), "utf8");

function loadWorker() {
  const context = {
    AbortSignal,
    Headers,
    Request,
    Response,
    TextDecoder,
    TextEncoder,
    URL,
    console,
    crypto,
    setTimeout,
    clearTimeout
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(workerSource.replace("export default", "globalThis.__worker ="), context);
  return context.__worker;
}

class MemoryKV {
  constructor() {
    this.values = new Map();
    this.puts = [];
  }

  async put(key, value, options = {}) {
    this.values.set(key, String(value));
    this.puts.push({ key, value: String(value), options });
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === "json" ? JSON.parse(value) : value;
  }

  async delete(key) {
    this.values.delete(key);
  }

  async list({ prefix = "" } = {}) {
    return { keys: [...this.values.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })) };
  }
}

class MemberDB {
  constructor(member) {
    this.member = member;
  }

  prepare(sql) {
    const db = this;
    return {
      bind() {
        return {
          async first() {
            if (sql.includes("FROM members")) return db.member;
            return null;
          },
          async run() {
            return { meta: { changes: 1 } };
          },
          async all() {
            return { results: [] };
          }
        };
      }
    };
  }
}

function makeEnv(member = activeMember()) {
  return {
    DB: new MemberDB(member),
    SUBS: new MemoryKV(),
    EPS_PUBLISH_TOKEN: "publish-secret"
  };
}

function activeMember(overrides = {}) {
  return {
    email: "member@example.com",
    plan: "pro",
    expires_at: "2099-01-01",
    created_at: "2026-01-01",
    ...overrides
  };
}

function jsonRequest(pathname, body, headers = {}) {
  return new Request(`https://api.brassivo.com${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://brassivo.com",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

const validSnapshot = {
  version: 1,
  asOf: "2026-09-01",
  baselineDate: "2026-09-01",
  status: "sent",
  summary: {
    stocksTotal: 1,
    stocksSuccess: 1,
    currentNumericChanges: 0,
    periodChanges: 0,
    trendCarry: 1
  },
  stocks: [
    {
      symbol: "TEST",
      name: "Test Co",
      market: "US",
      source: "Zacks",
      baselineDate: "2026-09-01",
      currency: null,
      periods: ["Q1", "Q2", "F1", "F2"],
      estimates: ["1", "2", "3", "4"],
      revisionsUp: ["1", "0", "0", "0"],
      revisionsDown: ["0", "0", "0", "0"],
      recentChanges: []
    }
  ]
};

test("member session creates a private HttpOnly cookie and KV record", async () => {
  const worker = loadWorker();
  const env = makeEnv();
  const response = await worker.fetch(jsonRequest("/member/session", {
    email: "member@example.com",
    password: "correct-password"
  }), env);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Credentials"), "true");
  const cookie = response.headers.get("Set-Cookie");
  assert.match(cookie, /^brassivo_session=[A-Za-z0-9_-]+;/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.equal(env.SUBS.puts.length, 1);
  assert.match(env.SUBS.puts[0].key, /^session:[a-f0-9]{64}$/);
  assert.equal(env.SUBS.puts[0].options.expirationTtl, 7 * 24 * 60 * 60);
  assert.doesNotMatch(env.SUBS.puts[0].value, /correct-password/);
});

test("expired members cannot create a session", async () => {
  const worker = loadWorker();
  const env = makeEnv(activeMember({ expires_at: "2020-01-01" }));
  const response = await worker.fetch(jsonRequest("/member/session", {
    email: "member@example.com",
    password: "correct-password"
  }), env);

  assert.equal(response.status, 403);
  assert.equal(env.SUBS.puts.length, 0);
});

test("EPS data is publicly readable without a member session", async () => {
  const worker = loadWorker();
  const env = makeEnv();
  env.SUBS.values.set("eps:current", JSON.stringify(validSnapshot));
  const response = await worker.fetch(new Request("https://api.brassivo.com/eps/data", {
    headers: { Origin: "https://brassivo.com" }
  }), env);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), validSnapshot);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("EPS publisher requires the secret and validates the snapshot", async () => {
  const worker = loadWorker();
  const env = makeEnv();

  const denied = await worker.fetch(jsonRequest("/admin/eps", validSnapshot), env);
  assert.equal(denied.status, 401);

  const invalid = await worker.fetch(jsonRequest("/admin/eps", { version: 1 }, {
    Authorization: "Bearer publish-secret"
  }), env);
  assert.equal(invalid.status, 422);

  const accepted = await worker.fetch(jsonRequest("/admin/eps", validSnapshot, {
    Authorization: "Bearer publish-secret"
  }), env);
  assert.equal(accepted.status, 200);
  assert.deepEqual(JSON.parse(env.SUBS.values.get("eps:current")), validSnapshot);
});

test("logout invalidates the server session and clears the cookie", async () => {
  const worker = loadWorker();
  const env = makeEnv();
  const login = await worker.fetch(jsonRequest("/member/session", {
    email: "member@example.com",
    password: "correct-password"
  }), env);
  const cookie = login.headers.get("Set-Cookie").split(";", 1)[0];
  const sessionKey = env.SUBS.puts[0].key;

  const response = await worker.fetch(new Request("https://api.brassivo.com/member/logout", {
    method: "POST",
    headers: { Cookie: cookie, Origin: "https://brassivo.com" }
  }), env);

  assert.equal(response.status, 200);
  assert.equal(env.SUBS.values.has(sessionKey), false);
  assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
});
