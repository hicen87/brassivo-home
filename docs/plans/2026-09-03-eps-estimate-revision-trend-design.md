# EPS 四期预期修正趋势设计

## 目标

在每只股票的 Q1、Q2、F1、F2 摘要格中显示 `Trend of estimate revision`，与当前 EPS 估计和 7 日上调/下调数量放在一起。

## 数据口径

- 美股直接使用 Zacks Magnitude 表的 `Trend of Estimate Revisions` 四项百分比。
- A股、港股使用 Yahoo Finance Analysis 的 Normalized EPS Trend，按 `(Current Estimate - 7 Days Ago) / abs(7 Days Ago)` 计算四项 7 日修正百分比。
- 任一值缺失、不可解析或 7 日前估计为 0 时输出 `--`，不猜数。

该字段仅用于摘要展示，不进入“今日变化”、截图标记或趋势记忆。

## 发布与验收

发布器把四项趋势写入脱敏快照；Worker 强制校验每只股票恰有四项。页面按正、负、零或缺失显示绿、红、中性色。自动化仍在 Gmail 和基线验收全部成功后发布，失败时保留上一份线上快照。
