# Botanica v3 — 修正施工计划（给 AI 实施者 / DeepSeek 直接执行）

> **本文件是自包含的施工蓝图。** 实施者（DeepSeek）无法访问产生本文件的对话，所需上下文已全部写入。配套：`00-AUDIT.md`（为什么这么改）、`01-STRATEGY.md`（战略）、`03-WORKFLOW.md`（多-Agent 工作流）、`04-COMPLIANCE.md`（提交门禁清单）。
> **目标**：做一个能通过 2026 Shopify Theme Store 审核、并在商店里卖得动的**多用途精品主题**，首发 demo 为植物店（"Botanical editorial / 植物百科"美学）。
> **代号**：Botanica（多用途主题，植物旗舰预设）。

---

## 0. 如何使用本文件（给实施者）

1. **先读 §1 铁律和 §2 设计北极星**，它们约束你之后的每一个决定。
2. **按 §6 的阶段（P0→P5）顺序施工**，每阶段末尾有**验收门禁**，未过门禁不得进入下一阶段。
3. **§7 是每个自定义 section/block 的详细规格**，施工到对应阶段时查阅。
4. **§8 是提交前的合规自审清单**（对齐 Shopify 5 阶段审核），提交前逐条勾。
5. **§9 是绝对禁止项**（v1 踩过的雷 + 官方点名拒因），任何时候不得触犯。
6. 每写完一个文件，运行 `shopify theme check`，必须 **0 error**。

---

## 1. 铁律（最高优先级，违反任何一条都会导致被拒）

> 这些来自 2026-06 对 shopify.dev 官方要求的核实。

1. **底座只能是 Skeleton。** `shopify theme init`（默认克隆 `Shopify/skeleton-theme`）。**禁止**使用、复制、移植 Dawn 或 Horizon 的任何代码（component-*.css、原生 section、JS 模块都不行）。Dawn/Horizon 派生主题一律不合格。可把它们当**只读行为参考**，但 ship 的每一行都必须原创。
2. **架构唯一性是硬门。** 官方明确把"换色/换字体/调间距/加几个 section 到现有代码库"列为**不充分**。唯一性必须嵌进**所有核心模板**（PDP/collection/cart/search）的原创布局与交互，不只是首页。
3. **采用 theme-blocks 架构。** 顶层 `blocks/` 目录放可复用、可嵌套的 block；section 用 `{% content_for "blocks" %}` 组装。产品主区把 price/vendor/description 等拆成独立 block。每个 JSON 模板支持 `@app` blocks。
4. **颜色商家可编辑（免代码）。** 用 `color_palette`（2–20 个命名色）。**禁止**硬编码不可改的配色下拉。对比敏感元素（文字/背景/按钮）禁止硬编码颜色。
5. **核心数据不依赖自定义 metafield。** 提交的任何 `.json` / schema default **禁止**出现 `botanica.*`、`custom.*`、`shopify://`（点名拒因）。养护/规格数据走 **block/section 设置**。
6. **必含 Custom Liquid section**（一个 `type: "liquid"` 设置）。
7. **theme_info 用作者自有 URL**：真实文档站 + 公开支持表单；`theme_support_url`/`theme_support_email` 二选一。
8. **性能/无障碍硬门**：Lighthouse 性能 **≥60** + 无障碍 **≥90**（home+product+collection 平均、桌面+移动、Shopify 基准数据集）。
9. **0 error**：`shopify theme check` 每次必须零 error。**无 BOM**（UTF-8 without BOM）。**不预压缩** css/js（Shopify 自动压缩）；**不用 Sass**。
10. **禁止项**：外部 script/分析/追踪、app 依赖的核心功能、假紧迫（倒计时/假库存/假浏览数）、心愿单、作者署名/外链/联盟链接、`config/markets.json`。独占 Theme Store 分发。

---

## 2. 设计北极星（这是 v1 真正失败的地方，最高投入区）

> 拒信原话：要"surpass… including the free themes"、要"intentionality and sophistication"、参考 **Awwwards**。v1 失败因为它=Dawn 默认布局 + 未完成细节。本节定义"看起来值 $30,000 定制"的标准。

