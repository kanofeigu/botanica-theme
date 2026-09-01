# Botanica v3 — 多-Agent 工作流（重写版，对齐 Skeleton 重建 + 内置审核门禁）

> 本文件替代旧的 `LOOP.md` / `AGENTS.md` / `CONTRACTS.md`（它们仍描述 Dawn 7-worker、6-section 的 v1 流程，已**整体过时**）。
> 用途：交给一个能 spawn 子 Agent 的编排器（Orchestrator），按 DAG 分波次并行把 `02-PLAN.md` 实现出来。
> 核心升级：把"为什么被拒"的三道真门（**唯一性门 / 设计门 / 合规门**）做进 barrier，而不只是查 theme-check。

---

## 1. 旧工作流为什么必须重写（优化点诊断）

| 旧工作流（LOOP/AGENTS/CONTRACTS） | 问题 | 新工作流 |
|---|---|---|
| 铁律 #1 "Dawn 基准，参考 Dawn 写法" | **致命**：Dawn 派生=一票否决 | 铁律改为"Skeleton 底座 + 全原创 + theme-blocks" |
| 7 个 worker，各做 1 个 v1 section（hero/care/spotlight…） | 与新计划（核心模板原创 + block 库）对不上 | 按 P0–P5 重排 worker 角色 |
| barrier 只查 `theme check` + CSS-link + BOM | **抓不到真正拒因**（唯一性/设计/合规） | barrier 增加唯一性门、设计 Stage-4 门、合规门、Lighthouse CI |
| CSS 命名 BEM + Dawn `--color-*` 变量 | 过时 | block 作用域 `{% stylesheet %}` + `color_palette` token |
| 配色"3 套 color_scheme_group" | 已弃用 | `color_palette`（商家可改） |
| 无设计质量评审环节 | v1 正是死在设计 | 增加"设计评审 Agent"（对照 Awwwards/Stage-4 清单） |
| 无合规审计环节 | 会在完整审核二次被拒 | 增加"合规审计 Agent"（对照 §8 清单） |

---

## 2. 文件体系（新）

```
docs/botanica-v3/
├── 00-AUDIT.md         ← 为什么这么改
├── 01-STRATEGY.md      ← 底座/定位/定价/渠道
├── 02-PLAN.md          ← ★ 施工蓝图（所有 worker 的真相源）
├── 03-WORKFLOW.md      ← 本文件（编排器入口）
└── 04-COMPLIANCE.md    ← 提交门禁清单（合规 Agent 用）
botanica/               ← Skeleton 主题源码（全新，丢弃旧 Dawn 树）
```
- **Orchestrator** 读：本文件 + `02-PLAN.md`（全文）。
- **每个 Worker** 只读：本文件 §4 铁律 + `02-PLAN.md` 中与自己相关的 §（避免读全部）。
- **评审/合规 Agent** 读：`02-PLAN.md §2/§8` + `04-COMPLIANCE.md`。

---

## 3. DAG 波次模型（对齐 P0–P5，按门禁推进）

```
wave-0  地基（串行，1 个 Worker）
  W-foundation → Skeleton init + design-tokens(color_palette) + theme.liquid + settings_schema(theme_info)
                + base.css + 自定义页头/页脚 + custom-liquid + apps.liquid + Lighthouse CI 接入
   │  🚦 barrier-0：theme check 0 error · CI 接通 · theme_info 作者URL · palette 可改 · 0 Dawn 代码
   ▼
wave-1  核心模板原创架构（并行，4 个 Worker）★唯一性主战场
  W-product   → PDP 原创布局 + 产品元素拆 block + @app + aria-live
  W-collection→ collection 原创网格+筛选 + card-product
  W-cart      → cart 原创 + 真实免运费进度条
  W-search    → search predictive + 分面
   │  🚦 barrier-1：唯一性门 + 性能60/无障碍90(CI 基准) + 键盘走通 + @app 全覆盖
   ▼
wave-2  Block 库 + 多用途/植物 section（并行，3–4 个 Worker，按 block 域切分，无文件重叠）
  W-blocks-core   → blocks/（eyebrow/heading/button/badge/card/care-row/meter/specimen…）
  W-sections-multi→ hero/rich-text/image-with-text/multicolumn/collage/featured-*/slideshow/faq…
  W-sections-plant→ shop-by-care/plant-spotlight/size-guide/care-blog-teaser（数据走 block 设置）
   │  🚦 barrier-2：每 section 有 schema+presets+@theme/@app · CSS 作用域 · 空块不破版
   ▼
wave-3  设计精修 + 现代特效（并行，2 个 Worker）★设计门
  W-artdirection → 纸纹/标本/oldstyle 数字/测量插画/精致计量器/微交互 4 态
  W-effects      → CSS 滚动驱动 + View Transitions + <dialog> quick-view + Popover + reduced-motion 守卫
   │  🚦 barrier-3：设计 Stage-4 自审(§2.3) + 无未完成感 + reduced-motion + 焦点环 + 性能仍≥60
   ▼
wave-4  预设 + demo + listing（并行，1 编排 + 内容 Agent）
  W-presets → settings_data.json 3 预设(色+字+构图差异) + /listings/<preset>/ + 截图规格
  W-demo    → 3 套真实 demo 内容（产品/博客/文案/授权图，零 Lorem Ipsum）
   │  🚦 barrier-4：3 预设显著不同 · demo 真实完整 · 打包含 /listings · 截图合规
   ▼
wave-5  合规 + 无障碍 + 提交（串行，2 个评审 Agent）★合规门
  A-a11y     → 手动键盘+读屏 home→checkout · 对比 · 触控 · dialog 焦点 · Nu HTML
  A-compliance→ 对照 04-COMPLIANCE.md 全清单 + 文案风格 + 去署名/外链 + 无 metafield/markets.json
   │  🚦 barrier-5（提交门）：§8 全绿 · CI 性能60/无障碍90 · theme check 0 · demo 加密码
   ▼
  提交（仅当全门绿；只剩 2 次机会，宁停勿赌）
```

