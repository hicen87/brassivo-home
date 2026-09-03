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

  function renderRotation() {
    $("#rotation-track").innerHTML = data.rotation.map((step, index) => `
      <article class="rotation-step ${escapeHTML(step.state)}" data-order="${String(index + 1).padStart(2, "0")}">
        <div class="step-meta">
          <span>STAGE ${String(index + 1).padStart(2, "0")}</span>
          <span>${escapeHTML(step.stage)}</span>
        </div>
        <h3>${escapeHTML(step.label)}</h3>
        <p>${escapeHTML(step.note)}</p>
        ${step.state === "current" ? '<span class="current-flag">CURRENT FOCUS</span>' : ""}
      </article>
    `).join("");
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

  function renderObservations() {
    $("#observation-grid").innerHTML = data.observations.map((item) => `
      <article class="observation-card reveal">
        <h3>${escapeHTML(item.market)}</h3>
        <p>${escapeHTML(item.observation)}</p>
        <p class="handling">${escapeHTML(item.handling)}</p>
      </article>
    `).join("");
  }

  function renderChanges() {
    $("#change-list").innerHTML = data.changes.map((change) => `
      <article class="change-entry${change.turningPoint ? " is-turning-point" : ""}">
        <div class="change-meta">
          <time>${escapeHTML(change.date)}</time>
          ${change.turningPoint ? `
            <span class="turning-point-badge" aria-label="拐点信号：${escapeHTML(change.turningPoint.label)}">
              <span class="turning-point-mark" aria-hidden="true">↺</span>
              拐点 · ${escapeHTML(change.turningPoint.label)}
            </span>
          ` : ""}
        </div>
        <h3>${escapeHTML(change.asset)} · ${escapeHTML(change.to)}</h3>
        <p>${escapeHTML(change.reason)}</p>
        ${change.turningPoint ? `
          <p class="turning-point-context"><b>价格位置</b>${escapeHTML(change.turningPoint.priceContext)}</p>
        ` : ""}
      </article>
    `).join("");
  }

  function renderSources() {
    $("#source-list").innerHTML = data.sources.map((source) => `
      <article class="source-card">
        <span class="source-id">${escapeHTML(source.id)} · ${escapeHTML(source.type)}</span>
        <h3>${escapeHTML(source.title)}</h3>
        <p>${escapeHTML(source.role)}</p>
        <span class="source-footer"><time>${escapeHTML(source.date)}</time><b>证据索引</b></span>
      </article>
    `).join("");
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
    renderRotation();
    renderAssetTable();
    renderObservations();
    renderChanges();
    renderSources();
    bindEvents();
  }

  init();
})();