### 2.1 设计语言
**"Botanical editorial / 植物百科"**——像翻一本印刷精良的植物图鉴：纸张质感、标本标签、测量插画、田野笔记、克制留白、戏剧性字体。但这套美学只是**旗舰预设**的表达；主题骨架是中性、灵活、可重组的，能换装成家居/护肤等其他预设。

### 2.2 必须做到的"完成度"信号（逐条对照 v1 的失败）
| v1 的失败 | v3 必须做到 |
|---|---|
| 计量器渲染成 `* * *` | 光照/水分用**精致 SVG**（实心圆点/水滴渐进填充 + label），有动效，对比清晰 |
| 信任栏图标又小又灰 | 图标够大、对比够、有节奏 |
| 博客是空灰盒 | demo 填满真实文章 + 专业图 |
| 黄 PayPal 按钮糊在调色上 | 动态结账按钮收进统一视觉（或按 Shopify 规则保留但与品牌协调） |
| 左图右字烂大街 hero | **有艺术指导的非对称构图**：景深、纸纹、标本标签、字体戏剧性 |
| Dawn 默认产品/分类页 | **原创** PDP/collection 布局（§7） |
| 概念只在 eyebrow 文案 | 概念**落进像素**：纸纹 overlay、标本边框、测量插画、oldstyle 数字 |

### 2.3 设计审核 Stage-4 自检（官方明列的评分点）
施工时每个页面都要满足：唯一且刻意的设计 / 清晰有组织的页面结构（栅格、刻意的间距对齐）/ 清晰的内容层级（大小/颜色/对比/位置）/ 内容多变时布局仍"刻意"（无尴尬空隙、无破版）/ 字体一致（不过多字体、搭配协调）/ 专业级视觉（无模糊/拉伸/像素化/剪贴画）。

---

## 3. 技术地基与目录结构

### 3.1 运行时目录（Skeleton，7 个标准目录）
```
botanica/
├── assets/        # CSS/JS/SVG/图片（每个 block/section 可用 {% stylesheet %}/{% javascript %} 内联作用域）
├── blocks/        # ★ theme blocks（可复用、可嵌套）—— 现代架构的核心单元
├── config/        # settings_schema.json（含 theme_info + color_palette）、settings_data.json（presets）
├── layout/        # theme.liquid、password.liquid
├── locales/       # en.default.json（+ *.schema.json）必需；其他语言可选
├── sections/      # 较薄的 section，用 {% content_for "blocks" %} 组装 blocks
├── snippets/      # 纯函数式可复用片段（icon、price、responsive-image 等）
└── templates/     # JSON 模板（OS 2.0），含 templates/customers/
```
> **提交打包**才有的目录（非运行时，用 `shopify theme package` 生成）：`/listings/<preset>/`（可选放 `sections/` section-group 覆盖）。**不要**手动在运行时引用它。**不要**建 `/listings/<preset>/templates/`（错误结构）。

### 3.2 必须覆盖的模板（除 Customer Account/Gift Card/Checkout 外全部 JSON + 支持 section）
`index, product, collection, list-collections, cart, search, page, page.contact, blog, article, 404, password, gift_card` + `customers/{account,activate_account,addresses,login,order,register,reset_password}`。

### 3.3 theme-blocks 架构（务必理解）
- **theme block** = `blocks/<name>.liquid`，可被多个 section 复用，可嵌套（最多 8 层）。
- section 在 schema 里声明 `"blocks": [{ "type": "@theme" }, { "type": "@app" }]`，然后在 markup 里用 `{% content_for "blocks" %}` 动态渲染子块；或用 `{% content_for "block", type: "...", id: "..." %}` 静态渲染。
- **公开/私有块**：`_name.liquid`（下划线前缀）= 私有，不出现在 `@theme` 选择器里，可被显式引用。用它收纳内部小块，curate 编辑器体验。
- **顶层 app/theme 块包装**：提供 `sections/apps.liquid`（支持 `@app`、含 preset、不用 `templates` schema 属性）和/或 `_blocks.liquid`（支持 `@theme`+`@app`、含 preset、渲染 `{% content_for "blocks" %}`），让商家能在任意模板顶层插入 app/theme 块。