> **关键：每个 barrier 不只是"跑 theme check"，而是"门禁 Agent 出具通过/驳回报告"。** 未过门禁不得进入下一波。

---

## 4. 全 Agent 铁律（替代旧 AGENTS.md）

> 所有 Worker/Agent 必读。违反任何一条都会导致主题被拒。

1. **Skeleton 底座 + 全原创**：禁用/禁抄 Dawn·Horizon 任何代码。可读它们作行为参考，ship 的每行原创。
2. **theme-blocks 架构**：复用单元是 `blocks/<name>.liquid`；section 用 `{% content_for "blocks" %}` 组装；产品元素拆 block；每个 JSON 模板支持 `@app`。
3. **唯一性嵌进核心模板**：PDP/collection/cart/search 都要原创布局与交互，不是首页堆 section。自检"商家无法把它调成另一个商店主题"。
4. **颜色走 `color_palette`**（商家可改）；对比敏感元素禁硬编码颜色；默认值过 4.5:1/3:1。
5. **数据禁依赖自定义 metafield**：JSON/schema default 禁出现 `botanica.*`/`custom.*`/`shopify://`；规格数据走 block/section 设置。
6. **0 error · 无 BOM · 不预压缩 · 不用 Sass · 零外部库**。CSS 用 `{% stylesheet %}` 作用域；JS ES module、defer、≤16KB。
7. **a11y 一等公民**：语义 HTML、`:focus-visible` 不抹除、ARIA、对比、触控 24×24(CTA 44×44)、reduced-motion 三层守卫、`<dialog>`/drawer 焦点陷阱+ESC+归还。
8. **文案走 `t:` key**（无硬编码可见文本）；按钮动词开头、sentence case、美式英语、无 `&`、不用 "homepage/slider/CTA"。
9. **职责隔离**：Worker 只写自己负责的文件（无重叠）；不碰他人文件；不读他人 SKILL/无关 §。
10. **禁止项**（§02-PLAN.md §9 全部）：假紧迫/心愿单/app 依赖/外部 script/分析/署名外链/markets.json。

---

## 5. 文件所有权契约（替代旧 CONTRACTS.md，防 Worker 冲突）

> 每个 Worker 只写自己列下的文件。`blocks/` 按块名切分到具体 Worker，`sections/` 按 section 切分，互不重叠。

