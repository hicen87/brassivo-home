import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("EPS page is a public dashboard shell with no embedded portfolio data", () => {
  const html = read("eps/index.html");

  assert.match(html, /<link rel="canonical" href="https:\/\/brassivo\.com\/eps\/">/);
  assert.match(html, /<meta name="robots" content="index,follow">/);
  for (const id of ["dashboard", "loading-state", "error-state", "empty-state", "stock-list", "stock-search", "market-filter"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.doesNotMatch(html, /login-form|member-email|member-password|logout-button|会员登录/);
  assert.doesNotMatch(html, /id=["']dashboard["'][^>]*hidden/);

  assert.doesNotMatch(html, /NVDA|AAPL|腾讯控股|中际旭创|招商银行/);
  assert.doesNotMatch(html, /dashboard-data|eps-data|\.json["']/i);
  assert.doesNotMatch(html, /<script[^>]+type=["']application\/ld\+json/i);
  assert.match(html, /<link rel="stylesheet" href="styles\.css\?v=20260916score">/);
  assert.match(html, /<script defer src="sort\.js\?v=20260916score"><\/script>\s*<script defer src="app\.js\?v=20260916score"><\/script>/);
  assert.match(html, /Magnitude 40% · Agreement 30% · Upside\/ESP 20% · Surprise 10%/);
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
});

test("EPS app loads public data with no-store requests", () => {
  const app = read("eps/app.js");

  assert.match(app, /https:\/\/api\.brassivo\.com/);
  assert.match(app, /\/eps\/data/);
  assert.match(app, /cache:\s*["']no-store["']/);
  assert.match(app, /function escapeHTML\(/);
  assert.match(app, /function renderStocks\(/);
  assert.match(app, /groupAndSortStocks/);
  assert.match(app, /score-badge/);
  assert.match(app, /scoreMethodLabel/);
  assert.match(app, /market-group/);
  assert.doesNotMatch(app, /综合趋势|简单平均/);
  assert.match(app, /estimateRevisionTrend/);
  assert.match(app, /Trend of estimate revision/);
  assert.match(app, /加权总分由高到低/);
  assert.match(app, /function applyFilters\(/);
  assert.match(app, /\/eps\/image\//);
  assert.match(app, /data-screenshot-src/);
  assert.match(app, /addEventListener\(["']toggle["']/);
  assert.doesNotMatch(app, /change-list|change-item/);
  assert.doesNotMatch(app, /member\/session|member\/logout|credentials:\s*["']include["']|localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(app, /NVDA|AAPL|腾讯控股|中际旭创|招商银行/);
});

test("EPS styles support readable desktop and mobile layouts", () => {
  const css = read("eps/styles.css");

  assert.match(css, /--bg:\s*#f6f7f9/);
  assert.match(css, /\.summary-grid\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.stock-grid\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.screenshot-frame/);
  assert.match(css, /\.change-screenshot/);
  assert.match(css, /\.estimate-trend/);
  assert.match(css, /\.market-group-head/);
  assert.match(css, /\.score-badge/);
  assert.match(css, /\.score-note/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test("EPS stocks are grouped by market and ranked by weighted score", () => {
  const context = { window: {} };
  vm.runInNewContext(read("eps/sort.js"), context);
  const { groupAndSortStocks, scoreValue, trendVector } = context.window.EPSSort;
  const stocks = [
    { symbol: "US-LOW", market: "US", score: { total: 20 }, estimateRevisionTrend: ["100%", "100%", "100%", "100%"] },
    { symbol: "A-TOP", market: "A", score: { total: 95 }, estimateRevisionTrend: ["20%", "20%", "20%", "20%"] },
    { symbol: "US-MISSING", market: "US", estimateRevisionTrend: ["--", "--", "--", "--"] },
    { symbol: "HK-ONE", market: "HK", score: { total: 50 }, estimateRevisionTrend: ["1%", "1%", "1%", "1%"] },
    { symbol: "US-TOP", market: "US", score: { total: 90 }, estimateRevisionTrend: ["5%", "-100%", "-100%", "-100%"] },
    { symbol: "US-MID", market: "US", score: { total: 60 }, estimateRevisionTrend: ["4%", "2%", "-100%", "-100%"] }
  ];

  assert.deepEqual(Array.from(trendVector(stocks[4])), [5, -100, -100, -100]);
  assert.equal(scoreValue(stocks[4]), 90);
  const groups = JSON.parse(JSON.stringify(groupAndSortStocks(stocks)));
  assert.deepEqual(groups.map((group) => group.market), ["US", "A", "HK"]);
  assert.deepEqual(groups[0].stocks.map((stock) => stock.symbol), ["US-TOP", "US-MID", "US-LOW", "US-MISSING"]);
});

test("homepage and public indexes link to the public EPS module", () => {
  const homepage = read("index.html");
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");

  const homepageLinks = [...homepage.matchAll(/<a class="card" href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(homepageLinks, [
    "/media/", "/macro/", "/eps/", "https://investment.brassivo.com",
    "https://stocks.brassivo.com/sectors.html", "https://china.brassivo.com/sectors.html",
    "https://stocks.brassivo.com", "https://china.brassivo.com"
  ]);
  assert.match(homepage, /href=["']\/eps\/["']/);
  assert.match(homepage, /EPS Margin Tracker/);
  assert.match(homepage, /a\[href=["']\/eps\/["']\]/);
  assert.match(sitemap, /https:\/\/brassivo\.com\/eps\//);
  assert.match(llms, /EPS Margin Tracker/);

  const jsonLdMatch = homepage.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(jsonLdMatch, "homepage JSON-LD is missing");
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.ok(jsonLd.hasPart.some((part) => part.url === "https://brassivo.com/eps/"));
});
