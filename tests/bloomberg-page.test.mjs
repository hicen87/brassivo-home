import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "media/index.html"), "utf8");
const dataJs = fs.readFileSync(path.join(root, "media/interest-analysis-data.js"), "utf8");
const script = fs.readFileSync(path.join(root, "media/interest-analysis.js"), "utf8");

test("public media page renders only Interest Analysis 2.0 without legacy AIHOT or conditional view", () => {
  assert.match(html, /<h1 id="page-title">主流媒体/);
  assert.match(html, /id="interest-analysis"/);
  assert.match(html, /interest-analysis-data\.js\?v=\d{8}-[a-f0-9]{8}/);
  assert.doesNotMatch(html, /id="media-focus"|bloomberg-daily\.js|AIHOT|短期条件判断/);
  assert.doesNotMatch(dataJs, /\/Users\/|gmail\.com|mail\.google\.com|@news\.bloomberg\.com|Content-Type:|Message-ID:/i);
});

test("Interest Analysis 2.0 page updates latest archive date and renders entries cleanly", () => {
  const dataCtx = { window: {} };
  vm.runInNewContext(dataJs, dataCtx);
  const data = dataCtx.window.BRASSIVO_INTEREST_ANALYSIS;
  assert.ok(data.entries.length >= 2);

  const rootEl = { innerHTML: "", hidden: false, querySelectorAll: () => [], querySelector: () => null };
  const dateEl = { textContent: "" };
  vm.runInNewContext(script, {
    window: { BRASSIVO_INTEREST_ANALYSIS: data },
    document: { querySelector: (s) => (s === "#interest-analysis" ? rootEl : s === "#interest-latest-date" ? dateEl : null) }
  });
  assert.equal(dateEl.textContent, data.latestDate);
  assert.match(rootEl.innerHTML, /01 \/ INTEREST ANALYSIS 2\.0/);
  assert.match(rootEl.innerHTML, /谢林信号真伪过滤/);
  assert.match(rootEl.innerHTML, /BDM 权力加权博弈矩阵/);
});
