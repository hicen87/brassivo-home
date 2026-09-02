# Brassivo EPS Private Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a login-protected EPS margin tracking page at `brassivo.com/eps/` backed by private Worker KV data produced only after a successful EPS daily run.

**Architecture:** The public repository contains only the page shell and Worker source. The local EPS project builds a sanitized snapshot and uploads it with a secret bearer token; the Worker stores it in KV and serves it only to a valid, unexpired D1 member session held in an HttpOnly cookie.

**Tech Stack:** Static HTML/CSS/JavaScript, Cloudflare Worker + D1 + KV, Node.js built-in test runner, zsh project validator.

---

### Task 1: Worker authentication and private EPS endpoints

**Files:**
- Modify: `worker-crm.js`
- Create: `tests/worker-eps-auth.test.mjs`

**Step 1: Write the failing tests**

Cover `POST /member/session`, `POST /member/logout`, unauthenticated `GET /eps/data`, authenticated `GET /eps/data`, and token-protected `POST /admin/eps` with in-memory D1/KV mocks.

**Step 2: Run the focused test and verify failure**

Run: `node --test tests/worker-eps-auth.test.mjs`

Expected: FAIL because the new routes and session cookie do not exist.

**Step 3: Implement minimal Worker routes**

Add helpers for cookie parsing, constant-time token comparison, session hashing, session creation, active-member checks and snapshot schema validation. Store `session:<sha256(token)>` with seven-day TTL and `eps:current` without TTL.

**Step 4: Run the focused test**

Run: `node --test tests/worker-eps-auth.test.mjs`

Expected: all Worker EPS authentication tests PASS.

### Task 2: Deterministic EPS snapshot builder and publisher

**Files:**
- Create: `/Users/jackycen/Documents/EPS边际跟踪/scripts/publish_brassivo_eps.mjs`
- Create: `/Users/jackycen/Documents/EPS边际跟踪/tests/publish_brassivo_eps.test.mjs`
- Modify: `/Users/jackycen/Documents/EPS边际跟踪/scripts/validate_project.sh`
- Modify: `/Users/jackycen/Documents/EPS边际跟踪/docs/MAINTENANCE.md`

**Step 1: Write the failing export tests**

Use temporary fixtures to assert that a successful, same-date, fully validated run produces a 13-stock snapshot; failed or mismatched runs must throw. Assert that output contains no URLs, Gmail ids, local paths, image names or credentials.

**Step 2: Run the focused test and verify failure**

Run: `node --test tests/publish_brassivo_eps.test.mjs`

Expected: FAIL because the module does not exist.

**Step 3: Implement build and publish modes**

Export pure `buildSnapshot` and `validateSnapshot` functions. CLI default writes JSON to stdout for inspection; `--publish` requires `BRASSIVO_EPS_PUBLISH_TOKEN` and sends the snapshot to `https://api.brassivo.com/admin/eps` with an AbortSignal timeout.

**Step 4: Extend project validation and maintenance docs**

Type-check the Node module, run its tests from `validate_project.sh`, document the post-Gmail publication gate, environment variable and exact dry-run/publish commands.

**Step 5: Run EPS validation**

Run: `/Users/jackycen/Documents/EPS边际跟踪/scripts/validate_project.sh`

Expected: existing project validation and new export tests PASS.

### Task 3: Login-protected EPS page

**Files:**
- Create: `eps/index.html`
- Create: `eps/styles.css`
- Create: `eps/app.js`
- Create: `tests/eps-page.test.mjs`

**Step 1: Write the failing page contract test**

Assert canonical metadata, login form, market/search filters, empty/loading/error states, credentialed API requests and absence of embedded symbols or static data files.

**Step 2: Run the focused test and verify failure**

Run: `node --test tests/eps-page.test.mjs`

Expected: FAIL because `eps/` does not exist.

**Step 3: Implement the page shell and renderer**

Match the Brassivo light theme. Render summary cards, searchable/filterable stock cards, four-period estimates and recent directional changes. Redirect expired sessions back to the login state and never cache the API response in browser storage.

**Step 4: Run the focused test**

Run: `node --test tests/eps-page.test.mjs`

Expected: page contract tests PASS.

### Task 4: Homepage and discovery integration

**Files:**
- Modify: `index.html`
- Modify: `sitemap.xml`
- Modify: `llms.txt`
- Modify: `tests/eps-page.test.mjs`

**Step 1: Extend the failing integration assertions**

Require an EPS module card, JSON-LD `hasPart`, bilingual card copy, sitemap URL and llms index entry.

**Step 2: Implement the minimum integration**

Add a wide `EQUITY · 盈利修正` card and update public metadata without claiming that private data is crawlable.

**Step 3: Run all repository tests**

Run: `node --test tests/*.test.mjs`

Expected: all existing Honghao and new EPS tests PASS.

### Task 5: Local functional and visual verification

**Files:**
- Modify if needed: `eps/index.html`, `eps/styles.css`, `eps/app.js`
- Create: deployment and rollback section in `/Users/jackycen/Documents/EPS边际跟踪/docs/MAINTENANCE.md`

**Step 1: Build a real dry-run snapshot**

Run: `node /Users/jackycen/Documents/EPS边际跟踪/scripts/publish_brassivo_eps.mjs > /tmp/brassivo-eps-snapshot.json`

Expected: valid JSON with 13 active stocks and no sensitive fields.

**Step 2: Serve and inspect locally**

Run: `python3 -m http.server 8765 --directory /Users/jackycen/Documents/产业链瓶颈与价值投资/brassivo-home`

Expected: `/eps/` loads the login shell without console errors at desktop and mobile widths. API-dependent authenticated rendering is covered with the same fixture through automated DOM tests or a local mock.

**Step 3: Re-run all gates and inspect the diff**

Run: `node --test tests/*.test.mjs`

Run: `/Users/jackycen/Documents/EPS边际跟踪/scripts/validate_project.sh`

Run: `git status --short && git diff --check && git diff --stat`

Expected: tests PASS, no whitespace errors, and only the explicit EPS/private-page files are changed.

**Step 4: Stop before production mutation**

Do not push or deploy. Report the required Cloudflare secret, Worker deployment and online acceptance steps for separate authorization.
