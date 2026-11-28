import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const FORBIDDEN = /\/Users\/|gmail\.com|mail\.google\.com|@news\.bloomberg\.com|GOALS_当前目标与行动板|REVIEW_推演复盘记录|实盘持仓|实盘\s*\d+(?:\.\d+)?%|telegram_notify|激活码/i;

test("Interest Analysis 2.0 dataset is public-safe and covers Asia Morning and Markets Daily", () => {
  const js = read("media/interest-analysis-data.js");
  assert.doesNotMatch(js, FORBIDDEN);

  const ctx = { window: {} };
  vm.runInNewContext(js, ctx);
  const data = ctx.window.BRASSIVO_INTEREST_ANALYSIS;
  assert.ok(data && Array.isArray(data.entries) && data.entries.length >= 2);

  const editions = new Set(data.entries.map((e) => e.edition));
  assert.ok(editions.has("asia_morning"), "expected asia_morning edition");
  assert.ok(editions.has("markets_daily"), "expected markets_daily edition");

  for (const entry of data.entries) {
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof entry.bdmScore, "number");
    assert.ok(entry.bdmMatrix.rows.length >= 4, `${entry.id} should have BDM matrix rows`);
    assert.equal(entry.tetlock.scenarios.length, 3, `${entry.id} should have 3 Tetlock scenarios`);
    if (entry.chartWebp) {
      assert.ok(fs.existsSync(path.join(root, "media", entry.chartWebp)), `missing chart ${entry.chartWebp}`);
    }
  }
});

