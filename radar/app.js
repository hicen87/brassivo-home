(() => {
  const root = document.querySelector("#radar-root");
  const dateEl = document.querySelector("#radar-date");
  if (!root) return;

  const dataset = window.BRASSIVO_RADAR_DATA;
  if (!dataset || !Array.isArray(dataset.weeks) || !dataset.weeks.length) {
    root.innerHTML = `<p class="unavailable">暂无已发布的六大核心美股周度快照。</p>`;
    return;
  }

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const weeks = dataset.weeks;
  const initialHash = (window.location?.hash || "").replace(/^#/, "").toUpperCase();
  const state = {
    weekIndex: 0,
    selectedTicker: initialHash || weeks[0].stocks[0]?.ticker || ""
  };

  const verdictClass = (v) => {
    if (!v) return "verdict-neutral";
    if (v.includes("多")) return "verdict-bull";
    if (v.includes("空")) return "verdict-bear";
    return "verdict-neutral";
  };

  const tierClass = (tier) => {
    if (tier === "第一梯队") return "tier-1";
    if (tier === "第二梯队") return "tier-2";
    return "tier-3";
  };

  const zoneClass = (zone) => {
    if (!zone) return "";
    if (zone.includes("高性价比")) return "is-high";
    if (zone.includes("合理")) return "is-fair";
    if (zone.includes("偏贵") || zone.includes("透支") || zone.includes("高估")) return "is-expensive";
    return "";
  };

  const renderDetail = (stock) => {
    if (!stock) return "";
    return `
      <section class="detail-card" id="stock-detail" aria-labelledby="detail-title">
        <div class="detail-head">
          <div>
            <span class="tier-pill ${tierClass(stock.tier)}">#${escapeHTML(stock.rank)} · ${escapeHTML(stock.tier)}</span>
            <h3 id="detail-title">${escapeHTML(stock.name)}（${escapeHTML(stock.ticker)}）</h3>
          </div>
          <div class="detail-scores">
            <div class="detail-score-box">
              <span>四维加权得分</span>
              <strong>${stock.fourDimScore != null ? escapeHTML(stock.fourDimScore.toFixed(1)) : "—"}<small class="verdict-tag ${verdictClass(stock.fourDimVerdict)}">${escapeHTML(stock.fourDimVerdict || "—")}</small></strong>
            </div>
            <div class="detail-score-box">
              <span>BDM 博弈均衡</span>
              <strong>${stock.bdmScore != null ? escapeHTML(stock.bdmScore.toFixed(1)) : "—"}<small class="verdict-tag ${verdictClass(stock.bdmVerdict)}">${escapeHTML(stock.bdmVerdict || "—")}</small></strong>
            </div>
          </div>
        </div>

        ${stock.overboughtWarning ? `<div class="overbought-banner" role="alert">${escapeHTML(stock.overboughtWarning)}</div>` : ""}
        ${stock.positioning ? `<div class="positioning-box"><strong>核心定位：</strong>${escapeHTML(stock.positioning)}</div>` : ""}

        <div class="metric-grid">
          ${(stock.metrics || []).map((m) => `
            <div class="metric-box">
              <span>${escapeHTML(m.label)}</span>
              <strong>${escapeHTML(m.value)}</strong>
            </div>
          `).join("")}
        </div>

        ${stock.strikeZones?.length ? `
          <h4 class="sub-heading">三档击球区与 10% 折现率估值锚${stock.impliedReturn ? `（核心回报 ${escapeHTML(stock.impliedReturn)}）` : ""}</h4>
          <div class="zones-grid">
            ${stock.strikeZones.map((z) => `
              <div class="zone-card is-${escapeHTML(z.tier)}">
                <strong>${escapeHTML(z.label)}</strong>
                <p>${escapeHTML(z.detail)}</p>
              </div>
            `).join("")}
          </div>
        ` : ""}

        <div class="two-col">
          <div class="panel-box">
            <h4>四维加权量化评分卡</h4>
            <ul class="dim-list">
              ${(stock.fourDimBreakdown || []).map((d) => `
                <li><strong>${escapeHTML(d.dim)}：</strong><span>${escapeHTML(d.detail)}</span></li>
              `).join("")}
            </ul>
          </div>

          <div class="panel-box">
            <h4>利益分析法 2.0 · BDM 权力加权矩阵</h4>
            <ul class="dim-list">
              ${(stock.bdmPlayers || []).map((p) => `
                <li><strong>${escapeHTML(p.actor)}：</strong><span>${escapeHTML(p.detail)}</span></li>
              `).join("")}
            </ul>
          </div>
        </div>

        ${stock.scenarios?.length ? `
          <h4 class="sub-heading">帕特南双层博弈与三情景概率</h4>
          <div class="scenario-grid">
            ${stock.scenarios.map((s) => `
              <div class="scen-card is-${escapeHTML(s.kind)}">
                <strong>${s.prob ? `${escapeHTML(s.prob)}%` : "情景推演"}</strong>
                <span>${escapeHTML(s.text)}</span>
              </div>
            `).join("")}
          </div>
        ` : ""}

        ${stock.sections?.length ? `
          <div class="full-sections">
            <h4 class="sub-heading">完整全景研判模块（点击展开逐项复核）</h4>
            ${stock.sections.map((sec, idx) => `
              <details${idx < 2 ? " open" : ""}>
                <summary>${escapeHTML(sec.heading)}</summary>
                <div class="sec-body">
                  ${(sec.blocks || []).map((b) => `<p>${escapeHTML(b)}</p>`).join("")}
                </div>
              </details>
            `).join("")}
          </div>
        ` : ""}
      </section>
    `;
  };

  const render = () => {
    const week = weeks[state.weekIndex] || weeks[0];
    if (dateEl) dateEl.textContent = week.date;

    const stocks = week.stocks || [];
    const active = stocks.find((s) => s.ticker === state.selectedTicker) || stocks[0];
    if (active) state.selectedTicker = active.ticker;

    const bullCount = stocks.filter((s) => (s.fourDimVerdict || "").includes("多")).length;
    const warnCount = stocks.filter((s) => Boolean(s.overboughtWarning)).length;
    const topStock = stocks[0];

    root.innerHTML = `
      <div class="radar-toolbar">
        <label class="radar-week-picker">
          <span>周度快照归档</span>
          <select id="week-select" aria-label="选择周度快照">
            ${weeks.map((w, i) => `<option value="${i}"${i === state.weekIndex ? " selected" : ""}>${escapeHTML(w.date)}（${escapeHTML(w.stockCount)} 只核心美股）</option>`).join("")}
          </select>
        </label>
        <div class="radar-meta-pills">
          ${week.benchmark10Y ? `<span>10Y 美债基准：${escapeHTML(week.benchmark10Y)}</span>` : ""}
          <span>自动同步：${escapeHTML(dataset.updatedAt || week.date)}</span>
        </div>
      </div>

      <div class="kpi-strip">
        <div class="kpi-card"><span>核心覆盖标的</span><strong>${escapeHTML(stocks.length)}</strong><small>周六 08:30 自动刷新</small></div>
        <div class="kpi-card"><span>四维评级看多</span><strong>${escapeHTML(bullCount)} / ${escapeHTML(stocks.length)}</strong><small>综合得分 ≥ 65 为看多</small></div>
        <div class="kpi-card"><span>本期价值榜首</span><strong>${topStock ? escapeHTML(topStock.ticker) : "—"}</strong><small>${topStock ? `四维 ${escapeHTML(topStock.fourDimScore)} · BDM ${escapeHTML(topStock.bdmScore)}` : ""}</small></div>
        <div class="kpi-card${warnCount > 0 ? " is-warn" : ""}"><span>RSI ≥ 70 超买警示</span><strong>${escapeHTML(warnCount)}</strong><small>${warnCount > 0 ? stocks.filter((s) => s.overboughtWarning).map((s) => escapeHTML(s.ticker)).join(" / ") : "全周期暂无超买红灯"}</small></div>
      </div>

      <div class="section-heading">
        <span>01 / VALUE RANKING</span>
        <h2>综合投资价值排序表</h2>
        <small>点击任意一行切换下方全景研判</small>
      </div>

      <div class="ranking-wrap">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>梯队</th>
              <th>标的</th>
              <th>SA 现价</th>
              <th>核心 PE / PB</th>
              <th>ROIC</th>
              <th>四维得分</th>
              <th>BDM 均衡</th>
              <th>当前击球区 / 警示</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${stocks.map((s) => {
              const isSel = active && s.ticker === active.ticker;
              const sc = s.fourDimScore ?? 0;
              return `
                <tr class="${isSel ? "is-selected" : ""}" data-ticker="${escapeHTML(s.ticker)}">
                  <td class="rank-num">#${escapeHTML(s.rank)}</td>
                  <td><span class="tier-pill ${tierClass(s.tier)}">${escapeHTML(s.tier)}</span></td>
                  <td class="stock-cell"><strong>${escapeHTML(s.ticker)}</strong><small>${escapeHTML(s.name)}</small></td>
                  <td class="num"><strong>${escapeHTML(s.price)}</strong></td>
                  <td class="num">${escapeHTML(s.pe)}</td>
                  <td class="num">${escapeHTML(s.roic)}</td>
                  <td>
                    <div class="score-pill">${s.fourDimScore != null ? escapeHTML(s.fourDimScore.toFixed(1)) : "—"} <span class="verdict-tag ${verdictClass(s.fourDimVerdict)}">${escapeHTML(s.fourDimVerdict || "—")}</span></div>
                    <div class="score-bar${sc < 68 ? " is-mid" : ""}" aria-hidden="true"><span style="width:${Math.min(100, Math.max(0, sc))}%"></span></div>
                  </td>
                  <td class="num"><strong>${s.bdmScore != null ? escapeHTML(s.bdmScore.toFixed(1)) : "—"}</strong> <small>${escapeHTML(s.bdmVerdict || "")}</small></td>
                  <td>
                    <span class="zone-tag ${zoneClass(s.currentZone)}">${escapeHTML(s.currentZone)}</span>
                    ${s.overboughtWarning ? `<br><span class="warn-badge">⚠️ RSI 超买警示</span>` : ""}
                  </td>
                  <td><button type="button" class="inspect-btn">${isSel ? "正在查看" : "展开全景"}</button></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div class="section-heading">
        <span>02 / PANORAMIC DOSSIER</span>
        <h2>个股全景研判详情</h2>
        <small>五步慢变量 × DCF 折现率 × 利益分析法 2.0</small>
      </div>

      ${renderDetail(active)}
    `;

    const sel = root.querySelector("#week-select");
    if (sel) {
      sel.addEventListener("change", () => {
        state.weekIndex = Number(sel.value) || 0;
        render();
      });
    }

    root.querySelectorAll("tr[data-ticker]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedTicker = row.dataset.ticker;
        if (window.history?.replaceState) {
          window.history.replaceState(null, "", `#${state.selectedTicker}`);
        }
        render();
        const detail = document.querySelector("#stock-detail");
        if (detail?.scrollIntoView) {
          detail.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  };

  render();
})();