**示例：一个 theme block（blocks/eyebrow.liquid）**
```liquid
{% comment %} blocks/eyebrow.liquid — 可复用小标签 {% endcomment %}
<p class="bt-eyebrow" {{ block.shopify_attributes }}>{{ block.settings.text }}</p>
{% stylesheet %}
  .bt-eyebrow{font:600 var(--bt-fs-eyebrow)/1 var(--bt-font-body);letter-spacing:.16em;text-transform:uppercase;color:var(--bt-color-accent);opacity:.85}
{% endstylesheet %}
{% schema %}
{ "name": "t:blocks.eyebrow.name",
  "settings": [{ "type": "text", "id": "text", "label": "t:blocks.eyebrow.text", "default": "Botanical field guide" }],
  "presets": [{ "name": "t:blocks.eyebrow.name" }] }
{% endschema %}
```

**示例：一个组装 section（sections/spotlight.liquid 片段）**
```liquid
<section class="bt-spotlight color-{{ section.settings.color_scheme }}">
  <div class="bt-spotlight__inner">{% content_for "blocks" %}</div>
</section>
{% schema %}
{ "name":"t:sections.spotlight.name",
  "blocks":[{"type":"@theme"},{"type":"@app"}],
  "settings":[ /* color_scheme(palette引用)、layout、padding 无代码控制 */ ],
  "presets":[{"name":"t:sections.spotlight.name","blocks":[
    {"type":"eyebrow"},{"type":"heading"},{"type":"spotlight-media"},{"type":"care-table"}
  ]}] }
{% endschema %}
```

---

## 4. 设计系统（具体数值，DeepSeek 直接落）

### 4.1 颜色 → `color_palette`（在 settings_schema.json 定义，商家可改）
```json
{
  "name": "t:settings.colors",
  "settings": [
    { "type": "color_palette", "id": "colors",
      "label": "t:settings.color_palette",
      "definition": [
        { "id": "background", "label": "Background", "default": "#F5F1E8" },
        { "id": "surface",    "label": "Surface/Card", "default": "#FAF7EF" },
        { "id": "text",       "label": "Text", "default": "#2E2A24" },
        { "id": "text_muted", "label": "Muted text", "default": "#4D4840" },
        { "id": "primary",    "label": "Primary/Accent", "default": "#4A6B4F" },
        { "id": "primary_contrast","label":"On-primary text","default":"#FFFFFF" },
        { "id": "secondary",  "label": "Secondary accent", "default": "#C97D5A" },
        { "id": "border",     "label": "Border", "default": "#2E2A24" }
      ]
    }
  ]
}
```
> 在 `layout/theme.liquid` 的 `{% style %}` 里把 palette 注入 `--bt-color-*` token：`--bt-color-bg: {{ settings.colors.background }};` 等。`--bt-*` 间接层保留，但**源头是可编辑 palette**。对比敏感元素只能用 palette token，**不得**硬编码。
> 校验：默认值必须过 4.5:1（正文）/ 3:1（大字/边框）。⚠ terracotta `#C97D5A` 在 cream 上**不过** 4.5:1——只能用于大标题或加深；hero 文字压图必须有渐变 scrim。

### 4.2 字体（Shopify Font Library handle，`font_picker`）
- 标题：**Fraunces**（serif，编辑感，开 `font-variant-numeric: oldstyle-nums`）
- 正文：**Inter**（sans）
- 用 `font_picker` 设默认；`font_face` 加载；`size-adjust` fallback 防 CLS。确认两者 handle 在 Font Library 存在。

### 4.3 字号阶梯（fluid，clamp）
```
--bt-fs-display: clamp(3.2rem,5vw,5.6rem)   --bt-fs-h1: clamp(2.2rem,3.5vw,3.2rem)
--bt-fs-h2: clamp(1.8rem,2.5vw,2.4rem)      --bt-fs-h3: clamp(1.4rem,1.8vw,1.8rem)
--bt-fs-body: 1rem  --bt-fs-eyebrow:.72rem  --bt-fs-specimen:.68rem
```
标题 `text-wrap: balance`；正文 max-width 65ch、`text-wrap: pretty`（增强）。

