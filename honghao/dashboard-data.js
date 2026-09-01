(function () {
  "use strict";

  const data = {
    meta: {
      title: "洪灏资产方向跟踪",
      englishTitle: "HONG HAO / CYCLE LEDGER",
      baselineDate: "2026-09-01",
      latestSourceDate: "2026-08-31",
      posture: "短期防守，长期商品趋势未破",
      postureNote: "控制风险资产仓位，兑现部分盈利；商品配置从贵金属继续向农产品轮动。",
      disclaimer: "本页面为Brassivo Research对洪灏公开资料的二次整理，不代表洪灏本人，不构成投资建议，也不包含实时行情。"
    },
    rotation: [
      { id: "precious", label: "黄金白银", stage: "已启动", state: "passed", note: "长期逻辑未变，短期防去杠杆" },
      { id: "industrial", label: "有色工业", stage: "已轮动", state: "passed", note: "等待下一次趋势确认" },
      { id: "energy", label: "能源", stage: "后段", state: "passed", note: "单日上涨受地缘事件驱动" },
      { id: "agriculture", label: "农产品", stage: "当前重点", state: "current", note: "新增跟踪，分批而非追涨" }
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
        rationale: "风险资产近期表现强，但风险收益比已恶化；沃什的鹰派立场被市场低估。",
        trigger: "若出现大幅政策转鸽，或回调后风险收益比改善，再考虑提高仓位。",
        updated: "2026-08-31",
        sourceRefs: ["S1", "S3"],
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
        rationale: "市场对沃什鹰派讲话反应克制；通胀和长端利率仍可能重新定价。",
        trigger: "企业盈利继续上修可托住估值；若联储明显转鸽，谨慎判断弱化。",
        updated: "2026-08-31",
        sourceRefs: ["S1"],
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
        direction: "谨慎",
        tone: "caution",
        action: "不追高，防范剧烈回撤和去杠杆；新增仓位等波动释放。",
        evidence: "原文明确",
        status: "有效",
        rationale: "峰会前已提示黄金和矿股风险，随后贵金属及相关矿业股明显回撤。",
        trigger: "价格完成去杠杆、资金重新流入，或新资料重新确认加仓信号。",
        updated: "2026-08-31",
        sourceRefs: ["S3"],
        priority: true
      },
      {
        id: "commodities",
        asset: "大宗商品整体",
        category: "商品",
        horizon: "中长期",
        direction: "看多，轮动后段",
        tone: "positive",
        action: "保留商品方向，从已大涨品种转向下一棒，避免平均追涨。",
        evidence: "原文明确",
        status: "有效",
        rationale: "长期逻辑未变；轮动顺序为黄金白银、有色工业、能源、农产品。",
        trigger: "若轮动顺序被价格和新资料证伪，重新定位阶段。",
        updated: "2026-08-31",
        sourceRefs: ["S3"],
        priority: true
      },
      {
        id: "agriculture",
        asset: "农产品",
        category: "商品",
        horizon: "中期",
        direction: "看多 / 重点跟踪",
        tone: "positive",
        action: "作为当前商品轮动下一棒优先观察，分批而非追涨。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "纪要判断近期大宗轮动开始进入农产品，年初以来多类农产品涨幅高于标普。",
        trigger: "农产品相对收益转弱，或后续纪要明确轮动未成立。",
        updated: "2026-08-31",
        sourceRefs: ["S3"],
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
        direction: "轮动后段，事件驱动偏强",
        tone: "neutral",
        action: "不因单日地缘上涨追多；作为周期后段信号跟踪。",
        evidence: "原文明确 + 基于原文推导",
        status: "有效",
        rationale: "能源位于轮动倒数第二棒；当日油价上涨主要由地缘事件推动。",
        trigger: "非事件性趋势延续，或后续资料确认能源重新成为主线。",
        updated: "2026-08-31",
        sourceRefs: ["S3"],
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
        rationale: "鹰派讲话后美元走强，美元贬值交易出现平仓迹象。",
        trigger: "通胀回落、政策转鸽或美元重新转弱。",
        updated: "2026-08-31",
        sourceRefs: ["S1", "S3"],
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
        rationale: "沃什强调通胀与缩表；压低长端收益率的操作效果短暂且受资金约束。",
        trigger: "通胀确认回落、联储转鸽且长端收益率趋势下行。",
        updated: "2026-08-31",
        sourceRefs: ["S1"],
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
      { market: "A股高股息", observation: "峰会前创约11年新高，属于防御交易的一部分。", handling: "已涨事实，不据此追高；等待后续方向确认。" },
      { market: "A股贵金属、农业、光伏", observation: "当日出现资金撤出和明显回落。", handling: "只作为短期资金行为，不推翻长期商品逻辑。" },
      { market: "A股传媒 / AIGC、先进制造、半导体", observation: "当日转强并获资金流入。", handling: "单日波动含情绪成分，不升级为战略看多。" },
      { market: "港股AI、芯片及大模型新股", observation: "当日明显上涨。", handling: "记为短期动量，不视为新的配置主线。" },
      { market: "韩国半导体", observation: "对中国及香港科技板块形成当日带动。", handling: "作为外部催化观察，不形成独立仓位结论。" }
    ],
    changes: [
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
      }
    ]
  };

  if (typeof window !== "undefined") {
    window.HONG_HAO_DASHBOARD_DATA = Object.freeze(data);
  }
})();
