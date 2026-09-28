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
    "MiniMax 宣布最新文本模型 M3.1-Flash-Preview 上线 MiniMax Code 平台": "AIHOT: MiniMax launches M3.1-Flash-Preview on MiniMax Code",
    "英伟达发布 AI 智能体安全平台": "Nvidia launches an AI-agent security platform",
    "吉利千里浩瀚辅助驾驶搭载量突破 100 万辆": "Geely's G-ASD driver-assistance system surpasses one million installations",
    "黄仁勋与辛顿就 AI 风险公开交锋": "Jensen Huang and Geoffrey Hinton publicly clash over AI risk",
    "米哈游谈 AI 大模型投入与发展目标": "miHoYo discusses AI-model investment and ambitions",
    "OpenAI 智能体曾未经授权访问澳大利亚政府网站文件": "OpenAI agent reportedly accessed Australian government files without authorization",
    "16 岁研究员借助 AI 发现微软 Titan 平台漏洞": "Teen researcher uses AI to find a vulnerability in Microsoft's Titan platform",
    "Google Android Dev Summit 2026 首次提及 Android 18": "Android 18 is mentioned for the first time at Google Android Dev Summit 2026",
    "酷派发布 699 元起 AI 智能眼镜": "Coolpad launches AI glasses starting at RMB 699",
    "极摩客发布搭载 AMD 芯片的桌面 AI 超算": "GMKtec launches a desktop AI system with an AMD chip",
    "微软澄清 Windows 11 缩略图缓存隐私传言": "Microsoft addresses a Windows 11 thumbnail-cache privacy rumor",
    "AI 安全平台发布不等于新增订单或收入；观察客户部署和后续采购。": "A security-platform launch does not establish new orders or revenue; watch customer deployment and follow-on purchases.",
    "系统搭载规模扩大，不代表软件收入同步增长；观察付费率、车型覆盖和交付。": "A larger installation base does not prove software revenue growth; watch paid uptake, model coverage and deliveries.",
    "观点分歧没有披露订单、监管变化或算力采购，不能据此推导行业收入。": "The public disagreement disclosed no orders, policy changes or compute purchases and does not establish industry revenue.",
    "管理层投入意愿并非已落地模型或采购；暂未核验到明确的公开上市供应链关系。": "Stated investment intent is not a deployed model or a purchase; no clear public-company supply-chain link is verified.",
    "安全事件指向部署与合规风险，尚无足够证据連结上市供应商的订单或利润。": "The incident raises deployment and compliance risks, but evidence is insufficient to link it to a listed supplier's orders or profits.",
    "微软平台漏洞的修复或赏金本身不构成新增收入或供应商需求。": "Fixing a Microsoft platform vulnerability or paying a bounty does not itself create revenue or supplier demand.",
    "大会议程预告不等于新功能订单或变现，硬件传导暂不明确。": "A conference agenda is not an order or monetization, and hardware spillover is unclear.",
    "产品发布及起售价不证明销量、毛利或持续需求；观察发货与财报。": "A product launch and starting price do not prove sales, margins or sustained demand; watch shipments and results.",
    "產品配置中的 AMD 处理器不证明实际出货或收入增量，暂列方向待确认。": "An AMD processor in a product configuration does not prove shipments or incremental revenue; direction remains unconfirmed.",
    "微软对隐私传言的说明暂无明确营收或供应链传导。": "Microsoft's response to a privacy rumor has no clear revenue or supply-chain transmission.",
    "美国债券市场逼近经济预警信号": "Bond market nears a warning signal for the economy",
    "Bloomberg Markets Daily 报道，美国 10 年期与 2 年期国债收益率利差上周盘中一度收窄至 0.17 个百分点；若转为倒挂，可能反映市场担忧紧缩压制经济，但该指标此前也曾失准。简报还称，伊朗提议被拒后油价上涨、国债抛售重启；美中公布约 600 亿美元商品的关税下调细节；本周美国 PCE 通胀与就业数据可能影响下月利率预期。以上为媒体报道摘要，原刊未给出统一市场涨跌预测。": "Bloomberg Markets Daily reports that the 10-year/2-year Treasury spread narrowed intraday to 0.17 percentage point last week. An inversion could signal concern that tight policy is weighing on growth, though the indicator has also failed before. The briefing says oil rose and Treasury selling resumed after Iran's proposal was rejected; the US and China detailed tariff cuts on about $60 billion of goods; and US PCE inflation and jobs data this week may shape rate expectations for next month. This is a media summary; the edition makes no unified market-direction forecast.",
    "美债收益率曲线接近倒挂": "Treasury yield curve nears inversion",
    "10 年与 2 年期利差盘中曾收窄至 0.17 个百分点；倒挂历史上领先多次衰退，但近年预测表现并非始终可靠。": "The 10-year/2-year spread narrowed intraday to 0.17 percentage point. Inversions preceded many recessions historically, but the signal has not always proved reliable in recent years.",
    "伊朗提案被拒后油价与债券收益率走高": "Oil and bond yields rise after Iran proposal rejected",
    "简报称美国拒绝伊朗重开霍尔木兹海峡提案后，油价上涨，国债抛售重启，风险资产期货走弱。": "The briefing says oil rose and Treasury selling resumed after the US rejected Iran's proposal to reopen the Strait of Hormuz, while risk-asset futures weakened.",
    "美中公布商品关税下调细节": "US and China detail tariff cuts on goods",
    "双方公布约 600 亿美元商品的关税下调安排，包括中国玩具和美国煤炭；简报未称全部措施已完成实施。": "The sides detailed tariff cuts on about $60 billion of goods, including Chinese toys and US coal; the briefing did not say all measures had been implemented.",
    "本周通胀与就业数据影响利率预期": "Inflation and jobs data this week may shape rate expectations",
    "市场关注周三美国 PCE 通胀与周五就业报告，以判断下月美联储利率行动预期。": "Markets are watching Wednesday's US PCE inflation report and Friday's jobs report for clues to next month's Fed decision.",
    "AI 股票情绪两周内剧烈摆动": "AI stock sentiment swings sharply over two weeks",
    "简报称 AI 相关股票近期在安全担忧与订阅价值乐观之间反复波动，美光业绩将提供算力支出线索。": "The briefing says AI-related stocks have swung between safety fears and optimism about subscription value; Micron's results may offer clues about computing demand.",
    "若贸易关税下调落地，相关成本压力或缓和": "Implemented tariff cuts could ease related cost pressure",
    "简报称美中公布约 600 亿美元商品的关税下调方案，覆盖中国玩具和美国煤炭。": "The briefing says the US and China detailed tariff cuts on about $60 billion of goods, including Chinese toys and US coal.",
    "需核实实施清单、时间和贸易流量；若执行延后、范围缩小或谈判再度恶化，判断失效。": "Verify the implementation list, timing and trade flows; delays, a narrower scope or renewed tensions would invalidate this view.",
    "若通胀数据缓和，利率预期可能降温": "Softer inflation could cool rate expectations",
    "本周 PCE 与就业数据将影响市场对美联储下月行动的判断；较温和数据可能缓和紧缩预期。": "This week's PCE and jobs data will shape views of next month's Fed decision; softer readings could ease expectations for tighter policy.",
    "数据尚未公布；观察核心 PCE、就业与债券收益率，若价格压力加速或就业仍强则逻辑减弱。": "The data are not yet out. Watch core PCE, jobs and Treasury yields; accelerating price pressure or continued job strength would weaken the thesis.",
    "收益率曲线逼近倒挂，经济担忧升温": "Yield curve nears inversion, raising growth concerns",
    "10 年与 2 年期利差曾缩至 0.17 个百分点；倒挂历史上领先多次衰退，但不能单独确认衰退。": "The 10-year/2-year spread narrowed to 0.17 percentage point; inversions preceded many recessions but cannot confirm one on their own.",
    "观察利差是否持续倒挂及就业、消费和企业数据；若增长保持韧性、利差回升，风险判断减弱。": "Watch for a sustained inversion alongside jobs, consumer and business data; resilient growth and a steeper curve would weaken the risk case.",
    "油价上涨与国债抛售叠加": "Rising oil prices coincide with Treasury selling",
    "伊朗重开霍尔木兹方案遭拒后油价上行，简报称美国国债抛售重启，可能同时推高通胀与融资压力。": "Oil rose after Iran's Hormuz proposal was rejected, and the briefing says Treasury selling resumed, potentially adding to inflation and financing pressure.",
    "关注实际通航、原油供应及长短端收益率；若谈判缓和、油价回落且收益率稳定，该判断失效。": "Watch shipping, oil supply and short- and long-term yields; easing talks, lower oil and stable yields would invalidate this view.",
    "AI 股票情绪反复，资本开支验证临近": "AI stocks swing as spending expectations face a test",
    "简报称资金近两周在 AI 恐慌与乐观之间大幅摆动，市场将关注美光业绩对算力投资预期的验证。": "The briefing says money has swung sharply between AI fears and optimism over the past two weeks; markets will look to Micron's results to test computing-spend expectations.",
    "对照美光业绩、管理层展望和后续订单；若需求与利润兑现则风险减弱，若指引下修则压力加大。": "Compare Micron's results, outlook and subsequent orders; realized demand and profits would ease the risk, while weaker guidance would add pressure.",
    "小盘股开始遇阻，投资者考虑转向更小公司": "Small caps struggle as investors consider going smaller",
    "首页称，偏好小盘股的投资者可考虑进一步聚焦微型公司；具体策略细节未在首页展开。": "The homepage says investors seeking small-cap exposure could consider focusing further on microcaps; it did not provide strategy details.",
    "Sandisk、Marvell 等 AI 股票下跌": "SanDisk, Marvell and other AI stocks fall",
    "首页标题将多只 AI 相关股票走弱与 OpenAI 引发的安全担忧并列；未展示进一步因果细节。": "The homepage pairs weakness in several AI-related stocks with safety concerns involving OpenAI; it provides no further causal detail.",
    "英伟达股价与芯片股走势分化": "Nvidia stock diverges from the chip slump",
    "首页聚焦英伟达在芯片股疲弱背景下的股价表现，并列出三项解释；详情以原文为准。": "The homepage focuses on Nvidia's stock performance against weakness in chip shares and lists three possible explanations; see the article for details.",
    "生物科技创新推动新一轮牛市？": "Innovation drives a new biotech bull market?",
    "首页称医学进展与并购活动提振生物科技股，并列出圆桌专家关注的 16 个标的。": "The homepage says medical advances and deal activity are lifting biotech shares and highlights 16 picks from its roundtable.",
    "五只可能受益于 Meta Muse 的股票": "Five stocks that could benefit from Meta Muse",
    "首页新闻简报栏目列出五只可能受益于 Meta Muse 的股票；具体公司与传导依据未在首页展示。": "The homepage newsletter section lists five stocks that could benefit from Meta Muse; it does not show the companies or transmission case.",
    "Brookfield 盈利增长记录突出，估值受关注": "Brookfield's profit growth record draws attention to valuation",
    "首页称该另类资产管理公司当前估值约为近期资产价值估算的 55%。": "The homepage says the alternative-asset manager is valued at about 55% of a recent estimate of its asset value.",
    "SPS Commerce 软件管理零售供应链": "SPS Commerce software manages retail supply chains",
    "首页标题称这家供应链软件公司的股票或有较大上行空间；首页未展示支撑细节。": "The homepage headline suggests substantial upside for the supply-chain software company; supporting details were not shown.",
    "EchoStar 的资产价值与 SpaceX 关联受关注": "EchoStar's asset value and SpaceX connection draw attention",
    "首页股票精选栏目列出 EchoStar 及其 SpaceX 相关资产因素；具体估值分析未在首页展示。": "The homepage stock-picks section highlights EchoStar and a SpaceX-related asset; no valuation detail was shown.",
    "Costco 盈利超预期仍未提振股价": "Costco's earnings beat fails to lift the stock",
    "首页称 Costco 会员收入增速连续第三季放缓；会费收入同比增长 7.3% 至 15 亿美元。": "The homepage says Costco's membership-revenue growth slowed for a third straight quarter; fee revenue rose 7.3% year over year to $1.5 billion.",
    "BlackBerry 强劲业绩由汽车软件带动": "BlackBerry's strong results are driven by car software",
    "首页列出第二财季每股收益 7 美分、销售额 1.633 亿美元，均高于华尔街预期。": "The homepage lists second-quarter earnings of 7 cents a share and revenue of $163.3 million, both above Wall Street expectations.",
    "Everpure 成为标普 500 当日表现最佳股票": "Everpure becomes the S&P 500's top performer for the day",
    "首页称数据存储公司表示 2028 财年营收增长将继续加速，股价随之上涨。": "The homepage says the data-storage company expects revenue growth to accelerate further in fiscal 2028, lifting its shares.",
    "Darden 下调业绩，Olive Garden 增长放慢": "Darden earnings fall as Olive Garden growth slows",
    "首页称 Darden 报告盈利下滑；食品与劳动力成本上升、Olive Garden 增长放缓。": "The homepage says Darden reported lower earnings amid higher food and labor costs and slower growth at Olive Garden.",
    "特朗普政策反噬，利率与通胀走高": "Trump's policies backfire, pushing rates and inflation higher",
    "WSJ 首页称，总统自身议程削弱了控制经济与赤字的承诺，并推高利率和通胀。": "The WSJ homepage says the president's own agenda undermined promises to fix the economy and control the deficit, while pushing up rates and inflation.",
    "伊朗被施压作出核让步以恢复和谈": "Iran pressed for nuclear concessions to revive peace talks",
    "调停方提出较难实现的方案，试图在特朗普拒绝七日停火后避免全面战争。": "Mediators proposed a long-shot plan to avert all-out war after Trump rejected a seven-day truce.",
    "英国调查基地附近疑似恐怖袭击与伊朗关联": "UK probes possible Iran link to suspected plot near a base",
    "调查人员称，五名英国公民在供美军使用的费尔福德基地附近被捕。": "Investigators said five UK nationals were arrested near Fairford, a base used by US forces.",
    "投资人士讨论收益率上行与债券交易": "Investors weigh rising yields and bond trades",
    "首页摘要提到，BlackRock 的 Rick Rieder 认为债券存在机会，Ray Dalio 则建议谨慎。": "The homepage says BlackRock's Rick Rieder sees opportunity in bonds, while Ray Dalio recommends caution.",
    "伊朗停火提案遭拒，油价与收益率走高": "Rejected Iran truce proposal sends oil and yields higher",
    "WSJ 实时市场页面将油价、收益率上涨与谈判僵局并列，股指期货走低。": "The WSJ live-markets page links higher oil and yields with the negotiating impasse as stock futures fall.",
    "美国推动削弱中国关键矿产控制力": "US moves to reduce China's control of critical minerals",
    "首页称，美方正推动建立不依赖中国的军事与工业投入品供应链，该举措开始见效。": "The homepage says a US effort to build a China-free supply chain for military and industrial inputs is starting to work.",
    "按 Barron’s 首页可见顺序筛选 12 条公司、个股、产业与财报焦点。摘要只采用首页标题和可见简介；未展示正文的条目标明细节未展示。": "Twelve company, stock, industry and earnings stories are selected in the visible order on Barron's homepage. Summaries use only visible headlines and blurbs; items without visible detail are labeled accordingly.",
    "WSJ 首页宏观焦点包括美国政策对利率与通胀的影响、伊朗谈判与地区安全、国债收益率，以及关键矿产供应链政策。以下只概括首页标题和可见简介。": "WSJ homepage macro coverage includes US policy effects on rates and inflation, Iran talks and regional security, Treasury yields, and critical-mineral supply-chain policy. Summaries reflect only visible headlines and blurbs.",
    "按 WSJ 首页展示顺序筛选 8 条宏观、政策与经济焦点，涵盖利率与通胀、制裁与地缘风险、工业投资、国防产能及能源。摘要依据首页可见标题和简介；专栏观点单独注明。": "Eight macro, policy and economic stories are selected in WSJ homepage order, covering rates, inflation, sanctions, geopolitics, industrial investment, defense capacity and energy. Summaries use visible headlines and blurbs; column opinions are labeled.",
    "参议院调查关注伊朗使用 USDT 的制裁风险": "Senate inquiry examines Iran-linked USDT sanctions risks",
    "据首页引述的参议院民主党调查，与伊朗有关而受制裁的钱包大量使用 Tether 的 USDT 稳定币；报道聚焦制裁执行与数字资产监管。": "The homepage cites Senate Democrats finding extensive USDT use by wallets sanctioned over Iran ties, highlighting sanctions enforcement and digital-asset regulation.",
    "调查人员称，五名二十多岁的英国公民在费尔福德基地附近被捕；该基地部署美军与 B-1 轰炸机，可能的伊朗关联仍在调查。": "Investigators said five UK nationals in their twenties were arrested near Fairford, which hosts US forces and B-1 bombers. A possible Iran link remains under investigation.",
    "特朗普拟公布 150 亿美元艾奥瓦钢铁项目": "Trump to unveil a planned $15 billion Iowa steel project",
    "首页称，特朗普将公布一项计划中的 150 亿美元钢铁项目；报道将宣布时点与共和党面临艰难中期选举的背景联系起来，项目尚属计划。": "The homepage says Trump plans to unveil a $15 billion steel project as Republicans face a difficult midterm election. The project is described as planned.",
    "国防企业扩充导弹产能，长期投入不足制约补库": "Defense firms expand missile output amid underinvestment",
    "首页称，军工企业正加快提高导弹产量，但关键工厂此前受到合同安排不稳定和投入不足影响，美国武器库存补充面临产能约束。": "The homepage says missile producers are rushing to expand capacity, but inconsistent contracting and underinvestment at key factories have constrained replenishment of US weapons stocks.",
    "WSJ 专栏：美国压力或推动加拿大能源复兴": "WSJ column: US pressure could revive Canadian energy",
    "Heard on the Street 专栏认为，美国贸易压力与中东战争可能促使加拿大能源产业迎来新机会；这是专栏的条件性观点，并非已实现的增长。": "The Heard on the Street column argues that US trade pressure and the Middle East war could create opportunities for Canadian energy. This is a conditional opinion, not realized growth.",
    "利率": "Rates",
    "若贸易关税下调落地，相关成本压力或缓和": "Implemented tariff cuts could ease related cost pressure",
    "简报称美中公布约 600 亿美元商品的关税下调方案，覆盖中国玩具和美国煤炭。": "The briefing says the US and China detailed tariff cuts on about $60 billion of goods, including Chinese toys and US coal.",
    "需核实实施清单、时间和贸易流量；若执行延后、范围缩小或谈判再度恶化，判断失效。": "Verify the implementation list, timing and trade flows; delays, a narrower scope or renewed tensions would invalidate this view.",
    "若通胀数据缓和，利率预期可能降温": "Softer inflation could cool rate expectations",
    "本周 PCE 与就业数据将影响市场对美联储下月行动的判断；较温和数据可能缓和紧缩预期。": "This week's PCE and jobs data will shape views of next month's Fed decision; softer readings could ease expectations for tighter policy.",
    "数据尚未公布；观察核心 PCE、就业与债券收益率，若价格压力加速或就业仍强则逻辑减弱。": "The data are not yet out. Watch core PCE, jobs and Treasury yields; accelerating price pressure or continued job strength would weaken the thesis.",
    "收益率曲线逼近倒挂，经济担忧升温": "Yield curve nears inversion, raising growth concerns",
    "10 年与 2 年期利差曾缩至 0.17 个百分点；倒挂历史上领先多次衰退，但不能单独确认衰退。": "The 10-year/2-year spread narrowed to 0.17 percentage point; inversions preceded many recessions but cannot confirm one on their own.",
    "观察利差是否持续倒挂及就业、消费和企业数据；若增长保持韧性、利差回升，风险判断减弱。": "Watch for a sustained inversion alongside jobs, consumer and business data; resilient growth and a steeper curve would weaken the risk case.",
    "油价上涨与国债抛售叠加": "Rising oil prices coincide with Treasury selling",
    "伊朗重开霍尔木兹方案遭拒后油价上行，简报称美国国债抛售重启，可能同时推高通胀与融资压力。": "Oil rose after Iran's Hormuz proposal was rejected, and the briefing says Treasury selling resumed, potentially adding to inflation and financing pressure.",
    "关注实际通航、原油供应及长短端收益率；若谈判缓和、油价回落且收益率稳定，该判断失效。": "Watch shipping, oil supply and short- and long-term yields; easing talks, lower oil and stable yields would invalidate this view.",
    "AI 股票情绪反复，资本开支验证临近": "AI stocks swing as spending expectations face a test",
    "简报称资金近两周在 AI 恐慌与乐观之间大幅摆动，市场将关注美光业绩对算力投资预期的验证。": "The briefing says money has swung sharply between AI fears and optimism over the past two weeks; markets will look to Micron's results to test computing-spend expectations.",
    "对照美光业绩、管理层展望和后续订单；若需求与利润兑现则风险减弱，若指引下修则压力加大。": "Compare Micron's results, outlook and subsequent orders; realized demand and profits would ease the risk, while weaker guidance would add pressure.",
    "这是英伟达自身的安全平台发布；合作采用尚不等于新增订单或收入，需观察客户部署、付费与后续采购。": "This is Nvidia's own security-platform launch. Partner adoption does not establish new orders or revenue; watch deployment, paid use and follow-on purchases.",
    "系统搭载规模扩大，但不能直接推出软件收入或利润同步增长；观察付费率、车型覆盖、成本和实际交付。": "A larger installation base does not establish matching software revenue or profit growth; watch paid uptake, model coverage, costs and deliveries.",
    "公开观点分歧没有披露订单、监管变化或算力采购，不能据此推导行业收入；后续以产品采用和具体政策为验证。": "The public disagreement disclosed no orders, policy changes or compute purchases and does not establish industry revenue; watch product adoption and concrete policy.",
    "管理层投入意愿并非已落地模型或采购。当前未核验到可解释的公开上市供应链关系，暂不列间接候选。": "Stated investment intent is not a deployed model or a purchase. No explainable public-company supply-chain link is verified, so no indirect candidate is listed.",
    "安全事件指向部署与合规风险，尚无足够证据将其传导到某家上市供应商的订单或利润，暂不列候选。": "The incident raises deployment and compliance risks, but there is not enough evidence to link it to a listed supplier's orders or profits; no candidate is listed.",
    "这是微软平台安全事件，直接主体为微软；漏洞修复或赏金本身不构成新增收入或供应商需求，观察修复与客户影响。": "This is a security incident involving Microsoft's platform. A fix or bounty does not itself create revenue or supplier demand; watch remediation and customer impact.",
    "大会议程预告不等于新功能订单或变现。观察官方发布、开发者采用及服务收入；具体硬件传导暂不清楚。": "A conference agenda is not an order or monetization. Watch the official release, developer adoption and service revenue; hardware spillover is unclear.",
    "产品发布提供公司直接观察线索，但起售价和功能不证明销量、毛利或持续需求；观察预售转化、发货与后续财报。": "The product launch is a direct company signal, but price and features do not prove sales, margins or sustained demand; watch conversion, shipments and results.",
    "热榜描述称产品搭载 AMD 处理器，但尚无可靠公开证据说明出货量或采购规模；不把单款配置等同 AMD 收入增量，暂不列候选。": "The board says the product uses an AMD processor, but shipment and purchase volumes are unverified; one configuration does not prove incremental AMD revenue.",
    "热榜描述该型号采用 AMD Ryzen AI Max+ PRO 495；若实际出货，AMD 或有处理器销售机会，但尚未核实出货规模，方向待确认。": "The board says this model uses AMD's Ryzen AI Max+ PRO 495. AMD may have a processor sales opportunity if it ships, but shipment scale is unverified and the direction remains unclear.",
    "按已连接浏览器中 Barron’s 首页展示顺序收录 12 条公司与市场焦点；只依据标题和可见简介归纳，首页未展示正文细节的条目不作延伸。": "Twelve company and market stories are listed in the order shown on the connected Barron's homepage. Summaries use only visible headlines and blurbs; no details are inferred where the homepage showed none.",
    "纸瓶将进入商店货架，可持续包装替代方案逐步落地": "Paper bottles are coming to store shelves as sustainable packaging alternatives advance",
    "首页称，塑料监管趋严与回收推动正在带动纸瓶替代方案；具体产品和商业进展以原文为准。": "The homepage points to tighter plastic rules and recycling efforts behind paper-bottle alternatives; see the article for product and commercial details.",
    "生物科技新一轮牛市的 16 个关注标的": "16 biotech stocks to watch in a potential new bull market",
    "首页简介称，医学进展与并购活动提振生物科技股，并列出圆桌专家关注的 16 个标的。": "The homepage says medical advances and deal activity are lifting biotech stocks and lists 16 picks from its expert roundtable.",
    "AI 不会带来就业末日，至少目前还没有": "AI is not causing a jobs apocalypse, at least not yet",
    "首页展示该观点文章，摘要强调目前尚未出现所担忧的就业末日；更多依据未在首页展示。": "The homepage presents the view that the feared jobs apocalypse has not appeared so far; it shows no further supporting details.",
    "按揭利率接近 7%，住房负担能力承压": "Mortgage rates near 7% pressure housing affordability",
    "首页展示房贷利率上行与住房负担能力压力，并附有互动图表；未据此推断后续利率方向。": "The homepage links rising mortgage rates with affordability pressure and includes an interactive chart; no rate forecast is inferred.",
    "债券界的‘巴菲特’仍未退休，并给出投资建议": "The 'Buffett of bonds' is not retired and has advice for investors",
    "首页展示资深债券投资者 Dan Fuss 的观点与建议；具体配置细节以原文为准。": "The homepage features views and advice from veteran bond investor Dan Fuss; see the article for portfolio details.",
    "Anthropic 相关 ETF 持有大量博通与亚马逊股票": "An Anthropic-related ETF holds sizable Broadcom and Amazon positions",
    "首页简介称，一只 Anthropic 相关 ETF 持有较多 Broadcom 与 Amazon；持仓及关联以原文为准。": "The homepage says an Anthropic-related ETF holds sizable Broadcom and Amazon positions; see the article for holdings and context.",
    "麦当劳借助 AI 与门店改造推动增长": "McDonald's looks to AI and restaurant revamps to drive growth",
    "首页聚焦麦当劳的 AI 应用和餐厅改造计划；具体营收贡献未在首页展示。": "The homepage focuses on McDonald's AI use and restaurant revamps; it shows no specific revenue contribution.",
    "11 只适合市场波动期关注的股息股": "11 dividend stocks to consider in a volatile market",
    "首页简介称，市场波动与 AI 涨势可能见顶的担忧提升了防御性收益关注；列出专家推荐的股息股。": "The homepage says volatility and concerns that the AI rally may be peaking are drawing attention to defensive income, and lists experts' dividend picks.",
    "Brookfield 盈利增长记录突出，估值受到关注": "Brookfield's earnings growth record stands out as valuation draws attention",
    "SPS Commerce 为零售业管理供应链软件": "SPS Commerce provides supply-chain software for retailers",
    "首页股票精选将 SPS Commerce 列为关注标的；估值和增长依据未在首页展示。": "The homepage's stock picks feature SPS Commerce; valuation and growth details are not shown there.",
    "EchoStar 资产价值或高于市值，SpaceX 是额外因素": "EchoStar's assets may be worth more than its market value, with SpaceX as an added factor",
    "微软澄清 Windows 11 缩略图缓存隐私传言": "Microsoft addresses a Windows 11 thumbnail-cache privacy rumor",
    "这是微软对隐私传言的说明，暂无可识别的营收或供应链传导；后续关注官方技术说明与安全更新。": "This is Microsoft's response to a privacy rumor, with no clear revenue or supply-chain transmission; watch official technical notes and security updates.",
    "榜单所述 GMKtec 型号采用 AMD Ryzen AI Max+ PRO 495；若成为实际出货配置，AMD 可能获得对应处理器销售。": "The GMKtec model described by the board uses AMD's Ryzen AI Max+ PRO 495; if this configuration ships, AMD may sell the corresponding processor.",
    "须独立核验该型号实际装配、AMD 供货关系及出货量；预约和参数宣称不代表芯片订单规模或利润贡献。": "Independently verify the model's actual configuration, AMD supply relationship and shipment volume; reservations and specifications do not establish chip orders or profit contribution."
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
      <p class="source-summary">${translated(focus.summary)}</p>
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
  const readThrough = story => {
    const view = story.readThrough;
    if (!view) return "";
    return `<details class="read-through"><summary><span class="read-through-label">产业链推演 · 条件性</span><strong>${view.candidates.length ? view.candidates.map(candidate => escapeHTML(candidate.ticker)).join(" / ") : ""}</strong><span>${view.candidates.length ? translated(view.candidates[0].direction) : "传导待确认"}</span></summary><p>${translated(view.note)}</p>${view.candidates.map(candidate => `<div class="read-through-candidate"><p><strong>${escapeHTML(candidate.company)} (${escapeHTML(candidate.ticker)} · ${escapeHTML(candidate.exchange)})</strong> · <span>${translated(candidate.direction)}</span></p><p>${translated(candidate.exposure)}</p><p><span>验证条件：</span>${translated(candidate.condition)}</p><a class="market-source" href="${escapeHTML(candidate.sourceUrl)}" target="_blank" rel="noopener noreferrer"><span>合作依据</span> ↗</a></div>`).join("")}<small><span>推演核验 </span>${escapeHTML(view.checkedAt.slice(0, 16).replace("T", " "))}</small></details>`;
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
    return `<div class="market-summary${notable ? " notable" : ""}"><p><span>股价观察</span> · <strong>${company}</strong> · <span>${bilingual(move, `${quote.sessionDate} US close ${signed(pct)}%`)}</span><span>${bilingual(against, sameWindow ? `; versus S&P 500 ${signed(relative)} percentage points` : "; market comparison unverified")}</span></p><p class="market-verdict">${bilingual(verdict, verdictEN)}</p><div class="market-links">${sources} ${mapping}</div></div>`;
  };
  const hotCard = hot ? `
    <article class="source-card aihot">
      <div class="source-meta"><span>AIHOT · AI 热点榜</span><small>过去 48 小时 / 讨论热度</small></div>
      <div class="hot-times"><span>榜单更新 <time datetime="${escapeHTML(hot.boardUpdatedAt)}">${escapeHTML(hot.boardUpdatedAt.slice(0, 16).replace("T", " "))}</time></span><span>抓取 <time datetime="${escapeHTML(hot.capturedAt)}">${escapeHTML(hot.capturedAt.slice(0, 16).replace("T", " "))}</time></span></div>
      <p class="hot-note">按 AIHOT 页面显示的热度排序。标题为聚合站的事件描述，热度不是事件真实性或市场影响的评分。</p>
      <p class="market-note">股价观察用于筛选研究线索：比较最近完整交易日与前一交易日收盘，涨跌同时受大盘和其他消息影响，不代表这条新闻已影响定价。</p>
      <ol class="hot-list">${hot.stories.map((story) => `
        <li><span class="hot-rank">${String(story.rank).padStart(2, "0")}</span><div class="hot-story"><a href="${escapeHTML(story.url)}" rel="noopener noreferrer" target="_blank">${translated(story.title)}<span aria-hidden="true">↗</span></a>${marketSummary(story)}${readThrough(story)}</div><small><span>热度</span> ${escapeHTML(story.heat)}</small></li>
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
        ${data.bloombergStories?.length ? `<ol class="story-list bloomberg-stories">${data.bloombergStories.map(story => `<li><strong>${translated(story.title)}</strong><p>${translated(story.summary)}</p></li>`).join("")}</ol>` : ""}
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
