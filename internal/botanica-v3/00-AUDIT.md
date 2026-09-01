# Botanica v3 — 审计报告（为什么被拒 + 计划里的错误与缺口）

> 文档目的：解释 v1 被拒的根因，并逐条审计现有 `docs/superpowers/` 计划（spec + implementation plan）中的错误/缺口。所有结论基于 2026-06 对 shopify.dev / help.shopify.com 官方文档的多代理调研与对抗式验证。
> 读者：项目所有者 + 后续施工的 AI（DeepSeek）。
> 配套文件：`01-STRATEGY.md`（战略决策）、`02-PLAN.md`（修正施工计划）、`03-WORKFLOW.md`（新工作流）。

---

## 0. 一句话结论

**v1 被拒的根因是：它是 Dawn 套壳，而自 2025-05-15 起，基于 Dawn/Horizon 派生的主题已被 Theme Store 彻底取消提交资格。** 这是"在审核第 1 阶段（资格/唯一性）就被刷掉、连完整审核都不给"的硬性失格，与拒信原文"won't proceed to a full review"完全吻合。叠加因素：①设计上确为 Dawn 套壳（无原创架构）②demo store 几乎是空的（无真实产品/博客）。

**好消息**：现有新计划（`docs/superpowers/`）已经选择"从 Skeleton 重建"——方向正确。
**坏消息**：新计划本身还有 **6 个 blocker 级 + 一批 major 级技术错误**，如果照它施工，会在完整审核里第二次被拒（而你只剩 2 次机会，第 3 次被拒封 90 天）。本报告把它们全部列出并给出修正。

---

## 1. v1 为什么被拒（根因分析）

### 1.1 拒信解读
拒信关键句：
- "we won't be proceeding with a **full review**" → 在设计初筛/资格阶段就停了。
- "surpass the offerings of our current theme store catalog, **including the free themes**" → 判定为没超过免费的 Dawn。
- "design choices, layout, consistency, accessibility, UX" 需要更高的"intentionality and sophistication"。
- "if your theme is rejected **3 times** → suspended for **90 days**" → 这是第 1 次，**只剩 2 次**。

### 1.2 三个根因（按权重）

| # | 根因 | 证据 | 严重度 |
|---|------|------|--------|
| 1 | **Dawn 套壳 = 一票否决** | 官方要求页（2025-05-15 生效）："Shopify's Skeleton Theme is the only approved codebase… New theme submissions built on or derived from **Dawn or Horizon are not eligible**." `botanica/sections/` 里 63 个文件大量是 Dawn 原生件（cart-drawer / predictive-search / main-product / quick-order-list…）。 | **blocker** |
| 2 | **设计无原创架构** | 官方"唯一性"判定明确把"color/typography swaps、加几个 section 到现有代码库"列为**不充分**。截图显示首页=左图右字最烂大街 hero、产品页/分类页=Dawn 默认布局、黄色 PayPal 按钮糊在莫兰迪色调上、计量器渲染成 `* * *`、博客是空灰盒。 | **blocker** |
| 3 | **demo store 是空的** | 作者确认"没有真实产品、没有真实博客"。官方要求 demo 必须是"完整、真实、无 Lorem Ipsum、专业图片"的运营级店铺。 | major |

> 结论：v1 不是"设计差一点"，而是**底座违规 + 无原创架构 + demo 空**三重失格。任何在 Dawn 上继续打磨的方案都不可能过审。

---

## 2. 8 条高风险论断的最终裁定（对抗式验证）