test("Interest Analysis 2.0 front-end renders four modules and escapes HTML", () => {
  const script = read("media/interest-analysis.js");
  const html = read("media/index.html");
  assert.match(html, /id="interest-analysis"/);
  assert.match(html, /interest-analysis-data\.js\?v=/);
  assert.match(html, /interest-analysis\.js\?v=/);

  const target = {
    innerHTML: "",
    hidden: false,
    querySelectorAll: () => [],
    querySelector: () => null
  };
  const fakeData = {
    updatedAt: "2026-11-28 13:30 CST",
    entries: [{
      id: "2026-11-27-asia_morning",
      date: "2026-11-27",
      edition: "asia_morning",
      editionLabel: "亚洲早报",
      scheduleLabel: "工作日 06:05 CST",
      title: "<script>alert(1)</script>早报测试",
      snapshot: "快照",
      bdmScore: 38.9,
      bdmSummary: "摩擦共存",
      validationWindow: "至 2027-01",
      highlights: ["要点一"],
      schelling: [{ label: "信号", text: "测试" }],
      bdmMatrix: { scale: "0-100", rows: [{ actor: "A", stance: "50", weight: "20", notes: "ok" }] },
      putnam: [{ label: "国际", text: "双层博弈" }],
      tetlock: { baseRate: "55%", scenarios: [{ kind: "base", label: "基准情景", prob: 55, headline: "震荡", detail: "详情" }] },
      chartWebp: "charts/asia_morning_2026-11-27.webp"
    }]
  };
  vm.runInNewContext(script, {
    window: { BRASSIVO_INTEREST_ANALYSIS: fakeData },
    document: { querySelector: (s) => (s === "#interest-analysis" ? target : null) }
  });
  assert.match(target.innerHTML, /谢林信号真伪过滤/);
  assert.match(target.innerHTML, /BDM 权力加权博弈矩阵/);
  assert.match(target.innerHTML, /帕特南双层博弈/);
  assert.match(target.innerHTML, /泰特洛克基准率与三情景概率/);
  assert.match(target.innerHTML, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(target.innerHTML, /<script>alert/);
});

test("Core US Radar dataset is public-safe and ranks all 7 core US stocks including AAPL", () => {
  const js = read("radar/radar-data.js");
  assert.doesNotMatch(js, FORBIDDEN);

  const ctx = { window: {} };
  vm.runInNewContext(js, ctx);
  const data = ctx.window.BRASSIVO_RADAR_DATA;
  assert.ok(data && Array.isArray(data.weeks) && data.weeks.length >= 1);

  const latest = data.weeks[0];
  assert.equal(latest.stocks.length, 7);
  const tickers = new Set(latest.stocks.map((s) => s.ticker));
  for (const tk of ["MSFT", "META", "TSM", "BRK.A", "GOOG", "AMZN", "AAPL"]) {
    assert.ok(tickers.has(tk), `missing core ticker ${tk}`);
  }
  for (let i = 1; i < latest.stocks.length; i++) {
    assert.ok(latest.stocks[i - 1].fourDimScore >= latest.stocks[i].fourDimScore, "stocks must be sorted by fourDimScore desc");
  }
  for (const s of latest.stocks) {
    assert.notEqual(s.pe, "—", `${s.ticker} should have parsed PE/PB`);
    assert.notEqual(s.roic, "—", `${s.ticker} should have parsed ROIC`);
    assert.equal(s.strikeZones.length, 3, `${s.ticker} should have 3 strike zones`);
    assert.equal(s.fourDimBreakdown.length, 4, `${s.ticker} should have 4-dim breakdown`);
    assert.ok(s.bdmPlayers.length >= 4, `${s.ticker} should have BDM players`);
  }
});

test("Core US Radar page renders ranking table, overbought alert, and homepage links", () => {
  const html = read("radar/index.html");
  const app = read("radar/app.js");
  const dataJs = read("radar/radar-data.js");
  const homepage = read("index.html");
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");

  assert.match(html, /canonical" href="https:\/\/brassivo\.com\/radar\/"/);
  assert.match(html, /radar-data\.js\?v=/);
  assert.match(homepage, /href="\/radar\/"/);
  assert.match(sitemap, /https:\/\/brassivo\.com\/radar\//);
  assert.match(llms, /https:\/\/brassivo\.com\/radar\//);

  const dataCtx = { window: {} };
  vm.runInNewContext(dataJs, dataCtx);
  const rootEl = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const dateEl = { textContent: "" };
  vm.runInNewContext(app, {
    window: { BRASSIVO_RADAR_DATA: dataCtx.window.BRASSIVO_RADAR_DATA, location: { hash: "#BRK.A" }, history: {} },
    document: { querySelector: (s) => (s === "#radar-root" ? rootEl : s === "#radar-date" ? dateEl : null) }
  });
  assert.match(rootEl.innerHTML, /综合投资价值排序表/);
  assert.match(rootEl.innerHTML, /EPS 边际（只读）/);
  assert.match(rootEl.innerHTML, /overbought-banner/);
  assert.match(rootEl.innerHTML, /三档击球区/);
  assert.match(dateEl.textContent, /^\d{4}-\d{2}-\d{2}$/);
});

test("Core US Radar hydrates read-only EPS badges and detail strip without altering ranking", async () => {
  const app = read("radar/app.js");
  const dataJs = read("radar/radar-data.js");
  const dataCtx = { window: {} };
  vm.runInNewContext(dataJs, dataCtx);

  const rootEl = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const dateEl = { textContent: "" };
  const mockEps = {
    asOf: "2026-11-26",
    stocks: [
      { symbol: "META", score: { total: 27.1, rank: 6 }, estimateRevisionTrend: ["+0.87%", "-9.03%", "-6.42%", "-1.90%"] },
      { symbol: "GOOGL", score: { total: 45.9, rank: 4 }, estimateRevisionTrend: ["-2.49%", "+1.85%", "-3.61%", "+1.50%"] }
    ]
  };
  vm.runInNewContext(app, {
    window: {
      BRASSIVO_RADAR_DATA: dataCtx.window.BRASSIVO_RADAR_DATA,
      location: { hash: "#META" },
      history: {},
      fetch: async () => ({ ok: true, json: async () => mockEps })
    },
    document: { querySelector: (s) => (s === "#radar-root" ? rootEl : s === "#radar-date" ? dateEl : null) }
  });
  await new Promise((r) => setTimeout(r, 10));
  assert.match(rootEl.innerHTML, /EPS 27\.1 ↓/);
  assert.match(rootEl.innerHTML, /EPS 45\.9 →/);
  assert.match(rootEl.innerHTML, /eps-readonly-strip/);
  assert.match(rootEl.innerHTML, /Q1 \+0\.87%/);
});
