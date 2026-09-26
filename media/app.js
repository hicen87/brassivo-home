(() => {
  "use strict";
  const data = window.BLOOMBERG_MARKETS_DAILY;
  const target = document.querySelector("#media-content");
  if (!target) return;
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  if (!data) {
    target.innerHTML = '<p class="unavailable">主流媒体焦点尚未核验，暂无可发布的内容。</p>';
    return;
  }

  document.querySelector("#issue-date").textContent = data.issueDate;
  const newsletter = data.newsletter === "Morning Briefing Asia" ? "Morning Briefing Asia" : "Markets Daily";
  const storyCard = (focus, name, scope, kind) => focus ? `
    <article class="source-card ${kind}">
      <div class="source-meta"><span>${name}</span><small>${scope}</small></div>
      <div class="source-date"><span>首页抓取</span><time datetime="${escapeHTML(focus.capturedAt)}">${escapeHTML(focus.capturedAt.slice(0, 16).replace("T", " "))}</time></div>
      <p class="source-summary">${escapeHTML(focus.summary)}</p>
      <ol class="story-list">${focus.stories.map((story) => `
        <li><a href="${escapeHTML(story.url)}" rel="noopener noreferrer" target="_blank"><strong>${escapeHTML(story.title)}</strong><span aria-hidden="true">↗</span></a><p>${escapeHTML(story.summary)}</p></li>
      `).join("")}</ol>
    </article>` : `<article class="source-card ${kind}"><div class="source-meta"><span>${name}</span><small>${scope}</small></div><p class="source-summary">本期首页内容尚未核验，保留待更新状态。</p></article>`;
  const signalCards = (items, tone, label) => items.map((entry) => `
    <article class="signal-card ${tone}"><span>${label} · Brassivo 推演</span><h3>${escapeHTML(entry.title)}</h3><p>${escapeHTML(entry.reason)}</p><small>验证条件：${escapeHTML(entry.condition)}</small></article>
  `).join("");
  const hot = data.mediaFocus?.aihot;
  const signed = value => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
  const change = quote => (quote.close / quote.previousClose - 1) * 100;
  const bilingual = (zh, en) => {
    window.BrassivoLanguage?.addTranslations({ [zh]: en });
    return escapeHTML(zh);
  };
  const marketSummary = story => {
    const link = story.marketLink;
    if (!link) return '<p class="market-summary"><span>股价观察</span> · <span>上市公司关联待核验</span></p>';
    const company = `${escapeHTML(link.company)}${link.ticker ? ` (${escapeHTML(link.ticker)})` : ""}`;
    const mapping = link.relationUrl ? `<a class="market-source" href="${escapeHTML(link.relationUrl)}" target="_blank" rel="noopener noreferrer"><span>公司关联</span> ↗</a>` : "";
    if (link.status !== "listed") return `<div class="market-summary"><p><span>股价观察</span> · ${company} · <span>暂无已核验的直接上市标的</span></p>${mapping}</div>`;
    const quote = hot.market?.quotes?.[link.ticker];
    const benchmark = hot.market?.benchmark;
    if (!quote || !benchmark) return `<div class="market-summary"><p><span>股价观察</span> · ${company} · <span>行情待核验</span></p>${mapping}</div>`;
    const pct = change(quote);
    const relative = pct - change(benchmark);
    const sameWindow = quote.sessionDate === benchmark.sessionDate && quote.previousSessionDate === benchmark.previousSessionDate;
    const eventObserved = link.eventPublishedAt && Date.parse(link.eventPublishedAt) <= Date.parse(quote.previousSessionDate + "T20:00:00Z");
    const move = `${quote.sessionDate} 美股收盘 ${signed(pct)}%`;
    const against = sameWindow ? `；较标普500 ${signed(relative)} 个百分点` : "；大盘比较待核验";
    const notable = sameWindow && Math.abs(relative) >= 2;
    const verdict = notable ? "相对大盘波动明显，值得研究；新闻影响待核验" : !eventObserved ? "新闻时点待核验，暂不确认定价影响" : "单日相对波动有限，继续观察";
    const verdictEN = notable ? "Notable move versus the market; worth investigating, news impact unconfirmed" : !eventObserved ? "News timing unverified; pricing impact unconfirmed" : "Limited relative move over one session; keep watching";
    const sources = quote.sources.map((source, index) => `<a class="market-source" href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer"><span>${index ? "行情复核" : "行情来源"}</span> ↗</a>`).join(" ");
    return `<div class="market-summary${notable ? " notable" : ""}"><p><span>股价观察</span> · <strong>${company}</strong> · ${bilingual(move, `${quote.sessionDate} US close ${signed(pct)}%`)}${bilingual(against, sameWindow ? `; versus S&P 500 ${signed(relative)} percentage points` : "; market comparison unverified")}</p><p class="market-verdict">${bilingual(verdict, verdictEN)}</p><div class="market-links">${sources} ${mapping}</div></div>`;
  };
  const hotCard = hot ? `
    <article class="source-card aihot">
      <div class="source-meta"><span>AIHOT · AI 热点榜</span><small>过去 48 小时 / 讨论热度</small></div>
      <div class="hot-times"><span>榜单更新 <time datetime="${escapeHTML(hot.boardUpdatedAt)}">${escapeHTML(hot.boardUpdatedAt.slice(0, 16).replace("T", " "))}</time></span><span>抓取 <time datetime="${escapeHTML(hot.capturedAt)}">${escapeHTML(hot.capturedAt.slice(0, 16).replace("T", " "))}</time></span></div>
      <p class="hot-note">按 AIHOT 页面显示的热度排序。标题为聚合站的事件描述，热度不是事件真实性或市场影响的评分。</p>
      <p class="market-note">股价观察用于筛选研究线索：比较最近完整交易日与前一交易日收盘，涨跌同时受大盘和其他消息影响，不代表这条新闻已影响定价。</p>
      <ol class="hot-list" style="--hot-rows:${Math.ceil(hot.stories.length / 2)}">${hot.stories.map((story) => `
        <li><span class="hot-rank">${String(story.rank).padStart(2, "0")}</span><div class="hot-story"><a href="${escapeHTML(story.url)}" rel="noopener noreferrer" target="_blank">${escapeHTML(story.title)}<span aria-hidden="true">↗</span></a>${marketSummary(story)}</div><small><span>热度</span> ${escapeHTML(story.heat)}</small></li>
      `).join("")}</ol>
      ${hot.market ? `<p class="market-meta"><span>行情核验 </span>${escapeHTML(hot.market.checkedAt)} · ${hot.market.benchmark.sources.map(source => `<a href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer"><span>大盘来源</span> ↗</a>`).join(" / ")}</p>` : ""}
      <a class="original-link" href="${escapeHTML(hot.sourceUrl)}" rel="noopener noreferrer" target="_blank">查看 AIHOT 完整榜单 ↗</a>
    </article>` : "";

  target.innerHTML = `
    <div class="source-grid">
      <article class="source-card bloomberg">
        <div class="source-meta"><span>Bloomberg</span><small>宏观 / 短期波动</small></div>
        <div class="source-date"><span>原刊</span><time datetime="${escapeHTML(data.issueDate)}">${escapeHTML(data.issueDate)}</time></div>
        <h3>${escapeHTML(data.headline)}</h3>
        <p class="source-summary">${escapeHTML(data.bloombergTake)}</p>
        <a class="original-link" href="${escapeHTML(data.sourceUrl)}" rel="noopener noreferrer" target="_blank">查看 ${newsletter} 原刊 ↗</a>
      </article>
      ${storyCard(data.mediaFocus?.barrons, "Barron’s", "公司 / 个股", "barrons")}
      ${storyCard(data.mediaFocus?.wsj, "The Wall Street Journal", "首页 / 头条", "wsj")}
      ${hotCard}
    </div>
    <details class="judgments">
      <summary><span>02 / BRASSIVO CONDITIONAL VIEW</span><strong>短期条件判断</strong><small>展开查看利多、利空与验证条件</small></summary>
      <p class="judgment-note">以下仅基于 Bloomberg 这期邮件的事实独立推演，不是其他来源的共同观点。</p>
      <div class="signal-grid">${signalCards(data.bullish, "positive", "短期利多")}${signalCards(data.bearish, "negative", "短期利空")}</div>
      <p class="boundary-note">媒体摘要与 AI 热榜均保留各自刊期或抓取时点，不是实时行情；条件判断不自动改变策略基线、资金配比或 EPS 基线。</p>
    </details>
  `;
})();
