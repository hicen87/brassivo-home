(function () {
  "use strict";

  const data = {
    meta: {
      title: "宏观资产方向跟踪",
      englishTitle: "MACRO / VIEW LEDGER",
      baselineDate: "2026-09-01",
      latestSourceDate: "2026-09-01",
      posture: "短期风险升温，粮食安全独立走强",
      postureNote: "强美元、长债收益率上行与九月调整窗口压制风险资产；农产品因供应收缩和低库存获得独立实体支撑。",
      disclaimer: "本页面为Brassivo Research对公开宏观资料的二次整理，不代表原作者，不构成投资建议，也不包含实时行情。"
    },
    rotation: [
      { id: "precious", label: "黄金白银", stage: "已启动", state: "passed", note: "反弹目标已到，短期止盈控仓" },
      { id: "industrial", label: "有色工业", stage: "已轮动", state: "passed", note: "等待下一次趋势确认" },
      { id: "energy", label: "能源", stage: "后段", state: "passed", note: "地缘冲突推动油价，仍不追涨" },
      { id: "agriculture", label: "粮食安全", stage: "结构主线", state: "current", note: "脱离普通轮动，升级为独立交易" }
    ],
    assets: [
      {
        id: "global-risk",
        asset: "全球风险资产",
        category: "总资产",
        horizon: "短期",
        direction: "中性偏谨慎",
        tone: "caution",
        action: "控制仓位、兑现部分盈利，不追涨；等待更好的入场机会。",
        evidence: "原文明确",
        status: "有效",
        rationale: "强美元、长端利率上行、油价冲击与九月周线调整窗口叠加，风险收益比继续恶化。",
        trigger: "长端收益率和美元同步转弱，或回调后风险收益比明显改善，再考虑提高仓位。",
        updated: "2026-09-01",
        sourceRefs: ["S1", "S3", "S4", "S5"],
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
        rationale: "全球长端收益率抬升，高估值成长承压；周期模型提示本周五前后可能打开周线调整窗口。",
        trigger: "企业盈利继续上修且长端收益率回落，或政策明显转鸽，谨慎判断弱化。",
        updated: "2026-09-01",
        sourceRefs: ["S1", "S5"],
        priority: true
      },
      {
        id: "hong-kong-equity",
        asset: "港股 / 高估值成长",
        category: "股票",
        horizon: "短期",
        direction: "谨慎偏空 / 等待风险释放",
        tone: "caution",
        action: "不急于抄底，降低高估值成长敞口；跟踪美元、长债收益率和美股期货。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "港股九月首日下跌被判断为对强美元、长债收益率上行和隔夜美股走弱的补跌。",
        trigger: "美元与长端收益率回落，港股止跌且市场宽度改善。",
        updated: "2026-09-01",
        sourceRefs: ["S4"],
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
        rationale: "黄金期货已从约3900反弹至约4800目标区；矿股先行承压，随后COMEX金银继续下跌。",
        trigger: "价格完成去杠杆、资金重新流入，或新资料重新确认加仓信号。",
        updated: "2026-09-01",
        sourceRefs: ["S3", "S4", "S5"],
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
        action: "把粮食安全作为独立结构性交易分批布局；优先跟踪种业、种植、化肥和粮油加工，不追涨停潮。",
        evidence: "原文明确",
        status: "有效",
        rationale: "全球玉米库存消费比降至17.9%的警戒区间，欧洲减产扩大供给缺口，粮食产业链出现广泛价格与资金确认。",
        trigger: "库存消费比持续回升并脱离警戒区、供给缺口修复，且农产品相对收益趋势转弱。",
        updated: "2026-09-01",
        sourceRefs: ["S3", "S4"],
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
        direction: "事件驱动偏强 / 不追涨",
        tone: "neutral",
        action: "不因单日地缘上涨追多；作为周期后段信号跟踪。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "海峡冲突和油轮遇袭推动油价飙升，属于地缘供给冲击而非已确认的独立新周期。",
        trigger: "非事件性趋势延续，或后续资料确认能源重新成为主线。",
        updated: "2026-09-01",
        sourceRefs: ["S3", "S4", "S5"],
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
        direction: "价格承压 / 收益率上行风险",
        tone: "negative",
        action: "暂不激进加久期；等待政策与通胀路径明确。",
        evidence: "基于原文推导",
        status: "观察中",
        rationale: "油价冲击与通胀风险推动全球长端收益率上行，30年期美债收益率升至2008年中以来高位。",
        trigger: "通胀确认回落、联储转鸽且长端收益率趋势下行。",
        updated: "2026-09-01",
        sourceRefs: ["S1", "S4", "S5"],
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
        rationale: "2年期日债收益率向2%靠近，市场上调日本央行加息预期。",
        trigger: "加息预期回落或收益率趋势反转。",
        updated: "2026-08-31",
        sourceRefs: ["S1"],
        priority: false
      }
    ],
    observations: [
      { market: "A股粮食产业链", observation: "粮食产业指数上涨5.69%，全市场83只涨停且农业链占多数。", handling: "确认粮食安全主线，但涨停潮后只分批布局，不追高。" },
      { market: "A股AI算力与半导体", observation: "科创50、半导体材料和部分小盘股明显回落，但上证仅微跌。", handling: "判断为板块轮动而非A股整体去风险，不做全市场看空。" },
      { market: "港股与互联网成长", observation: "恒指、恒生科技及互联网龙头普跌，内房和建发国际跌幅更大。", handling: "视为强美元与长端利率上行背景下的补跌，等待风险释放。" },
      { market: "美元与长端美债", observation: "美元延续强势，30年期美债收益率升至2008年中以来高位。", handling: "作为风险资产和高估值成长的共同压制信号。" },
      { market: "原油与贵金属", observation: "地缘冲突推升油价，COMEX黄金和白银同步回落。", handling: "不追事件驱动原油；贵金属按反弹目标到位处理，止盈控仓。" }
    ],
    changes: [
      { date: "2026-09-01", asset: "农产品 / 粮食安全", from: "商品轮动下一棒、重点观察", to: "独立结构性交易主线", reason: "库存消费比进入警戒区、欧洲减产扩大供给缺口，产业链价格和资金形成确认。", sources: ["S4"] },
      { date: "2026-09-01", asset: "贵金属及矿业股", from: "短期谨慎、不追高", to: "反弹目标到位，止盈控仓", reason: "黄金反弹至目标区，矿股先行承压后COMEX金银继续回落。", sources: ["S4", "S5"] },
      { date: "2026-09-01", asset: "港股 / 高估值成长", from: "无独立方向", to: "短期谨慎偏空", reason: "强美元、长端收益率上行和隔夜美股走弱触发补跌。", sources: ["S4"] },
      { date: "2026-09-01", asset: "全球风险资产", from: "短期谨慎", to: "维持防守，风险继续升温", reason: "地缘油价冲击、长端利率上行与九月调整窗口叠加。", sources: ["S4", "S5"] },
      { date: "2026-08-31", asset: "全部", from: "无（首次建账）", to: "建立基线", reason: "以首批已核验资料建立初始方向。", sources: ["S1", "S2", "S3"] }
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
      }
    ]
  };

  if (typeof window !== "undefined") {
    window.HONG_HAO_DASHBOARD_DATA = Object.freeze(data);
  }
})();
