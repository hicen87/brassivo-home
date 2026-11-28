(() => {
  const root = document.querySelector("#interest-analysis");
  if (!root) return;
  const dataset = window.BRASSIVO_INTEREST_ANALYSIS;
  if (!dataset || !Array.isArray(dataset.entries) || !dataset.entries.length) {
    root.hidden = true;
    return;
  }

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const entries = dataset.entries;
  const state = {
    edition: entries[0].edition,
    id: entries[0].id,
    view: "structured"
  };

  const bdmTone = (score) => {
    if (score == null) return "neutral";
    if (score >= 55) return "bull";
    if (score <= 40) return "bear";
    return "neutral";
  };

  const currentList = () => entries.filter((item) => item.edition === state.edition);

  const pickEntry = () => {
    const list = currentList();
    return list.find((item) => item.id === state.id) || list[0] || entries[0];
  };

  const renderScenarioBar = (scenarios) => {
    if (!scenarios || !scenarios.length) return "";
    return `
      <div class="ia-prob-bar" role="img" aria-label="三情景概率分布">
        ${scenarios.map((s) => `<span class="ia-prob-seg is-${escapeHTML(s.kind)}" style="width:${Math.max(8, Number(s.prob) || 0)}%">${escapeHTML(s.label.replace("情景", ""))} ${escapeHTML(s.prob)}%</span>`).join("")}
      </div>
    `;
  };

  const renderStructured = (entry) => `
    ${entry.highlights?.length ? `
      <details class="ia-highlights">
        <summary>
          <span>核心情报与跨市场快照（${entry.highlights.length} 条）</span>
          <small>点击展开原始要点</small>
        </summary>
        <ol class="ia-highlight-list">
          ${entry.highlights.map((h) => `<li>${escapeHTML(h)}</li>`).join("")}
        </ol>
      </details>
    ` : ""}

    <div class="ia-module-grid">
      <article class="ia-module">
        <div class="ia-module-head"><span>MODULE 01</span><h3>谢林信号真伪过滤</h3></div>
        <ul class="ia-bullet-list">
          ${(entry.schelling || []).map((item) => `
            <li>${item.label ? `<strong>${escapeHTML(item.label)}：</strong>` : ""}${escapeHTML(item.text)}</li>
          `).join("")}
        </ul>
      </article>

      <article class="ia-module">
        <div class="ia-module-head"><span>MODULE 02</span><h3>BDM 权力加权博弈矩阵</h3></div>
        ${entry.bdmMatrix?.scale ? `<p class="ia-scale-note">${escapeHTML(entry.bdmMatrix.scale)}</p>` : ""}
        <div class="ia-table-wrap">
          <table class="ia-table">
            <thead>
              <tr><th>博弈主体</th><th>立场</th><th>权重</th><th>核心利益与动作</th></tr>
            </thead>
            <tbody>
              ${(entry.bdmMatrix?.rows || []).map((row) => `
                <tr>
                  <td><strong>${escapeHTML(row.actor)}</strong></td>
                  <td class="num">${escapeHTML(row.stance)}</td>
                  <td class="num">${escapeHTML(row.weight)}</td>
                  <td>${escapeHTML(row.notes)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${entry.bdmSummary ? `<p class="ia-bdm-note">${escapeHTML(entry.bdmSummary)}</p>` : ""}
      </article>

      <article class="ia-module">
        <div class="ia-module-head"><span>MODULE 03</span><h3>帕特南双层博弈</h3></div>
        <ul class="ia-bullet-list">
          ${(entry.putnam || []).map((item) => `
            <li>${item.label ? `<strong>${escapeHTML(item.label)}：</strong>` : ""}${escapeHTML(item.text)}</li>
          `).join("")}
        </ul>
      </article>

      <article class="ia-module">
        <div class="ia-module-head">
          <span>MODULE 04</span>
          <h3>泰特洛克基准率与三情景概率</h3>
          ${entry.validationWindow ? `<small class="ia-window">验证窗口：${escapeHTML(entry.validationWindow)}</small>` : ""}
        </div>
        ${entry.tetlock?.baseRate ? `<p class="ia-base-rate"><strong>外部基准率：</strong>${escapeHTML(entry.tetlock.baseRate)}</p>` : ""}
        <div class="ia-scenario-list">
          ${(entry.tetlock?.scenarios || []).map((s) => `
            <div class="ia-scenario is-${escapeHTML(s.kind)}">
              <div class="ia-scenario-top">
                <span class="ia-scenario-tag">${escapeHTML(s.label)}</span>
                <strong class="ia-scenario-prob">${escapeHTML(s.prob)}%</strong>
              </div>
              <p class="ia-scenario-title">${escapeHTML(s.headline)}</p>
              ${s.detail ? `<p class="ia-scenario-detail">${escapeHTML(s.detail)}</p>` : ""}
            </div>
          `).join("")}
        </div>
      </article>
    </div>
  `;

  const renderChartView = (entry) => entry.chartWebp ? `
    <div class="ia-chart-panel">
      <div class="ia-chart-toolbar">
        <span>高清研判长图 · ${escapeHTML(entry.date)} ${escapeHTML(entry.editionLabel)}</span>
        <a href="${escapeHTML(entry.chartWebp)}" target="_blank" rel="noopener noreferrer">新标签打开原图 ↗</a>
      </div>
      <figure class="ia-chart-figure">
        <img src="${escapeHTML(entry.chartWebp)}" alt="${escapeHTML(entry.title)}" loading="lazy">
      </figure>
    </div>
  ` : `<p class="unavailable">该期暂未生成高清研判长图，请切换回“结构化四模块”阅读。</p>`;

  const render = () => {
    const entry = pickEntry();
    state.id = entry.id;
    const latestEl = document.querySelector("#interest-latest-date");
    if (latestEl) latestEl.textContent = dataset.latestDate || entry.date || "—";
    const list = currentList();
    const hasAsia = entries.some((e) => e.edition === "asia_morning");
    const hasMarkets = entries.some((e) => e.edition === "markets_daily");
    const tone = bdmTone(entry.bdmScore);
    const scorePct = entry.bdmScore != null ? Math.max(0, Math.min(100, entry.bdmScore)) : 50;

    root.innerHTML = `
      <div class="section-heading ia-heading">
        <span>01 / INTEREST ANALYSIS 2.0</span>
        <h2 id="interest-title">布隆伯格 · 利益分析 2.0（早报 / 晚报）</h2>
        <small class="ia-updated">自动同步：${escapeHTML(dataset.updatedAt || entry.date)}</small>
      </div>

      <div class="ia-controls" role="region" aria-label="利益分析筛选控制">
        <div class="ia-tabs" role="tablist">
          ${hasAsia ? `<button type="button" role="tab" class="ia-tab${state.edition === "asia_morning" ? " is-active" : ""}" data-edition="asia_morning" aria-selected="${state.edition === "asia_morning"}">亚洲早报 · 06:05</button>` : ""}
          ${hasMarkets ? `<button type="button" role="tab" class="ia-tab${state.edition === "markets_daily" ? " is-active" : ""}" data-edition="markets_daily" aria-selected="${state.edition === "markets_daily"}">Markets Daily · 20:10</button>` : ""}
        </div>

        <label class="ia-date-picker">
          <span>历史归档</span>
          <select id="ia-date-select" aria-label="选择历史日期">
            ${list.map((item) => `<option value="${escapeHTML(item.id)}"${item.id === entry.id ? " selected" : ""}>${escapeHTML(item.date)} · BDM ${item.bdmScore ?? "—"}</option>`).join("")}
          </select>
        </label>

        <div class="ia-view-switch" role="group" aria-label="展示模式">
          <button type="button" class="ia-view-btn${state.view === "structured" ? " is-active" : ""}" data-view="structured">结构化四模块</button>
          <button type="button" class="ia-view-btn${state.view === "chart" ? " is-active" : ""}" data-view="chart" ${entry.chartWebp ? "" : "disabled"}>高清研判长图</button>
        </div>
      </div>

      <div class="ia-hero-card">
        <div class="ia-hero-top">
          <div>
            <div class="ia-badges">
              <span class="ia-pill">${escapeHTML(entry.editionLabel)}</span>
              <span class="ia-pill is-muted">${escapeHTML(entry.date)}</span>
              <span class="ia-pill is-muted">${escapeHTML(entry.scheduleLabel)}</span>
            </div>
            <h3 class="ia-entry-title">${escapeHTML(entry.title)}</h3>
            ${entry.snapshot ? `<p class="ia-snapshot">${escapeHTML(entry.snapshot)}</p>` : ""}
          </div>
          <div class="ia-bdm-box is-${tone}">
            <span>BDM 博弈均衡点</span>
            <strong>${entry.bdmScore != null ? escapeHTML(entry.bdmScore.toFixed(1)) : "—"}<small> / 100</small></strong>
            <div class="ia-gauge" aria-hidden="true"><span style="width:${scorePct}%"></span></div>
          </div>
        </div>
        ${renderScenarioBar(entry.tetlock?.scenarios)}
      </div>

      ${state.view === "chart" ? renderChartView(entry) : renderStructured(entry)}
      <p class="ia-footnote">利益分析法 2.0 纯净四模块自动归档（谢林信号 × BDM 矩阵 × 帕特南双层博弈 × 泰特洛克三情景），仅供研究参考，不构成投资建议。</p>
    `;

    root.querySelectorAll("[data-edition]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.edition = btn.dataset.edition;
        const nextList = currentList();
        state.id = nextList[0]?.id || entries[0].id;
        render();
      });
    });

    const select = root.querySelector("#ia-date-select");
    if (select) {
      select.addEventListener("change", () => {
        state.id = select.value;
        render();
      });
    }

    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        render();
      });
    });
  };

  render();
})();
