import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const pageDir = path.join(root, "macro");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const dataCode = read("macro/dashboard-data.js");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataCode, context);
const data = context.window.HONG_HAO_DASHBOARD_DATA;

test("public page contains the verified baseline", () => {
  assert.equal(data.meta.baselineDate, "2026-09-01");
  assert.equal(data.meta.latestSourceDate, "2026-09-22");
  assert.equal(data.assets.length, 26);
  assert.equal(data.sources.length, 11);
  assert.equal(data.rotation.filter((step) => step.state === "current").length, 1);
  assert.equal(data.rotation.find((step) => step.state === "current").id, "agriculture");
  assert.equal(data.rotation.find((step) => step.state === "current").stage, "结构主线");
  assert.equal(data.changes[0].date, "2026-09-22");
  assert.equal(data.changes.at(-1).date, "2026-08-31");
});

test("asset records are complete, unique, and traceable", () => {
  const required = ["id", "asset", "horizon", "direction", "tone", "action", "evidence", "status", "rationale", "trigger", "updated", "sourceRefs"];
  const sourceIds = new Set(data.sources.map((source) => source.id));
  const assetIds = new Set();

  for (const asset of data.assets) {
    for (const key of required) assert.ok(asset[key], `${asset.id || "unknown"} missing ${key}`);
    assert.ok(!assetIds.has(asset.id), `duplicate asset id ${asset.id}`);
    assetIds.add(asset.id);
    for (const ref of asset.sourceRefs) assert.ok(sourceIds.has(ref), `${asset.id} has unknown source ${ref}`);
  }
  for (const change of data.changes) {
    assert.ok(Object.hasOwn(change, "turningPoint"), `${change.asset} missing turning-point assessment`);
    if (change.turningPoint) {
      assert.ok(["top", "bottom"].includes(change.turningPoint.side), `${change.asset} has invalid turning-point side`);
      assert.ok(change.turningPoint.label, `${change.asset} missing turning-point label`);
      assert.ok(change.turningPoint.priceContext, `${change.asset} missing turning-point price context`);
    }
    for (const ref of change.sources) assert.ok(sourceIds.has(ref), `${change.asset} change has unknown source ${ref}`);
  }
});

test("turning-point signals are explicit and limited to qualified changes", () => {
  const candidates = data.changes.filter((change) => change.turningPoint);
  assert.equal(candidates.length, 5);
  assert.equal(candidates[0].asset, "港股 / 高估值成长");
  assert.equal(candidates[0].turningPoint.side, "bottom");
  assert.equal(candidates[1].asset, "贵金属及矿业股");
  assert.equal(candidates[1].turningPoint.side, "bottom");

  const html = read("macro/index.html");
  const app = read("macro/app.js");
  assert.match(html, /标有“拐点”的记录/);
  assert.match(app, /change\.turningPoint \? " is-turning-point"/);
  assert.match(app, /turning-point-badge/);
});

test("assets follow the horizon groups and direction priority", () => {
  const horizonGroup = (asset) => asset.horizon.includes("短") ? "短期" : asset.horizon.includes("中") ? "中期" : "长期";
  const horizonOrder = ["短期", "中期", "长期"];
  const toneOrder = { positive: 0, neutral: 1, caution: 2, negative: 3 };
  const originalOrder = new Map(data.assets.map((asset, index) => [asset.id, index]));
  const sorted = [...data.assets].sort((left, right) =>
    horizonOrder.indexOf(horizonGroup(left)) - horizonOrder.indexOf(horizonGroup(right)) ||
    toneOrder[left.tone] - toneOrder[right.tone] ||
    originalOrder.get(left.id) - originalOrder.get(right.id)
  );

  assert.deepEqual(
    horizonOrder.map((group) => sorted.filter((asset) => horizonGroup(asset) === group).length),
    [13, 12, 1]
  );
  assert.equal(sorted[0].id, "hong-kong-equity");
  assert.equal(sorted.at(-1).id, "precious-long");
});