### 4.4 间距/圆角/阴影/缓动 token
保留 v2 设计的 `--bt-space-*`（4–80px 阶梯 + section clamp）、`--bt-radius-*`（标签 2–4px / 卡片 14px）、暖褐阴影 `rgba(46,42,36,*)`（非纯黑）、缓动 `--bt-ease-out: cubic-bezier(.16,1,.3,1)`。**所有间距提供无代码 section 设置**（卖点 e1）。

### 4.5 CSS 分层
```
design-tokens（含 palette 注入） → base（reset/排版/.bt-btn/表单/卡片原语） → effects（@keyframes + 滚动驱动 + reduced-motion 守卫） → block/section 作用域（用 {% stylesheet %} 内联，Shopify 自动按渲染树子集化）
```

---

## 5. 现代特效与交互（CSS-native 优先，过性能门 + 高级感）

> 替换 v2 计划里的 JS IntersectionObserver/JS 视差。全部 `prefers-reduced-motion` 守卫，禁自动播放（或给暂停控件）。

| 用途 | 用什么（2026） | 守卫/降级 |
|---|---|---|
| 滚动入场/视差 | CSS 滚动驱动 `animation-timeline: view()/scroll()`，只动 `transform/opacity` | `@media (prefers-reduced-motion:no-preference){ @supports(animation-timeline:view()){…animation-duration:1ms} }`；不支持则静态可见 |
| 页面切换 morph | 跨文档 View Transitions：`@view-transition{navigation:auto}` + 产品卡↔PDP `view-transition-name` | reduced-motion 关闭；Firefox 自动降级为普通跳转 |
| Quick view 弹层 | 原生 `<dialog>`（免 focus-trap、ESC、焦点归还）+ 手动 backdrop 点击关 | 渐进增强 |
| Tooltip/尺寸气泡 | Popover API | 渐进增强 |
| 颜色派生 | `color-mix()` 派生 hover/tint/border | 有 fallback 值 |
| 卡片内响应 | container queries；卡片行对齐 subgrid | `@supports` 守卫 |
| 轮播 | `scroll-snap`（基础，全支持）；CSS 轮播按钮/标记仅 Chrome → `@supports` 增强 | 可滚动容器兜底 |

JS 预算：**≤16KB minified**（Shopify 指南），全部 ES module、defer、零外部库。

---

## 6. 分阶段施工（按门禁推进，不按周数）

### P0 — 地基 + 合规骨架
**产出**：可渲染的 Skeleton 主题，带设计 token、theme_info、color_palette、自定义页头/页脚、Custom Liquid section、apps 包装。
- [ ] `shopify theme init` 克隆 Skeleton；建 §3.1 目录。
- [ ] `assets/design-tokens.css`（§4，颜色从 palette 注入）。
- [ ] `assets/base.css`（reset/排版/.bt-btn/表单/卡片原语，原创）。
- [ ] `config/settings_schema.json`：**theme_info（作者自有 URL）** + **color_palette** + typography(font_picker) + layout(无代码间距) + 其余分组。
- [ ] `layout/theme.liquid`：原创骨架，`<html lang>`、skip-link→`#MainContent`(tabindex=-1)、palette→token 注入、font_face、`content_for_header`。
- [ ] **自定义页头**（原创导航系统：非 Dawn 布局，支持 mega-menu via theme blocks）。
- [ ] **自定义页脚**（多列 + newsletter + 社交 + 支付图标，section group）。
- [ ] `sections/custom-liquid.liquid`（强制项，`type:"liquid"` 设置）。
- [ ] `sections/apps.liquid`（`@app` + preset，无 `templates` 属性）。
- [ ] header/footer 用 section group（`sections/header-group.json` / `footer-group.json`）。

**🚦门禁 P0**：`theme check` 0 error；接入 Shopify Lighthouse CI GitHub Action（基准数据集）；theme_info 完整且为作者自有 URL；color_palette 商家可改；首页空壳能渲染。

