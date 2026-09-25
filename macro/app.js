(function () {
  "use strict";

  const data = window.HONG_HAO_DASHBOARD_DATA;
  if (!data) {
    document.body.innerHTML = '<main style="padding:40px;color:#f0ead8;font-family:sans-serif"><h1>看板数据未加载</h1><p>请确认 dashboard-data.js 与 index.html 位于同一目录。</p></main>';
    return;
  }

  const state = {
    query: "",
    horizon: "全部",
    evidence: "全部",
    status: "全部",
    selectedId: null
  };

  const horizonOrder = ["短期", "中期", "长期"];
  const toneOrder = { positive: 0, neutral: 1, caution: 2, negative: 3 };
  const originalOrder = new Map(data.assets.map((asset, index) => [asset.id, index]));

  const toneMeta = {
    positive: { label: "偏多 / 支撑", color: "#79b995" },
    caution: { label: "谨慎 / 降速", color: "#d2ae62" },
    neutral: { label: "中性 / 观察", color: "#75857f" },
    negative: { label: "承压 / 偏弱", color: "#d35f4c" }
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function horizonGroup(asset) {
    if (asset.horizon.includes("短")) return "短期";
    if (asset.horizon.includes("中")) return "中期";
    return "长期";
  }

  function matchesHorizon(asset, value) {
    return value === "全部" || horizonGroup(asset) === value;
  }

  function sortAssets(assets) {
    return [...assets].sort((left, right) => {
      const horizonDiff = horizonOrder.indexOf(horizonGroup(left)) - horizonOrder.indexOf(horizonGroup(right));
      if (horizonDiff) return horizonDiff;
      const toneDiff = toneOrder[left.tone] - toneOrder[right.tone];
      if (toneDiff) return toneDiff;
      return originalOrder.get(left.id) - originalOrder.get(right.id);
    });
  }

  function filteredAssets() {
    const query = state.query.trim().toLocaleLowerCase("zh-CN");
    return sortAssets(data.assets.filter((asset) => {
      const searchable = [asset.asset, asset.category, asset.direction, asset.action, asset.rationale].join(" ").toLocaleLowerCase("zh-CN");
      const queryMatch = !query || searchable.includes(query);
      const horizonMatch = matchesHorizon(asset, state.horizon);
      const evidenceMatch = state.evidence === "全部" || asset.evidence.includes(state.evidence);
      const statusMatch = state.status === "全部" || asset.status === state.status;
      return queryMatch && horizonMatch && evidenceMatch && statusMatch;
    }));
  }

  function renderMeta() {
    $("#baseline-date").textContent = data.meta.baselineDate;
    $("#header-date").textContent = data.meta.latestSourceDate;
    $("#latest-source-date").textContent = data.meta.latestSourceDate;
    $("#hero-title").textContent = data.meta.posture;
    $("#posture-note").textContent = data.meta.postureNote;
    $("#footer-disclaimer").textContent = data.meta.disclaimer;

    const activeCount = data.assets.filter((asset) => asset.status === "有效").length;
    const priorityCount = data.assets.filter((asset) => asset.priority).length;
    const explicitCount = data.assets.filter((asset) => asset.evidence.includes("原文明确")).length;
    $("#asset-total").textContent = data.assets.length;
    $("#metric-active").textContent = activeCount;
    $("#metric-priority").textContent = priorityCount;
    $("#metric-explicit").textContent = explicitCount;
    $("#metric-sources").textContent = data.sources.length;
  }

  function renderCompass() {
    const counts = { positive: 0, caution: 0, neutral: 0, negative: 0 };
    for (const asset of data.assets) counts[asset.tone] += 1;
    const total = data.assets.length || 1;
    const positiveEnd = (counts.positive / total) * 360;
    const cautionEnd = positiveEnd + (counts.caution / total) * 360;
    const neutralEnd = cautionEnd + (counts.neutral / total) * 360;
    const compass = $("#direction-compass");
    compass.style.setProperty("--positive-deg", `${positiveEnd}deg`);
    compass.style.setProperty("--caution-deg", `${cautionEnd}deg`);
    compass.style.setProperty("--neutral-deg", `${neutralEnd}deg`);

    $("#direction-legend").innerHTML = Object.entries(toneMeta).map(([tone, meta]) => `
      <div class="legend-item" data-tone="${tone}">
        <i aria-hidden="true"></i>
        <span>${escapeHTML(meta.label)}</span>
        <strong>${counts[tone]}</strong>
      </div>
    `).join("");
  }

  function renderAllocation() {
    const allocation = data.allocation;
    const valid = allocation && Number.isFinite(allocation.stocks) && Number.isFinite(allocation.cash)
      && allocation.stocks >= 0 && allocation.cash >= 0
      && Math.abs(allocation.stocks + allocation.cash - 100) < 0.000001;
    const bar = $("#allocation-bar");
    bar.hidden = !valid;
    $("#allocation-stocks").textContent = valid ? `${allocation.stocks}%` : "—";
    $("#allocation-cash").textContent = valid ? `${allocation.cash}%` : "—";
    $("#allocation-basis").textContent = valid ? allocation.basis : "待设置";
    $("#allocation-note").textContent = valid ? allocation.note : "配比尚未设置。";
    $("#allocation-date").textContent = valid ? allocation.asOf : "";
    $("#allocation-method").textContent = valid ? allocation.method : "";
    $("#allocation-increase").textContent = valid ? `提高股票比例：${allocation.increaseCondition}` : "";
    $("#allocation-decrease").textContent = valid ? `降低股票比例：${allocation.decreaseCondition}` : "";
    $("#allocation-scope-note").textContent = valid ? allocation.scope : "";
    $(".allocation-details").hidden = !valid;
    bar.setAttribute("aria-label", valid ? `股票 ${allocation.stocks}%，现金 ${allocation.cash}%` : "资金配比待设置");
    if (valid) {
      $("#allocation-stock-segment").style.flex = `${allocation.stocks} 1 0%`;
      $("#allocation-cash-segment").style.flex = `${allocation.cash} 1 0%`;
    }
  }

  function renderBloombergDaily() {
    const item = window.BLOOMBERG_MARKETS_DAILY;
    const target = $("#bloomberg-content");
    if (!target) return;
    if (!item) {
      target.innerHTML = '<p class="bloomberg-unavailable">主流媒体焦点尚未核验，暂无可发布的内容。</p>';
      return;
    }
    const cards = (items, label, tone) => items.map((entry) => `
      <article class="bloomberg-signal ${tone}">
        <span>${label} · Brassivo 推演</span>
        <h4>${escapeHTML(entry.title)}</h4>
        <p>${escapeHTML(entry.reason)}</p>
        <small>验证条件：${escapeHTML(entry.condition)}</small>
      </article>
    `).join("");
    const sourceCard = (focus, name, scope, className) => focus ? `
      <article class="media-focus-card ${className}">
        <div class="media-focus-meta"><span>${name} <em>${scope}</em></span><time datetime="${escapeHTML(focus.capturedAt)}">首页抓取 ${escapeHTML(focus.capturedAt.slice(0, 16).replace('T', ' '))}</time></div>
        <p class="media-focus-summary">${escapeHTML(focus.summary)}</p>
        <ol class="media-focus-stories">${focus.stories.map((story) => `
          <li><a href="${escapeHTML(story.url)}" rel="noopener noreferrer"><strong>${escapeHTML(story.title)}</strong><span aria-hidden="true">↗</span></a><p>${escapeHTML(story.summary)}</p></li>
        `).join("")}</ol>
      </article>` : `<article class="media-focus-card ${className} media-focus-missing"><strong>${name}</strong><p>本期首页内容尚未核验，保留待更新状态。</p></article>`;
    target.innerHTML = `
      <div class="media-focus-grid">
        <article class="media-focus-card media-focus-bloomberg">
          <div class="media-focus-meta"><span>Bloomberg <em>宏观 / 短期波动</em></span><time datetime="${escapeHTML(item.issueDate)}">原刊 ${escapeHTML(item.issueDate)}</time></div>
          <h3>${escapeHTML(item.headline)}</h3>
          <p class="media-focus-summary">${escapeHTML(item.bloombergTake)}</p>
          <a class="media-focus-link" href="${escapeHTML(item.sourceUrl)}" rel="noopener noreferrer">查看 Markets Daily 原刊 ↗</a>
        </article>
        ${sourceCard(item.mediaFocus?.barrons, "Barron’s", "个股 / 公司", "media-focus-barrons")}
        ${sourceCard(item.mediaFocus?.wsj, "The Wall Street Journal", "首页 / 头条", "media-focus-wsj")}
      </div>
      <details class="media-focus-judgment">
        <summary class="media-focus-judgment-heading"><span>BRASSIVO / CONDITIONAL VIEW</span><strong>短期条件判断</strong></summary>
        <p class="media-focus-judgment-note">以下仅基于 Bloomberg 这期邮件的事实独立推演，不是三家媒体的共同观点。</p>
        <div class="bloomberg-signals">
          ${cards(item.bullish, "短期利多", "positive")}
          ${cards(item.bearish, "短期利空", "negative")}
        </div>
        <p class="bloomberg-footnote">三家媒体内容均为各自刊期或首页抓取时点的摘要，不是实时行情；条件判断不自动改变策略基线、资金配比或 EPS 基线。</p>
      </details>
    `;
  }

  function renderAssetTable() {
    const assets = filteredAssets();
    $("#filtered-count").textContent = assets.length;
    $("#empty-state").hidden = assets.length !== 0;

    if (assets.length && !assets.some((asset) => asset.id === state.selectedId)) {
      state.selectedId = assets[0].id;
    }

    const groupCounts = assets.reduce((counts, asset) => {
      const group = horizonGroup(asset);
      counts[group] = (counts[group] || 0) + 1;
      return counts;
    }, {});

    let previousGroup = null;
    $("#asset-table-body").innerHTML = assets.map((asset) => {
      const group = horizonGroup(asset);
      const groupHeader = group === previousGroup ? "" : `
        <tr class="asset-group-row" data-horizon-group="${escapeHTML(group)}">
          <th colspan="4" scope="rowgroup">
            <span>${escapeHTML(group)}</span>
            <small>利多优先 · 谨慎与利空靠后</small>
            <strong>${groupCounts[group]} 项</strong>
          </th>
        </tr>
      `;
      previousGroup = group;
      return `${groupHeader}
        <tr class="asset-row ${asset.id === state.selectedId ? "is-selected" : ""}" data-id="${escapeHTML(asset.id)}" tabindex="0" role="button" aria-label="查看${escapeHTML(asset.asset)}详情" aria-selected="${asset.id === state.selectedId}">
          <td>
            <div class="asset-name">
              <i class="tone-mark ${escapeHTML(asset.tone)}" aria-hidden="true"></i>
              <span><strong>${escapeHTML(asset.asset)}</strong><small>${escapeHTML(asset.category)}</small></span>
            </div>
          </td>
          <td><span class="horizon-label">${escapeHTML(asset.horizon)}</span></td>
          <td><span class="direction-label">${escapeHTML(asset.direction)}</span></td>
          <td><span class="evidence-label">${escapeHTML(asset.evidence)}</span></td>
        </tr>`;
    }).join("");

    renderAssetDetail();
  }

  function renderAssetDetail() {
    const asset = data.assets.find((item) => item.id === state.selectedId);
    if (!asset) {
      $("#asset-detail").innerHTML = '<div class="empty-state"><strong>请选择资产</strong><span>左侧列表会显示可用记录</span></div>';
      return;
    }

    const sourceMap = new Map(data.sources.map((source) => [source.id, source]));
    const sourceLinks = asset.sourceRefs.map((ref) => {
      const source = sourceMap.get(ref);
      if (!source) return "";
      return `<span title="${escapeHTML(source.title)}">${escapeHTML(ref)}</span>`;
    }).join("");

    $("#asset-detail").innerHTML = `
      <div class="detail-topline">
        <span class="detail-category">${escapeHTML(asset.category)} / ${escapeHTML(asset.horizon)}</span>
        <span class="status-badge ${asset.status === "观察中" ? "watch" : ""}">${escapeHTML(asset.status)}</span>
      </div>
      <h3>${escapeHTML(asset.asset)}</h3>
      <div class="detail-direction"><i class="${escapeHTML(asset.tone)}" aria-hidden="true"></i><span>${escapeHTML(asset.direction)}</span></div>
      <div class="action-callout">
        <span>对应交易动作</span>
        <p>${escapeHTML(asset.action)}</p>
      </div>
      <div class="detail-block">
        <span>关键依据</span>
        <p>${escapeHTML(asset.rationale)}</p>
      </div>
      <div class="detail-block">
        <span>后续确认 / 反转条件</span>
        <p>${escapeHTML(asset.trigger)}</p>
      </div>
      <div class="detail-evidence">
        <b>${escapeHTML(asset.evidence)}</b>
        <b>更新 ${escapeHTML(asset.updated)}</b>
      </div>
      <div class="detail-sources" aria-label="相关来源">${sourceLinks}</div>
    `;
  }

  function renderSources() {
    const changesBySource = new Map(data.sources.map((source) => [source.id, []]));
    for (const change of data.changes) {
      for (const id of new Set(change.sources || [])) changesBySource.get(id)?.push(change);
    }
    const sourceCards = [...data.sources]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((source) => `
      <article class="source-card">
        <div class="source-card-heading">
          <span class="source-id">${escapeHTML(source.id)} · ${escapeHTML(source.type)}</span>
          <time datetime="${escapeHTML(source.date)}">${escapeHTML(source.date)}</time>
        </div>
        <h3>${escapeHTML(source.title)}</h3>
        <details class="source-role">
          <summary>资料提要</summary>
          <p>${escapeHTML(source.role)}</p>
        </details>
        <div class="source-derived">
          <h4>方向变更摘要 · 依据本文提炼</h4>
          ${changesBySource.get(source.id)?.length
            ? changesBySource.get(source.id).map((change) => `
              <article class="source-change-entry${change.turningPoint ? " is-turning-point" : ""}">
                <div class="source-change-heading">
                  <strong>${escapeHTML(change.asset)} · ${escapeHTML(change.to)}</strong>
                  ${change.turningPoint ? `
                    <span class="turning-point-badge" aria-label="拐点信号：${escapeHTML(change.turningPoint.label)}">
                      <span class="turning-point-mark" aria-hidden="true">↺</span>
                      拐点 · ${escapeHTML(change.turningPoint.label)}
                    </span>
                  ` : ""}
                </div>
                <p>${escapeHTML(change.reason)}</p>
                ${change.turningPoint ? `
                  <p class="turning-point-context"><b>价格位置</b>${escapeHTML(change.turningPoint.priceContext)}</p>
                ` : ""}
              </article>
            `).join("")
            : '<p class="source-no-change">该资料未单独形成方向变更。</p>'}
        </div>
      </article>
    `);
    const recentCards = sourceCards.slice(0, 2).join("");
    const historyCards = sourceCards.slice(2);
    $("#source-list").innerHTML = recentCards + (historyCards.length ? `
      <details class="source-history">
        <summary>
          <span class="source-history-closed">展开历史文章（${historyCards.length} 篇）</span>
          <span class="source-history-open">收起历史文章（${historyCards.length} 篇）</span>
        </summary>
        <div class="source-history-list">${historyCards.join("")}</div>
      </details>
    ` : "");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  async function copySummary() {
    const priorityLines = data.assets
      .filter((asset) => asset.priority)
      .map((asset) => `- ${asset.asset}（${asset.horizon}）：${asset.direction}；${asset.action}`)
      .join("\n");
    const summary = `${data.meta.title}\n基线：${data.meta.baselineDate}\n${data.meta.posture}\n${data.meta.postureNote}\n\n${priorityLines}`;

    try {
      await navigator.clipboard.writeText(summary);
      showToast("基线摘要已复制");
    } catch (_error) {
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("基线摘要已复制");
    }
  }

  function bindEvents() {
    $("#asset-search").addEventListener("input", (event) => {
      state.query = event.target.value;
      renderAssetTable();
    });

    $$('[data-filter="horizon"]').forEach((button) => {
      button.addEventListener("click", () => {
        state.horizon = button.dataset.value;
        $$('[data-filter="horizon"]').forEach((item) => item.classList.toggle("is-active", item === button));
        renderAssetTable();
      });
    });

    $("#evidence-filter").addEventListener("change", (event) => {
      state.evidence = event.target.value;
      renderAssetTable();
    });

    $("#status-filter").addEventListener("change", (event) => {
      state.status = event.target.value;
      renderAssetTable();
    });

    $("#asset-table-body").addEventListener("click", (event) => {
      const row = event.target.closest(".asset-row");
      if (!row) return;
      state.selectedId = row.dataset.id;
      renderAssetTable();
    });

    $("#asset-table-body").addEventListener("keydown", (event) => {
      const row = event.target.closest(".asset-row");
      if (!row || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      state.selectedId = row.dataset.id;
      renderAssetTable();
      $(`.asset-row[data-id="${CSS.escape(state.selectedId)}"]`)?.focus();
    });

    $("#copy-summary").addEventListener("click", copySummary);
  }

  function init() {
    renderMeta();
    renderCompass();
    renderAllocation();
    renderBloombergDaily();
    renderAssetTable();
    renderSources();
    bindEvents();
  }

  init();
})();
