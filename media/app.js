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
  const englishCopy = {
    "美伊围绕霍尔木兹海峡重开陷入僵局": "US-Iran talks on reopening the Strait of Hormuz reach an impasse",
    "Bloomberg Morning Briefing Asia 报道，伊朗坚持七日重开霍尔木兹海峡方案，美国总统特朗普此前拒绝该提议，但称本周可能恢复谈判；英国警方逮捕五名涉嫌策划袭击者。简报同时提及中美峰会后台湾政策表态、AI 智能体访问外部网络引发的安全事件，以及中国可能允许部分企业采购英伟达新款芯片。以上为媒体报道摘要；原刊没有给出统一市场涨跌预测。": "Bloomberg Morning Briefing Asia reports that Iran is holding to a seven-day proposal to reopen the Strait of Hormuz. President Trump rejected it but said talks may resume this week; UK police arrested five people suspected of plotting an attack. The briefing also covers Taiwan policy statements after the US-China summit, a security incident involving an AI agent accessing the open internet, and possible Chinese purchases of Nvidia's new chips. This is a media summary; the edition makes no unified market-direction forecast.",
    "若航道恢复，能源运输压力有望缓和": "Energy transport pressure could ease if the waterway reopens",
    "简报称美伊仍可能本周重启谈判；霍尔木兹海峡若恢复通行，可降低能源供应中断风险。": "The briefing says US-Iran talks may resume this week; restored passage through Hormuz could reduce the risk of energy supply disruption.",
    "须观察实际通航、油轮流量与油价风险溢价；谈判破裂或冲突升级将使判断失效。": "Watch actual passage, tanker flows and the oil risk premium; failed talks or escalation would invalidate this view.",
    "中国企业潜在采购英伟达芯片": "Potential Nvidia chip purchases by Chinese companies",
    "简报转述报道称中国可能允许阿里巴巴等企业采购新款 RTX Pro 5500，若落实将带来新增高端算力需求。": "The briefing cites a report that China may allow firms such as Alibaba to buy the new RTX Pro 5500; if realized, this would add high-end computing demand.",
    "该报道仍属“可能”；须核实监管许可、实际订单与交付，若未获批或采购受限则逻辑不成立。": "The report describes a possibility. Verify regulatory approval, orders and delivery; the thesis fails if approval is withheld or purchases are restricted.",
    "AI 云与数据中心需求延续": "Continued AI cloud and data-center demand",
    "简报提到日本开发商转用旧高尔夫球场建设大型太阳能项目，反映数据中心及能源基础设施需求带来的选址压力。": "The briefing notes Japanese developers turning former golf courses into large solar projects, reflecting siting pressure from data-center and energy infrastructure demand.",
    "须看项目融资、并网许可与施工进度；若成本或审批阻碍项目落地，相关需求判断减弱。": "Track financing, grid approvals and construction; cost or permitting barriers would weaken this demand view.",
    "霍尔木兹谈判僵局与能源供应风险": "Hormuz deadlock and energy-supply risk",
    "伊朗未软化重开条件、特朗普已拒绝方案，地缘风险可能推高能源价格及通胀预期。": "Iran has not softened its reopening terms and Trump has rejected the proposal; geopolitical risk could lift energy prices and inflation expectations.",
    "若本周恢复谈判并形成可执行的通航安排，风险溢价可能回落；当前尚未确认协议。": "A resumption of talks and an executable passage arrangement could lower the risk premium; no agreement is confirmed.",
    "海湾安全局势升温": "Rising Gulf security tensions",
    "英国逮捕五名涉嫌策划袭击者，简报称目标涉及美军使用的英国空军基地，事件增加地区安全不确定性。": "UK police arrested five people suspected of plotting an attack near an air base used by the US military, adding regional uncertainty.",
    "关注调查结果与后续安全事件；若未发现更广泛网络且地区冲突降温，风险判断减弱。": "Watch investigation findings and further security events; evidence of no wider network and regional de-escalation would reduce the risk.",
    "中国消费与科技资源分化": "Widening divide between Chinese consumption and technology",
    "简报称中国消费股长期表现受压，资本更多流向科技和 AI，内需传导有限；若持续，消费复苏相关预期或承压。": "The briefing says Chinese consumer shares remain under pressure as capital flows to technology and AI, with limited spillover to domestic demand; this could weigh on recovery expectations.",
    "观察居民消费、企业收入和政策传导；若需求改善并扩散至消费企业，该判断失效。": "Watch household spending, company revenue and policy transmission; broader demand gains across consumer firms would invalidate this view.",
    "消费品牌押注纸瓶包装": "Consumer brands bet on paper bottles",
    "首页报道百事、帝亚吉欧等品牌关注纸瓶方案，背景是塑料法规趋严和回收推动。": "The homepage reports that brands including PepsiCo and Diageo are exploring paper bottles amid tighter plastic rules and recycling efforts.",
    "生物科技牛市中的 16 只关注标的": "16 stocks to watch in biotech's bull market",
    "Barron’s 圆桌受访者认为医学进展与并购活动带动生物科技股走强，并列出 16 只个股。": "Barron's roundtable guests say medical advances and deal activity are lifting biotech shares, and highlight 16 stocks.",
    "AI 不会摧毁就业市场？": "AI may not destroy the job market",
    "首页摘要引用新研究称 AI 正在创造岗位，而非消灭白领工作；这是该报道的观点，不代表已验证的长期结果。": "The homepage cites research suggesting AI is creating roles rather than eliminating white-collar jobs; this is the article's view, not a proven long-term outcome.",
    "7% 按揭利率为何更难承受": "Why 7% mortgage rates hurt more",
    "Barron’s 指出，按若干指标衡量，如今购房负担能力处于上世纪八十年代末以来低位。": "Barron's says home affordability is at its weakest since the late 1980s by some measures.",
    "伊朗被要求作出核让步以重启和谈": "Iran pressed for nuclear concessions to revive peace talks",
    "首页报道称，调停方提出这项难度较高的方案，目标是在特朗普拒绝七日停火后避免全面战争。": "The homepage says mediators proposed the long-shot plan to avert all-out war after Trump rejected a seven-day truce.",
    "英国逮捕五名涉嫌策划袭击者": "UK arrests five suspected of plotting an attack",
    "WSJ 首页称，五人在一处供美军使用的英国空军基地附近被捕。": "The WSJ homepage says five people were arrested near a UK air base used by the US military.",
    "埃及曾在 10 月 7 日前警告内塔尼亚胡": "Egypt warned Netanyahu before Oct. 7",
    "首页报道该警告为以色列国内政治争论增添新材料，报道提及其对内塔尼亚胡的指责。": "The homepage says the warning adds to domestic Israeli debate and claims that Netanyahu ignored signs.",
    "一家初创公司用 AI 防范未来 AI 病原体": "A startup uses AI to prepare for future AI pathogens",
    "WSJ 独家称，Red Queen Bio 正用 AI 设计抗体药物，以应对未来可能出现的新型病原体。": "The WSJ exclusive says Red Queen Bio is using AI to design antibody drugs against potential novel pathogens.",
    "OpenAI 一款 AI 智能体 6 月未经授权侵入澳大利亚政府网站，访问公共和非公共文件": "AIHOT: OpenAI agent reportedly accessed Australian government sites without authorization in June",
    "OpenAI DevDay 倒计时72小时，发布者称一直在构建并将展示成果": "AIHOT: OpenAI DevDay countdown reaches 72 hours; the poster says a reveal is coming",
    "Opus 5.5发布：沟通更好、每token价格低于Opus 5.0、具Fable 5.1的智能，现已在Claude Code可用": "AIHOT: Opus 5.5 announced with communication and pricing claims; available in Claude Code",
    "Fireworks Research 发布基于 Kimi K3 的专用模型 Ember-1，以 Research Preview 在 Serverless 上线": "AIHOT: Fireworks Research launches Kimi K3-based Ember-1 as a serverless research preview",
    "Google Flow 上 Nano Banana 2.5 Flash 参考版本被改为 Nano Banana 2.1": "AIHOT: Google Flow changes the Nano Banana 2.5 Flash reference to Nano Banana 2.1",
    "特朗普计划与Anthropic CEO达里奥·阿莫迪在白宫举行首次一对一私下晚餐": "AIHOT: Trump plans a private one-on-one White House dinner with Anthropic CEO Dario Amodei",
    "OpenAI发布GPT-6 Sol，价格较GPT-5.6 Sol减半至$2/$10每百万tokens；AA测试显示智力指数持平、编码代理指数57分升2分，幻觉率由92%降至60%": "AIHOT: OpenAI announces GPT-6 Sol and reports pricing and benchmark changes",
    "OpenAI公布安全事件调查并暂停最先进模型训练、评估及工具使用推理": "AIHOT: OpenAI reports a safety investigation and pauses advanced-model training and evaluations",
    "Meta 9月8日上线AI智能体Muse，基础版免费并提供每月20/100美元订阅，目前仅面向美加用户": "AIHOT: Meta launches Muse agent in the US and Canada with free and paid plans",
    "MiniMax 宣布最新文本模型 M3.1-Flash-Preview 上线 MiniMax Code 平台": "AIHOT: MiniMax launches M3.1-Flash-Preview on MiniMax Code"
  };
  const bilingual = (zh, en) => {
    window.BrassivoLanguage?.addTranslations({ [zh]: en });
    return escapeHTML(zh);
  };
  const translated = zh => englishCopy[zh] ? bilingual(zh, englishCopy[zh]) : escapeHTML(zh);
  const storyCard = (focus, name, scope, kind) => focus ? `
    <article class="source-card ${kind}">
      <div class="source-meta"><span>${name}</span><small>${scope}</small></div>
      <div class="source-date"><span>首页抓取</span><time datetime="${escapeHTML(focus.capturedAt)}">${escapeHTML(focus.capturedAt.slice(0, 16).replace("T", " "))}</time></div>
      <p class="source-summary">${escapeHTML(focus.summary)}</p>
      <ol class="story-list">${focus.stories.map((story) => `
        <li><a href="${escapeHTML(story.url)}" rel="noopener noreferrer" target="_blank"><strong>${translated(story.title)}</strong><span aria-hidden="true">↗</span></a><p>${translated(story.summary)}</p></li>
      `).join("")}</ol>
    </article>` : `<article class="source-card ${kind}"><div class="source-meta"><span>${name}</span><small>${scope}</small></div><p class="source-summary">本期首页内容尚未核验，保留待更新状态。</p></article>`;
  const signalCards = (items, tone, label) => items.map((entry) => `
    <article class="signal-card ${tone}"><span>${label} · Brassivo 推演</span><h3>${translated(entry.title)}</h3><p>${translated(entry.reason)}</p><small>验证条件：${translated(entry.condition)}</small></article>
  `).join("");
  const hot = data.mediaFocus?.aihot;
  const signed = value => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
  const change = quote => (quote.close / quote.previousClose - 1) * 100;
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
    return `<div class="market-summary${notable ? " notable" : ""}"><p><span>股价观察</span> · <strong>${company}</strong> · <span>${bilingual(move, `${quote.sessionDate} US close ${signed(pct)}%`)}</span><span>${bilingual(against, sameWindow ? `; versus S&P 500 ${signed(relative)} percentage points` : "; market comparison unverified")}</span></p><p class="market-verdict">${bilingual(verdict, verdictEN)}</p><div class="market-links">${sources} ${mapping}</div></div>`;
  };
  const hotCard = hot ? `
    <article class="source-card aihot">
      <div class="source-meta"><span>AIHOT · AI 热点榜</span><small>过去 48 小时 / 讨论热度</small></div>
      <div class="hot-times"><span>榜单更新 <time datetime="${escapeHTML(hot.boardUpdatedAt)}">${escapeHTML(hot.boardUpdatedAt.slice(0, 16).replace("T", " "))}</time></span><span>抓取 <time datetime="${escapeHTML(hot.capturedAt)}">${escapeHTML(hot.capturedAt.slice(0, 16).replace("T", " "))}</time></span></div>
      <p class="hot-note">按 AIHOT 页面显示的热度排序。标题为聚合站的事件描述，热度不是事件真实性或市场影响的评分。</p>
      <p class="market-note">股价观察用于筛选研究线索：比较最近完整交易日与前一交易日收盘，涨跌同时受大盘和其他消息影响，不代表这条新闻已影响定价。</p>
      <ol class="hot-list">${hot.stories.map((story) => `
        <li><span class="hot-rank">${String(story.rank).padStart(2, "0")}</span><div class="hot-story"><a href="${escapeHTML(story.url)}" rel="noopener noreferrer" target="_blank">${translated(story.title)}<span aria-hidden="true">↗</span></a>${marketSummary(story)}</div><small><span>热度</span> ${escapeHTML(story.heat)}</small></li>
      `).join("")}</ol>
      ${hot.market ? `<p class="market-meta"><span>行情核验 </span>${escapeHTML(hot.market.checkedAt)} · ${hot.market.benchmark.sources.map(source => `<a href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer"><span>大盘来源</span> ↗</a>`).join(" / ")}</p>` : ""}
      <a class="original-link" href="${escapeHTML(hot.sourceUrl)}" rel="noopener noreferrer" target="_blank">查看 AIHOT 完整榜单 ↗</a>
    </article>` : "";

  target.innerHTML = `
    <div class="source-group"><h3 class="group-title">宏观焦点</h3>
    <div class="source-grid">
      <article class="source-card bloomberg">
        <div class="source-meta"><span>Bloomberg</span><small>宏观 / 短期波动</small></div>
        <div class="source-date"><span>原刊</span><time datetime="${escapeHTML(data.issueDate)}">${escapeHTML(data.issueDate)}</time></div>
        <h3>${translated(data.headline)}</h3>
        <p class="source-summary">${translated(data.bloombergTake)}</p>
        <a class="original-link" href="${escapeHTML(data.sourceUrl)}" rel="noopener noreferrer" target="_blank">查看 ${newsletter} 原刊 ↗</a>
      </article>
      ${storyCard(data.mediaFocus?.wsj, "The Wall Street Journal", "宏观 / 政策与经济", "wsj")}
    </div></div>
    <div class="source-group"><h3 class="group-title">公司与产业</h3>
    <div class="source-grid">
      ${storyCard(data.mediaFocus?.barrons, "Barron’s", "公司 / 个股", "barrons")}
      ${hotCard}
    </div></div>
    <details class="judgments">
      <summary><span>02 / BRASSIVO CONDITIONAL VIEW</span><strong>短期条件判断</strong><small>展开查看利多、利空与验证条件</small></summary>
      <p class="judgment-note">以下仅基于 Bloomberg 这期邮件的事实独立推演，不是其他来源的共同观点。</p>
      <div class="signal-grid">${signalCards(data.bullish, "positive", "短期利多")}${signalCards(data.bearish, "negative", "短期利空")}</div>
      <p class="boundary-note">媒体摘要与 AI 热榜均保留各自刊期或抓取时点，不是实时行情；条件判断不自动改变策略基线、资金配比或 EPS 基线。</p>
    </details>
  `;
})();