| # | 论断 | 裁定 | 对计划的影响 |
|---|------|------|-------------|
| 1 | `/listings/` 是主题预设目录、含每个预设的 `templates/` 子文件夹 | **部分成立** | `/listings/` 真实存在（2025-05 新增），但子文件夹是 `sections/`（section group 覆盖），**不是** `templates/`；预设"样式"定义在 `config/settings_data.json` 的 `presets` 里。计划的 `/listings/{preset}/templates/` 结构**错误**。 |
| 2 | 必须用 `color_scheme_group` 让商家可改色，硬编码下拉预设会被拒 | **部分成立** | 商家可改色（免代码）是硬要求 ✓；但不强制 `color_scheme_group`——新主题应用 **`color_palette`**（2–20 个命名色）。硬编码 5 预设、商家不可编辑 = **blocker**。 |
| 3 | 主题可依赖自定义 metafield 作核心功能、且不能自动建定义 | **部分成立** | "不能自动建定义、需商家手动"=对；但"可依赖自定义 metafield 作核心功能"=**错且危险**：提交的 JSON 里出现 `botanica.*` 自定义 metafield 是**点名拒因**，且在空店渲染为空。护城河数据必须走 **block/section 设置**。 |
| 4 | 性能门槛是 Lighthouse 桌面≥90、移动≥75 | **驳回** | 真实门槛 = 性能 **≥60** + 无障碍 **≥90**，按 home+product+collection 平均、桌面与移动都测、用 Shopify 基准数据集。 |
| 5 | 提交需要 20 个语言文件 | **部分成立** | 20 个**不是**要求；只需 **1 个 `*.default.json`**（通常 en.default.json）+ 用 `t:` key 国际化。20 个机翻文件是**负债**。 |
| 6 | Skeleton 可接受、Horizon+theme-blocks 是新方向 | **部分成立** | Skeleton 是**唯一**批准底座（强制，不只是"可接受"）；Horizon 是现代架构参考但**禁止**作底座。要"采用 theme-blocks 架构 + 建在 Skeleton 上"。 |
| 7 | theme_info 必须放作者自己的文档/支持 URL，指向 support.shopify.com 不行 | **部分成立** | 实质成立：需作者自有文档站 + 公开支持表单（help-desk/CRM，光邮箱不够）；`support.shopify.com` 能过 theme-check 但人审会因第三方主题判不合格。 |
| 8 | Theme Store 仍接受 Dawn 派生主题（只要够差异化） | **驳回** | 2025-05-15 前成立，**现在已失效**。Dawn/Horizon 派生主题一律不合格。这就是 v1 的根因。 |

---

## 3. 现有新计划（docs/superpowers）的错误与缺口

> 说明：新计划已正确选择 Skeleton 重建（方向对）。以下是它**仍然会导致二次被拒**的问题。严重度：**blocker**（必拒）/ **major**（很可能拒）/ **minor**（扣分/隐患）/ **enhancement**（提升项）。

### 3.1 Blocker 级（不改必拒）

