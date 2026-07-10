# DeepSeek 启动指南 —— 复制粘贴即可开工

> 用法：把下面的【启动 Prompt】整段复制给 DeepSeek，作为第一条消息。之后每开一个新阶段，用【阶段 Kickoff 模板】。
> 前提：DeepSeek 能访问本仓库 `E:\ccfold\shopify\docs\botanica-v3\` 这套文档。

---

## 【启动 Prompt】（第一条消息，整段复制）

```
你是一名资深 Shopify 主题工程师。我们要从零重建一个名为 Botanica 的主题，目标是通过 2026 年的 Shopify Theme Store 审核并出售。前一版是 Dawn 套壳，已被官方拒绝。

请先按顺序读取并完全遵守这套文档（在 docs/botanica-v3/）：
1. README.md          —— 全局与阅读顺序
2. 00-AUDIT.md        —— 为什么 v1 被拒、有哪些坑
3. 01-STRATEGY.md     —— 底座/定位/定价决策
4. 02-PLAN.md         —— ★ 你的主施工蓝图（铁律/设计北极星/架构/分阶段/section 规格/禁止项）
5. 03-WORKFLOW.md     —— 工作流与文件所有权
6. 04-COMPLIANCE.md   —— 提交前合规清单
7. 05-SPEC-PDP.md     —— 产品页(PDP)细粒度规格示例（其他 section 照此粒度推演）

不可违反的硬约束（来自 02-PLAN.md §1 铁律 + §9 禁止项）：
- 底座只能是 Shopify Skeleton（`shopify theme init`）。禁止使用或复制 Dawn / Horizon 的任何代码。
- 采用 theme-blocks 架构：顶层 blocks/ 目录 + {% content_for "blocks" %}；产品元素拆成独立 block；每个 JSON 模板支持 @app。
- 颜色用 color_palette（商家可改）；对比敏感元素禁硬编码颜色。
- 提交的任何 .json / schema default 禁止出现 botanica.* / custom. metafield / shopify:// 。
- 必含 Custom Liquid section；theme_info 用作者自有文档/支持 URL。
- 每写完一个文件跑 `shopify theme check`，必须 0 error；文件 UTF-8 无 BOM；不用 Sass；不预压缩；零外部 JS 库。
- 所有可见文本走 locales 的 t: key；a11y 一等公民（焦点环、ARIA、对比、reduced-motion）。

工作方式：
- 严格按 02-PLAN.md 的阶段 P0 → P5 顺序施工，每个阶段末尾有“🚦门禁”，未达门禁不得进入下一阶段。
- 现在从 P0（地基 + 合规骨架）开始。先列出 P0 要创建的文件清单和每个文件的职责，等我确认后再逐个生成代码。
- 每个阶段结束，输出该阶段的“门禁自检”结果（逐条对照 02-PLAN.md 与 04-COMPLIANCE.md）。

请先确认你已读完这 7 个文件并复述：①底座是什么 ②为什么不能用 Dawn ③养护数据用什么承载（不能用什么）。然后给出 P0 的文件清单。
```

---

## 【阶段 Kickoff 模板】（每进入新阶段时用）

```
进入阶段 P{N}（见 02-PLAN.md §6）。
- 你负责的文件：{从 03-WORKFLOW.md §5 文件所有权表抄对应行}
- 只读依赖：02-PLAN.md 的 §{相关小节}
- 本阶段门禁：02-PLAN.md §6-P{N} 末尾的“🚦门禁 P{N}”

请逐个文件生成代码。每个文件：
1. 顶部注释写明文件用途；
2. theme-blocks 用 schema + {% content_for "blocks" %}（如适用）；
3. CSS 用 {% stylesheet %} 作用域；JS 用 {% javascript %} 或 assets/*.js + defer；
4. 文本走 t: key（同时在 locales/en.default.json 补上对应 key）；
5. 自检：是否触犯 02-PLAN.md §9 任一禁止项？
生成完本阶段所有文件后，输出门禁自检表（逐条 pass/fail）。
```

---

## 【常见纠偏提示】（DeepSeek 跑偏时用）

- 它引用了 Dawn 的 component-*.css / global.js / 原生 section → “停。禁止 Dawn 代码，见铁律 1。请用 Skeleton + 原创实现。”
- 它把养护数据写成 product.metafields.botanica.* → “停。禁止自定义 metafield，见铁律 5。改用 care-row block 设置。”
- 它做了硬编码配色下拉 → “停。用 color_palette，商家必须能改色，见铁律 4。”
- 它做了倒计时/假库存/心愿单 → “停。禁止项，见 §9。”
- 它把首页堆很多 section 当作差异化 → “唯一性要嵌进 PDP/collection/cart/search 的原创架构，不是堆首页 section，见 §2/M1。”
