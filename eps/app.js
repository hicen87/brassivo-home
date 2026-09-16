(function () {
  "use strict";

  const API = "https://api.brassivo.com";
  const state = { data: null, query: "", market: "ALL" };
  const $ = (selector) => document.querySelector(selector);
  const { groupAndSortStocks } = window.EPSSort;

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

  function setLoadState(kind, message = "") {
    $("#loading-state").hidden = kind !== "loading";
    $("#error-state").hidden = kind !== "error";
    $("#stock-list").hidden = kind === "loading" || kind === "error";
    if (message) $("#error-message").textContent = message;
  }

  function marketLabel(market) {
    return { US: "美股", A: "A股", HK: "港股" }[market] || market;
  }

  function marketEnglishLabel(market) {
    return { US: "US EQUITIES", A: "A-SHARES", HK: "HONG KONG" }[market] || market;
  }

  function stockTone(stock) {
    const newestDate = stock.recentChanges[0]?.changeDate;
    const newest = stock.recentChanges.filter((change) => change.changeDate === newestDate);
    const up = newest.filter((change) => change.direction === "up").length;
    const down = newest.filter((change) => change.direction === "down").length;
    return up > down ? "has-up" : down > up ? "has-down" : "";
  }

  function estimateTrendTone(value) {
    const number = Number.parseFloat(String(value ?? "").replace("%", ""));
    if (!Number.isFinite(number) || number === 0) return "neutral";
    return number > 0 ? "up" : "down";
  }

  function scoreLabel(stock) {
    const score = Number(stock.score?.total);
    return Number.isFinite(score) ? score.toFixed(1) : "—";
  }

  function scoreRank(stock, fallbackRank) {
    const rank = Number(stock.score?.rank);
    return Number.isInteger(rank) && rank > 0 ? rank : fallbackRank;
  }

  function scoreMethodLabel(market) {
    if (market === "US") return "加权总分由高到低 · Magnitude 40% · Agreement 30% · Upside/ESP 20% · Surprise 10%";
    return "加权总分由高到低 · Magnitude 40% · Agreement 30%（按可用权重归一）";
  }

  function renderChanges(stock) {
    const changes = stock.recentChanges;
    if (!changes.length) return '<div class="change-block"><span class="muted">尚无可延续的真实变化</span></div>';
    const screenshotSrc = `${API}/eps/image/${encodeURIComponent(stock.baselineDate)}/${encodeURIComponent(stock.symbol)}/${encodeURIComponent(stock.screenshotSha256)}`;
    return `
      <details class="change-block">
        <summary>最近真实变化 · ${changes.length} 项</summary>
        <div class="screenshot-frame">
          <span class="screenshot-status">截图加载中…</span>
          <img class="change-screenshot" data-screenshot-src="${escapeHTML(screenshotSrc)}" alt="${escapeHTML(stock.name)} ${escapeHTML(stock.baselineDate)} 邮件截图" hidden>
        </div>
      </details>`;
  }

  function bindScreenshotLoaders() {
    document.querySelectorAll("details.change-block").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        const image = details.querySelector(".change-screenshot");
        const status = details.querySelector(".screenshot-status");
        if (!image || image.dataset.loaded || image.src) return;
        image.addEventListener("load", () => {
          image.dataset.loaded = "true";
          image.hidden = false;
          status.hidden = true;
        }, { once: true });
        image.addEventListener("error", () => {
          status.textContent = "截图暂时无法加载，请稍后重试。";
          image.removeAttribute("src");
        }, { once: true });
        image.src = image.dataset.screenshotSrc;
      });
    });
  }

  function renderStock(stock, rank) {
    const marketRank = scoreRank(stock, rank);
    return `
      <article class="stock-card ${stockTone(stock)}">
        <header class="stock-head">
          <div class="stock-identity">
            <div class="stock-title-row">
              <h2>${escapeHTML(stock.name)}</h2>
              <span class="score-badge" aria-label="${escapeHTML(stock.name)} 市场排名第 ${marketRank}，加权得分 ${scoreLabel(stock)} 分">
                <small>#${marketRank}</small><strong>${scoreLabel(stock)}</strong><span>分</span>
              </span>
            </div>
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
              <div class="estimate-trend ${estimateTrendTone(stock.estimateRevisionTrend[index])}">
                <span>Trend of estimate revision</span>
                <b>${escapeHTML(stock.estimateRevisionTrend[index])}</b>
              </div>
            </div>
          `).join("")}
        </div>
        ${renderChanges(stock)}
      </article>`;
  }

  function renderStocks(stocks) {
    $("#filtered-count").textContent = stocks.length;
    $("#empty-state").hidden = stocks.length !== 0;
    $("#stock-list").innerHTML = groupAndSortStocks(stocks).map((group) => `
      <section class="market-group" aria-labelledby="market-group-${escapeHTML(group.market)}">
        <header class="market-group-head">
          <span>${escapeHTML(marketEnglishLabel(group.market))}</span>
          <h2 id="market-group-${escapeHTML(group.market)}">${escapeHTML(marketLabel(group.market))}</h2>
          <small>${group.stocks.length} 只 · ${escapeHTML(scoreMethodLabel(group.market))}</small>
        </header>
        <div class="market-stock-list">${group.stocks.map((stock, index) => renderStock(stock, index + 1)).join("")}</div>
      </section>
    `).join("");
    bindScreenshotLoaders();
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
    setLoadState("loading");
    try {
      const data = await api("/eps/data", { method: "GET" });
      state.data = data;
      renderSummary(data);
      setLoadState("ready");
      applyFilters();
    } catch (error) {
      setLoadState("error", error.message || "请稍后重试。");
    }
  }

  function bindEvents() {
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
