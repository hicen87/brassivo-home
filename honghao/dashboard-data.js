(function () {
  "use strict";

  const data = {
    meta: {
      title: "宏观资产方向跟踪",
      englishTitle: "MACRO / VIEW LEDGER",
      baselineDate: "2026-09-01",
      latestSourceDate: "2026-09-02",
      posture: "全球债市暴熊，成长久期承压",
      postureNote: "油价与全球长债收益率同步冲高，市场交易的是滞胀式利率冲击；短期优先降低久期、拥挤度和贝塔，而不是无差别清仓风险资产。",
      disclaimer: "本页面为Brassivo Research对公开宏观资料的二次整理，不代表原作者，不构成投资建议，也不包含实时行情。"
    },
    rotation: [
      { id: "precious", label: "黄金白银", stage: "已启动", state: "passed", note: "反弹目标已到，短期止盈控仓" },
      { id: "industrial", label: "有色工业", stage: "已轮动", state: "passed", note: "等待下一次趋势确认" },
      { id: "energy", label: "能源", stage: "后段", state: "passed", note: "地缘冲突与低战略储备支撑油价，仍不追涨" },
      { id: "agriculture", label: "粮食安全", stage: "结构主线", state: "current", note: "中长期供需逻辑保留，短期波动和拥挤度上升" }
    ],
    assets: [
      {
        id: "global-risk",
        asset: "全球风险资产",
        category: "总资产",
        horizon: "短期",
        direction: "结构性谨慎 / 去久期与贝塔",
        tone: "caution",
        action: "降低高久期、高拥挤和高贝塔敞口；保留低久期价值与防御方向，避免无差别清仓。",
        evidence: "原文明确",
        status: "有效",
        rationale: "油价与全球长债收益率同步冲高，金银连续下跌确认市场交易的是滞胀式利率冲击；两地被削减的是久期、拥挤度和贝塔，而不是风险资产本身。",
        trigger: "油价和长端收益率同步回落，成长板块市场宽度改善，或回调后风险收益比明显修复。",
        updated: "2026-09-02",
        sourceRefs: ["S1", "S3", "S4", "S5", "20260902-S1", "20260902-S2"],
        priority: true
      },
      {
        id: "us-equity",
        asset: "美股",
        category: "股票",
        horizon: "短期",
        direction: "谨慎偏空，不直接做空",
        tone: "caution",
        action: "降低拥挤敞口、保留盈利仓，等待回调。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "全球长端收益率抬升，高估值成长承压；连续三日下跌后仍在下行，周期模型继续提示本周五前后是周线趋势转换窗口。",
        trigger: "企业盈利继续上修且长端收益率回落，或政策明显转鸽，谨慎判断弱化。",
        updated: "2026-09-02",
        sourceRefs: ["S1", "S5", "20260902-S2"],
        priority: true
      },
      {
        id: "hong-kong-equity",
        asset: "港股 / 高估值成长",
        category: "股票",
        horizon: "短期",
        direction: "谨慎偏空 / 去拥挤与贝塔",
        tone: "caution",
        action: "不急于抄底，降低高估值成长敞口；跟踪美元、长债收益率和美股期货。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "恒指在大型权重支撑下接近收平，但二线AI和券商继续下跌；指数表面分化来自成分权重，不代表底层风险逻辑分叉。",
        trigger: "长端收益率回落，二线成长止跌且港股市场宽度改善。",
        updated: "2026-09-02",
        sourceRefs: ["S4", "20260902-S1"],
        priority: true
      },
      {
        id: "a-share-duration",
        asset: "A股高久期成长 / 科创",
        category: "股票",
        horizon: "短期",
        direction: "承压 / 降低拥挤敞口",
        tone: "negative",
        action: "降低电子、半导体、通信、计算机和传媒等拥挤成长敞口；不把结构性下跌扩大为全市场看空。",
        evidence: "原文明确 + 行情观察",
        status: "有效",
        rationale: "创业板和科创50领跌，五个成长板块主力资金合计净流出约400亿元；上证50相对抗跌，资金转向国防军工和电网设备。",
        trigger: "长端收益率与油价回落，成长板块资金流和市场宽度连续改善。",
        updated: "2026-09-02",
        sourceRefs: ["20260902-S1"],
        priority: true
      },
      {
        id: "us-ai-earnings",
        asset: "美股 / AI盈利",
        category: "股票",
        horizon: "中期",
        direction: "基本面仍有支撑",
        tone: "positive",
        action: "不因实际利率上升机械清仓；重点跟踪盈利兑现。",
        evidence: "原文明确",
        status: "有效",
        rationale: "实际利率约在历史中枢，但AI相关盈利增长可能支撑较高估值。",
        trigger: "盈利预期下修，或实际利率继续上升且估值不降，将削弱支撑。",
        updated: "2026-08-31",
        sourceRefs: ["S1"],
        priority: false
      },
      {
        id: "precious-long",
        asset: "黄金、白银",
        category: "商品",
        horizon: "长期",
        direction: "看多",
        tone: "positive",
        action: "核心配置逻辑不变；持有为主。",
        evidence: "原文明确",
        status: "有效",
        rationale: "纪要明确指出黄金、白银及大宗商品的长期逻辑没有改变。",
        trigger: "需要后续资料明确否定长期逻辑，才改变长期方向。",
        updated: "2026-08-31",
        sourceRefs: ["S3"],
        priority: true
      },
      {
        id: "precious-short",
        asset: "贵金属及矿业股",
        category: "商品",
        horizon: "短期",
        direction: "止盈 / 控仓",
        tone: "caution",
        action: "反弹目标附近获利了结，控制风险和仓位；新增仓位等待波动释放。",
        evidence: "原文明确",
        status: "有效",
        rationale: "黄金从约4800目标区回落至约4300，白银回落至约63并连续下跌三日；金银未按地缘避险逻辑上涨，短期风险信号得到确认。",
        trigger: "价格完成去杠杆、长端收益率回落且资金重新流入，或新资料重新确认加仓信号。",
        updated: "2026-09-02",
        sourceRefs: ["S3", "S4", "S5", "20260902-S1", "20260902-S2"],
        priority: true
      },
      {
        id: "commodities",
        asset: "大宗商品整体",
        category: "商品",
        horizon: "中长期",
        direction: "看多，但内部分化",
        tone: "positive",
        action: "保留商品方向，从已大涨品种转向下一棒，避免平均追涨。",
        evidence: "原文明确",
        status: "有效",
        rationale: "商品长期逻辑未变，但强美元和长端利率压制贵金属，地缘冲突推升原油，粮食安全获得实体供需支撑。",
        trigger: "若轮动顺序被价格和新资料证伪，重新定位阶段。",
        updated: "2026-09-01",
        sourceRefs: ["S3", "S4", "S5"],
        priority: true
      },
      {
        id: "agriculture",
        asset: "农产品",
        category: "商品",
        horizon: "中长期",
        direction: "看多 / 独立结构主线",
        tone: "positive",
        action: "保留粮食安全中长期结构方向；种业由涨停转跌停后不接短期拥挤交易，等待波动和筹码消化。",
        evidence: "原文明确 + 行情观察",
        status: "有效",
        rationale: "全球玉米库存消费比降至17.9%的警戒区间，欧洲减产扩大供给缺口，粮食产业链出现广泛价格与资金确认。",
        trigger: "若库存消费比持续回升、供给缺口修复且相对收益趋势持续转弱，再下调中长期方向；单日跌停不单独构成反转。",
        updated: "2026-09-02",
        sourceRefs: ["S3", "S4", "20260902-S1"],
        priority: true
      },
      {
        id: "industrial-metals",
        asset: "有色工业金属",
        category: "商品",
        horizon: "中期",
        direction: "主要轮动已过",
        tone: "neutral",
        action: "继续持有观察，不把单日反弹当成新起点。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "在轮动顺序中位于贵金属之后、能源和农产品之前。",
        trigger: "若重新出现有色领涨并获原文确认，再上调方向。",
        updated: "2026-08-31",
        sourceRefs: ["S3"],
        priority: false
      },
      {
        id: "energy",
        asset: "能源 / 原油",
        category: "商品",
        horizon: "中期",
        direction: "事件驱动偏强 / 相对受益",
        tone: "positive",
        action: "不因单日地缘上涨追多；作为周期后段信号跟踪。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "霍尔木兹海峡冲突升级推动WTI两日累计上涨约10%至90美元一线、布油约95美元；美国战略原油库存处于历史低位，能源成为本轮冲击中的相对受益资产。",
        trigger: "冲突降级、供给恢复或油价回落将削弱相对优势；若非事件性趋势延续，再评估是否升级为独立主线。",
        updated: "2026-09-02",
        sourceRefs: ["S3", "S4", "S5", "20260902-S1", "20260902-S2"],
        priority: false
      },
      {
        id: "usd",
        asset: "美元",
        category: "货币",
        horizon: "短期",
        direction: "偏强",
        tone: "positive",
        action: "作为防御信号观察，不升级为长期看多。",
        evidence: "行情观察 + 基于原文推导",
        status: "观察中",
        rationale: "鹰派政策预期持续推动美元走强，并压制港股、贵金属和高估值成长资产。",
        trigger: "通胀回落、政策转鸽或美元重新转弱。",
        updated: "2026-09-01",
        sourceRefs: ["S1", "S3", "S4", "S5"],
        priority: false
      },
      {
        id: "long-ust",
        asset: "美国长久期国债",
        category: "债券",
        horizon: "短中期",
        direction: "价格继续承压 / 收益率上行",
        tone: "negative",
        action: "暂不激进加久期；等待政策与通胀路径明确。",
        evidence: "基于原文推导",
        status: "观察中",
        rationale: "油价冲击与通胀风险推动全球长端收益率上行，10年期美债收益率升至约4.81%、为三年多来高位。",
        trigger: "冲突和油价冲击消退、通胀确认回落，且长端收益率趋势转为下行。",
        updated: "2026-09-02",
        sourceRefs: ["S1", "S4", "S5", "20260902-S1", "20260902-S2"],
        priority: true
      },
      {
        id: "jpy",
        asset: "日元",
        category: "货币",
        horizon: "短期",
        direction: "对美元偏弱",
        tone: "negative",
        action: "仅作跨市场风险信号，不作为独立配置结论。",
        evidence: "行情观察",
        status: "观察中",
        rationale: "美元兑日元一度突破160，反映鹰派冲击外溢。",
        trigger: "日本加息预期显著升温或美元转弱。",
        updated: "2026-08-31",
        sourceRefs: ["S1"],
        priority: false
      },
      {
        id: "jgb",
        asset: "日本国债",
        category: "债券",
        horizon: "短期",
        direction: "价格承压 / 收益率偏升",
        tone: "negative",
        action: "只记录外溢风险，暂无明确交易动作。",
        evidence: "行情观察",
        status: "观察中",
        rationale: "30年期日债收益率升破3%，为1996年以来高位，全球长久期债券同步承压。",
        trigger: "加息预期回落或收益率趋势反转。",
        updated: "2026-09-02",
        sourceRefs: ["S1", "20260902-S2"],
        priority: false
      }
    ],
    observations: [
      { market: "全球长久期债券", observation: "10年期美债收益率升至约4.81%，30年期日债收益率升破3%，中美债券收益率价差接近3.15%。", handling: "确认全球债市的久期冲击；长债暂不逆势加仓。" },
      { market: "A股成长与防御", observation: "创业板跌2.4%、科创50领跌，五个成长板块主力资金合计净流出约400亿元，资金转入国防军工和电网设备。", handling: "降低久期、拥挤度和贝塔，不把结构性下跌扩大为全市场看空。" },
      { market: "港股与二线成长", observation: "恒指在大型权重支撑下接近收平，恒生科技跌0.7%；二线AI和券商继续承压，南向净买入降至40.9亿元。", handling: "指数差异主要来自权重结构；继续等待底层成长板块止跌。" },
      { market: "人民币与跨境资本", observation: "中美收益率价差接近历史极值，但人民币低开高走；跨境资本流动和离境管理强化。", handling: "只记录套利阻滞和汇率韧性，不据此建立独立人民币方向。" },
      { market: "原油与贵金属", observation: "WTI两日累计上涨约10%至90美元一线、布油约95美元；黄金回落至约4300、白银约63并连跌三日。", handling: "市场交易的是滞胀式利率冲击而非避险；能源相对受益但不追涨，贵金属短期继续控仓。" },
      { market: "粮食安全", observation: "前一日涨停集中的种业股在9月2日出现集体跌停。", handling: "视为短期拥挤交易反转；不据此否定库存和供给缺口支撑的中长期逻辑。" }
    ],
    changes: [
      { date: "2026-09-02", asset: "A股高久期成长 / 科创", from: "未单列", to: "承压 / 降低拥挤敞口", reason: "创业板、科创50和五个成长板块同步承压，资金转向低久期价值与防御方向。", turningPoint: null, sources: ["20260902-S1"] },
      { date: "2026-09-02", asset: "能源 / 原油", from: "事件驱动偏强 / 不追涨", to: "事件驱动偏强 / 相对受益", reason: "油价升至90至95美元区间，低战略储备放大供给冲击，能源成为风险资产中的相对例外。", turningPoint: null, sources: ["20260902-S1", "20260902-S2"] },
      { date: "2026-09-02", asset: "全球风险资产", from: "中性偏谨慎", to: "结构性谨慎 / 去久期与贝塔", reason: "金银未按避险逻辑上涨，确认市场交易的是滞胀式利率冲击；受压集中在久期、拥挤度和贝塔。", turningPoint: null, sources: ["20260902-S1", "20260902-S2"] },
      { date: "2026-09-01", asset: "农产品 / 粮食安全", from: "商品轮动下一棒、重点观察", to: "独立结构性交易主线", reason: "库存消费比进入警戒区、欧洲减产扩大供给缺口，产业链价格和资金形成确认。", turningPoint: null, sources: ["S4"] },
      { date: "2026-09-01", asset: "贵金属及矿业股", from: "短期谨慎、不追高", to: "反弹目标到位，止盈控仓", reason: "黄金反弹至目标区，矿股先行承压后COMEX金银继续回落。", turningPoint: { side: "top", label: "顶部候选", priceContext: "黄金反弹至目标区，矿股先行承压，随后COMEX金银开始回落；方向反转尚未完全走出。" }, sources: ["S4", "S5"] },
      { date: "2026-09-01", asset: "港股 / 高估值成长", from: "无独立方向", to: "短期谨慎偏空", reason: "强美元、长端收益率上行和隔夜美股走弱触发补跌。", turningPoint: null, sources: ["S4"] },
      { date: "2026-09-01", asset: "全球风险资产", from: "短期谨慎", to: "维持防守，风险继续升温", reason: "地缘油价冲击、长端利率上行与九月调整窗口叠加。", turningPoint: null, sources: ["S4", "S5"] },
      { date: "2026-08-31", asset: "全部", from: "无（首次建账）", to: "建立基线", reason: "以首批已核验资料建立初始方向。", turningPoint: null, sources: ["S1", "S2", "S3"] }
    ],
    sources: [
      {
        id: "S1",
        date: "2026-08-31",
        title: "市场将如何定价沃什和贝森特的巅峰对决",
        type: "完整文章",
        role: "政策分歧、风险资产仓位、美股、实际利率和长端美债判断"
      },
      {
        id: "S2",
        date: "2026-08-31",
        title: "文章长截图",
        type: "重复资料",
        role: "与S1内容重复，用于视觉核对，不作为独立证据"
      },
      {
        id: "S3",
        date: "2026-08-31",
        title: "新神雕侠侣：沃什 vs 贝森特",
        type: "当日纪要",
        role: "防御交易变化、贵金属风险、商品长期逻辑及农产品轮动"
      },
      {
        id: "S4",
        date: "2026-09-01",
        title: "每日复盘与展望：A股粮食涨停潮，港股开门黑",
        type: "当日复盘摘要",
        role: "粮食安全结构主线、A股板块轮动、港股补跌、美元和长端利率"
      },
      {
        id: "S5",
        date: "2026-09-01",
        title: "地缘冲突、贵金属风险与九月调整窗口",
        type: "评论摘要",
        role: "油价冲击、贵金属止盈、长端利率与周期调整窗口"
      },
      {
        id: "20260902-S1",
        date: "2026-09-02",
        title: "全球债市暴熊，全球股市承压",
        type: "当日复盘摘要",
        role: "滞胀式利率冲击、A股成长去拥挤、港股权重分化、能源与粮食安全短期表现"
      },
      {
        id: "20260902-S2",
        date: "2026-09-02",
        title: "全球债市冲击与周线趋势窗口",
        type: "评论摘要",
        role: "全球长债收益率、跨境套利阻滞、贵金属回落、油价和周线趋势转换窗口"
      }
    ]
  };

  if (typeof window !== "undefined") {
    window.HONG_HAO_DASHBOARD_DATA = Object.freeze(data);
  }
})();
