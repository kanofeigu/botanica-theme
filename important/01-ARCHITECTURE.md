# Botanica v3 — 代码架构文档

> 位置：`E:\ccfold\shopify\important\01-ARCHITECTURE.md`
> 用途：让任何 AI 或开发者快速理解 Botanica 主题的完整代码架构
> 最后更新：2026-07-06

---

## 1. 项目总览

Botanica 是一个 Shopify 多用途精品主题，旗舰 demo 为植物店。基于 **Shopify Skeleton** 底座，采用 **theme-blocks 架构**，全原创代码（零 Dawn/Horizon）。

```
botanica/
├── assets/          # 全局 CSS / JS / 静态资源
├── blocks/          # ★ Theme blocks（可复用、可嵌套的功能单元）
├── config/          # settings_schema.json + settings_data.json
├── layout/          # theme.liquid（HTML 骨架）、password.liquid
├── locales/         # en.default.json（翻译）+ *.schema.json
├── sections/        # Section（用 blocks 组装的页面区域）
├── snippets/        # 纯函数式可复用片段（icon、card-product 等）
├── templates/       # JSON 模板（OS 2.0 页面结构）
│   └── customers/   # 客户账户模板
└── listings/        # 预设 listing 目录（Theme Store 提交用）
    ├── botanical/
    ├── home-and-decor/
    └── wellness/
```

---

## 2. 四层架构

### 第 1 层：Layout 骨架

**文件**：`layout/theme.liquid`、`layout/password.liquid`

- `<html>` → `<head>` → `<body>` 标准 HTML5 结构
- `<head>` 中加载：design-tokens.css → base.css → effects.css → botanical-effects.css
- `{% style %}` 块中从 `settings.colors_*` 注入 `--bt-color-*` CSS 自定义属性
- `font_picker` 加载 Fraunces（标题）+ Inter（正文）
- `<body>` 渲染：skip-link → `{% sections 'header-group' %}` → `<main>` → `{% sections 'footer-group' %}`
- 全局挂载：cart drawer、predictive search、quick-view 容器

### 第 2 层：JSON Templates（OS 2.0 页面结构）

**目录**：`templates/*.json`

每个模板定义页面的 section 组成、顺序、配置。示例（`templates/index.json`）：

```json
{
  "sections": {
    "hero": { "type": "hero", "settings": {...}, "blocks": {...}, "block_order": [...] },
    "shop-by-care": { "type": "shop-by-care", "settings": {...}, "blocks": {...} }
  },
  "order": ["hero", "shop-by-care", ...]
}
```

**已覆盖的模板**（14 个）：
`index`、`product`、`collection`、`cart`、`search`、`page`、`page.contact`、`blog`、`article`、`404`、`password`、`gift_card`、`list-collections` + 全部 `customers/*`

### 第 3 层：Sections + Blocks（功能组装）

**目录**：`sections/` + `blocks/`

- **Section** = 薄壳容器，声明 `blocks: [{ type: "@theme" }, { type: "@app" }]`，用 `{% content_for "blocks" %}` 渲染子块
- **Block** = 可复用的功能单元，自带 `{% stylesheet %}` / `{% javascript %}` / `{% schema %}`
- 私有 Block 用 `_name.liquid` 前缀（不出现在 `@theme` 选择器中）

**关键 Section 架构**：
```
main-product.liquid (PDP)
  ├── specimen-eyebrow      (标本标签)
  ├── product-title         (产品标题)
  ├── product-price         (价格 + sale/regular)
  ├── variant-picker        (变体选择器)
  ├── size-guide-link       (尺寸指南弹窗)
  ├── buy-buttons           (数量 + ATC + 动态结账)
  ├── care-icons            (养护四宫格)
  ├── product-description   (产品描述)
  ├── editorial-quote       (田野笔记引用)
  ├── collapsible-specs     (可折叠规格)
  ├── share                 (社交分享)
  ├── complementary-products(搭配推荐)
  └── pickup-availability   (自提信息)
```

### 第 4 层：Assets（全局样式 + 脚本）

**CSS 分层加载顺序**：

| 文件 | 作用 | 大小 |
|------|------|------|
| `design-tokens.css` | CSS 自定义属性（色板、字体、间距、圆角、阴影、缓动、z-index） | ~140 行 |
| `base.css` | Reset、排版、按钮、表单、卡片、badge、布局工具类、cart drawer、predictive search | ~476 行 |
| `effects.css` | Paper texture、specimen frame、scroll-driven animations、View Transitions、微交互 | ~300+ 行 |
| `botanical-effects.css` | 滚动驱动植物动画（落叶、藤蔓、视差剪影、斑驳光、孢子等 12 种效果） | ~400+ 行 |