### P1 — 核心模板的原创架构（★唯一性主战场，最高投入）
> 这是 v1 最致命的短板（PDP/collection 是 Dawn 默认）。这里决定能否过"唯一性"门。
- [ ] **PDP（main-product）**：原创布局（例：编辑式分栏画廊 + sticky 养护面板 + 田野笔记 + 标本牌）。**产品元素拆成独立 block**：title/price/vendor/variant-picker/quantity/buy-buttons/description/care-table/share，section 声明 `@theme`+`@app`、用 `{% content_for "blocks" %}`。变体价/库存变化用 `aria-live` 播报；售价/原价用 visually-hidden 区分。
- [ ] **collection**：原创网格 + 原创筛选体验（按养护难度/光照/空间等**用 block 设置或标准筛选**，非自定义 metafield）。原创产品卡（§7）。
- [ ] **cart**：原创购物车（含免运费进度条——**真实**基于 cart total，非假数据；养护贴士 upsell 用真实 block）。
- [ ] **search**：predictive search + 分面筛选，原创样式。
- [ ] 产品卡 snippet：难度徽章/光照 icon/库存 badge（数据来自 block 设置或产品原生属性，**非自定义 metafield**）。

**🚦门禁 P1**：四大核心模板均为原创架构（自检"商家无法把它调成另一个商店主题的样子"）；产品元素已 block 化；每个 JSON 模板支持 `@app`；性能≥60 / 无障碍≥90（用 CI 基准测）；键盘可走通 home→PDP→加车。

### P2 — Block 库 + 多用途 section
- [ ] **可复用 theme blocks**（`blocks/`）：`eyebrow, heading, text, button-group, image, badge, care-row, care-table, light-meter, water-meter, specimen-tag, spotlight-media, editorial-quote, value-item, size-card, testimonial, logo-item, social-item`。每个自带 `{% stylesheet %}` 作用域 CSS + schema + a11y。
- [ ] **多用途 section**（用 blocks 组装，薄壳）：`hero`（多布局：分栏/堆叠/全幅+scrim）、`rich-text`、`image-with-text`、`multicolumn`、`collage`、`featured-collection`、`featured-product`、`collection-list`、`slideshow`（可暂停）、`newsletter`、`testimonials`、`logo-list`、`faq-accordion`（原生 `<details>`）、`gallery`、`contact-form`。
- [ ] **植物专属 section**（旗舰 demo 用，做成多用途友好）：`shop-by-care`、`plant-spotlight`、`size-guide`、`care-blog-teaser`。数据全部走 block 设置（§7、铁律 5）。

**🚦门禁 P2**：所有 section 有 schema + presets + 至少 1 个 `@theme`/`@app` 支持；CSS 作用域化；内容多变不破版（空块不输出孤立标签）。

### P3 — 设计精修（艺术指导落像素）+ 现代特效
> 把 §2 的设计北极星真正做出来。这是把"合规主题"升级成"Awwwards 级"的阶段。
- [ ] 纸纹 overlay、标本边框、oldstyle 数字、测量插画 SVG、精致计量器（替掉 `***`）。
- [ ] §5 全部 CSS-native 特效 + reduced-motion 三层守卫。
- [ ] Quick view（`<dialog>`）、sticky ATC（移动端，键盘可达、不遮挡焦点）、mega-menu（theme blocks + 键盘箭头）。
- [ ] 微交互：hover lift、underline reveal、按钮 active scale、表单 error shake/success、加车 cart bounce。全部 4 态（hover/active/focus-visible/disabled）。
- [ ] 跨文档 View Transitions（产品卡→PDP morph）。

**🚦门禁 P3**：设计 Stage-4 自检（§2.3）逐条过；无 `***`/空盒/未完成感；所有动效 reduced-motion 守卫；焦点环未被自定义 CSS 抹除；性能仍≥60。

