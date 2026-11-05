# 耘链 AGRI LINK · 农业综合服务平台

面向农户、合作社、农业企业、农资经销商、农机服务商与农产品采购商的一站式数字农业服务平台前端实现。

覆盖 **病虫害智能识别、农产品产销对接、农机共享、农资商城、大宗行情、农业资讯、用户中心** 七大业务域，包含 32 个可交互页面（22 个主页面 + 10 个个人中心子页）与 9 条完整业务闭环。

> 演示环境说明：行情数据、识别结果与平台统计均为**示例/模拟数据**，页面内均有明确标注；下单为模拟流程，不接入真实支付与物流。

---

## 一、快速开始

```bash
# 1. 安装依赖（Node 18+，推荐 20/22）
npm install

# 2. 启动开发环境
npm run dev          # 或 npm start

# 3. 生产构建与本地预览
npm run build
npm run preview
```

浏览器打开终端提示的地址（默认 `http://localhost:5173`）。

### 演示账号

登录页已预填演示手机号，验证码固定为 **888888**，也可点击「一键填入演示账号」：

| 项目 | 值 |
| --- | --- |
| 手机号 | 13800136621 |
| 验证码 | 888888 |
| 可切换身份 | 农户 / 合作社 / 农业企业 / 采购商 |

---

## 二、技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS 3（自定义设计令牌） |
| 路由 | React Router 7（路由级代码分割） |
| 状态 | Zustand 5 + persist（localStorage） |
| 图表 | Recharts 3（自绘迷你走势图 Sparkline） |
| 图标 | Lucide React |
| 校验 | 自研轻量校验函数（手机号/数量/价格/图片） |

---

## 三、目录结构

```
src/
├─ components/
│  ├─ layout/        顶部导航、全局搜索、地区选择、页脚
│  ├─ ui/            按钮/表单/弹窗/抽屉/分页/空状态/骨架屏/图元等基础组件
│  ├─ charts/        价格走势图、迷你走势图
│  ├─ home/          首页各分区组件
│  ├─ machinery/     农机卡片（列表与首页复用）
│  └─ shop/          商品卡片（列表与首页复用）
├─ pages/            32 个页面（22 个主页面 + user/ 个人中心 10 个子页）
├─ services/         统一 API 层（Mock 适配器 + 真实接口预留）
│  ├─ client.ts      请求封装、错误模型、Mock 延迟与失败注入
│  ├─ recognition.ts AI 识别服务（Mock provider / 远程 provider 可切换）
│  ├─ listings.ts    供需查询、分页、智能匹配评分
│  ├─ machinery.ts / products.ts / news.ts / prices.ts / search.ts
├─ store/            auth / cart / order / business(listing+booking) / userData / ui
├─ data/             演示数据：14 类病虫害、20 条供需、12 台农机、20 款农资、14 篇资讯、8 个品种行情
├─ hooks/            useAsync（loading/error/retry）、useInView、useCountUp、防抖等
├─ lib/              设计常量、格式化、校验、随机种子等工具
└─ types/            领域类型定义
```

---

## 四、已实现的业务闭环

| 流程 | 入口 → 结果 | 数据落点 |
| --- | --- | --- |
| 病虫害识别 | `/disease` 上传图片 → 选择作物 → 识别 → 结果 + 四类防控方案 + 用药参考 | 会话内状态；结果可收藏 |
| 供需发布 | `/market/publish` 填写 → 审核中 → 3 秒后自动通过 → 大厅/我的信息可见 | `agrilink:listings` |
| 询价 | 供需详情 → 发起询价 → 我的询价 → 6 秒后模拟回复 | `agrilink:inquiries` |
| 农机预约 | 农机详情 → 在线预约 → 订单（待确认→已确认）→ 我的预约 → 完成评价 | `agrilink:bookings` |
| 农资下单 | 商城 → 购物车 → 结算 → 生成订单（待付款）→ 模拟支付 → 待发货 → 确认收货 | `agrilink:cart` / `agrilink:orders` |
| 收藏 | 供需/农机/商品/文章 → 收藏 → 个人中心 | `agrilink:favorites` |
| 地址管理 | 个人中心 / 结算页新增、编辑、设默认、删除 | `agrilink:auth` |
| 搜索 | 顶部搜索 → 分组结果 → 分类查看 | 实时查询 |
| 行情 | 品种切换 → 周期切换 → 图表/区域价差/排行/历史表 | 演示数据生成 |

### 本地持久化键

```
agrilink:auth          账号、地址、地区
agrilink:cart          购物车
agrilink:orders        订单
agrilink:listings      我的供需信息
agrilink:bookings      农机预约
agrilink:favorites     收藏
agrilink:inquiries     询价
agrilink:notifications 消息通知
```

「账户设置 → 清空全部演示数据」可一键重置。

---

## 五、接入真实服务的边界

### 1. 后端 REST

