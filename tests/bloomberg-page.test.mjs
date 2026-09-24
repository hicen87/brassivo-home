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
  assert.ok(item.marketCheck.asOf <= item.issueDate);
  assert.match(item.marketCheck.mediaBias, /偏空|偏多|中性/);
  assert.ok(item.marketCheck.verdict && item.marketCheck.interpretation && item.marketCheck.marketSummary);
  assert.equal(new URL(item.marketCheck.sourceUrl).hostname, "www.fidelity.com");
  for (const side of ["bullish", "bearish"]) {
    assert.ok(item[side].length > 0);
    for (const entry of item[side]) assert.ok(entry.title && entry.reason && entry.condition);
  }
});

test("public macro page renders the Bloomberg section without private mail data", () => {
  assert.match(html, /id="bloomberg-daily"/);
  assert.match(html, new RegExp(`bloomberg-daily\\.js\\?v=${item.issueDate.replaceAll("-", "")}-[a-f0-9]{8}`));
  assert.match(html, /<h2 id="bloomberg-title">主流媒体焦点<\/h2>/);
  assert.match(app, /renderBloombergDaily\(\);/);
  assert.match(app, /media-focus-grid/);
  assert.match(app, /media-focus-current/);
  assert.match(app, /Brassivo 推演/);
  assert.doesNotMatch(js, /\/Users\/|gmail\.com|mail\.google\.com|@news\.bloomberg\.com|Content-Type:|Message-ID:/i);
  assert.ok(js.length < 12000, "public file should be a compact original summary");
});

test("Barron's and WSJ homepage snapshots are dated, attributed, and use clean source URLs", () => {
  for (const [name, host] of [["barrons", "www.barrons.com"], ["wsj", "www.wsj.com"]]) {
    const focus = item.mediaFocus[name];
    assert.match(focus.captureDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(focus.capturedAt.slice(0, 10), focus.captureDate);
    assert.ok(focus.summary.length > 20);
    assert.ok(focus.stories.length >= 2);
    for (const story of focus.stories) {
      const url = new URL(story.url);
      assert.equal(url.hostname, host);
      assert.equal(url.search, "");
      assert.ok(story.title && story.summary);
    }
  }
});
