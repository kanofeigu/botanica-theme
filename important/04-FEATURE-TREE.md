# Botanica v3 — 功能树文档

> 位置：`E:\ccfold\shopify\important\04-FEATURE-TREE.md`
> 每个功能与其关联功能的关系图。修改 A 功能前，必须先查看此文档确认不会影响 B 功能。
> 最后更新：2026-07-06

---

## 阅读指南

- `→` 表示"依赖"（A → B = A 依赖 B，修改 B 会影响 A）
- `⇄` 表示"双向联动"（互相影响）
- `◆` 表示"核心节点"（修改影响范围最广）

---

## 1. 全局基础设施

```
◆ design-tokens.css（全局 CSS 变量）
  ├─→ base.css（消费 --bt-color-*, --bt-fs-*, --bt-space-* 等全部令牌）
  ├─→ effects.css（消费 --bt-color-*, --bt-duration-*, --bt-ease-*）
  ├─→ botanical-effects.css（消费 --bt-color-*）
  ├─→ 所有 block 的 {% stylesheet %}（消费 --bt-color-*, --bt-space-*, --bt-radius-* 等）
  └─→ 所有 section 的 {% stylesheet %}（同上）
  ⚠ 修改 design-tokens.css 的任何变量 → 影响全站所有组件

◆ base.css（全局基础样式）
  ├─→ .bt-btn（所有按钮）
  ├─→ .bt-card（所有卡片）
  ├─→ .bt-input / .bt-select / .bt-textarea（所有表单元素）
  ├─→ .bt-badge（所有徽章）
  ├─→ .bt-container / .bt-section / .bt-grid（布局工具类）
  ├─→ .bt-cart-drawer（购物车抽屉结构）
  ├─→ .bt-predictive（预测搜索结构）
  └─→ .bt-meter（计量器圆点）
  ⚠ 修改 base.css → 影响使用这些工具类的所有组件

◆ theme.liquid（HTML 骨架 + 颜色注入 + 脚本加载）
  ├─→ 所有页面的 <head>（CSS 加载顺序、字体、SEO meta）
  ├─→ 所有 section group（header-group / footer-group）
  ├─→ cart drawer 结构（base.css 样式化的容器）
  ├─→ predictive search 容器
  ├─→ quick-view 容器（<bt-quick-view>）
  ├─→ JS 加载顺序（cart.js → search.js → quick-view.js → sticky-atc.js）
  └─→ window.theme 初始化（shopUrl, moneyFormat）
```

---

## 2. Header 功能树

```
sections/header.liquid
  ├─→ settings_schema.json
  │   └─ logo / logo_width / menu / sticky_header
  ├─→ blocks/mega-menu.liquid（mega menu block）
  │   ├─→ header.liquid（通过 section.blocks 渲染 promo/links/collections）
  │   └─→ settings_schema.json（font_picker / color）
  ├─→ snippets/icon-search.liquid
  ├─→ snippets/icon-cart.liquid（+ cart.js 联动更新 count）
  ├─→ snippets/icon-hamburger.liquid
  ├─→ snippets/icon-close.liquid
  ├─→ header-group.json（section group 声明）
  └─→ cart.js（cart count dot 更新）
  ⚠ 修改 header.liquid → 影响全站导航、移动端菜单
  ⚠ 修改 mega menu JS → 影响桌面端导航交互
```

---

## 3. PDP（产品详情页）功能树 ★ 最复杂的页面

