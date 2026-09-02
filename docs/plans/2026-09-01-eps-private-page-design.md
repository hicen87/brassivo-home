# Brassivo EPS 私有页面设计

## 目标

在 `https://brassivo.com/eps/` 增加登录后可见的 EPS 边际跟踪页面。继续由 `/Users/jackycen/Documents/EPS边际跟踪` 负责抓取、比较、截图、邮件和成功基线；Brassivo 只接收通过验收后的脱敏结构化快照。

## 边界

- 不把 `state/`、`logs/`、Gmail message id、原始网页截图或历史 PNG 放进公开 Git 仓库。
- `/eps/` 的 HTML、CSS、JS 可以公开，但页面源码中不含自选股数据。
- 真实数据只由 `api.brassivo.com` 在有效会员会话下返回。
- Gmail 未明确成功、项目校验未通过或当日股票不完整时，发布脚本必须 fail closed。
- 首期只做最新快照，不做历史数据库、图表回放和逐日归档。

## 架构与数据流

1. EPS 日报完成 Gmail 回读并原子更新基线。
2. 本地发布脚本读取 `watchlist.json`、成功基线和同日运行日志，生成不含 URL、截图与邮件标识的快照。
3. 发布脚本使用环境变量 `BRASSIVO_EPS_PUBLISH_TOKEN` 调用 `POST /admin/eps`。
4. Worker 校验发布令牌与快照 schema 后，将 `eps:current` 写入现有 KV 绑定 `SUBS`。
5. 用户在 `/eps/` 输入 Brassivo 会员邮箱和密码；`POST /member/session` 校验 D1 会员状态，生成随机 7 天会话并写入 KV。
6. Worker 通过 `HttpOnly; Secure; SameSite=Lax` cookie 识别会话；`GET /eps/data` 只向未过期会员返回当前快照。

## 页面信息

页面顶部展示基线日期、覆盖股票数、今日变化数和趋势延续数。股票列表支持关键词与市场筛选；每只股票展示数据源、当前四个期间的 EPS 估计、向上/向下修正计数及最近真实变化。美股遵循 Zacks Rank Factors 口径，A股和港股遵循 Yahoo Finance Normalized EPS Trend / EPS Revisions 口径。

## 安全与异常

- 密码只提交给 Worker，不写 cookie/localStorage。
- 会话 token 仅存在 HttpOnly cookie；KV 只保存 token 的 SHA-256 摘要。
- 发布令牌只存在 Cloudflare secret 和本机环境变量，不进入项目或日志。
- 登录、数据读取与发布接口均返回明确的 401/403/404/422；页面不回退到旧的静态数据。
- Worker 接受 Brassivo 域名 CORS，并对带 cookie 请求返回 `Access-Control-Allow-Credentials: true`。
- 登出会删除 KV 会话并清空 cookie。

## 验收

- Node 测试覆盖有效/过期会员、会话 cookie、未登录拒绝、授权读取、发布令牌和快照校验。
- 导出脚本测试覆盖当前 13 只活动股票、数据源口径、敏感字段排除和失败日志拒绝。
- 页面测试覆盖登录壳、无内嵌数据、筛选控件、主站入口、sitemap 与 llms 索引。
- 本地 HTTP 服务下做桌面与移动端视觉检查。
- 本轮不部署；上线需另行完成 Worker secret、Worker 代码、GitHub Pages push 与线上鉴权回读验收。
