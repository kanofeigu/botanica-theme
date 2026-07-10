> ⚠️ **已废弃 / SUPERSEDED（2026-06-27）**
> 本文件的契约面向**被拒的 Dawn 套壳 v1**（Dawn 件 + section-local blocks），已失效。
> 新文件所有权契约见 **`docs/botanica-v3/03-WORKFLOW.md §5`**（Skeleton + theme-blocks）。下面内容仅作历史参考，**勿照此操作**。

# CONTRACTS.md — Botanica Shopify Theme 模块接口契约

> **定位**: 所有 Worker 的唯一接口真相源。定义了文件所有权、section schema 输入/输出、CSS 变量依赖。
> **规则**: 每个 Worker 只能读取本文件和自己的 SKILL.md。不得读取其他 Worker 的 SKILL.md。
> **契约版本**: `@contract-version 1.0.0`

---

## 零、共享契约层（wave-0 产出——全局基础）

> **这部分是所有 section 的公共依赖**，必须在 wave-0 最先产出，后续所有 Worker 可直接引用。

### 0.1 文件所有权（Worker-0: foundation）

```text
Worker-0 (foundation, wave-0):
  ├── botanica/config/settings_schema.json    [修改]  ← 全局主题设置（色板、字体、布局、按钮、卡片等）
  ├── botanica/config/settings_data.json       [修改]  ← 默认设置值（3 套配色预设）
  ├── botanica/assets/botanica.css             [修改]  ← Botanica 品牌 CSS 变量层 + 全局工具类
  └── botanica/locales/en.default.json         [修改]  ← 基础翻译（全局 settings label）
```

### 0.2 CSS 变量契约（botanica.css 提供的品牌 token）

所有 section CSS 文件可以安全引用以下变量（已在 wave-0 中定义）：

```css
/* 品牌色板 */
--botanica-sage-500: #4A6B4F;
--botanica-sage-400: #5F7A5C;
--botanica-sage-300: #8AA386;
--botanica-sage-200: #C7D4C4;
--botanica-sage-100: #E8EFE6;

--botanica-cream-100: #FAF7EF;
--botanica-cream-200: #F5F1E8;
--botanica-cream-300: #ECE4D2;

--botanica-terracotta-500: #C97D5A;
--botanica-terracotta-400: #D89576;
--botanica-terracotta-300: #E8B89E;

--botanica-bark-700: #2E2A24;
--botanica-bark-500: #4D4840;
--botanica-bark-300: #8A8378;

/* 语义别名（推荐使用这些而非上面原始色值） */
--botanica-accent: var(--botanica-terracotta-500);
--botanica-accent-soft: var(--botanica-terracotta-300);
--botanica-success: var(--botanica-sage-500);
--botanica-success-soft: var(--botanica-sage-200);

/* Section 间距 */
--botanica-section-gap-y: clamp(3rem, 6vw, 6rem);
--botanica-section-pad-y: clamp(1.5rem, 4vw, 4rem);
--botanica-edge-pad: clamp(1rem, 5vw, 2.5rem);

/* 排版微调 */
--botanica-tracking-tight: -0.02em;
--botanica-tracking-wide: 0.18em;
--botanica-line-tight: 1.05;
--botanica-line-snug: 1.4;

/* 阴影 */
--botanica-shadow-float: 0 18px 40px -12px rgba(46, 42, 36, 0.18);
--botanica-shadow-card: 0 10px 22px -10px rgba(46, 42, 36, 0.14);
```

### 0.3 Dawn CSS 变量依赖

所有 section 还可使用 Dawn 在 theme.liquid 中生成的 CSS 变量：
- `--color-background`, `--color-foreground`, `--color-button`, `--color-button-text`
- `--color-shadow`, `--color-link`, `--color-badge-*`
- `--font-body-family`, `--font-heading-family`, `--font-body-scale`, `--font-heading-scale`
- `--page-width`, `--buttons-radius`, `--media-radius`
- 以及所有 `--product-card-*`, `--collection-card-*`, `--blog-card-*` 变量

### 0.4 全局 CSS 工具类（botanica.css 提供）