```
templates/product.json
  │
  ├─◆ sections/main-product.liquid
  │   ├─→ blocks/specimen-eyebrow.liquid
  │   ├─→ blocks/product-title.liquid
  │   ├─→ blocks/product-price.liquid ⇄ variant-selects.js（价格更新）
  │   ├─→ blocks/variant-picker.liquid ←◆ 核心交互节点
  │   │   ├─→ assets/variant-selects.js
  │   │   │   ├─⇄ product-price（价格刷新）
  │   │   │   ├─⇄ buy-buttons（ATC disabled/文本更新）
  │   │   │   ├─→ gallery.js（主图切换）
  │   │   │   ├─→ sticky-atc.js（移动端同步）
  │   │   │   └─→ URL（history.pushState）
  │   │   └─→ design-tokens.css / base.css（button/input 样式）
  │   ├─→ blocks/size-guide-link.liquid（尺寸指南弹窗触发）
  │   ├─→ blocks/buy-buttons.liquid ←◆ 加车节点
  │   │   ├─→ cart.js（AJAX 加车）
  │   │   │   ├─→ cart drawer（内容更新）
  │   │   │   ├─→ header cart count（badge 更新）
  │   │   │   └─→ sticky-atc.js（sticky bar 同步）
  │   │   ├─→ blocks/quantity-selector.liquid（+/- 数量控件）
  │   │   └─→ variant-selects.js（disabled 状态同步）
  │   ├─→ blocks/care-icons.liquid（养护四宫格）
  │   ├─→ blocks/product-description.liquid
  │   ├─→ blocks/editorial-quote.liquid（田野笔记）
  │   ├─→ blocks/collapsible-specs.liquid（可折叠规格 × 3）
  │   ├─→ blocks/share.liquid
  │   ├─→ blocks/complementary-products.liquid
  │   └─→ blocks/pickup-availability.liquid ⇄ pickup-availability.js
  │
  ├─ sections/risk-free-guarantee.liquid
  │   └─→ design-tokens.css（--bt-color-primary-tint 背景）
  │
  ├─ sections/product-care-guide.liquid
  │   └─→ rich text 排版（base.css bt-rich-text-content 样式）
  │
  ├─◆ sections/product-recommendations.liquid
  │   └─→ fetch('/recommendations/products') → 客户端渲染 cards
  │
  └─ sections/apps.liquid（@app block 支持）
      └─→ 第三方 review app 样式协调（.bt-apps__inner CSS）

⚠ 修改 variant-selects.js → 影响 PDP + featured-product + quick-view
⚠ 修改 cart.js → 影响全站所有 ATC 行为
⚠ 修改 buy-buttons.liquid → 影响 PDP + featured-product + sticky-atc
```

---

## 4. Collection（分类页）功能树

```
templates/collection.json
  │
  ├─ sections/main-collection-banner.liquid
  │   └─→ collection.image / collection.description
  │
  ├─◆ sections/main-collection-product-grid.liquid
  │   ├─→ collection.filters（原生筛选）
  │   │   ├─→ 价格区间（popover dropdown）
  │   │   └─→ 可用性筛选（checkbox）
  │   ├─→ collection.sort_options（popover dropdown）
  │   ├─→ snippets/card-product.liquid
  │   │   ├─→ blocks/badge.liquid（care badge / sale badge）
  │   │   └─→ blocks/quick-view-trigger.liquid → quick-view.js
  │   ├─→ snippets/pagination.liquid
  │   ├─→ AJAX 导航系统
  │   │   ├─→ history.pushState
  │   │   ├─→ fade-out/fade-up 过渡动画
  │   │   └─→ popover portal 清理
  │   └─→ design-tokens.css / base.css
  │
  └─ sections/apps.liquid
```

---

## 5. Cart（购物车）功能树

```
templates/cart.json
  │
  ├─ sections/main-cart-items.liquid
  │   └─→ cart.items 遍历 → 商品行
  │
  └─ sections/main-cart-footer.liquid（如果有）

theme.liquid 中的 cart drawer
  ├─→ cart.js ⇄ 所有 ATC 按钮
  │   ├─→ fetch('/cart/add.js') → fetch('/cart.js')
  │   ├─→ 更新 cart drawer body（商品列表）
  │   ├─→ 更新 cart drawer footer（小计 + 免运费进度）
  │   ├─→ 更新 header cart count
  │   └─→ aria-live 播报
  ├─→ 免运费进度条
  │   └─→ settings.free_shipping_threshold
  └─→ design-tokens.css / base.css
```

---

## 6. Search（搜索）功能树

```
templates/search.json
  │
  ├─ sections/main-search.liquid
  │   └─→ search.results → card-product snippet
  │
  └─ predictive search（theme.liquid 中全局挂载）
      ├─→ assets/search.js
      │   └─→ fetch('/search/suggest?q=X') → 渲染下拉结果
      └─→ header.liquid 中的搜索图标触发
```

---

## 7. 首页 Section 功能树