**JS 架构**（全部 vanilla、ES module、defer）：

| 文件 | 功能 | 依赖 |
|------|------|------|
| `cart.js` | AJAX 加车、cart drawer 开关、数量更新、免运费进度条 | — |
| `search.js` | Predictive search 请求 + 结果渲染 | — |
| `quick-view.js` | Quick view modal（`<dialog>` 原生） | cart.js |
| `sticky-atc.js` | 移动端 sticky ATC bar（IntersectionObserver） | cart.js |
| `variant-selects.js` | 变体切换（pill/swatch）、价格/库存 aria-live 更新 | — |
| `gallery.js` | 产品图集缩放 dialog + 缩略图切换 | — |
| `pickup-availability.js` | 自提信息异步加载 | — |

---

## 3. 数据流

```
settings_schema.json (商家设置)
        │
        ▼
theme.liquid {% style %} 块
  settings.colors_* → --bt-color-* CSS 变量
  settings.font_*   → font_face 加载
        │
        ▼
所有 CSS / Block 的 {% stylesheet %}
  通过 var(--bt-color-*) 消费令牌
        │
        ▼
template JSON (页面配置)
  → section.liquid (容器)
    → {% content_for "blocks" %}
      → block.liquid (功能单元)
        → block.settings (商家在编辑器中配的数据)
```

**数据来源优先级**：
1. Block `settings`（商家在 theme editor 中填写）—— 主要数据源
2. Section `settings`（容器级配置：产品选择、布局、间距）
3. Product 原生属性（`product.title`、`product.price`、`product.tags`）
4. Shopify 全局对象（`cart`、`shop`、`routes`、`all_products`）
5. **绝不**依赖自定义 metafield（`botanica.*`、`custom.*`）

---

## 4. 命名规范

| 类型 | 前缀 | 示例 |
|------|------|------|
| CSS class | `bt-` | `.bt-btn`、`.bt-card`、`.bt-header` |
| CSS 变量 | `--bt-` | `--bt-color-primary`、`--bt-fs-h1` |
| Block 文件 | 小写+连字符 | `buy-buttons.liquid`、`care-row.liquid` |
| Section 文件 | 小写+连字符 | `main-product.liquid`、`plant-spotlight.liquid` |
| Snippet 文件 | 小写+连字符 | `card-product.liquid`、`icon-cart.liquid` |
| 私有 Block | `_` 前缀 | `_care-meter.liquid` |

---

## 5. 关键架构决策

| 决策 | 理由 |
|------|------|
| **Skeleton 底座** | 2025-05-15 起 Shopify 强制要求，Dawn/Horizon 派生主题一律不合格 |
| **theme-blocks 架构** | 2026 官方推荐；产品元素拆成独立 block；商家可在编辑器中拖拽重组 |
| **CSS `{% stylesheet %}` 作用域** | 每个 block/section 的 CSS 自动子集化，只在渲染时输出 |
| **独立 `color` type（非 `color_palette`）** | 8 个清晰命名的颜色设置（background/surface/text/text_muted/primary/primary_contrast/secondary/border）在设置面板中比调色板编辑器更直观；功能等效，均满足"商家可改色"硬要求 |
| **全局 `--bt-color-*` token** | 所有组件通过 CSS 变量消费颜色，商家改一处全局生效 |
| **养护数据走 block 设置** | 不用自定义 metafield——空店开箱即用，不触发提交拒因 |
| **Care badge 走 product tags** | 商家给产品打 `care-easy`/`light-bright` 等标签即可自动显示徽章 |

---

## 6. 依赖关系图

```
design-tokens.css ◄── base.css ◄── effects.css ◄── botanical-effects.css
       │                 │              │
       ▼                 ▼              ▼
  theme.liquid ───→ 所有 block/section 的 {% stylesheet %}
       │
       ├── cart.js ──────→ cart drawer
       ├── search.js ────→ predictive search
       ├── variant-selects.js ──→ main-product.liquid
       ├── gallery.js ───→ main-product.liquid (zoom dialog)
       ├── quick-view.js ─→ quick-view-trigger block
       ├── sticky-atc.js ─→ sticky-atc block
       └── pickup-availability.js → pickup-availability block

sections/header-group.json ──→ sections/header.liquid
sections/footer-group.json ──→ sections/footer.liquid
templates/*.json ──→ sections/*.liquid ──→ blocks/*.liquid
                                    └──→ snippets/*.liquid
```

---

*关联文档：[[02-LIFECYCLE]] [[03-STATE-MANAGEMENT]] [[04-FEATURE-TREE]] [[05-QUICK-START]] [[06-COMPOSABLE-MODULES]]*