所有 section HTML 可以使用以下全局工具类：
- `.botanica-eyebrow` — 大写宽松间距的标签文字
- `.botanica-badge` / `.botanica-badge--easy` / `.botanica-badge--medium` / `.botanica-badge--expert` — 养护难度徽章
- `.botanica-light-meter` / `.botanica-light-meter__dot` / `.botanica-light-meter__dot--on` — 光照指示器
- `.botanica-lift` — hover 时微浮动效果（尊重 prefers-reduced-motion）
- `.botanica-section` / `.botanica-section--wide-gap` — section 垂直间距

### 0.5 依赖规则
- wave-0 产出后，所有 section Worker 直接引用上述 CSS 变量和工具类
- 各 section Worker 不互相引用对方的 CSS 或 Liquid
- 如需共享 UI 片段 → 抽取为 snippet，在 CONTRACTS.md 中登记

---

## 一、文件所有权（DAG 波次 + Shopify 目录）

> ⚠️ 这是最重要的章节——定义每个 Worker 的写权限边界。文件集合互不重叠。

```text
Worker-0 (foundation, wave-0):
  ├── botanica/config/settings_schema.json    [修改]
  ├── botanica/config/settings_data.json       [修改]
  ├── botanica/assets/botanica.css             [修改]
  └── botanica/locales/en.default.json         [修改]

Worker-hero (hero-lookbook section, wave-1):
  ├── botanica/sections/hero-lookbook.liquid      [修改]
  ├── botanica/assets/hero-lookbook.css           [修改]
  ├── botanica/snippets/hero-lookbook-content.liquid  [修改]
  └── botanica/snippets/hero-lookbook-placeholder.liquid [修改]

Worker-care (shop-by-care section, wave-1):
  ├── botanica/sections/shop-by-care.liquid       [修改]
  └── botanica/assets/shop-by-care.css            [修改]

Worker-spotlight (plant-spotlight section, wave-1):
  ├── botanica/sections/plant-spotlight.liquid    [修改]
  ├── botanica/assets/plant-spotlight.css         [修改]
  └── botanica/snippets/plant-spotlight-placeholder.liquid [修改]

Worker-blog (care-blog-teaser section, wave-1):
  ├── botanica/sections/care-blog-teaser.liquid   [修改]
  └── botanica/assets/care-blog-teaser.css        [修改]

Worker-size (botanica-size-guide section, wave-1):
  ├── botanica/sections/botanica-size-guide.liquid [修改]
  └── botanica/assets/botanica-size-guide.css      [修改]

Worker-values (botanica-values-bar section, wave-1):
  ├── botanica/sections/botanica-values-bar.liquid [修改]
  └── botanica/assets/botanica-values-bar.css      [修改]

Worker-product (main-product section, wave-1):
  ├── botanica/sections/main-product.liquid       [修改]
  └── botanica/assets/section-main-product.css    [修改]

Worker-collection (collection sections, wave-1):
  ├── botanica/sections/main-collection-banner.liquid     [修改]
  ├── botanica/sections/main-collection-product-grid.liquid [修改]
  ├── botanica/sections/featured-collection.liquid        [修改]
  ├── botanica/assets/template-collection.css             [修改]
  └── botanica/snippets/card-product.liquid               [修改]

Worker-cart (cart sections, wave-1):
  ├── botanica/sections/main-cart-items.liquid     [修改]
  ├── botanica/sections/main-cart-footer.liquid    [修改]
  ├── botanica/sections/cart-drawer.liquid         [修改]
  └── botanica/snippets/cart-drawer.liquid         [修改]

Worker-integration (模板组装 + 布局, wave-2):
  ├── botanica/templates/index.json               [修改]  ← 组装所有 section
  ├── botanica/templates/product.json             [修改]
  ├── botanica/templates/collection.json          [修改]
  ├── botanica/templates/cart.json                [修改]
  ├── botanica/layout/theme.liquid                [修改]  ← 全局布局
  ├── botanica/sections/header-group.json         [修改]
  └── botanica/sections/footer-group.json         [修改]
```

---

## 二、输入契约（每个 Worker 启动前必须存在的文件）

### wave-0 共享输入

| 文件 | 说明 | 谁负责生成 |
|------|------|-----------|
| `AGENTS.md` | 铁律和禁止项 | 项目固定 |
| `CONTRACTS.md`（本文件） | 接口契约 | 项目固定 |
| Dawn 基准主题 | `botanica/` 目录下的 Dawn fork | 已存在（Phase 0） |

