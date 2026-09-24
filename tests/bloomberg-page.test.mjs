import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = fs.readFileSync(path.join(root, "macro/bloomberg-daily.js"), "utf8");
const html = fs.readFileSync(path.join(root, "macro/index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "macro/app.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(js, context);
const item = context.window.BLOOMBERG_MARKETS_DAILY;

test("Bloomberg summary has a dated source and separate conditional judgments", () => {
  assert.match(item.issueDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(item.publishedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(item.sourceUrl.startsWith(`https://www.bloomberg.com/news/newsletters/${item.issueDate}/`));
  assert.ok(item.bloombergTake.includes("Bloomberg"));
  for (const side of ["bullish", "bearish"]) {
    assert.ok(item[side].length > 0);
    for (const entry of item[side]) assert.ok(entry.title && entry.reason && entry.condition);
  }
});

test("public macro page renders the Bloomberg section without private mail data", () => {
  assert.match(html, /id="bloomberg-daily"/);
  assert.match(html, new RegExp(`bloomberg-daily\\.js\\?v=${item.issueDate.replaceAll("-", "")}`));
  assert.match(app, /renderBloombergDaily\(\);/);
  assert.match(app, /Brassivo 推演/);
  assert.doesNotMatch(js, /\/Users\/|gmail\.com|mail\.google\.com|@news\.bloomberg\.com|Content-Type:|Message-ID:/i);
  assert.ok(js.length < 5000, "public file should be a compact original summary");
});
