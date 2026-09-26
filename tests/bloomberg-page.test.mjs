import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = fs.readFileSync(path.join(root, "media/bloomberg-daily.js"), "utf8");
const html = fs.readFileSync(path.join(root, "media/index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "media/app.js"), "utf8");
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

test("public media page renders the Bloomberg section without private mail data", () => {
  assert.match(html, /id="media-focus"/);
  assert.match(html, new RegExp(`bloomberg-daily\\.js\\?v=${item.issueDate.replaceAll("-", "")}-[a-f0-9]{8}`));
  assert.match(html, /<h1 id="page-title">主流媒体/);
  assert.match(app, /source-grid/);
  assert.match(app, /Brassivo 推演/);
  assert.doesNotMatch(js, /\/Users\/|gmail\.com|mail\.google\.com|@news\.bloomberg\.com|Content-Type:|Message-ID:/i);
  assert.ok(js.length < 20000, "public file should be a compact original summary");
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

test("AIHOT ranking is a dated 48-hour snapshot with clean story links", () => {
  const hot = item.mediaFocus.aihot;
  assert.equal(hot.sourceUrl, "https://aihot.news/hot");
  assert.equal(hot.windowHours, 48);
  assert.equal(hot.capturedAt.slice(0, 10), hot.captureDate);
  assert.ok(Date.parse(hot.boardUpdatedAt) <= Date.parse(hot.capturedAt));
  assert.ok(hot.stories.length >= 1 && hot.stories.length <= 10);
  for (const [index, story] of hot.stories.entries()) {
    assert.equal(story.rank, index + 1);
    assert.ok(story.title.length > 10);
    assert.ok(Number.isInteger(story.heat));
    assert.match(story.url, /^https:\/\/aihot\.news\/story\/[0-9a-f-]{36}$/);
  }
  assert.match(app, /标题为聚合站的事件描述/);
  assert.match(html, /媒体焦点与 AI 热榜/);
});

const render = data => {
  const target = { innerHTML: "" };
  const env = { window: { BLOOMBERG_MARKETS_DAILY: data }, document: { querySelector: selector => selector === "#media-content" ? target : {} } };
  vm.runInNewContext(app, env);
  return target.innerHTML;
};
test("market summaries derive close-to-close moves and keep missing data distinct from zero", () => {
  const data = structuredClone(item);
  const story = data.mediaFocus.aihot.stories[0];
  story.marketLink = { company: "Example", ticker: "TEST", status: "listed", relationUrl: "https://example.com/", eventPublishedAt: null, eventSourceUrl: null };
  data.mediaFocus.aihot.market = { checkedAt: "2026-09-27T00:00:00Z", benchmark: { sessionDate: "2026-09-25", previousSessionDate: "2026-09-24", close: 101, previousClose: 100, sources: [] }, quotes: { TEST: { sessionDate: "2026-09-25", previousSessionDate: "2026-09-24", close: 105, previousClose: 100, sources: [] } } };
  const rendered = render(data);
  assert.match(rendered, /美股收盘 \+5\.00%/);
  assert.match(rendered, /较标普500 \+4\.00 个百分点/);
  assert.match(rendered, /值得研究；新闻影响待核验/);
  delete data.mediaFocus.aihot.market.quotes.TEST;
  const missing = render(data);
  assert.match(missing, /Example \(TEST\).*?行情待核验/s);
  assert.doesNotMatch(missing, /美股收盘 \+0\.00%/);
});
test("company mappings escape HTML and do not attach private businesses to listed investors", () => {
  const data = structuredClone(item);
  const story = data.mediaFocus.aihot.stories[0];
  story.marketLink = { company: "<img src=x>", ticker: null, status: "no_direct", relationUrl: null };
  const rendered = render(data);
  assert.match(rendered, /&lt;img src=x&gt;/);
  assert.doesNotMatch(rendered, /<img src=x>/);
  assert.match(rendered, /暂无已核验的直接上市标的/);
});