### P4 — 预设（3 个）+ 真实 demo store + listing 资产
- [ ] **3 个差异化预设**（写进 `settings_data.json` `presets`，≤5、文件≤1.5MB；色+字+构图三维都不同）：
  1. **Botanical**（旗舰，cream/sage/terracotta，editorial）
  2. **Home & Decor**（中性、留白、建筑感）
  3. **Wellness / Apothecary**（terracotta 暖调、有机）
- [ ] 每个预设：一套**真实 demo store**（命名产品、真实文案、价格、含 on-sale/sold-out/多变体/gift-card；真实博客文章；专业/授权图片，AI 图逐张过关+留版权记录；零 Lorem Ipsum），匹配行业标签（≤2/20）+ 目录规模（1/4），install 状态镜像 demo。
- [ ] `/listings/<preset>/`（如需 section-group 覆盖放 `sections/`）；用 `shopify theme package` 打包。
- [ ] listing 截图：桌面 1000×1248 或 2000×2496、移动 750×1334、3 张 highlight 1600×1200（无 GIF、无 Shopify logo）。

**🚦门禁 P4**：3 预设视觉显著不同；每预设 demo 真实完整；打包含 `/listings`；截图合规。

### P5 — 合规 + 无障碍 + 提交
- [ ] **无障碍手动审**：键盘走通 home→product→cart→checkout 无陷阱；NVDA/VoiceOver 读产品/分类/购物车/弹层；对比度全过；触控 24×24（CTA 44×44）；`<dialog>`/drawer 焦点陷阱+ESC+焦点归还；SVG `aria-hidden`/`role=img`+title；Nu HTML Checker 0 error。
- [ ] **文案风格**：sentence case、美式英语、动词开头按钮、无 `&`、不用 "homepage/slider/CTA/meta-nav"。
- [ ] **基础设施**：文档站（含 FAQ、语法干净）+ 公开支持表单（help-desk/CRM）上线；`release-notes.md`（zip 根，merchant-facing）。
- [ ] **i18n**：`en.default.json` + `*.schema.json` 完整精准；URL 用 `routes` 对象（不硬编码 `/cart`）；`t:` key 无硬编码文本。其他语言宁缺毋滥。
- [ ] **清理**：去除所有作者署名/外链/联盟链接；zip 不含 `config/markets.json`；无自定义 metafield/`shopify://` 在 JSON；无 Sass/预压缩；保留 `powered_by_link`。
- [ ] 跑完 **§8 提交门禁清单** + `03-WORKFLOW.md` 的 5 阶段自审。

**🚦门禁 P5（=提交门）**：§8 全绿；Lighthouse CI 性能≥60/无障碍≥90（基准、桌面+移动）；theme check 0 error/0 warning；3 demo store 就绪并加 reviewer 密码。→ 才可提交。

---

## 7. 关键自定义 section/block 规格（DeepSeek 详查）

> 通则：①数据全部走 block/section 设置，禁自定义 metafield ②每个块自带作用域 CSS + a11y 契约 ③空设置不输出孤立标签 ④至少支持 `@theme`/`@app`（适用时）。

### 7.1 plant-spotlight（植物聚焦）
- 组成 blocks：`eyebrow` + `heading` + `spotlight-media`（4:5 画框 + 纸纹 + 标本牌）+ `care-table`（光照/水分/湿度/尺寸/毒性行，每行 = 图标圆 + label + 值/计量器）+ `editorial-quote`（田野笔记，terracotta 左边框）+ `button-group`。
- 养护数据：**`care-row` block 设置**（label 文本 + 值文本 + 计量器等级 select），商家填；可选 dynamic-source 接**标准** "Care guide" 定义（绝不默认绑自定义 metafield）。
- a11y：care-table 用真 `<table>`+`<caption>`；计量器有 visually-hidden 文本（不只靠颜色/形状）。

### 7.2 shop-by-care（按养护难度入口）
- 3 张卡（易/中/挑战），每张 = `care-card` block：图标 + 徽章 + 标题 + 描述 + **精致光/水计量器**（SVG 圆点/水滴填充，非 `***`）+ 链接集合（绑 collection）+ arrow slide。
- 数据走 block 设置；卡片背景按难度 tint（用 `color-mix` 派生）。
- 滚动驱动 stagger 入场；3→1 列响应。