### wave-1 额外输入（依赖 wave-0）

| Worker | 额外读取（已存在的文件） |
|--------|------------------------|
| 所有 wave-1 Worker | `botanica/assets/botanica.css`（CSS token），`botanica/config/settings_schema.json`（settings 定义） |
| Worker-product | 还依赖 `botanica/snippets/product-media-gallery.liquid`，`botanica/snippets/product-variant-picker.liquid`（Dawn 已有） |
| Worker-collection | 还依赖 `botanica/snippets/facets.liquid`，`botanica/snippets/pagination.liquid`（Dawn 已有） |
| Worker-cart | 还依赖 `botanica/snippets/cart-notification.liquid`（Dawn 已有） |

### wave-2 额外输入（依赖 wave-0 + wave-1）

| Worker | 额外读取 |
|--------|----------|
| Worker-integration | wave-0 全部产出 + wave-1 所有 section 文件（用于在 template JSON 中引用正确的 section type 和 settings key） |

---

## 三、输出契约（每个 Section 的 Schema 接口）

> 每个 section 必须遵循以下契约。Worker 按此实现 Liquid + CSS + `{% schema %}`。

### 3.1 hero-lookbook（Worker-hero, wave-1）

**Section type**: `hero-lookbook`

**Schema 契约**:

```json
{
  "name": "t:sections.hero-lookbook.name",
  "tag": "section",
  "class": "hero-lookbook",
  "settings": [
    { "type": "select", "id": "design", "label": "布局模式", "options": [{"value":"split","label":"Split"}, {"value":"stacked","label":"Stacked"}], "default": "split" },
    { "type": "select", "id": "split_image_position", "label": "图片位置(Split)", "options": [{"value":"left","label":"左图右文"},{"value":"right","label":"右图左文"}], "default": "left" },
    { "type": "range", "id": "split_min_height", "label": "最小高度(Split)", "min": 300, "max": 800, "step": 20, "default": 560, "unit": "px" },
    { "type": "select", "id": "image_ratio", "label": "图片比例", "options": [{"value":"portrait","label":"3:4"},{"value":"square","label":"1:1"},{"value":"landscape","label":"4:3"},{"value":"wide","label":"16:9"}], "default": "wide" },
    { "type": "image_picker", "id": "image", "label": "背景/侧图" },
    { "type": "color", "id": "overlay_color", "label": "叠加色", "default": "#2E2A24" },
    { "type": "range", "id": "overlay_opacity", "label": "叠加不透明度", "min": 0, "max": 100, "step": 5, "default": 25, "unit": "%" },
    { "type": "select", "id": "content_position_x", "label": "内容水平位置", "options": [{"value":"left"},{"value":"center"},{"value":"right"}], "default": "left" },
    { "type": "select", "id": "content_position_y", "label": "内容垂直位置", "options": [{"value":"top"},{"value":"center"},{"value":"bottom"}], "default": "center" },
    { "type": "select", "id": "text_alignment", "label": "文字对齐", "options": [{"value":"left"},{"value":"center"},{"value":"right"}], "default": "left" },
    { "type": "text", "id": "issue_label", "label": "杂志标签", "default": "ISSUE 01" },
    { "type": "text", "id": "issue_topic", "label": "杂志主题", "default": "Indoor foliage" },
    { "type": "color_scheme", "id": "color_scheme", "label": "配色方案", "default": "scheme-3" },
    { "type": "color_scheme", "id": "panel_color_scheme", "label": "面板配色", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "上间距", "default": 0, "min": 0, "max": 100, "step": 4, "unit": "px" },
    { "type": "range", "id": "padding_bottom", "label": "下间距", "default": 0, "min": 0, "max": 100, "step": 4, "unit": "px" }
  ],
  "blocks": [
    { "type": "eyebrow", "name": "眉题", "settings": [{"type":"text","id":"text","label":"眉题文字","default":"Botanical field guide"}] },
    { "type": "heading", "name": "标题", "settings": [{"type":"richtext","id":"heading","label":"标题","default":"Plants that live where you live"},{"type":"select","id":"heading_size","label":"标题大小","options":[{"value":"h-large"},{"value":"h-xl"},{"value":"h-xxl"}],"default":"h-xl"}] },
    { "type": "subheading", "name": "副标题", "settings": [{"type":"richtext","id":"text","label":"副标题文字"}] },
    { "type": "buttons", "name": "按钮", "settings": [{"type":"text","id":"button_label_1","label":"主按钮文字"},{"type":"url","id":"button_link_1","label":"主按钮链接"},{"type":"checkbox","id":"button_style_secondary_1","label":"主按钮轮廓样式","default":false},{"type":"text","id":"button_label_2","label":"次按钮文字"},{"type":"url","id":"button_link_2","label":"次按钮链接"},{"type":"checkbox","id":"button_style_secondary_2","label":"次按钮轮廓样式","default":true}] }
  ],
  "presets": [{"name":"Hero Lookbook","blocks":[{"type":"eyebrow"},{"type":"heading"},{"type":"subheading"},{"type":"buttons"}]}]
}
```

