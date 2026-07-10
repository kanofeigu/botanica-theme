# Botanica v3 — 组合式功能模块文档

> 位置：`E:\ccfold\shopify\important\06-COMPOSABLE-MODULES.md`
> 高内聚低耦合的组合式模块：每个可复用功能组件化，方便后期维护
> 最后更新：2026-07-06

---

## 核心原则

1. **高内聚**：每个 block/section 的功能、样式、脚本、schema 全部在一个 `.liquid` 文件中
2. **低耦合**：block 之间不直接依赖；通过全局 CSS 变量 + 自定义事件通信
3. **可复用**：同一个 block 可被多个 section 使用（如 `eyebrow` 被 hero、rich-text、plant-spotlight 等共用）
4. **作用域隔离**：`{% stylesheet %}` 和 `{% javascript %}` 自动作用域化，不会泄露到其他组件

---

## 1. Theme Block 模块清单（20+ 个）

### 1.1 文本内容模块

#### `blocks/eyebrow.liquid`
- **功能**：小号大写标签文字（如 "ISSUE 01 — FIELD GUIDE"）
- **复用场景**：hero、rich-text、plant-spotlight、image-with-text、size-guide 等
- **设置**：`text`（文本内容）
- **CSS 类**：`.bt-eyebrow`（base.css 定义）
- **关联模块**：无依赖，纯展示
- **空状态处理**：text 为空时不渲染

#### `blocks/heading.liquid`
- **功能**：标题文本（h1-h3 可选）
- **复用场景**：几乎所有 section
- **设置**：`text`、`tag`（h1/h2/h3）、`alignment`（left/center）
- **CSS 类**：`.bt-h1`、`.bt-h2`、`.bt-h3`（base.css 定义）
- **关联模块**：无依赖，纯展示

#### `blocks/text.liquid`
- **功能**：富文本内容
- **复用场景**：rich-text、hero、image-with-text、plant-spotlight 等
- **设置**：`text`（richtext 类型）
- **关联模块**：无依赖，纯展示

#### `blocks/button-group.liquid`
- **功能**：单个或成对按钮（primary/outline）
- **复用场景**：hero、image-with-text、plant-spotlight 等
- **设置**：`label`、`link`、`style`（primary/outline）
- **CSS 类**：`.bt-btn--primary`、`.bt-btn--outline`（base.css 定义）
- **关联模块**：无依赖

#### `blocks/editorial-quote.liquid`
- **功能**：编辑式引用（terracotta 左边框 + 斜体）
- **复用场景**：plant-spotlight、PDP
- **设置**：`quote`、`attribution`
- **关联模块**：无依赖

#### `blocks/badge.liquid`
- **功能**：小型徽章标签
- **复用场景**：产品卡、care-card
- **设置**：`text`、`style`（primary/secondary/outline）
- **CSS 类**：`.bt-badge`（base.css 定义）
- **关联模块**：无依赖

---

### 1.2 产品信息模块

#### `blocks/product-title.liquid`
- **功能**：产品标题（动态读取 `product.title`）
- **复用场景**：PDP main-product section
- **设置**：无（自动读取）
- **关联模块**：无依赖；被 main-product 渲染

#### `blocks/product-price.liquid` ⇄ `variant-selects.js`
- **功能**：产品价格 + compare_at 划线价
- **复用场景**：PDP、featured-product
- **关联模块**：
  - ← `variant-selects.js` 变体切换时更新价格 DOM
  - → `sticky-atc.js` 同步价格到移动端条

#### `blocks/product-badges.liquid`
- **功能**：产品徽章（sale/sold-out/stock 状态）
- **复用场景**：PDP
- **设置**：`show_stock_badge`、`show_sale_badge`
- **关联模块**：读取 `product.available`、`product.compare_at_price`

#### `blocks/product-description.liquid`
- **功能**：产品描述（动态读取 `product.description`）
- **复用场景**：PDP
- **关联模块**：无依赖

---

### 1.3 购买流程模块

#### `blocks/variant-picker.liquid` ⇄ ◆ `variant-selects.js`
- **功能**：变体选择器（按钮 pills 或色块 swatches）
- **复用场景**：PDP、featured-product、quick-view
- **设置**：`picker_type`（button/swatch）、`swatch_option_index`
- **关联模块**：
  - → `variant-selects.js`（核心交互逻辑）
  - ⇄ `product-price`（价格更新）
  - ⇄ `buy-buttons`（ATC disabled 状态同步）
  - → `gallery.js`（主图切换）
  - → URL params（?variant=xxx）