| # | 问题（计划原文） | 修正 | 来源 |
|---|------|------|------|
| B1 | **配色系统**：spec §9 / plan task 0.5 用一个硬编码 `select` 的 5 套 `--bt-*` 预设，商家不能改色。 | 改用 **`color_palette`**（2–20 个命名色，写在 settings_schema.json），把 `--bt-*` token 用 `{{ settings.colors.<key> }}` 动态注入；预设作为 settings_data.json 的 `presets` 叠加在可编辑色之上，而非取代。对比敏感元素（文字/背景/按钮）禁止硬编码颜色。 | color-system best practices；requirements |
| B2 | **metafield 护城河**：spec §12.3 / plant-spotlight 用 `care_row` 读 `botanica.light_level` 等自定义 metafield 作核心数据源。 | 提交的任何 `templates/*.json`、`sections/*.json`、schema default **绝不能**出现 `botanica.*` / `custom.*` / `shopify://`。养护/尺寸/毒性数据一律做成 **block/section 设置**（商家在编辑器里填），section 在空店也能完整渲染；metafield 绑定只能是"可选增强"，由商家在 theme editor 手动接。 | requirements（"don't include resources specific to your demo store… custom metafields"）；dynamic-sources |
| B3 | **`/listings/` 结构错误**：plan task 1.7 建 `/listings/{preset}/templates/index.json`。 | 预设样式定义在 `config/settings_data.json` 的 `presets`（≤5 个）。`/listings/<preset>/` 只放**可选的 `sections/`** section-group 覆盖，**没有 `templates/`**。用 `shopify theme package` 生成 zip 自动带 `/listings`。 | 验证#1；settings-data-json；theme-package CLI |
| B4 | **缺 Custom Liquid section（强制项）**：计划全程未提。 | 新增一个 Custom Liquid section（含一个 `type: "liquid"` 的设置），在所有支持 section 的模板可用。 | requirements |
| B5 | **缺 `@app` block 支持 + 产品元素未拆块（强制项）**：plan 把 product/featured-collection 当"Dawn 件 used as-is"。 | 每个 JSON 模板支持 `@app` blocks；main-product section 把 price/vendor/description 等**拆成独立 block**；加 `apps.liquid`（或 `_blocks.liquid`）包装 section（含 `@app`/`@theme` block 类型 + preset）。 | app-blocks；requirements |
| B6 | **theme_info 用了 Shopify 自家 URL**：plan task 0.5 把 `theme_documentation_url` 设成 help.shopify.com、`theme_support_url` 设成 support.shopify.com。 | 换成**作者自有**：真实文档站（含 FAQ）+ 公开支持联系表单（help-desk/CRM）。提交前这些基础设施必须先上线（支持 SLA：2 个工作日内回复）。`theme_info` 里 `theme_support_url` 与 `theme_support_email` **二选一**（同时给会报错）。 | requirements；settings-schema-json |

### 3.2 Major 级（很可能拒/重大扣分）

| # | 问题 | 修正 | 来源 |
|---|------|------|------|
| M1 | **重心错位：堆 32 个 section ≠ 设计原创性**。拒你的是"设计 craft + 架构唯一性"，不是功能数量。 | 重心从"功能多"转向"少而精 + 架构原创"。优先把**唯一性嵌进核心模板**（PDP/collection/cart/search 的原创布局与交互），而非首页堆 section。质量 > 数量。 | requirements §2/§3 |
| M2 | **性能/无障碍门槛写错**：CLAUDE/PLAN 写"Lighthouse ≥80"，spec 写 ≥90/75，且无障碍没当硬门。 | 改成真实门：**性能≥60 + 无障碍≥90**（home/product/collection 平均，桌面+移动）。无障碍升为一等公民：手动键盘+读屏走通 home→checkout；对比度 4.5:1 正文 / 3:1 大字；触控目标 24×24（CTA 做 44×44）。接入 Shopify Lighthouse CI GitHub Action 用基准数据集测（不是测你的 demo）。 | requirements；performance/accessibility best practices |
| M3 | **架构停留在 Dawn 扁平 section 模型**，几乎不用 `blocks/`。 | 采用 **theme-blocks 架构**：顶层 `blocks/` 目录放可复用、可嵌套的 block（eyebrow/badge/button/care-row/card/spotlight-media…），用 `{% content_for "blocks" %}` 组装进更薄的 section；公开/私有块用 `_name.liquid` 区分。这是 2025 reviewer 期待的现代架构，也是"看起来不像 Dawn"的关键。 | blocks 架构文档；Horizon 参考 |
| M4 | **效果层用 JS IntersectionObserver + JS 视差**（Dawn 遗产）。 | 升级为 **CSS-native**：滚动驱动动画 `animation-timeline: view()/scroll()`（三层守卫：`prefers-reduced-motion` → `@supports` → `animation-duration:1ms`）；跨文档 **View Transitions**（产品卡→PDP morph）；quick-view 用原生 `<dialog>`；tooltip 用 Popover API。少 JS、过性能门、且"高级感"。 | modern effects 报告 |
| M5 | **demo store 必须重做**：每个预设要有**自己的**真实 demo store + 行业/目录规模标签 + 独立 listing 页 + 专属截图（桌面 1000×1248 或 2000×2496、移动 750×1334、3 张 highlight 1600×1200）。 | 建真实植物目录（命名产品、真实养护文案、价格、含 on-sale/sold-out/多变体/gift-card 示例）、真实博客文章、专业/授权图片（Shopify Burst 或授权摄影；AI 图需逐张过"专业且无侵权"关并留版权记录）。零 Lorem Ipsum。 | requirements §3/§20；listings |
| M6 | **缺合规清单**：无"去除作者署名/外链、独占分发、排除 config/markets.json、设置文案风格"等检查。 | 见 `02-PLAN.md` 的提交门禁清单：禁外部 script/分析/追踪；禁假紧迫（倒计时/假库存）/心愿单/app 依赖核心功能；禁 Sass/预压缩；设置文案用 sentence case、美式英语、动词开头按钮、无 & 、不用 "homepage/slider/CTA"。 | requirements |