**CSS 契约**:
- 类名前缀: `hero-lookbook`
- Split 模式: CSS grid `grid-template-columns: 1fr 1fr`
- Stacked 模式: flex column
- 叠加层: `::after` 伪元素 with `background: rgba(var(--color-foreground), overlay_opacity)`
- 杂志标签: `.hero-lookbook__issue-label` — 小号大写字体，位于文字区域顶部
- 响应式: < 750px 强制 stacked

### 3.2 shop-by-care（Worker-care, wave-1）

**Section type**: `shop-by-care`

**Schema 契约**:

```json
{
  "name": "t:sections.shop-by-care.name",
  "tag": "section",
  "class": "shop-by-care",
  "max_blocks": 4,
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "眉题", "default": "Find your green match" },
    { "type": "text", "id": "title", "label": "标题", "default": "Shop by care level" },
    { "type": "richtext", "id": "subtitle", "label": "副标题" },
    { "type": "range", "id": "columns_desktop", "label": "桌面端列数", "min": 3, "max": 4, "step": 1, "default": 3 },
    { "type": "checkbox", "id": "show_light_meter", "label": "显示光照指示器", "default": true },
    { "type": "checkbox", "id": "show_care_degree", "label": "显示养护难度", "default": true },
    { "type": "select", "id": "background_tone", "label": "背景色调", "options": [{"value":"default","label":"默认"},{"value":"cream","label":"奶油"},{"value":"sage","label":"鼠尾草"}], "default": "cream" },
    { "type": "color_scheme", "id": "color_scheme", "label": "配色方案", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "上间距", "default": 60, "min": 0, "max": 100, "step": 4, "unit": "px" },
    { "type": "range", "id": "padding_bottom", "label": "下间距", "default": 60, "min": 0, "max": 100, "step": 4, "unit": "px" }
  ],
  "blocks": [
    {
      "type": "care_card",
      "name": "养护卡片",
      "settings": [
        { "type": "select", "id": "care_level", "label": "养护难度", "options": [{"value":"easy","label":"Easy"},{"value":"medium","label":"Medium"},{"value":"expert","label":"Expert"}], "default": "easy" },
        { "type": "text", "id": "title", "label": "卡片标题", "default": "Easy care" },
        { "type": "richtext", "id": "description", "label": "卡片描述" },
        { "type": "text", "id": "cta_label", "label": "按钮文字", "default": "Explore easy plants" },
        { "type": "url", "id": "link", "label": "链接" },
        { "type": "collection", "id": "collection", "label": "关联分类" },
        { "type": "range", "id": "light_level", "label": "光照等级(1-3)", "min": 1, "max": 3, "step": 1, "default": 2 },
        { "type": "range", "id": "water_level", "label": "水分等级(1-3)", "min": 1, "max": 3, "step": 1, "default": 1 }
      ]
    }
  ],
  "presets": [{"name":"Shop by Care","category":"Botanica","blocks":[{"type":"care_card","settings":{"care_level":"easy"}},{"type":"care_card","settings":{"care_level":"medium"}},{"type":"care_card","settings":{"care_level":"expert"}}]}]
}
```

**CSS 契约**:
- 类名前缀: `shop-by-care`
- Grid: `grid-template-columns: repeat(columns_desktop, 1fr)`
- 每个 card 有 `data-level="easy|medium|expert"` 属性 + `.care-{level}` class
- SVG 植物图标 inline 在 Liquid 中（无外部图片依赖）
- 光照/水分指示器使用 `.botanica-light-meter` 组件
- Cream tone: `background: var(--botanica-cream-200)`
- Sage tone: `background: var(--botanica-sage-100)`
- 响应式: < 750px → 单列

