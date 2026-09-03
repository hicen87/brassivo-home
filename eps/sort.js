(function (root) {
  "use strict";

  const marketOrder = ["US", "A", "HK"];

  function numericTrend(value) {
    const number = Number.parseFloat(String(value ?? "").replace("%", ""));
    return Number.isFinite(number) ? number : null;
  }

  function trendStrength(stock) {
    const values = (stock.estimateRevisionTrend || [])
      .slice(0, 4)
      .map(numericTrend)
      .filter((value) => value !== null);
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function formatTrendStrength(value) {
    if (!Number.isFinite(value)) return "--";
    if (Math.abs(value) < 0.005) return "0.00%";
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  }

  function compareStocks(left, right) {
    const leftStrength = trendStrength(left);
    const rightStrength = trendStrength(right);
    if (leftStrength === null && rightStrength !== null) return 1;
    if (leftStrength !== null && rightStrength === null) return -1;
    if (leftStrength !== rightStrength) return rightStrength - leftStrength;
    return String(left.symbol).localeCompare(String(right.symbol), "en");
  }

  function groupAndSortStocks(stocks) {
    const groups = new Map();
    for (const stock of stocks) {
      if (!groups.has(stock.market)) groups.set(stock.market, []);
      groups.get(stock.market).push(stock);
    }
    return [...groups.entries()]
      .sort(([leftMarket], [rightMarket]) => {
        const leftIndex = marketOrder.indexOf(leftMarket);
        const rightIndex = marketOrder.indexOf(rightMarket);
        return (leftIndex === -1 ? marketOrder.length : leftIndex) - (rightIndex === -1 ? marketOrder.length : rightIndex)
          || leftMarket.localeCompare(rightMarket, "en");
      })
      .map(([market, marketStocks]) => ({ market, stocks: [...marketStocks].sort(compareStocks) }));
  }

  root.EPSSort = Object.freeze({ formatTrendStrength, groupAndSortStocks, trendStrength });
})(typeof window !== "undefined" ? window : globalThis);