### 7.3 size-guide（尺寸对照）
- 3 张 `size-card`（桌面/落地/雕塑级）：高度/盆径数值 + 人+盆 SVG 可视化 + cm/inch 切换（无代码设置）。
- 可选拖拽对比滑块（原生指针事件，触控+鼠标；非外部库）。

### 7.4 care-blog-teaser（养护博客）
- 3 卡，自动从 blog 拉或手动 block；tag 徽章 + hover lift。demo 必须填真实文章。

### 7.5 产品卡 snippet（card-product）
- 1:1 或 4:5 画框 + hover 第二图 + 难度徽章 + 光照 icon + 库存 badge + quick-view 触发。
- 徽章/icon 数据来自 block 设置或产品原生属性（标签/系列），**非自定义 metafield**。

### 7.6 hero（多用途英雄区）
- 多布局：分栏 / 堆叠 / 全幅+scrim（文字压图必须有渐变 scrim 保对比）。
- blocks：eyebrow + heading + text + button-group + 可选 image/video（无自动播放或可暂停）。
- LCP 图 `fetchpriority=high` + width/height 防 CLS。

---

## 8. 提交前合规门禁清单（对齐 Shopify 5 阶段审核）

> 详版见 `04-COMPLIANCE.md`。提交前每条必须勾。

**Stage 1 功能/OS2.0**：□ 所有必需模板为 JSON □ header/footer 用 section group □ 每个 JSON 模板支持 `@app` □ Custom Liquid section 存在 □ 产品元素已 block 化 □ Skeleton 底座、零 Dawn/Horizon 代码
**Stage 2 性能/无障碍**：□ Lighthouse 性能≥60（基准、桌面+移动）□ 无障碍≥90 □ 手动键盘+读屏走通 □ 对比度 4.5:1/3:1 □ 触控≥24×24
**Stage 3 技术**：□ theme check 0 error □ 无 BOM □ 无 Sass/预压缩 □ theme_info 完整且作者自有 URL □ 无自定义 metafield/`shopify://` 在 JSON □ i18n 用 `t:` key + `routes`
**Stage 4 设计/UX**：□ §2.3 全过 □ 架构唯一（非 Dawn 套壳）□ 无未完成细节 □ 字体一致 □ 内容多变不破版 □ demo 真实无 Lorem Ipsum
**Stage 5 预发**：□ 3 预设 + 3 demo store 就绪 □ `/listings` 打包 □ listing 截图合规 □ 文档站+支持表单上线 □ 去除署名/外链 □ 无 markets.json □ reviewer 密码已加

---

## 9. 绝对禁止项（v1 踩过的雷 + 官方点名拒因）

- ❌ 用/抄 Dawn 或 Horizon 任何代码 → 一票否决
- ❌ 硬编码不可改配色 / 对比敏感元素硬编码颜色
- ❌ 提交 JSON/schema default 里出现 `botanica.*`、`custom.*`、`shopify://`
- ❌ 核心功能依赖自定义 metafield 或任何 app
- ❌ `/listings/<preset>/templates/` 这种错误结构
- ❌ theme_info 指向 help/support.shopify.com
- ❌ 假紧迫（倒计时/假库存/假浏览数）、心愿单、作者署名/外链/联盟链接
- ❌ 外部 script / 分析 / 追踪 / 外部 CDN / 外部 JS 库
- ❌ Sass / `.scss` / 预压缩 css·js / BOM
- ❌ `config/markets.json` 进 zip
- ❌ 自动播放有声媒体 / 无 reduced-motion 守卫的动效 / 抹除焦点环
- ❌ 空 section 渲染孤立标签（"Light:" 后面空）/ 计量器用 `***` / 空 Blog 盒 / Lorem Ipsum
- ❌ 在 Dawn 版上再提交（=必拒 + 逼近 90 天封禁；你只剩 2 次机会）

---

> 实施顺序提示：P0→P1 是"能不能过审"的命门（底座+唯一性），P3 是"惊不惊艳"的命门（设计 craft），P4/P5 是"完不完整"的命门（demo+合规）。三者缺一不可。