### 3.3 plant-spotlight（Worker-spotlight, wave-1）

**Section type**: `plant-spotlight`

**关键 Schema 字段**:
- settings: `eyebrow`, `title`, `subtitle`, `plate_label`（"PLATE NO. 01"）, `product`（product picker）, `spotlight_image`（单独图片，优先级 > product.featured_image）, `show_price`, `show_care_table`, `show_origin_story`, `story`（richtext）, `story_label`, `cta_label`, `cta_link`, `background_tone`（cream/sage/dark）, `color_scheme`, `padding_top`, `padding_bottom`
- blocks: `care_row` — 每个 block 有 `icon`（light/water/humidity/size/toxicity）, `label`, `value`

**CSS 契约**:
- 类名前缀: `plant-spotlight`
- 布局: 两栏 grid（media + content），`grid-template-columns: 1fr 1fr`
- 图片框: `border-radius: var(--media-radius)`, `overflow: hidden`
- 养护表: 每行 flex，icon + label + value
- Dark tone: 深色背景 + 浅色文字（`color: rgb(var(--color-foreground))`）
- 响应式: < 750px → 单列，图片在上

### 3.4 care-blog-teaser（Worker-blog, wave-1）

**Section type**: `care-blog-teaser`

**关键 Schema 字段**:
- settings: `eyebrow`, `title`, `subtitle`, `blog`（blog picker，为空则用手动卡片）, `show_date`, `show_author`, `show_badge`, `view_all_label`, `view_all_link`, `background_tone`, `color_scheme`, `padding_top`, `padding_bottom`
- blocks: `manual_card` — `tag`（标签）, `title`, `excerpt`（richtext）, `cta_label`, `link`, `image`（image_picker）

**CSS 契约**:
- 类名前缀: `care-blog-teaser`
- Grid: 3 列卡片
- 每张卡片: 图片（4:3 aspect-ratio）+ tag badge + title + excerpt + link
- tag badge: 使用 `.botanica-badge` 样式
- 响应式: < 990px → 2 列, < 750px → 1 列

### 3.5 botanica-size-guide（Worker-size, wave-1）

**Section type**: `botanica-size-guide`

**关键 Schema 字段**:
- settings: `eyebrow`, `title`, `subtitle`, `background_tone`, `color_scheme`, `padding_top`, `padding_bottom`
- blocks: `size_card` — `size_key`（small/medium/large）, `size_label`, `title`, `description`, `height_cm`（number）, `pot_cm`（text）, `spots_label`, `cta_label`, `link`

**CSS 契约**:
- 类名前缀: `botanica-size-guide`
- Grid: 3 列
- 每张卡片内: SVG 小人+盆器可视化（纯 CSS/SVG，无外部图片）
- 可视化: 使用 CSS `scale()` 根据 `height_cm` 缩放 SVG

### 3.6 botanica-values-bar（Worker-values, wave-1）

**Section type**: `botanica-values-bar`

**关键 Schema 字段**:
- settings: `background_tone`, `color_scheme`, `padding_top`, `padding_bottom`
- blocks: `value_item` — `icon`（truck/shield/pot/chat/leaf）, `title`, `subtitle`

**CSS 契约**:
- 类名前缀: `botanica-values-bar`
- Grid: `repeat(auto-fit, minmax(200px, 1fr))`
- 每个 item: icon(SVG inline) + title + subtitle
- 紧凑间距

### 3.7 main-product（Worker-product, wave-1）

**Section type**: `main-product`

**契约**: 在 Dawn 的 main-product 基础上增加：
- 养护需求面板（光照/水分/湿度/毒性 icon + text）
- 起源故事区（collapsible）
- 尺寸对照链接（导向 size-guide section）
- 所有新增 settings 以 `care_` 前缀命名

### 3.8 collection sections（Worker-collection, wave-1）

**契约**: 在 Dawn 的 collection 基础上增加：
- 照护难度筛选（作为 facet 或 tag 式的 quick filter）
- 产品卡上的难度徽章 + 光照 icon
- card-product snippet 增加 `badge_type` 逻辑

