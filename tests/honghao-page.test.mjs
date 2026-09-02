import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const pageDir = path.join(root, "honghao");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const dataCode = read("honghao/dashboard-data.js");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataCode, context);
const data = context.window.HONG_HAO_DASHBOARD_DATA;

test("public page contains the verified baseline", () => {
  assert.equal(data.meta.baselineDate, "2026-09-01");
  assert.equal(data.meta.latestSourceDate, "2026-09-02");
  assert.equal(data.assets.length, 15);
  assert.equal(data.sources.length, 7);
  assert.equal(data.rotation.filter((step) => step.state === "current").length, 1);
  assert.equal(data.rotation.find((step) => step.state === "current").id, "agriculture");
  assert.equal(data.rotation.find((step) => step.state === "current").stage, "结构主线");
  assert.equal(data.changes[0].date, "2026-09-02");
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
    for (const ref of change.sources) assert.ok(sourceIds.has(ref), `${change.asset} change has unknown source ${ref}`);
  }
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
    [9, 5, 1]
  );
  assert.equal(sorted[0].id, "usd");
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
  const html = read("honghao/index.html");
  const app = read("honghao/app.js");
  const css = read("honghao/styles.css");

  for (const id of ["overview", "rotation", "asset-ledger", "observations", "change-log", "sources"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /https:\/\/brassivo\.com\/honghao\//);
  assert.match(html, /styles\.css\?v=20260901c/);
  assert.match(html, /dashboard-data\.js\?v=20260902a/);
  assert.match(html, /app\.js\?v=20260902a/);
  assert.match(html, /<meta name="color-scheme" content="light"/);
  assert.match(html, /<meta name="theme-color" content="#f6f7f9"/);
  assert.doesNotMatch(html, /洪灏资产方向跟踪台账\.md|\.pdf|\.jpg/);
  assert.doesNotMatch(html, /HONG HAO|Hong Hao|洪灏/);
  assert.doesNotMatch(app, /\bfetch\s*\(|source\.path|target=["']_blank["']/);
  assert.match(app, /function horizonGroup\(/);
  assert.match(app, /function sortAssets\(/);
  assert.match(app, /asset-group-row/);
  assert.match(css, /--ink:\s*#f6f7f9/);
  assert.match(css, /--dot:\s*rgba\(20, 40, 80, 0\.09\)/);
  assert.match(css, /body::after[\s\S]*radial-gradient\(circle, var\(--glow\)/);
});

test("homepage, structured data, sitemap, and llms index the new page", () => {
  const homepage = read("index.html");
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");

  assert.match(homepage, /href=["']\/honghao\/["']/);
  assert.match(homepage, /a\[href=["']\/honghao\/["']\]/);
  assert.match(sitemap, /https:\/\/brassivo\.com\/honghao\//);
  assert.match(homepage, /Macro View Ledger/);
  assert.doesNotMatch(homepage, /Hong Hao|HONG HAO|洪灏/);
  assert.match(llms, /Macro View Ledger/);

  const jsonLdMatch = homepage.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(jsonLdMatch, "homepage JSON-LD is missing");
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.ok(jsonLd.hasPart.some((part) => part.url === "https://brassivo.com/honghao/"));
});
