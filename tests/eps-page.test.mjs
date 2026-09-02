import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
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
});

test("EPS app loads public data with no-store requests", () => {
  const app = read("eps/app.js");

  assert.match(app, /https:\/\/api\.brassivo\.com/);
  assert.match(app, /\/eps\/data/);
  assert.match(app, /cache:\s*["']no-store["']/);
  assert.match(app, /function escapeHTML\(/);
  assert.match(app, /function renderStocks\(/);
  assert.match(app, /function applyFilters\(/);
  assert.doesNotMatch(app, /member\/session|member\/logout|credentials:\s*["']include["']|localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(app, /NVDA|AAPL|腾讯控股|中际旭创|招商银行/);
});

test("EPS styles support readable desktop and mobile layouts", () => {
  const css = read("eps/styles.css");

  assert.match(css, /--bg:\s*#f6f7f9/);
  assert.match(css, /\.summary-grid\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.stock-grid\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test("homepage and public indexes link to the public EPS module", () => {
  const homepage = read("index.html");
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");

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
