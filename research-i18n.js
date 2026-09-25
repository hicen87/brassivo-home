(() => {
  "use strict";

  // Static, pretranslated UI copy shared by the Brassivo research pages.
  // Extend this dictionary when page content changes; this file never calls a translator.
  const translations = new Map(Object.entries({
    "首页": "Home",
    "宏观观点": "Macro Views",
    "EPS修正": "EPS Revisions",
    "全球流动性": "Global Liquidity",
    "美股板块": "US Sectors",
    "中国板块": "China Sectors",
    "美股个股": "US Stocks",
    "中国个股": "China Stocks",
    "返回 Brassivo 首页": "Back to Brassivo home",
    "返回 Brassivo Research 首页": "Back to Brassivo Research home",
    "本页目录": "On this page",
    "跳到资产台账": "Skip to asset ledger",
    "总览": "Overview",
    "资产": "Assets",
    "资料与方向变更": "Sources & changes",
    "资料": "Sources",
    "搜索": "Search",
    "市场": "Market",
    "全部市场": "All markets",
    "美股": "US",
    "A股": "A-shares",
    "港股": "Hong Kong",
    "股票代码或公司名": "Ticker or company name",
    "只匹配": "matched",
    "覆盖股票": "Stocks covered",
    "今日数值变化": "Value changes today",
    "期间滚动": "Rolling period",
    "趋势延续": "Trend continuation",
    "活动清单": "Active list",
    "可行动字段": "Actionable fields",
    "不计入变化提醒": "Excluded from change alerts",
    "最近方向记忆": "Most recent direction",
    "等待数据": "Waiting for data",
    "数据读取失败": "Unable to load data",
    "请稍后重试。": "Please try again later.",
    "重新读取": "Reload",
    "没有匹配的股票": "No matching stocks",
    "清除搜索词或切换市场筛选。": "Clear the search or change the market filter.",
    "数据时点": "Data as of",
    "全球流动性周期看板": "Global Liquidity Cycle Dashboard",
    "全球流动性周期看板：": "Global liquidity cycle dashboard: ",
    "本周立场": "This week’s stance",
    "流动性档位": "Liquidity regime",
    "本周要点": "Key points this week",
    "展开完整叙述": "Expand full analysis",
    "流动性传导链": "Liquidity transmission chain",
    "点击任一环节看明细": "Select a stage for details",
    "资产配置": "Asset allocation",
    "什么时候加风险": "When to add risk",
    "什么时候减风险": "When to reduce risk",
    "深入数据": "Data deep dive",
    "数据源：": "Sources: ",
    "框架推演，非投资建议。": "Framework analysis, not investment advice.",
    "保存为图片": "Save as image",
    "打分锚点（硬数据口径，分数不许脱离依据）": "Scoring anchors (scores must follow the stated data)"
  }));

  const originals = new WeakMap();
  const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"]);
  let language = "zh";

  function readPreference() {
    const match = document.cookie.match(/(?:^|;\s*)brassivo_lang=(en|zh)(?:;|$)/);
    return match ? match[1] : "zh";
  }

  function savePreference(value) {
    document.cookie = `brassivo_lang=${value}; domain=.brassivo.com; path=/; max-age=31536000; SameSite=Lax`;
  }

  function translateTextNode(node) {
    if (!node || !node.parentElement || ignoredTags.has(node.parentElement.tagName)) return;
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const source = originals.get(node);
    if (language === "zh") {
      if (node.nodeValue !== source) node.nodeValue = source;
      return;
    }
    const result = translations.get(source) ?? source;
    if (result !== node.nodeValue) node.nodeValue = result;
  }

  function translateAttributes(root) {
    const elements = [];
    if (root instanceof Element) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll("[aria-label], [placeholder], [title]") );
    for (const element of elements) {
      for (const attribute of ["aria-label", "placeholder", "title"]) {
        if (!element.hasAttribute(attribute)) continue;
        const key = `${attribute}`;
        let values = originals.get(element);
        if (!values) { values = {}; originals.set(element, values); }
        if (!(key in values)) values[key] = element.getAttribute(attribute);
        const source = values[key];
        const result = language === "en" ? (translations.get(source) ?? source) : source;
        if (element.getAttribute(attribute) !== result) element.setAttribute(attribute, result);
      }
    }
  }

  function apply(value) {
    language = value === "en" ? "en" : "zh";
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateTextNode(walker.currentNode);
    translateAttributes(document.body);
    const button = document.getElementById("brassivo-language-toggle");
    if (button) {
      button.textContent = language === "en" ? "中" : "EN";
      button.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "切换为英文");
      button.title = language === "en" ? "Switch to Chinese" : "切换为英文";
    }
  }

  function installButton() {
    const header = document.querySelector("header.site-header");
    if (!header || document.getElementById("brassivo-language-toggle")) return;
    const button = document.createElement("button");
    button.id = "brassivo-language-toggle";
    button.type = "button";
    button.className = "brassivo-language-toggle";
    button.style.cssText = "flex:none;border:1px solid #c77b2f;border-radius:6px;background:#fff;color:#8a5424;padding:7px 10px;font:inherit;font-size:12px;font-weight:600;line-height:1.2;cursor:pointer;";
    button.addEventListener("click", () => {
      const next = language === "en" ? "zh" : "en";
      savePreference(next);
      apply(next);
    });
    header.append(button);
  }

  window.BrassivoLanguage = {
    get language() { return language; },
    setLanguage(value) {
      const next = value === "en" ? "en" : "zh";
      savePreference(next);
      apply(next);
    },
    addTranslations(entries) {
      for (const [zh, en] of Object.entries(entries || {})) translations.set(zh, en);
      if (language === "en") apply("en");
    }
  };

  function start() {
    installButton();
    apply(readPreference());
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) translateTextNode(walker.currentNode);
            translateAttributes(node);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