| Worker | 拥有的文件（写） | 只读依赖 |
|---|---|---|
| W-foundation | `config/settings_schema.json`、`layout/*`、`assets/design-tokens.css`、`assets/base.css`、`sections/header*`、`sections/footer*`、`sections/custom-liquid.liquid`、`sections/apps.liquid`、header/footer-group.json | 02-PLAN §3/§4 |
| W-product | `sections/main-product.liquid`、相关 `blocks/product-*.liquid`、`snippets/price.liquid` | 02-PLAN §7.1，design tokens |
| W-collection | `sections/main-collection*.liquid`、`snippets/card-product.liquid`、相关 facet blocks | 02-PLAN §7.5 |
| W-cart | `sections/main-cart*.liquid`、`sections/cart-drawer.liquid` | 02-PLAN §6-P1 |
| W-search | `sections/main-search.liquid`、`snippets/predictive-search*` | — |
| W-blocks-core | `blocks/{eyebrow,heading,text,button-group,image,badge,care-row,care-table,light-meter,water-meter,specimen-tag,value-item,...}.liquid` | 02-PLAN §3.3/§7 |
| W-sections-multi | `sections/{hero,rich-text,image-with-text,multicolumn,collage,featured-collection,featured-product,collection-list,slideshow,newsletter,testimonials,logo-list,faq-accordion,gallery,contact-form}.liquid` | blocks 库 |
| W-sections-plant | `sections/{shop-by-care,plant-spotlight,size-guide,care-blog-teaser}.liquid` + 专属 blocks | 02-PLAN §7.1-7.4 |
| W-artdirection | `assets/effects.css`(纹理/微交互部分)、各 block 的视觉精修(协调，避免与作者冲突→改为提交"补丁建议"由 owner 合入) | 02-PLAN §2 |
| W-effects | `assets/effects.css`(动效)、`assets/quick-view.js`、`assets/mega-menu.js`、`assets/sticky-atc.js` | 02-PLAN §5 |
| W-presets | `config/settings_data.json`、`/listings/**` | 全 section presets |
| W-demo | demo store 内容（admin 操作，非主题文件）+ `release-notes.md` | 02-PLAN §6-P4 |

> ⚠ wave-3 的视觉精修容易跨 owner 改文件 → 约定：W-artdirection **不直接改**他人 block，而是产出"视觉补丁说明"，由 block 的 owner 合入；或把精修排在该 owner 完成后串行做。避免文件冲突。

---

## 6. Barrier 检查脚本（编排器在每个 barrier 运行）

```bash
# 通用（每个 barrier）
shopify theme check --path botanica         # 必须 0 error
# 自定义校验（扩展旧 verify.ps1，新增以下 gate）
#  - grep 禁止项：JSON 里无 botanica.* / custom. / shopify:// ；无 config/markets.json
#  - grep 无 Dawn 残留文件名 / Sass / 预压缩
#  - 每个 section 的 .liquid 含 schema + presets；每个 JSON 模板含 @app 支持
#  - theme_info 完整、URL 非 shopify.com
# barrier-1/3 额外：
shopify lighthouse-ci ...                    # 基准数据集，性能≥60 + 无障碍≥90（桌面+移动）
# barrier-3/5 额外：设计评审 Agent / 合规评审 Agent 出报告
```

**门禁判定 = 脚本绿 + 对应评审 Agent 报告 status=pass。** 任一不过 → 回退该波次 Worker 修复后重跑。

---

## 7. 评审 Agent 提示模板（新增的关键环节）

**设计评审 Agent（barrier-3）**：
> 你是资深 UI 设计评审。对照 `02-PLAN.md §2.3` 的 Shopify Stage-4 设计清单 + Awwwards 级标准，审查当前主题的首页/PDP/collection 截图与代码。逐条判定：唯一且刻意的设计 / 页面结构 / 内容层级 / 内容多变不破版 / 字体一致 / 专业视觉 / 无未完成感（无 `***`、无空盒、焦点环在）。输出 pass/fail + 每条具体问题 + 修复建议。**默认从严**：像 Dawn、有任何未完成感即 fail。

**合规评审 Agent（barrier-5）**：
> 你是 Shopify Theme Store 合规审计员。对照 `04-COMPLIANCE.md` 全清单逐条核：底座原创性、theme-blocks/@app/custom-liquid、color_palette、无自定义 metafield、theme_info、性能60/无障碍90、文案风格、去署名外链、无 markets.json、demo 真实、/listings 打包、截图规格。输出 pass/fail + 不合规项 + 修复指令。

---

## 8. 断点续跑 & 状态

- 编排器每个 wave/barrier 末尾写 `STATE.json`（current_wave、各 Worker status、verify_results、各 barrier pass/fail）。
- 重启先读 `STATE.json`，跳过 status=completed 的 Worker，从未过的 barrier 续跑。
- `STATE.json` 加入 `.gitignore`。

---

## 9. 给编排器的一句话

> **三道真门按顺序守死**：barrier-0/1 守"能不能过审"（Skeleton 底座 + 核心模板唯一性）；barrier-3 守"惊不惊艳"（设计 craft，对照 Awwwards/Stage-4）；barrier-4/5 守"完不完整"（真实 demo + 合规）。任何一道没绿，**不许提交**——只剩 2 次机会，宁停勿赌。
