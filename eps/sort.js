(function (root) {
  "use strict";

  const marketOrder = ["US", "A", "HK"];

  function numericTrend(value) {
    const number = Number.parseFloat(String(value ?? "").replace("%", ""));
    return Number.isFinite(number) ? number : null;
  }

  function trendVector(stock) {
    return Array.from({ length: 4 }, (_, index) => numericTrend(stock.estimateRevisionTrend?.[index]));
  }

  function scoreValue(stock) {
    const number = Number(stock.score?.total);
    return Number.isFinite(number) ? number : null;
  }

  function compareStocks(left, right) {
    const leftScore = scoreValue(left);
    const rightScore = scoreValue(right);
    if (leftScore === null && rightScore !== null) return 1;
    if (leftScore !== null && rightScore === null) return -1;
    if (leftScore !== null && leftScore !== rightScore) return rightScore - leftScore;

    const leftTrend = trendVector(left);
    const rightTrend = trendVector(right);
    for (let index = 0; index < leftTrend.length; index += 1) {
      if (leftTrend[index] === null && rightTrend[index] !== null) return 1;
      if (leftTrend[index] !== null && rightTrend[index] === null) return -1;
      if (leftTrend[index] !== rightTrend[index]) return rightTrend[index] - leftTrend[index];
    }
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

  root.EPSSort = Object.freeze({ groupAndSortStocks, scoreValue, trendVector });
})(typeof window !== "undefined" ? window : globalThis);