### 3.3 Minor / Enhancement

| # | 问题 | 修正 |
|---|------|------|
| m1 | 20 语言机翻 = 负债 | 只保 `en.default.json`（+ `*.schema.json`）做到完整精准；其余只留你能保证质量的语言，宁缺毋滥。 |
| m2 | 主题/预设命名规则 | 预设名不能是行业词（"Plant/Garden"）、SEO/性能词（"Mobile/Sales"）、不含公司/作者名；≤30 字符、sentence case、上传后不可改。审一遍 "Botanica" 及所有预设名。 |
| m3 | 字体 handle | 确认 Fraunces/Inter 在 Shopify Font Library 存在，用 `font_picker` 默认值（handle 不存在会静默上传失败）。 |
| e1 | 无代码间距/内边距控制 | 竞品最大差评是"深度定制要写代码"。把 per-section 间距/内边距做成无代码设置，作为卖点。 |
| e2 | 现代 CSS 红利 | 用 `color-mix()` 派生 hover/tint、container queries 做卡片内响应、subgrid 对齐卡片行、`text-wrap: balance` 给标题。 |

---

## 4. 计划里做对了、要保留的部分

不是全盘推翻——以下是 spec/plan 的优点，迁移到 Skeleton 重建时保留：

- ✅ **从 Skeleton 重建**的大方向（plan task 0.1）——正确。
- ✅ **设计 token 层**（design-tokens.css 的 sage/cream/terracotta/bark 分档、字号 clamp 阶梯、阴影/缓动变量）——保留，但颜色改为从 `color_palette` 注入。
- ✅ **4 层 CSS 架构**思路（token → base → animations → section）——保留，但 section 层改为 block 作用域 + `{% stylesheet %}`。
- ✅ **reduced-motion 合规**（spec §4.6）——保留并强化为三层守卫。
- ✅ **可访问性意识**（spec §11）——保留，但要从"Lighthouse 数字"升级为"含手动键盘+读屏"。
- ✅ **植物百科/editorial 美学方向**——保留为**艺术指导**，但必须做进像素（纹理、标本标签、字体戏剧性、构图），不能只停在 eyebrow 文案。
- ✅ **vanilla JS、零外部库**——保留，且进一步用 CSS-native 替代部分 JS。
- ✅ **CRO 互动（quick-view/sticky-ATC）**——保留，但用原生 `<dialog>`/Popover 实现，且严禁假紧迫/心愿单/app 依赖。

---

## 5. 结论与下一步

1. **v1 不可救**——Dawn 底座违规，必须丢弃作 throwaway 原型。
2. **新计划方向对、细节错**——按本报告 §3 修正后才能用。
3. 详见 `01-STRATEGY.md`（底座/定位/定价/渠道的最终建议）、`02-PLAN.md`（给 DeepSeek 的修正施工计划）、`03-WORKFLOW.md`（对齐的新多-Agent 工作流）。
