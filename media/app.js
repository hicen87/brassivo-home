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
    "OpenAI拟IPO前融资300亿美元，30年期美债收益率创2002年新高": "OpenAI targets $30 billion funding ahead of IPO; 30-year Treasury yield hits 2002 high",
    "Bloomberg Morning Briefing Asia 报道，OpenAI计划在IPO前以约1.4万亿美元估值融资至少300亿美元，CEO阿尔特曼称投资者对解决安全问题保持耐心，特朗普则在会晤后表态反对联邦AI安全监管；30年期美债收益率升至5.57%创2002年新高，联储威廉姆斯称年内或再加息。以上为原刊快照，非实时行情；简报未给出统一市场涨跌预测。": "Bloomberg Morning Briefing Asia reports OpenAI is seeking at least $30 billion at a $1.4 trillion valuation ahead of an IPO, with CEO Sam Altman saying investors are patient while safety concerns are addressed, as Trump rejected federal AI safety regulation after meeting tech CEOs. The 30-year Treasury yield rose to 5.57%, a level last seen in 2002, with the Fed’s Williams noting another hike may be appropriate this year. This is an edition snapshot, not live pricing; no unified market-direction forecast is provided.",
    "OpenAI拟以1.4万亿美元估值融资300亿": "OpenAI targets $30 billion round at $1.4 trillion valuation",
    "简报称OpenAI在筹备IPO之际寻求新一轮大规模融资，阿尔特曼称投资者对公司解决安全关切保持耐心。": "The briefing reports OpenAI is seeking a massive new funding round ahead of its IPO, with Altman noting investor patience as the company addresses safety concerns.",
    "30年期美债收益率升至5.57%创24年新高": "30-year Treasury yield rises to 5.57%, a 24-year high",
    "美债抛售延续，30年期收益率达2002年以来最高水平；联储官员威廉姆斯称年内或仍有一次加息。": "The Treasury selloff deepened with the 30-year yield reaching its highest since 2002; the Fed’s Williams said one more rate hike may be appropriate this year.",
    "苹果新CEO特纳斯拟推行架构重组": "New Apple CEO John Ternus moves to overhaul company",
    "前硬件主管上任后拟精简组织、加快产品研发周期并扩充设备品类，强化工程研发重心。": "The former hardware chief plans to streamline operations, accelerate product cycles and expand device lineups with a sharper engineering focus.",
    "智能穿戴Oura因估值推迟赴美上市": "Smart-ring maker Oura postpones IPO on valuation concerns",
    "简报报道受市场波动及部分投资者对目标估值分歧影响，智能指环公司Oura推迟上市计划。": "Citing market volatility and investor pushback on target valuation, smart-wearable maker Oura delayed its US IPO plans.",
    "中国扩定向信贷并予首套房贷利息补贴": "China expands targeted credit and unveils mortgage subsidies",
    "简报报道中国扩大对基建与高科技领域定向借款，并向符合条件的首套房贷推出利息补贴以稳增长。": "The briefing reports expanded targeted lending for infrastructure and tech alongside interest-payment subsidies for first-home mortgages to support growth.",
    "前沿AI与终端研发投入预期延续": "Frontier AI and device R&D investment expectations continue",
    "OpenAI大额融资意向与苹果工程提速，反映前沿模型与消费硬件研发投入持续加码。": "OpenAI’s large funding target and Apple’s engineering push reflect sustained R&D spending across frontier models and consumer hardware.",
    "核对实际融资交割、估值水平及研发转化；若监管阻力增大或资本开支缩减，判断失效。": "Track actual deal closing, valuation and commercial execution; heightened regulatory friction or capex pullbacks invalidate the view.",
    "国内定向支持措施释放托底信号": "Targeted domestic measures signal economic stabilization support",
    "基建科技定向贷款与房贷利息补贴政策推出，释放针对性稳增长与支持内需信号。": "Targeted loans for infrastructure and technology along with mortgage subsidies signal focused support for growth and domestic demand.",
    "观察信贷实际投放节奏与地产销售企稳迹象；若政策效果未显或需求继续下滑，判断失效。": "Monitor credit deployment pace and property sales stabilization; lack of follow-through or renewed demand slumps invalidate the view.",
    "长端收益率突破压制风险资产估值": "Surging long-term yields pressure risk asset valuations",
    "30年期美债收益率触及5.57%，高利率预期及联储加息预期延续使无风险折现率高企。": "With 30-year yields reaching 5.57% and hawkish Fed signals lingering, discount rates remain elevated.",
    "跟踪通胀数据、劳动力市场与长端利率；若国债买盘回流且收益率大幅回落，估值压力减轻。": "Track inflation data, labor reports and long-end yields; renewed bond buying and yield pullbacks ease valuation pressure.",
    "市场不确定性阻碍企业上市与估值兑现": "Market uncertainty delays IPOs and valuation realization",
    "Oura推迟上市及投资者对高估值承接力存疑，反映一级向二级传导存在流动性折价。": "Oura’s delayed listing and valuation pushback reflect liquidity discounts during private-to-public market transmission.",
    "观察后续IPO定价、认购倍数与破发率；若风险偏好恢复且新股溢价回升，压力缓解。": "Watch subsequent IPO pricing, subscription demand and post-listing performance; improved risk appetite eases pressure.",
    "按首页展示顺序筛选12条公司与市场焦点，去除重复；摘要仅使用可见标题和简介，投资观点注明，未展示细节不作延伸。": "12 company and market stories selected in homepage order without duplicates. Summaries use visible headlines and blurbs, identify investment views and do not extend undisplayed detail.",
    "AI末日警告与市场高位并存下的投资思考": "How to invest when extinction warnings meet market highs",
    "探讨在AI生存风险争论与科技股高位估值交织下，投资机构在风险与回报之间的平衡策略。": "Examining how investors balance existential AI risk debates against high equity valuations.",
    "纳微半导体受军方芯片项目关注再获青睐": "Navitas is a hot chip play again on army project",
    "报道称纳微半导体在功率器件及军工芯片应用领域出现新业务进展，股价重受市场关注。": "Reports highlight new momentum in power devices and defense chip applications, reviving stock interest.",
    "英伟达巨额股票回购展现AI核心盈利地位": "Nvidia buyback shows who is winning the AI boom",
    "首页称芯片巨头的大规模回购计划反映其在AI产业链顶端的现金流统治力，其他厂商仍需巨资追赶。": "The chip maker’s buyback plan reflects its cash generation at the top of AI, while rivals spend heavily.",
    "退休规划中的蒙特卡洛模拟测评与资金安全": "Monte Carlo testing in retirement financial planning",
    "介绍理财规划中利用概率模拟测算退休资产耗尽风险的方法，建议平衡收益目标与现金流安全。": "Explaining how probability simulations evaluate retirement asset longevity and cash-flow safety.",
    "机构看好金融软件服务商SS&C估值重估": "Investors look to SS&C Technologies stock valuation",
    "首页股票观点认为基金行政与金融软件服务商SS&C具备潜在上涨空间；投资观点仅供参考。": "A homepage stock view suggests potential upside for fund administrator SS&C; view is for reference.",
    "铀能公司盘中冲高回落，亏损超预期引发分歧": "Uranium Energy reverses after earnings spike on loss",
    "Uranium Energy公布财报显示核能需求虽增长但净亏损扩大，股价急涨后遭遇获利回吐。": "Uranium Energy posted growing nuclear demand but wider losses, leading to a sharp reversal.",
    "嘉年华邮轮营收创新高超分析师预期": "Carnival surges after earnings show record revenue",
    "邮轮巨头公布三季度营收达84亿美元创历史新高，强劲预订与票价支撑股价上涨。": "The cruise operator reported record $8.4 billion revenue beating expectations on strong bookings.",
    "秋季学院休闲服饰风潮利好两家服饰标的": "Fall preppy fashion trends benefit two apparel stocks",
    "零售观点探讨拉夫劳伦与Deckers在换季服饰及鞋类消费趋势中的品牌定价力。": "Retail analysis discusses Ralph Lauren and Deckers pricing power amid seasonal fashion shifts.",
    "苹果与多只异动股解析今日美股盘面": "Apple, Meta and key movers explain today’s market",
    "梳理高管调整、科技AI动态、邮轮财报与商业航天等多重事件对跨行业重点个股走势的影响。": "Reviewing executive changes, AI developments, cruise earnings and aerospace moves across key stocks.",
    "美债收益率走高压制美股，鸽派言论难挡高利率": "Bond yields depress stocks despite dovish Fed comments",
    "分析指出尽管有联储官员发表温和讲话，长端美债收益率上升仍对美股成长股估值构成直接压制。": "Analysis notes higher Treasury yields continue to pressure equity valuations despite mild Fed remarks.",
    "中美经贸与AI会晤进展引发投资者不同解读": "Trump-Xi meeting on trade and AI draws investor focus",
    "报道讨论中美双边会晤对于关税预期、半导体合作及关键产业供应链的长期复杂影响。": "Reports assess bilateral talks regarding tariff expectations, chip cooperation and supply chains.",
    "Meta因Muse大涨后估值步入精细验证期": "Meta rally on Muse AI enters valuation verification phase",
    "深度分析指出Meta在AI大涨后估值已充分反映初期预期，后续走势需依赖广告变现与API实际营收。": "Analysis suggests Meta’s initial AI rally is priced in; further gains depend on ad and API revenue.",
    "OpenAI 常驻助手 \"o\" 曝光，DevDay 下周揭晓": "OpenAI persistent assistant \"o\" surfaces; DevDay reveal next week",
    "OpenAI 推出 Ultrafast 高速层级": "OpenAI introduces Ultrafast speed tier",
    "AMD 收购 World Labs 并任命李飞飞为首席科学家": "AMD to acquire World Labs and appoint Fei-Fei Li as chief scientist",
    "Claude Sonnet 5.5 疑似泄露开启灰度测试": "Claude Sonnet 5.5 leak reported with gray-scale testing",
    "Anthropic 计划将 IPO 推迟至 11 月": "Anthropic reportedly plans to postpone IPO to November",
    "OpenAI 调整 Pro 订阅用量计算并预告新功能": "OpenAI adjusts Pro subscription usage limits and previews features",
    "OpenAI 因安全问题推迟发布 Astra 6.1 模型": "OpenAI delays Astra 6.1 release over safety concerns",
    "NVIDIA 谈 AI 安全：在智能体栈各层解决工程问题": "NVIDIA discusses AI safety across agent architecture layers",
    "Manus AI 发布 Manus 2.0": "Manus AI releases Manus 2.0",
    "Meta 或将推出 Muse Video API": "Meta reportedly preparing to launch Muse Video API",
    "助手发布计划仍属发布会预告，对算力调用与硬件采购的增量传导尚待实际部署验证。": "Assistant launch plans remain previews; incremental compute and hardware transmission require live deployment verification.",
    "高速层级或优化单Token能效，算力采购取决于用户调用总规模是否扩大。": "Ultrafast tier may optimize per-token efficiency; compute procurement depends on total usage expansion.",
    "收购尚待交割完成，关注李飞飞团队在3D世界模型与芯片软件栈的整合变现。": "Acquisition awaits closing; watch integration and commercialization of 3D world models on the chip software stack.",
    "模型升级预期可能影响云调用分配，效率提升也可能减少单位推理消耗。": "Model upgrade expectations may shift cloud allocations, though improved efficiency can reduce unit inference needs.",
    "推迟上市反映公开市场估值定价审慎，对现有云与芯片合作伙伴的商业合作影响中性。": "Delayed listing reflects public valuation caution; commercial cooperation with cloud/chip partners remains neutral.",
    "订阅规则微调属于产品运营策略，对外部基础设施及供应链无直接传导。": "Subscription limit adjustments reflect product operations with no direct infrastructure transmission.",
    "安全推迟或延后算力扩容需求，也可能增加评测与安全防护算力投入，方向待确认。": "Safety delays may defer expansion or increase evaluation compute; direction remains unconfirmed.",
    "全栈安全架构有助于降低企业部署门槛，开源与标准制定不直接等同于新增芯片订单。": "Full-stack safety frameworks ease enterprise adoption; open standards do not directly equate to chip orders.",
    "独立工具类产品更新不代表云基础设施采购增加，暂不列间接标的。": "Standalone tool updates do not indicate increased cloud procurement; no indirect candidates listed.",
    "视频生成 API 若上线可能拓展算力变现渠道，关注实际付费调用与推理成本。": "A video generation API could expand compute monetization; track actual paid usage and inference costs.",
    "官方说明AWS为主要训练与云伙伴，Claude新增调用可能传导至Trainium及云服务。": "Anthropic identifies AWS as its primary cloud partner; incremental Claude calls may reach Trainium and cloud services.",
    "核对新增付费调用和云用量；若效率提升抵消调用增长或需求转向其他平台，增量采购逻辑失效。": "Verify incremental paid calls and cloud usage; efficiency offsetting demand growth or platform migration invalidates procurement logic.",
    "Anthropic官方确认使用Google Cloud TPU，新增推理需求可能增加相关云用量。": "Anthropic confirms Google Cloud TPU use; incremental inference demand may increase related cloud usage.",
    "需核对平台份额、实际调用和计费收入；降价及效率提高可能压低单位收入与算力需求。": "Verify platform share, usage and billed revenue; lower pricing and efficiency gains may reduce unit revenue and compute demand.",

    "美伊谈判僵局加深美债抛售，中国研究稳增长措施": "US-Iran impasse deepens Treasury selling; China studies growth support",
    "Bloomberg Morning Briefing Asia 报道，美伊谈判僵局令能源冲击难解，美债抛售加深，10年期收益率触及19年高位；沙特跨国管道恢复约一半流量后油价收窄涨幅。中国研究稳楼市、扩内需与就业支持；软银以创纪录高收益债融资押注AI。以上为原刊快照，非实时行情；简报未给出统一市场涨跌预测。": "Bloomberg Morning Briefing Asia reports deeper Treasury selling as the US-Iran impasse prolongs energy concerns, with the 10-year yield at a 19-year high. Oil pared gains after Saudi pipeline flows recovered to about half. China is studying housing, demand and employment support, while SoftBank raised record high-yield debt for AI. This is an edition snapshot, not live pricing; no unified market-direction forecast is provided.",
    "美债收益率触及19年高位": "Treasury yield reaches a 19-year high",
    "简报称美伊谈判僵局加深债券抛售，能源冲击延续与通胀担忧影响市场。": "The briefing links deeper bond selling to stalled US-Iran talks and concerns about prolonged energy disruption and inflation.",
    "沙特管道恢复约半数流量": "Saudi pipeline recovers about half its flows",
    "沙特跨国管道修复后恢复约一半流量，油价收窄涨幅；这不等于霍尔木兹航道全面恢复。": "Oil pared gains after repairs restored about half of Saudi cross-country pipeline flows; this does not establish full Hormuz reopening.",
    "中国研究楼市、内需与就业支持": "China studies housing, demand and employment support",
    "简报转述新华社称，国务院研究稳楼市、扩内需、促就业措施，并提出更好使用财政和货币工具。": "Citing Xinhua, the briefing says the State Council is studying housing, domestic demand and job support and better use of fiscal and monetary tools.",
    "软银创纪录高收益债为AI融资": "SoftBank raises record high-yield debt for AI",
    "软银发行111亿美元高收益债，最长年期收益率为9.75%；简报将其放在AI融资重塑信用市场的背景中。": "SoftBank sold $11.1 billion of high-yield debt, with 9.75% on the longest maturity, illustrating how AI financing is changing credit markets.",
    "AMD拟收购World Labs，英伟达扩回购": "AMD plans World Labs acquisition; Nvidia expands buybacks",
    "简报报道AMD拟以82亿美元股票收购World Labs；英伟达推出智能体安全系统，并追加1500亿美元回购授权。": "The briefing reports an $8.2 billion all-stock World Labs deal for AMD and an Nvidia agent safety system plus $150 billion of additional buyback authorization.",
    "中国政策若落地，内需预期或改善": "Implemented Chinese support could improve demand expectations",
    "国务院研究稳楼市、内需与就业措施，可能缓和消费和地产压力。": "The State Council is studying housing, demand and jobs support that could ease pressure on consumption and property.",
    "核对具体措施、实施规模和销售就业数据；若仅停留表态或需求继续走弱，判断失效。": "Verify measures, implementation scale, sales and jobs; statements without delivery or further demand weakness invalidate the view.",
    "沙特管道修复或缓和供给冲击": "Saudi pipeline repairs could ease supply disruption",
    "简报称管道已恢复约一半流量，油价收窄涨幅。": "The briefing says about half of pipeline flows were restored and oil pared gains.",
    "观察实际出口与运输持续性；再遇停运、冲突升级或油价风险溢价上升，判断减弱。": "Track sustained exports and transport; renewed outages, escalation or rising oil risk premiums weaken the view.",
    "高收益率继续压制融资与估值": "High yields pressure financing and valuations",
    "10年期美债收益率触及19年高位，能源冲击使通胀担忧持续。": "The 10-year Treasury yield touched a 19-year high as energy disruption sustained inflation concerns.",
    "观察收益率、通胀与信用利差；若谈判缓和且融资成本回落，风险减弱。": "Watch yields, inflation and credit spreads; easing talks and lower funding costs reduce the risk.",
    "AI扩张依赖高成本融资": "AI expansion relies on costly financing",
    "软银创纪录发债，最长年期收益率9.75%，显示AI融资成本与执行压力。": "SoftBank’s record bond sale at 9.75% on its longest maturity highlights AI funding costs and execution pressure.",
    "核对现金流、债务服务及投资回报；若经营收入覆盖投入与利息，风险减弱，否则压力可能增加。": "Check cash flow, debt service and returns; revenues covering spending and interest reduce risk, otherwise pressure may rise.",
    "按首页展示顺序筛选12条公司与市场焦点，去除重复；摘要仅使用可见标题和简介，投资观点注明，未展示细节不作延伸。": "12 company and market stories selected in homepage order without duplicates. Summaries use visible headlines and blurbs, identify investment views and do not extend undisplayed detail.",
    "五只科技股掩盖市场疲弱": "Five tech stocks mask broader market weakness",
    "首页称大型科技股承担市场主要支撑，部分华尔街人士担忧集中度。": "The homepage highlights market dependence on large technology stocks and concentration concerns.",
    "OpenAI取消最新模型发布的报道": "Report: OpenAI cancels its latest model release",
    "首页展示模型发布取消的报道，未展示完整原因与技术细节。": "The homepage reports a canceled model release; full reasons and technical details are not shown.",
    "AMD拟以82亿美元收购World Labs": "AMD plans an $8.2 billion World Labs acquisition",
    "首页标题披露收购金额；交易进度与条件须看原文。": "The homepage headline states the deal value; transaction progress and conditions require the original article.",
    "Summit Therapeutics获20亿美元投资后上涨": "Summit Therapeutics rises after a $2 billion investment",
    "仅据首页标题归纳投资与股价表现，财务及交易细节未展示。": "Headline-only summary of the investment and share move; financial and transaction details are not displayed.",
    "Muse竞争者估值达100亿美元": "A Muse rival reaches a $10 billion valuation",
    "首页称Instinct通过短信和电话提供服务，与Muse的应用模式不同。": "The homepage says Instinct uses texts and phone calls, unlike Muse’s app approach.",
    "滑雪客减少，Vail Resorts承压": "Fewer skiers pressure Vail Resorts",
    "首页标题聚焦滑雪客减少的经营压力，财报细节未展示。": "The headline highlights operating pressure from fewer skiers; earnings details are not shown.",
    "Jefferies投行业务收入创新高，股价仍跌": "Jefferies falls despite record banking revenue",
    "仅据首页标题呈现收入与股价背离，未推导下跌原因。": "The headline contrasts record banking revenue with a share decline; no cause is inferred.",
    "生物科技圆桌关注16个标的": "Biotech roundtable highlights 16 stocks",
    "圆桌观点认为医学进展与并购提振生物科技；进一步上涨是受访者判断。": "Roundtable participants attribute biotech strength to medical advances and deals; further gains are their view.",
    "Ralph Lauren在零售回调后估值受关注": "Ralph Lauren valuation draws attention after retail weakness",
    "首页股票观点认为股价便宜；估值依据未展示，不作买入结论。": "The homepage stock view calls shares cheap; valuation evidence is not shown and no buy conclusion is made.",
    "GE Aerospace大幅回调后趋稳": "GE Aerospace steadies after a sharp pullback",
    "仅据首页标题记录走势描述，未展示订单与基本面细节。": "Headline-only description of stabilization; orders and fundamental details are not shown.",
    "Brookfield盈利记录与资产估值受关注": "Brookfield earnings record and asset valuation in focus",
    "首页称估值约为近期资产价值估算的55%；这是报道的估值比较。": "The homepage values the company at about 55% of a recent asset-value estimate; this is the article’s comparison.",
    "SPS Commerce零售供应链软件获关注": "SPS Commerce retail supply-chain software in focus",
    "首页股票精选讨论其供应链软件；上涨空间属于文章观点，细节未展示。": "A homepage stock pick discusses supply-chain software; upside is the article’s view and supporting details are not shown.",
    "按首页展示顺序筛选8条政策、监管、地缘与能源焦点；仅归纳可见标题和简介，债券机会是受访者观点，快照不代表实时行情。": "Eight policy, regulation, geopolitical and energy stories selected in homepage order. Only visible headlines and blurbs are summarized; bond opportunities are interviewee views and the snapshot is not live market data.",
    "英国释放美军基地附近袭击案嫌疑人": "UK releases suspects in alleged plot near a US base",
    "首页称调查人员仍核查伊朗或伊斯兰组织是否策划；释放不代表所有疑点已厘清。": "The homepage says investigators are examining possible Iranian or Islamist orchestration; release does not settle every question.",
    "美国财政部限制部分ETF避税操作": "US Treasury targets some ETF tax strategies",
    "首页称政府拟封堵部分“351转换交易”，并提示另一些操作存在问题。": "The homepage says the government moved to block some 351 ETF conversion transactions and flagged others.",
    "大法官Alito回避气候诉讼": "Justice Alito steps aside from a climate case",
    "首页称其决定不参与相关最高法院案件，改变了此前不回避的立场；结果尚未确定。": "The homepage says he reversed his earlier position and will not participate in the Supreme Court case; its outcome remains open.",
    "朝鲜战俘移交公开引发外交争议": "Disclosure of North Korean POW transfer sparks diplomatic dispute",
    "首页称乌克兰公布两名战俘位置，引发原以为信息不应公开的韩国不满。": "The homepage says Ukraine disclosed two captured soldiers’ location, upsetting South Korea, which expected confidentiality.",
    "沙特恢复红海石油出口": "Saudi Arabia resumes Red Sea oil exports",
    "首页引述知情人士称管道流量约每日350万桶，关注能源供应恢复。": "The homepage cites roughly 3.5 million barrels per day of pipeline throughput, focusing on recovering oil supply.",
    "美国放宽汽车燃油经济性标准": "US relaxes vehicle fuel-economy standards",
    "首页称2031车型年平均标准由每加仑50.4英里降至34.5英里，涉及汽车监管与能源需求。": "The homepage says the model-year 2031 average requirement falls from 50.4 to 34.5 miles per gallon, affecting vehicle regulation and energy demand.",
    "投资人士讨论收益率上升与债券机会": "Investing professionals discuss rising yields and bond opportunities",
    "首页引述Rick Rieder看好机会、Ray Dalio建议谨慎；这是受访者观点。": "The homepage cites Rick Rieder seeing opportunities and Ray Dalio urging caution; these are interviewees’ views.",
    "美国推动关键矿产供应链多元化": "US pushes diversification of critical-mineral supply chains",
    "首页称政府为军工和工业原料建立脱离中国的供应链，部分措施开始见效；具体规模未展示。": "The homepage describes efforts to create a China-free military and industrial input supply chain with early progress; scale is not shown.",
    "Anthropic 发布 Claude Sonnet 5.5，AA 智能指数升至第 2": "Anthropic releases Claude Sonnet 5.5; AA intelligence index rises to second",
    "AMD 82亿美元收购World Labs并任命李飞飞": "AMD to acquire World Labs for $8.2 billion and appoint Fei-Fei Li",
    "NVIDIA 发布开放智能体安全平台 OpenShell 与 Sentry": "NVIDIA releases OpenShell and Sentry agent safety platform",
    "OpenAI 常驻助手 \"o\" 曝光，DevDay 将揭晓": "OpenAI persistent assistant \"o\" surfaces; DevDay reveal expected",
    "Meta 启动企业平台，聘 MongoDB CEO 掌舵": "Meta launches enterprise platform and hires MongoDB CEO to lead it",
    "Manus 发布 2.0 系列产品与更新": "Manus releases its 2.0 product series and updates",
    "英伟达追加1500亿美元股票回购授权": "NVIDIA adds $150 billion to share buyback authorization",
    "OpenAI因安全问题推迟发布Astra 6.1模型": "OpenAI delays Astra 6.1 release over safety concerns",
    "可灵预告新消息，Kling 4.0 定档十月": "Kling previews news; Kling 4.0 scheduled for October",
    "荣耀 Magic9 系列发布：双 3D 识别与价格公布": "Honor Magic9 series launched with dual 3D identification and pricing",
    "模型升级可能改变云调用需求；效率提高也可能降低单次算力消耗，新增采购尚待验证。": "A model upgrade may change cloud demand; improved efficiency may reduce compute per task, so incremental procurement remains unverified.",
    "收购尚待交割，关注整合、模型采用与盈利兑现；不另挂供应商作为直接主体。": "The acquisition awaits closing; watch integration, model adoption and earnings delivery. Suppliers are not substituted as the direct company.",
    "安全平台可能提升企业采用信心；须核对付费部署与收入，开源发布不等于新增硬件订单。": "Safety tools may support enterprise adoption; verify paid deployment and revenue. An open-source release is not a hardware order.",
    "助手名称和发布安排仍属榜单描述；预告不等于订单，暂无独立核验的供应传导。": "The assistant name and release schedule remain ranking descriptions. A preview is not an order; no supply transmission is independently verified.",
    "企业产品可能扩展收入来源；须观察付费客户、调用量与利润，管理层变动本身不确认收入。": "Enterprise products could diversify revenue; watch paid customers, usage and profit. Leadership changes alone do not establish revenue.",
    "公司归属待核验；产品更新不证明云采购增加，暂不列间接标的。": "Ownership remains unverified. Product updates do not establish increased cloud procurement; no indirect candidates are listed.",
    "回购授权不等于已执行回购；关注实际购买、现金流与资本开支，暂无独立供应链传导。": "Buyback authorization is not completed repurchasing. Track actual purchases, cash flow and capital spending; no separate supply-chain transmission is established.",
    "安全问题或延迟部署与算力需求，也可能增加防护投入；方向待确认，暂不列间接标的。": "Safety concerns may delay deployment and compute demand or increase safeguards spending; direction is uncertain and no indirect candidates are listed.",
    "预告不等于新增收入；观察付费订阅、留存及推理成本，不从通用AI概念列供应商。": "A preview is not incremental revenue. Watch paid subscriptions, retention and inference cost; generic AI exposure does not justify supplier candidates.",
    "上市关联及实际芯片供货未独立核验；不按品牌或型号描述推导供应商订单。": "Listing relationships and actual chip supply are not independently verified; brand or model descriptions do not establish supplier orders.",
    "官方说明AWS为主要训练与云伙伴，Claude新增调用可能传导至Trainium及云服务。": "Anthropic identifies AWS as its primary training and cloud partner; incremental Claude usage could reach Trainium and cloud services.",
    "核对新增付费调用和云用量；若效率提升抵消调用增长或需求转向其他平台，增量采购逻辑失效。": "Verify incremental paid calls and cloud usage; efficiency offsetting demand growth or migration to other platforms invalidates incremental procurement.",
    "Anthropic官方确认使用Google Cloud TPU，新增推理需求可能增加相关云用量。": "Anthropic confirms Google Cloud TPU use; incremental inference demand may increase related cloud usage.",
    "需核对平台份额、实际调用和计费收入；降价及效率提高可能压低单位收入与算力需求。": "Verify platform share, usage and billed revenue; lower pricing and better efficiency may reduce unit revenue and compute demand.",

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
    "须独立核验该型号实际装配、AMD 供货关系及出货量；预约和参数宣称不代表芯片订单规模或利润贡献。": "Independently verify the model's actual configuration, AMD supply relationship and shipment volume; reservations and specifications do not establish chip orders or profit contribution.",
    "美债收益率高企吸引买家，AI看空者转向科技股": "High Treasury yields lure buyers as an AI bear turns to technology",
    "Bloomberg Markets Daily 报道，10年期美债收益率升至5.2%以上后，Jim Bianco及其他机构投资者认为债券回报风险比改善，但卖压仍可能延续至10月；另一报道显示，曾看空AI的基金经理因估值和算力需求转向增持科技股。简报未给出统一市场涨跌预测；邮件中的行情快照不是实时行情。": "Bloomberg Markets Daily reports that yields above 5.2% have improved the risk-reward profile for some bond investors, though selling may continue into October. A former AI bear is adding technology stocks, citing valuations and computing demand. The briefing gives no unified market forecast; its market snapshot is not live pricing.",
    "美债收益率超过5.2%，吸引部分投资者转向看多": "Treasury yields above 5.2% draw some investors toward bonds",
    "Jim Bianco称收益率缓冲改善；等幅收益率变动的债券盈亏并不对称，此为受访者估算。": "Jim Bianco says higher income improves the cushion; the asymmetric return estimate is the interviewee's view.",
    "债券抛售仍可能延续至10月": "Bond selling may continue into October",
    "Bloomberg报道，通胀影响下美债卖压未必结束；市场走势仍取决于后续通胀与利率。": "Bloomberg reports that inflation may prolong Treasury selling; the outlook depends on future inflation and rates.",
    "多家机构近期减少对长债的看空配置": "Several firms recently reduce bearish long-bond positions",
    "简报提及Pimco、Lombard Odier及RBC BlueBay近期调整观点，属于机构配置变化。": "The briefing notes positioning changes at Pimco, Lombard Odier and RBC BlueBay.",
    "AI看空基金经理提高科技股配置": "An AI bear raises technology allocations",
    "GQG经理称因估值与算力需求改变观点，旗下基金科技配置上升；其此前表现落后并遭资金流出。": "A GQG manager cites valuations and computing demand; the fund's technology exposure rose amid prior underperformance and outflows.",
    "AI仓位变化伴随显著资金流出": "AI positioning shift coincides with large outflows",
    "报道指出GQG自2025年中以来遭赎回约360亿美元，显示策略反转的业绩与资金风险。": "Bloomberg reports about $36 billion of GQG outflows since mid-2025, highlighting performance and fund-flow risks.",
    "铜供应担忧推动价格预测上调": "Copper supply concerns prompt a higher price forecast",
    "简报称德意志银行预计智利矿山争端与供应紧张可能推高铜价；这是机构预测。": "The briefing says Deutsche Bank sees supply tightness and a Chilean mine dispute lifting copper; this is a forecast.",
    "高票息为美债提供收益缓冲": "High coupons provide a cushion for Treasuries",
    "10年期收益率约5.2%后，部分债券投资者认为票息改善回报风险比。": "Some bond investors say yields near 5.2% improve the risk-reward balance.",
    "跟踪通胀、期限收益率与信用利差；若收益率继续急升并造成超出票息的损失，该判断失效。": "Track inflation, yields and credit spreads; a sharp further rise that overwhelms coupons invalidates this view.",
    "AI算力需求推动部分投资者回流科技股": "AI compute demand draws some investors back to tech",
    "GQG经理表示估值与计算需求令其自7月起增持科技股。": "A GQG manager says valuations and computing demand prompted technology purchases since July.",
    "核对云与芯片收入、现金流和基金资金流；若需求或盈利兑现减弱、资金继续流出，则逻辑失效。": "Check cloud and chip revenue, cash flow and fund flows; weaker delivery or continued outflows invalidates the thesis.",
    "美债抛售可能延续至10月": "Treasury selling may persist into October",
    "简报引用投资者称抛售尚可能继续，能源与通胀担忧构成压力。": "Investors cited in the briefing say selling may continue, with energy and inflation concerns adding pressure.",
    "观察实际通胀、油价与长端收益率；若通胀降温且收益率回落，风险减弱。": "Watch inflation, oil and long yields; cooler inflation and falling yields would ease the risk.",
    "集中押注科技股带来业绩与资金流风险": "Concentrated technology bets carry performance and flow risks",
    "GQG提高科技配置之际，报道也指出其基金表现落后并遭遇大额赎回。": "As GQG raised technology exposure, Bloomberg also noted underperformance and substantial redemptions.",
    "比较组合收益、基准差和申赎；若相对表现及资金流持续改善，风险判断减弱。": "Compare returns, benchmark gaps and flows; sustained relative gains and better flows would ease the risk.",
    "Nvidia扩大回购授权显示AI现金流优势": "Nvidia's larger buyback highlights AI cash-flow strength",
    "首页称Nvidia的回购计划反映其在AI产业链中的现金流优势；具体对比采用分析师估算。": "The homepage says Nvidia's buyback reflects its AI cash-flow strength; comparisons rely on analyst estimates.",
    "Oura以市场不确定为由暂停IPO": "Oura postpones its IPO citing market uncertainty",
    "首页报道Oura尽管需求强劲，仍推迟上市；短讯未展示完整交易细节。": "The homepage reports Oura postponed its listing despite strong demand; full transaction details are not shown.",
    "SpaceX获看多评级，Starship进展受关注": "SpaceX gets a bullish rating as Starship advances",
    "首页简介称TD Cowen分析师启动覆盖并给出买入评级及目标价；这是分析师观点。": "The homepage says TD Cowen initiated coverage with a Buy rating and target; this is an analyst view.",
    "Navitas获美国陆军项目后股价反弹": "Navitas rebounds after a US Army project award",
    "首页简介称陆军项目奖项推动股价反弹；订单规模与盈利影响未展示。": "The homepage says an Army project award helped shares rebound; deal size and earnings impact are not shown.",
    "Fair Isaac因抵押贷款定价调整消息下跌": "Fair Isaac falls on mortgage-pricing changes",
    "首页称FHFA推进简化定价并纳入VantageScore，Fair Isaac股价受压。": "The homepage says FHFA is simplifying pricing and including VantageScore, weighing on Fair Isaac shares.",
    "Meta的Muse智能体与OpenAI竞争": "Meta's Muse agent faces competition from OpenAI",
    "首页讨论Muse九月表现及OpenAI的竞争；收入与留存数据未展示。": "The homepage discusses Muse's September performance and OpenAI competition; revenue and retention are not shown.",
    "美国铀需求带动Uranium Energy受关注": "US uranium demand puts Uranium Energy in focus",
    "首页简介称公司业绩显示美国政府对本土铀需求增长；具体规模未展示。": "The homepage says results point to stronger US government demand for domestic uranium; scale is not shown.",
    "Jefferies投行业务收入增长但股价下跌": "Jefferies shares fall despite banking revenue growth",
    "首页简介称利润增长16%，股价盘后下跌；未推导两者背离原因。": "The homepage says profit rose 16% while shares fell after hours; it gives no explanation for the divergence.",
    "生物科技圆桌看好医学进展与并购": "Biotech roundtable sees promise in medical advances and M&A",
    "首页摘要称医学进展和并购提振板块，更多上涨是受访者判断。": "The homepage says medical advances and M&A lifted the sector; further gains are the panel's view.",
    "Anthropic 推迟 IPO 至 11 月，招股书曝光": "Anthropic delays IPO to November as filing details emerge",
    "OpenAI重开Pro订阅并调整用量计算": "OpenAI reopens Pro subscriptions and changes usage accounting",
    "按首页当前展示顺序筛选8条能源、利率、金融、政策、地缘与工业供应链焦点；只归纳标题和可见简介，债券观点保留为受访者判断。": "Eight energy, rates, finance, policy, geopolitical and industrial supply-chain items in homepage order; summaries use visible text, with bond opinions attributed.",
    "中东石油出口恢复，霍尔木兹风险仍在": "Middle East oil exports rebound as Hormuz risks persist",
    "首页称油轮通行增加、伊朗对航道的控制力减弱，但报道提示局势存在升级风险。": "The homepage says tanker traffic has increased and Iran's control has weakened, while warning that tensions could escalate.",
    "短期美债在高收益率下更具吸引力": "Short-term Treasurys look attractive at higher yields",
    "Heard on the Street专栏认为2年期国债定价有吸引力；属于作者的市场观点。": "The Heard on the Street column sees value in two-year Treasurys; this is the author's market view.",
    "Goldman董事会讨论CEO继任安排": "Goldman board discusses CEO succession",
    "首页称董事会讨论由John Waldron接替David Solomon，最早可能在明年；未宣布正式任命。": "The homepage says the board discussed John Waldron succeeding David Solomon, possibly next year; no appointment was announced.",
    "白宫内部对RFK Jr.食品改革议程存分歧": "RFK Jr.'s food agenda faces White House resistance",
    "首页简介称可行性争议导致政府内部摩擦，使政策议程走向存在不确定性。": "The homepage cites feasibility concerns and internal friction, leaving the agenda's path uncertain.",
    "英国释放美军基地附近袭击案嫌疑人": "UK releases suspects in alleged plot near US base",
    "首尔称朝韩非军事区爆炸很可能由地雷造成": "Seoul says land mines likely caused DMZ blast",
    "大法官Alito回避气候变化诉讼": "Justice Alito recuses himself from climate case",
    "美国推动关键矿产供应链摆脱对华依赖": "US seeks critical-minerals supply chains less reliant on China"
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
      <ol class="hot-list">${hot.stories.slice(0, 6).map((story) => `
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