### 3.9 cart sections（Worker-cart, wave-1）

**契约**: 保留 Dawn 逻辑，视觉微调匹配 Botanica 配色和字体。

### 3.10 集成层（Worker-integration, wave-2）

**templates/index.json 契约**: 包含所有 wave-1 section 的默认顺序和预设数据。Section type 名称必须与 wave-1 Worker 产出的 `{% schema %}` 中 `name` 对应的 type 一致。

**layout/theme.liquid 契约**: 加载 `botanica.css`（全局），维护 Dawn 原有 component CSS 加载逻辑，确保新增 section 的 CSS 不冲突。

---

## 四、Worker 间依赖关系（DAG 波次）

```text
wave-0 (基础层, 最先):
  Worker-0 ████████████  → settings_schema + settings_data + botanica.css + en.default.json
      │
      ▼ barrier（shopify theme check 通过 + verify.ps1 通过）
wave-1 (section 层, 并行——彼此只依赖 wave-0):
  Worker-hero ████████████
  Worker-care ████████████
  Worker-spotlight ████████
  Worker-blog ████████████
  Worker-size ████████████
  Worker-values ██████████
  Worker-product █████████
  Worker-collection ███████
  Worker-cart ████████████
      │
      ▼ barrier（所有 section 各自 theme check 通过 + CSS 都 link 了）
wave-2 (集成层, 最后):
  Worker-integration ████████  → 组装 templates/*.json + layout 更新
      │
      ▼ barrier（全量 theme check + verify.ps1 + 本地预览验证）
```

**关键规则**:
- wave-1 的 Worker 写的是互不重叠的文件集合 + 彼此不 import/不 render
- 跨波次必须用屏障同步（check 工具验证通过才推进）

---

## 五、通用约束（所有 Worker 必须遵守）

1. **Shopify 合规**: `shopify theme check` 零 error
2. **Liquid 格式**: `{%- -%}` 空格控制，`{%- liquid -%}` 块集中顶部
3. **CSS 必 link**: section liquid 顶部 `{{ '<name>.css' | asset_url | stylesheet_tag }}`
4. **CSS 作用域**: 所有样式放在 section 的顶级 class 下
5. **BEM 命名**: `.section__element--modifier`
6. **无硬编码色值**: 用 `var(--botanica-*)` 或 `rgb(var(--color-*))`
7. **无硬编码文本**: 所有用户可见文本走 settings 字段或 `t:` locale
8. **Schema 完整**: 每个 section 有 `{% schema %}` + presets
9. **文件编码**: UTF-8 without BOM
10. **图片处理**: `| image_url: width: N` + `sizes` + `loading="lazy"`
11. **SVG inline**: 小图标用 inline SVG（不增加 HTTP 请求）
12. **响应式**: 移动优先，Dawn breakpoint 750px/990px

---

## 六、接口变更流程

当需要修改 section schema 时：
1. Orchestrator 修改本文件中对应 section 的 Schema 契约
2. 递增 `@contract-version`（major 破坏性 / minor 新增 / patch 修复）
3. 在 §九 CHANGELOG 记录变更
4. 通知受影响的 Worker（重新 spawn）
5. Worker 按新 schema 重新实现
6. 同步更新 `templates/index.json` 中的 preset settings
7. 运行 `.\verify.ps1` 确认全量通过

---

## 七、契约校验机制

> Shopify 主题的"契约校验"分两层：

### 7.1 静态校验（屏障点运行）
```powershell
# 等价于 verify-contracts.js 的作用
shopify theme check --path botanica    # Liquid 语法、JSON 合法性、missing files、schema 完整性
.\verify.ps1                           # CSS link 一致性 + JSON/BOM 检查
```

### 7.2 视觉校验（人工 / 屏障点运行）
```bash
shopify theme push --path botanica    # 推到 dev store
# → 在浏览器中检查每个 section 的渲染效果
```

---

## 八、契约版本

- **当前版本**: `@contract-version 1.0.0`

---

## 九、CHANGELOG

| 日期 | 版本 | 变更 | 影响的 Worker |
|------|------|------|---------------|
| 2026-06-26 | 1.0.0 | 初始契约定义（Phase 2 sections + Phase 3 templates） | 全部 |