```
templates/index.json
  │
  ├─ sections/botanical-ambience.liquid（植物氛围特效层）
  │   └─→ botanical-effects.css（12 种滚动驱动植物动画）
  │
  ├─◆ sections/hero.liquid
  │   ├─→ blocks/eyebrow.liquid
  │   ├─→ blocks/heading.liquid
  │   ├─→ blocks/text.liquid
  │   └─→ blocks/button-group.liquid
  │
  ├─ sections/rich-text.liquid
  │   └─→ blocks（eyebrow / heading / text / button-group）
  │
  ├─ sections/collection-list.liquid
  │   └─→ collections 数据
  │
  ├─ sections/shop-by-care.liquid
  │   ├─→ blocks/care-card.liquid（Easy / Moderate / Expert × 3）
  │   │   └─→ blocks/light-meter.liquid + blocks/water-meter.liquid
  │   └─→ collection link（绑到对应 difficulty 的 collection）
  │
  ├─ sections/featured-collection.liquid
  │   └─→ snippets/card-product.liquid
  │
  ├─ sections/image-with-text.liquid
  │   └─→ blocks（eyebrow / heading / text / button-group / image）
  │
  ├─◆ sections/plant-spotlight.liquid
  │   ├─→ blocks/eyebrow.liquid
  │   ├─→ blocks/heading.liquid
  │   ├─→ blocks/spotlight-media.liquid（4:5 画框 + 纸纹）
  │   ├─→ blocks/text.liquid
  │   ├─→ blocks/care-table.liquid（wraps care-rows）
  │   ├─→ blocks/care-row.liquid × 5（light/water/humidity/size/toxicity）
  │   ├─→ blocks/editorial-quote.liquid
  │   └─→ blocks/button-group.liquid
  │
  ├─ sections/multicolumn.liquid
  │   └─→ column blocks × 4
  │
  ├─ sections/size-guide.liquid
  │   └─→ blocks/size-card.liquid × 3（desk/floor/statement）
  │
  ├─ sections/care-blog-teaser.liquid
  │   └─→ blog articles 或 manual_card blocks
  │
  ├─ sections/newsletter.liquid
  │   └─→ Shopify customer form
  │
  └─ sections/apps.liquid
```

---

## 8. JS 文件依赖图

```
cart.js（独立，无依赖）
  ↑ 被依赖：buy-buttons, sticky-atc, quick-view, header cart count

search.js（独立，无依赖）
  ↑ 被依赖：header.liquid 搜索图标

variant-selects.js（独立，无依赖）
  ↑ 被依赖：main-product.liquid, featured-product.liquid, quick-view
  → 输出：更新 price / buy-buttons / gallery / sticky-atc / URL

gallery.js（独立，无依赖）
  ↑ 被依赖：main-product.liquid

quick-view.js
  → 依赖：cart.js（内部 ATC 复用）
  → 依赖：variant-selects.js（内部变体选择复用）
  → 独立：dialog 管理逻辑

sticky-atc.js
  → 依赖：cart.js（ATC 复用）
  → 监听：variant-selects.js 的 theme:variantChange 事件

pickup-availability.js（独立）
```

---

## 9. 修改影响范围速查表

| 修改的文件 | 影响范围 | 风险等级 |
|-----------|---------|---------|
| `design-tokens.css` | **全站所有组件** | 🔴 极高 |
| `base.css` | **全站所有组件** | 🔴 极高 |
| `theme.liquid` | **所有页面** | 🔴 极高 |
| `cart.js` | 所有 ATC 按钮、cart drawer、header count、sticky-atc | 🔴 高 |
| `variant-selects.js` | PDP、featured-product、quick-view | 🔴 高 |
| `card-product.liquid` | 首页、collection、search、recommendations | 🟡 中 |
| `settings_schema.json` | 全站 theme editor 设置面板 | 🟡 中 |
| `en.default.json` | 全站可见文本（如果 key 名变更） | 🟡 中 |
| 单个 block | 使用该 block 的 section（通常可控） | 🟢 低 |
| 单个 section | 使用该 section 的模板页面 | 🟢 低 |

---

*关联文档：[[01-ARCHITECTURE]] [[02-LIFECYCLE]] [[09-CHANGE-MANAGEMENT]] [[12-FEATURE-DESCRIPTIONS]]*
