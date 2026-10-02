# Kart Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. User has authorized execution in this chat.

**Goal:** 按 21 项清单优化游戏并回归检查，保留现有产品规则。

**Architecture:** 前端独立 season / reliability / progression / experience 模块，比赛循环发出事件；Worker 使用独立元数据表保留旧库，幂等 finish 与版本绑定答案验证。

**Tech Stack:** Three.js、原生 JS、Cloudflare Worker/D1、Node tests、浏览器。

## Backup

本机私有备份 `block-kart-20261002-200433`（不在公开仓库内）；基线 `232a667bf0202df35f9561559b9c7f9ddc291d32`。

### Task 1: 成绩可靠保存（本机队列、同账号重试、幂等提交）

- [x] Implement
- [x] Local verification

### Task 2: 排行榜按规则版本区分，保留历史

- [x] Implement
- [x] Local verification

### Task 3: 服务端题目与答案校验、圈速合理性校验

- [x] Implement
- [x] Local verification

### Task 4: 结算展示赛车名次、综合分、个人进步

- [x] Implement
- [x] Local verification

### Task 5: 终点及满格答题奖励改学习经验

- [x] Implement
- [x] Local verification

### Task 6: 道具目标、范围、护盾计时、命中反馈

- [x] Implement
- [x] Local verification

### Task 7: 移动端可选辅助漂移

- [x] Implement
- [x] Local verification

### Task 8: 交互训练：转向、道具、答题

- [x] Implement
- [x] Local verification

### Task 9: AI 按威胁和范围使用道具

- [x] Implement
- [x] Local verification

### Task 10: 按年级加载题库、节流存储、复用 GPU 资源及性能检查

- [x] Implement
- [x] Local verification

### Task 11: 赛后错题与重新作答

- [x] Implement
- [x] Local verification

### Task 12: 题目反馈及可靠提交

- [x] Implement
- [x] Local verification

### Task 13: 按知识点显示掌握进度

- [x] Implement
- [x] Local verification

### Task 14: 间隔复习且避让近期相似题

- [x] Implement
- [x] Local verification

### Task 15: 赛道弯道指引与技巧路线

- [x] Implement
- [x] Local verification

### Task 16: 快速挑战/练习并保留默认六圈

- [x] Implement
- [x] Local verification

### Task 17: 个人最佳圈速与进步

- [x] Implement
- [x] Local verification

### Task 18: 本周年级挑战及分榜

- [x] Implement
- [x] Local verification

### Task 19: 可复制朋友挑战码

- [x] Implement
- [x] Local verification

### Task 20: 经验解锁外观与称号，性能不变

- [x] Implement
- [x] Local verification

### Task 21: 本地指标与可选匿名汇总，用数据决策多人联机

- [x] Implement
- [x] Local verification

## Verification

- Pure module tests: persistence failures, retry/idempotency, versions, answers, curriculum, fixed slots, learning progress, seeded challenge.
- Existing game regressions: `node --test tests/game*.test.mjs`.
- Backend local D1 integration: register/login, run, finish, duplicate finish, invalid answer/config, boards/history/report.
- Browser: menu/train/quick/normal/study/answer/item/pause/results/progress/challenge; mobile viewport multitouch layout and resource growth.
- Deploy Worker then Pages; verify health, exact changed resource bytes and production browser.
- Actual iPad handfeel/heat cannot be certified by desktop viewport emulation; document this limitation.
- Multiplayer decision depends on future observed return data; no unrequested real-time server this release.

## Execution status

Implementation complete locally. 98 site tests and local D1 integration passed. Worker/Pages rollout pending; do not publish frontend before compatible backend. Task 10 still requires real iPad heat/handfeel confirmation. Task 21 implements metrics and a decision gate, not live multiplayer.

## Local acceptance evidence

- 98/98 Node tests passed; game subset 70/70.
- Local disposable D1 verified auth, issued questions, server grading, elapsed/lap validation, idempotent finish, mode/version boards, scores, reports, metrics and CORS.
- Browser completed one-lap incorrect/correct flow and full six-lap study race: 7 quizzes, no road boxes, 100 point cap, final answer gives XP without extra equipment; wrong review and training verified.
- Mobile 390x844 verified large stacked answer choices, fixed slots and sequential use without releasing held throttle, scale stayed 1 on double tap.
- Grade shards/answer manifest match canonical bank. Build dry-run 1358.50 KiB, gzip 443.14 KiB.
- Fixed missing friend-code status display, stale wrong-question resolution, legacy-score join, and a score-script loading failure; six-lap rerun passed.
- Resource checks are desktop only; actual iPad heat/handfeel and real-player return data remain outstanding.