test("public dataset exposes source metadata but no private file paths", () => {
  for (const source of data.sources) {
    assert.deepEqual(Object.keys(source).sort(), ["date", "id", "role", "title", "type"]);
  }

  const publicFiles = fs.readdirSync(pageDir, { recursive: true });
  assert.ok(publicFiles.every((name) => !/\.(pdf|jpe?g|png)$/i.test(String(name))), "raw source media must not be published");
  assert.doesNotMatch(dataCode, /9月1日|HongHao趋势跟踪|\/Users\//);
});

test("macro view page is direct-file compatible and has public metadata", () => {
  const html = read("macro/index.html");
  const app = read("macro/app.js");
  const css = read("macro/styles.css");

  for (const id of ["overview", "asset-ledger", "change-log", "sources"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.doesNotMatch(html, /id="(?:rotation|observations)"|href="#rotation"|商品轮动走到哪一棒|当日市场观察/);
  assert.doesNotMatch(app, /renderRotation|renderObservations|#rotation-track|#observation-grid/);
  assert.match(html, /https:\/\/brassivo\.com\/macro\//);
  assert.match(html, /styles\.css\?v=20260924mediafocus/);
  assert.match(html, /dashboard-data\.js\?v=20260922/);
  assert.match(html, /app\.js\?v=20260924hidepanels/);
  assert.match(html, /<meta name="color-scheme" content="light"/);
  assert.match(html, /<meta name="theme-color" content="#f6f7f9"/);
  const researchNav = html.match(/<nav class="research-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  for (const href of [
    "https://brassivo.com",
    "https://brassivo.com/macro/",
    "https://brassivo.com/eps/",
    "https://investment.brassivo.com",
    "https://stocks.brassivo.com/sectors.html",
    "https://china.brassivo.com/sectors.html",
    "https://stocks.brassivo.com",
    "https://china.brassivo.com"
  ]) assert.match(researchNav, new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
  assert.equal((researchNav.match(/aria-current="page"/g) || []).length, 1);
  assert.match(html, /<header class="site-header">[\s\S]*?<img src="\/favicon\.svg" alt="" \/>[\s\S]*?BRASSIVO <b>RESEARCH<\/b>[\s\S]*?<span class="private-mark">MACRO LEDGER/);
  assert.doesNotMatch(html, /洪灏资产方向跟踪台账\.md|\.pdf|\.jpg/);
  assert.doesNotMatch(html, /HONG HAO|Hong Hao|洪灏/);
  assert.doesNotMatch(app, /\bfetch\s*\(|source\.path|target=["']_blank["']/);
  assert.match(app, /function horizonGroup\(/);
  assert.match(app, /function sortAssets\(/);
  assert.match(app, /asset-group-row/);
  assert.match(css, /--ink:\s*#f6f7f9/);
  assert.match(css, /--dot:\s*rgba\(20, 40, 80, 0\.09\)/);
  assert.match(css, /body::after[\s\S]*radial-gradient\(circle, var\(--glow\)/);
  assert.match(css, /\.site-header\s*\{[\s\S]*?width:\s*min\(1380px, calc\(100% - 64px\)\);[\s\S]*?height:\s*82px;[\s\S]*?background:\s*rgba\(246, 247, 249, \.92\)/);
  assert.match(css, /\.research-nav a\[aria-current="page"\]\s*\{[^}]*color:\s*#c77b2f;[^}]*background:\s*#f2e2cf;/);
  assert.match(css, /@media \(max-width: 780px\)[\s\S]*?\.site-header\s*\{[^}]*height:\s*68px;/);
});

test("legacy macro URL redirects to the renamed public route", () => {
  const legacy = read("honghao/index.html");
  assert.match(legacy, /url=\/macro\//i);
  assert.match(legacy, /href=["']\/macro\/["']/);
  assert.doesNotMatch(legacy, /dashboard-data\.js|app\.js/);
});

test("homepage, structured data, sitemap, and llms index the new page", () => {
  const homepage = read("index.html");
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");

  assert.match(homepage, /href=["']\/macro\/["']/);
  assert.match(homepage, /a\[href=["']\/macro\/["']\]/);
  assert.match(sitemap, /https:\/\/brassivo\.com\/macro\//);
  assert.match(homepage, /Macro View Ledger/);
  assert.doesNotMatch(homepage, /Hong Hao|HONG HAO|洪灏/);
  assert.match(llms, /Macro View Ledger/);

  const jsonLdMatch = homepage.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(jsonLdMatch, "homepage JSON-LD is missing");
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.ok(jsonLd.hasPart.some((part) => part.url === "https://brassivo.com/macro/"));
});

test("allocation is a sourced inference, separate from direction counts", () => {
  const a = data.allocation;
  assert.equal(a.stocks + a.cash, 100);
  assert.ok(a.stocks >= 0 && a.stocks <= 100 && a.cash >= 0 && a.cash <= 100);
  assert.match(a.basis, /文章推导/);
  assert.match(a.note, /非原文明确/);
  assert.equal(a.asOf, "2026-09-07");
  assert.ok(a.asOf <= data.meta.latestSourceDate);
  assert.ok(a.method && a.increaseCondition && a.decreaseCondition);
  for (const ref of a.sourceRefs) assert.ok(data.sources.some(s => s.id === ref));
});