#### `blocks/buy-buttons.liquid` ⇄ `cart.js`
- **功能**：数量选择器 + Add to cart 按钮 + 动态结账按钮
- **复用场景**：PDP、featured-product、sticky-atc
- **设置**：`show_quantity`、`show_cart_icon`、`show_dynamic_checkout`、`show_trust_badges`
- **关联模块**：
  - → `cart.js`（AJAX 加车逻辑）
  - ← `variant-selects.js`（disabled 状态同步）
  - → cart drawer（打开 + 内容更新）
  - → header cart count（badge 更新）

#### `blocks/quantity-selector.liquid`
- **功能**：+/- 数量控件
- **复用场景**：PDP（buy-buttons block 内嵌）
- **关联模块**：
  - → buy-buttons（内嵌使用）

#### `blocks/sticky-atc.liquid` ⇄ `sticky-atc.js`
- **功能**：移动端固定底部加购条
- **复用场景**：PDP
- **关联模块**：
  - → `sticky-atc.js`（IntersectionObserver 显隐逻辑）
  - ← `variant-selects.js`（价格/变体状态同步）
  - → `cart.js`（ATC 按钮行为复用）

---

### 1.4 养护展示模块

#### `blocks/care-icons.liquid`
- **功能**：养护四宫格（光照/水分/湿度/毒性）
- **复用场景**：PDP
- **设置**：`heading`、`light_label/value`、`water_label/value`、`humidity_label/value`、`toxicity_label/value`
- **关联模块**：无依赖（纯静态展示，数据来自 block settings）

#### `blocks/care-row.liquid`
- **功能**：单行养护数据（图标 + label + value + meter）
- **复用场景**：care-table（内嵌使用）
- **设置**：`icon`、`label`、`value`、`level`、`show_meter`
- **关联模块**：
  - → care-table（wraps 多个 care-row）
  - → light-meter / water-meter（内嵌计量器）

#### `blocks/care-table.liquid`
- **功能**：养护数据表格（wraps care-row blocks）
- **复用场景**：plant-spotlight、PDP
- **关联模块**：
  - → care-row × N（子 blocks）

#### `blocks/light-meter.liquid` / `blocks/water-meter.liquid`
- **功能**：精致的 SVG 圆点/水滴计量器（非 `***` 文本）
- **复用场景**：care-row、care-card
- **设置**：`label`、`level`（0-5）
- **关联模块**：无依赖（独立 SVG + meter dot 渲染）

---

### 1.5 展示与交互模块

#### `blocks/spotlight-media.liquid`
- **功能**：4:5 画框 + 纸纹 overlay + 标本牌
- **复用场景**：plant-spotlight
- **设置**：`label`、`show_texture`
- **关联模块**：无依赖

#### `blocks/image.liquid`
- **功能**：响应式图片
- **复用场景**：image-with-text、collage、gallery
- **设置**：`image`、`alt`、`aspect_ratio`
- **关联模块**：无依赖

#### `blocks/specimen-eyebrow.liquid`
- **功能**：标本标签（含科学分类编号风格）
- **复用场景**：PDP
- **关联模块**：无依赖

#### `blocks/collapsible-specs.liquid`
- **功能**：可折叠内容块（原生 `<details>/<summary>`）
- **复用场景**：PDP（Plant details / Shipping & returns / Complete care guide × 3）
- **设置**：`title`、`content`、`open_by_default`
- **关联模块**：无依赖

#### `blocks/quick-view-trigger.liquid`
- **功能**：快速预览触发按钮
- **复用场景**：产品卡（card-product snippet）
- **关联模块**：
  - → `quick-view.js`（弹窗逻辑）
  - → `variant-selects.js`（弹窗内变体选择）

#### `blocks/size-guide-link.liquid`
- **功能**：尺寸指南弹窗触发
- **复用场景**：PDP
- **设置**：`button_label`、`heading`、`content`
- **关联模块**：原生 `<dialog>` + Popover 交互

#### `blocks/mega-menu.liquid`
- **功能**：Mega menu 内容块
- **复用场景**：header section 内
- **关联模块**：
  - → `header.liquid`（渲染容器 + JS 交互）

#### `blocks/filter-group.liquid`
- **功能**：筛选组（用于 collection 侧边栏）
- **复用场景**：main-collection-product-grid.liquid
- **关联模块**：
  - → AJAX 导航系统

---