复制 `.env.example` 为 `.env.local`，填写 `VITE_API_BASE_URL` 后，`services/client.ts` 会自动从 Mock 模式切换到真实 `fetch`，业务页面无需改动。

预留接口约定（详见 `services/client.ts` 头部注释）：

```
GET    /api/diseases?crop=&kind=&q=
GET    /api/diseases/:id
POST   /api/ai/recognize            multipart: image + crop
GET    /api/listings?type=&category=&region=&page=
POST   /api/listings
POST   /api/listings/:id/inquiries
GET    /api/machinery?category=&region=
POST   /api/bookings
GET    /api/products?category=
POST   /api/orders
GET    /api/prices/:symbol?range=&market=
GET    /api/news?category=&q=
POST   /api/auth/login
```

### 2. AI 病虫害识别

- 配置 `VITE_AI_ENDPOINT` 后自动使用远程 provider（`services/recognition.ts`）。
- 请求：`multipart/form-data`，字段 `image`（jpg/png/webp ≤ 8MB）与 `crop`。
- 响应结构见 `AI_API_CONTRACT`，必须返回 `simulated: false`，页面才会移除「模拟识别」标识。
- **当前未配置时为模拟识别**，结果由作物类型与图片特征哈希映射生成，UI 明确标注「模拟识别 · mock-v0.1.0」。

### 3. 行情数据

`data/commodities.ts` 使用固定随机种子生成 400 天价格序列，保证刷新后数据一致。接入真实行情时替换 `prices.ts` 的 `fetchCommoditySeries` 即可，图表与筛选逻辑无需调整。

### 4. 支付与物流

平台未接入支付。`/checkout` 提交后生成「待付款」订单，需在订单列表点击「模拟支付」体验状态流转，全程标注「模拟订单 / 不产生真实扣款」。

---

## 六、设计规范摘要

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `forest` | `#173D32` | 主品牌色、深色区块、主按钮 |
| `moss` | `#34745B` | 交互强调、链接、图标 |
| `sage` | `#83A88B` | 辅助绿、图表装饰 |
| `cream` | `#F6F5F0` | 页面背景 |
| `sand` | `#EDEADF` | 次级背景、标签底 |
| `clay` | `#E69A4A` | 强调橙、数据高亮 |
| `ink` / `muted` | `#26342D` / `#7A857D` | 主/次文字 |

- 字体：Inter + 中文系统字体（PingFang SC / HarmonyOS Sans / Microsoft YaHei），价格与编号使用等宽数字。
- 布局：12 栏非对称网格，卡片圆角 16–22px，1px 细边框 + 低饱和阴影；章节使用 `01 — 核心服务` 编号体系。
- 响应式断点：手机 `<640`、平板 `640–1024`、笔记本 `1024–1440`、宽屏 `≥1440`；列表页在移动端自动切换为纵向卡片与底部筛选抽屉。
- 图表：中国习惯配色，**涨红跌绿**。
- 动效：滚动淡入、数字滚动、悬停位移、抽屉/弹窗 220–750ms 缓动；支持 `prefers-reduced-motion`。

---

## 七、视觉素材说明

`public/images/` 中的农业摄影来自 Unsplash（Unsplash License，可免费商用），已本地化压缩，避免外链失效。
农机与农资商品使用平台自绘的「包装轮廓 + 图形符号」视觉体系，避免使用与商品不符的实拍图；生产环境可在 `ProductVisual` / `MachineryCard` 中替换为真实商品图。

---

## 八、质量验证

```bash
npm run build      # TypeScript 全量检查 + 生产构建
npm run qa         # 32 条路由巡检：控制台错误 / 横向溢出 / 截图
npm run qa:flow    # 9 条关键业务流端到端验证
npm run qa:links   # 全站链接可达性 + 无效 ID 降级体检
```

`npm run qa`、`npm run qa:flow` 与 `npm run qa:links` 依赖本机 Chrome 与 `playwright-core`（开发依赖），仅用于本地验证，不参与生产构建。三者默认连接 `http://127.0.0.1:5180`，可用 `BASE_URL` 环境变量覆盖。

最近一次验证结果：
- 32 条路由：桌面 1440px / 移动 390px 均无横向溢出、无控制台报错。
- 9 条业务流：登录、图片识别、方案页签、供需发布、加购下单、模拟支付、农机预约、全局搜索、收藏持久化全部通过。
- 78 个站内链接全部可达；6 个不存在的 ID（供需 / 商品 / 农机 / 资讯 / 行情 / 病害）均优雅降级到空状态，无白屏。

---

## 九、已知限制

1. 所有业务数据存于浏览器 localStorage，换设备或清缓存会丢失；未做多用户隔离。
2. 识别为模拟服务，不具备真实诊断能力。
3. 行情为生成数据，不支持真实交易所对接。
4. 未接入支付、物流、短信与实名核验，相关位置均有明确说明。
5. 图片上传仅做本地预览（base64），未上传服务器。

---

© 2026 耘链农业 AGRI LINK · 演示项目
