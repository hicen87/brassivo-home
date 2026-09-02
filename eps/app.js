(function () {
  "use strict";

  const API = "https://api.brassivo.com";
  const state = { data: null, query: "", market: "ALL" };
  const $ = (selector) => document.querySelector(selector);

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(10_000)
    });
    const payload = await response.json().catch(() => ({ ok: false, err: "服务返回格式异常" }));
    if (!response.ok) {
      const error = new Error(payload.err || "请求失败");
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function showLogin(message = "") {
    state.data = null;
    $("#login-panel").hidden = false;
    $("#dashboard").hidden = true;
    $("#logout-button").hidden = true;
    $("#login-message").textContent = message;
  }

  function showDashboard() {
    $("#login-panel").hidden = true;
    $("#dashboard").hidden = false;
    $("#logout-button").hidden = false;
  }

  function setLoadState(kind, message = "") {
    $("#loading-state").hidden = kind !== "loading";
    $("#error-state").hidden = kind !== "error";
    $("#stock-list").hidden = kind === "loading" || kind === "error";
    if (message) $("#error-message").textContent = message;
  }

  function marketLabel(market) {
    return { US: "美股", A: "A股", HK: "港股" }[market] || market;
  }

  function directionLabel(direction) {
    return { up: "上调", down: "下调", new: "新增", missing: "缺失" }[direction] || direction;
  }

  function stockTone(stock) {
    const newestDate = stock.recentChanges[0]?.changeDate;
    const newest = stock.recentChanges.filter((change) => change.changeDate === newestDate);
    const up = newest.filter((change) => change.direction === "up").length;
    const down = newest.filter((change) => change.direction === "down").length;
    return up > down ? "has-up" : down > up ? "has-down" : "";
  }

  function renderChanges(changes) {
    if (!changes.length) return '<div class="change-block"><span class="muted">尚无可延续的真实变化</span></div>';
    return `
      <details class="change-block">
        <summary>最近真实变化 · ${changes.length} 项</summary>
        <div class="change-list">
          ${changes.slice(0, 12).map((change) => `
            <div class="change-item ${escapeHTML(change.direction)}">
              <i aria-hidden="true"></i>
              <div class="change-copy">
                <strong>${escapeHTML(change.field)} · ${escapeHTML(change.period)}</strong>
                <span>${escapeHTML(change.changeDate)} · ${directionLabel(change.direction)}</span>
              </div>
              <div class="change-value">${escapeHTML(change.newValue)}<span>${escapeHTML(change.delta)}</span></div>
            </div>
          `).join("")}
        </div>
      </details>`;
  }

  function renderStocks(stocks) {
    $("#filtered-count").textContent = stocks.length;
    $("#empty-state").hidden = stocks.length !== 0;
    $("#stock-list").innerHTML = stocks.map((stock) => `
      <article class="stock-card ${stockTone(stock)}">
        <header class="stock-head">
          <div class="stock-identity">
            <h2>${escapeHTML(stock.name)}</h2>
            <p>${escapeHTML(stock.symbol)} · BASELINE ${escapeHTML(stock.baselineDate)}</p>
          </div>
          <div class="stock-tags">
            <span>${escapeHTML(marketLabel(stock.market))}</span>
            <span>${escapeHTML(stock.source)}</span>
            ${stock.currency ? `<span>${escapeHTML(stock.currency)}</span>` : ""}
          </div>
        </header>
        <div class="stock-grid">
          ${stock.periods.map((period, index) => `
            <div class="period-cell">
              <span>${escapeHTML(period)}</span>
              <strong>${escapeHTML(stock.estimates[index])}</strong>
              <div class="revision-line" aria-label="7日盈利修正">
                <small class="up">↑ ${escapeHTML(stock.revisionsUp[index])}</small>
                <small class="down">↓ ${escapeHTML(stock.revisionsDown[index])}</small>
              </div>
            </div>
          `).join("")}
        </div>
        ${renderChanges(stock.recentChanges)}
      </article>
    `).join("");
  }

  function applyFilters() {
    if (!state.data) return;
    const query = state.query.trim().toLocaleLowerCase("zh-CN");
    const filtered = state.data.stocks.filter((stock) => {
      const marketMatch = state.market === "ALL" || stock.market === state.market;
      const queryMatch = !query || [stock.symbol, stock.name, stock.source, marketLabel(stock.market)].join(" ").toLocaleLowerCase("zh-CN").includes(query);
      return marketMatch && queryMatch;
    });
    renderStocks(filtered);
  }

  function renderSummary(data) {
    $("#baseline-date").textContent = data.baselineDate;
    $("#baseline-status").textContent = data.status === "sent" ? "已通过日报与邮件验收" : data.status;
    $("#metric-stocks").textContent = data.summary.stocksSuccess;
    $("#metric-current").textContent = data.summary.currentNumericChanges;
    $("#metric-period").textContent = data.summary.periodChanges;
    $("#metric-carry").textContent = data.summary.trendCarry;
  }

  async function loadData() {
    showDashboard();
    setLoadState("loading");
    try {
      const data = await api("/eps/data", { method: "GET" });
      state.data = data;
      renderSummary(data);
      setLoadState("ready");
      applyFilters();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        showLogin(error.status === 403 ? "会员已到期，请先续费。" : "请先登录后查看。 ");
        return;
      }
      setLoadState("error", error.message || "请稍后重试。");
    }
  }

  async function login(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button[type=submit]");
    const email = $("#member-email").value.trim();
    const password = $("#member-password").value;
    button.disabled = true;
    $("#login-message").textContent = "正在验证会员状态…";
    try {
      await api("/member/session", { method: "POST", body: JSON.stringify({ email, password }) });
      $("#member-password").value = "";
      $("#login-message").textContent = "";
      await loadData();
    } catch (error) {
      $("#login-message").textContent = error.message || "登录失败";
    } finally {
      button.disabled = false;
    }
  }

  async function logout() {
    $("#logout-button").disabled = true;
    try {
      await api("/member/logout", { method: "POST", body: "{}" });
    } catch (_error) {
      // Cookie is cleared server-side when reachable; local UI always returns to login.
    } finally {
      $("#logout-button").disabled = false;
      showLogin("已退出登录。 ");
    }
  }

  function bindEvents() {
    $("#login-form").addEventListener("submit", login);
    $("#logout-button").addEventListener("click", logout);
    $("#retry-button").addEventListener("click", loadData);
    $("#stock-search").addEventListener("input", (event) => {
      state.query = event.target.value;
      applyFilters();
    });
    $("#market-filter").addEventListener("change", (event) => {
      state.market = event.target.value;
      applyFilters();
    });
  }

  bindEvents();
  loadData();
})();