### 1.6 数据联动模块

#### `blocks/complementary-products.liquid`
- **功能**：搭配推荐产品
- **复用场景**：PDP
- **设置**：`heading`、`max_products`
- **关联模块**：
  - → Shopify product recommendations API

#### `blocks/pickup-availability.liquid`
- **功能**：自提信息
- **复用场景**：PDP
- **关联模块**：
  - → `pickup-availability.js`（异步加载）

#### `blocks/share.liquid`
- **功能**：社交分享按钮
- **复用场景**：PDP、article
- **关联模块**：无依赖

---

## 2. Snippet 模块清单（可复用片段）

#### `snippets/card-product.liquid` ★ 核心复用
- **功能**：统一产品卡（全站使用：首页、collection、search、recommendations）
- **参数**：`product`、`show_secondary_image`、`show_vendor`、`image_ratio`、`show_sale_badge`、`show_sold_out_badge`、`show_care_badge`、`show_light_badge`
- **关联模块**：
  - → badge block（care badge / sale badge）
  - → quick-view-trigger block
  - → product card CSS（base.css）

#### `snippets/pagination.liquid`
- **功能**：分页导航
- **参数**：`paginate`
- **关联模块**：无依赖

#### `snippets/icon-*.liquid`（7 个）
- **功能**：SVG 图标（search/cart/hamburger/close/facebook/instagram/pinterest）
- **复用场景**：全站需要图标的地方
- **关联模块**：无依赖

---

## 3. CSS 模块分层

```
design-tokens.css（Design Tokens 层）
  ↓
base.css（Base 基础层：reset/排版/按钮/表单/卡片/布局工具类/cart/predictive）
  ↓
effects.css（Effects 效果层：纹理/标本框/滚动动画/View Transitions/微交互）
  ↓
botanical-effects.css（植物特效层：12 种植物滚动驱动动画）
  ↓
每个 block/section 的 {% stylesheet %}（作用域 CSS：只在该组件出现时输出）
```

### 关键 CSS 工具类（base.css 提供）

| 工具类 | 用途 | 示例 |
|--------|------|------|
| `.bt-btn` | 按钮基础 | `.bt-btn--primary`、`.bt-btn--outline`、`.bt-btn--lg`、`.bt-btn--block` |
| `.bt-card` | 卡片基础 | `.bt-card__media`、`.bt-card__body`、`.bt-card__title` |
| `.bt-badge` | 徽章 | `.bt-badge--secondary`、`.bt-badge--outline` |
| `.bt-container` | 内容容器 | 自适应宽度 + 居中 |
| `.bt-section` | Section 间距 | 上下 padding 使用 `--bt-space-section` |
| `.bt-grid` | 网格 | `.bt-grid--2`、`.bt-grid--3`、`.bt-grid--4` |
| `.bt-stack-*` | 垂直堆叠间距 | xs/sm/md/lg/xl |
| `.bt-sr-only` | 无障碍隐藏 | 仅读屏器可见 |
| `.bt-meter` | 计量器圆点 | `.bt-meter__dot`、`.is-on` |

---

## 4. 组合式模块创建规范

创建新的可复用模块时：

1. **确定模块类型**：
   - 如果需要在 theme editor 中拖拽/配置 → **Block**（`blocks/xxx.liquid`）
   - 如果是纯 Liquid 渲染片段 → **Snippet**（`snippets/xxx.liquid`）
   - 如果是一个完整的页面区域 → **Section**（`sections/xxx.liquid`）

2. **必须包含的元素**：
   - `{% stylesheet %}` — 作用域 CSS
   - `{% schema %}` — 设置定义 + preset（Block 必须有 preset 才能在 editor 中手动添加）
   - 空状态处理 — 设置为空时不输出孤立标签
   - `{{ block.shopify_attributes }}` — 让 editor 的拖拽/选中功能工作

3. **命名规范**：
   - Block 文件名 = `{功能}.liquid`（如 `eyebrow.liquid`）
   - Section 文件名 = `{功能}.liquid`（如 `hero.liquid`）
   - Snippet 文件名 = `{功能}.liquid`（如 `card-product.liquid`）
   - CSS class = `bt-{组件}__{子元素}`（BEM 风格）
   - `t:` key = `blocks.{name}.settings.{id}.label`

---

*关联文档：[[01-ARCHITECTURE]] [[02-LIFECYCLE]] [[04-FEATURE-TREE]] [[12-FEATURE-DESCRIPTIONS]]*
