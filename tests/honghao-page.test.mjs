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
  assert.equal(data.meta.latestSourceDate, "2026-08-31");
  assert.equal(data.assets.length, 13);
  assert.equal(data.rotation.filter((step) => step.state === "current").length, 1);
  assert.equal(data.rotation.find((step) => step.state === "current").id, "agriculture");
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
});

test("public dataset exposes source metadata but no private file paths", () => {
  for (const source of data.sources) {
    assert.deepEqual(Object.keys(source).sort(), ["date", "id", "role", "title", "type"]);
  }

  const publicFiles = fs.readdirSync(pageDir, { recursive: true });
  assert.ok(publicFiles.every((name) => !/\.(pdf|jpe?g|png)$/i.test(String(name))), "raw source media must not be published");
  assert.doesNotMatch(dataCode, /9月1日|HongHao趋势跟踪|\/Users\//);
});

test("Hong Hao page is direct-file compatible and has public metadata", () => {
  const html = read("honghao/index.html");
  const app = read("honghao/app.js");

  for (const id of ["overview", "rotation", "asset-ledger", "observations", "change-log", "sources"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /https:\/\/brassivo\.com\/honghao\//);
  assert.match(html, /dashboard-data\.js/);
  assert.match(html, /app\.js/);
  assert.doesNotMatch(html, /洪灏资产方向跟踪台账\.md|\.pdf|\.jpg/);
  assert.doesNotMatch(app, /\bfetch\s*\(|source\.path|target=["']_blank["']/);
});

test("homepage, structured data, sitemap, and llms index the new page", () => {
  const homepage = read("index.html");
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");

  assert.match(homepage, /href=["']\/honghao\/["']/);
  assert.match(homepage, /a\[href=["']\/honghao\/["']\]/);
  assert.match(sitemap, /https:\/\/brassivo\.com\/honghao\//);
  assert.match(llms, /Hong Hao Trend Ledger/);

  const jsonLdMatch = homepage.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(jsonLdMatch, "homepage JSON-LD is missing");
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.ok(jsonLd.hasPart.some((part) => part.url === "https://brassivo.com/honghao/"));
});
