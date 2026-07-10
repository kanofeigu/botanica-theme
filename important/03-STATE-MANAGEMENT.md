# Botanica v3 — 状态管理文档

> 位置：`E:\ccfold\shopify\important\03-STATE-MANAGEMENT.md`
> 数据的响应式管理：每个数据变更如何及时响应，何时需要性能优化
> 最后更新：2026-07-06

---

## 1. 状态分类

Botanica 主题的状态分为 5 个层级：

| 层级 | 存储位置 | 更新方式 | 响应速度 |
|------|---------|---------|---------|
| **Shopify 后端状态** | Shopify 服务器（cart/product/collection） | AJAX fetch → DOM 更新 | 网络延迟 |
| **Theme Editor 设置状态** | `config/settings_data.json` | 商家在编辑器中修改 → iframe 实时预览 | 即时 |
| **URL 状态** | 浏览器地址栏 | pushState / popState | 即时 |
| **JS 运行时状态** | `window.theme` 对象 + DOM data-* 属性 | 自定义事件 + DOM 操作 | 即时 |
| **CSS 状态** | CSS 自定义属性（`--bt-color-*`） | `{% style %}` 注入或 JS 修改 `el.style.setProperty()` | 即时 |

---

## 2. Shopify 后端状态 → 前端响应

### 2.1 购物车状态（最重要的响应式数据）

**数据源**：`window.Shopify.cart` 或 `fetch('/cart.js')`

**响应链路**：
```
用户点击 ATC
  ↓
cart.js 拦截 form submit
  ↓
fetch('/cart/add.js', { method: 'POST', body: formData })
  ↓ 成功
fetch('/cart.js') → 获取完整 cart JSON
  ↓
更新所有 cart 消费者：
  ├─ cart drawer body（商品列表 HTML 重建）
  ├─ cart drawer footer（小计、免运费进度条）
  ├─ header cart count dot（.bt-header__cart-dot）
  ├─ aria-live 播报 "Item added to your cart"
  └─ 触发 window.dispatchEvent(new CustomEvent('theme:cartUpdated', { detail: { cart } }))
```

**免运费进度条**（真实 cart-total 驱动，非假数据）：
```liquid
{%- assign threshold = settings.free_shipping_threshold | times: 100 %}
{%- assign remaining = threshold | minus: cart.total_price %}
{%- if remaining > 0 %}
  <div class="bt-cart-drawer__shipping-track">
    <div class="bt-cart-drawer__shipping-fill"
         style="width: {{ cart.total_price | times: 100 | divided_by: threshold }}%">
    </div>
  </div>
  <p>You're {{ remaining | money }} away from free shipping!</p>
{%- else %}
  <p>You've unlocked free shipping! 🎉</p>
{%- endif %}
```

**AJAX 更新后**：cart.js 重新 fetch `/cart.js`，用新数据重建整个 cart drawer 的 innerHTML。

### 2.2 产品变体状态

**数据源**：`product.variants` JSON（嵌入在 variant-picker block 的 `<script data-variants>` 标签中）

**响应链路**：
```
用户切换变体（radio change）
  ↓
variant-selects.js 匹配 variant
  ↓
同时更新：
  ├─ 隐藏 input[name="id"] → cart.js 下次加车使用
  ├─ 价格 DOM（.bt-product-price__current）
  ├─ compare_at_price DOM（划线原价）
  ├─ 库存状态 aria-live 播报
  ├─ ATC 按钮 disabled 状态
  ├─ gallery 主图切换
  ├─ URL pushState（?variant=xxxx）
  └─ window.dispatchEvent(new CustomEvent('theme:variantChange', { detail: { variant, sectionId } }));
```

**关键**：所有变体相关的 UI 更新都在 `variant-selects.js` 的**单一函数**中完成，保证一致性和可维护性。

### 2.3 产品推荐状态

**数据源**：`/recommendations/products?product_id=X&limit=4`（Shopify 原生 API）

**响应链路**：
```
<product-recommendations> custom element 挂载
  ↓
fetch(data-url) → JSON { products: [...] }
  ↓
JS 构建 card HTML（image + title + price + link）
  ↓
插入 DOM → 显示
  ↓ 失败
显示空状态占位
```

### 2.4 Collection 筛选状态

**数据源**：`collection.filters`（Liquid 原生对象）+ URL params

**响应链路**：
```
用户点击筛选 checkbox
  ↓
main-collection-product-grid.liquid JS 拦截
  ↓
ajaxNavigate(filterUrl) — AJAX 刷新
  ↓
fetch(url) → 获取新 HTML
  ↓
DOMParser 解析 → 替换 grid 内容
  ↓
history.pushState → URL 可分享/可后退
  ↓
fade-out + fade-up reveal 动画
```

---

## 3. Theme Editor 设置 → 实时预览

### 3.1 颜色设置响应

```
商家在 editor 中改 colors_background
  ↓
Shopify 发送 setting change 事件到 preview iframe
  ↓
theme.liquid {% style %} 中的 --bt-color-bg 更新
  ↓
所有使用 var(--bt-color-bg) 的元素立即变色
  （浏览器 CSS 变量继承链自动处理）
```

### 3.2 字体设置响应

```
商家在 editor 中改 heading_font
  ↓
Shopify 重新注入 font_face → 字体文件重新加载
  ↓
所有使用 var(--bt-font-heading) 的元素立即更新字体
```

### 3.3 Section/Block 设置响应

```
商家改 section setting（如 hero 的 heading 文本）
  ↓
preview iframe 中对应 section 重新渲染
  ↓
新 HTML 替换旧 DOM
  ↓
JS 组件可能需要重新初始化（如 variant-selects）
```

---

## 4. URL 状态管理

| 状态 | 实现 | 触发 |
|------|------|------|
| 变体选择 | `history.pushState({...}, '', '?variant=xxxx')` | variant-selects.js |
| Collection 筛选 | `history.pushState({ btAjax: true, url }, '', url)` | collection-grid AJAX |
| 浏览器后退 | `window.addEventListener('popstate', ...)` → AJAX 导航 | collection-grid |

---

## 5. window.theme 全局状态对象

```javascript
window.theme = window.theme || {};

// 初始化（theme.liquid）
window.theme.moneyFormat = {{ shop.money_format | json }};

// 变体切换时更新（variant-selects.js）
window.theme.activeVariant = {
  id: 123456789,
  price: 2999,
  compareAtPrice: 3999,
  available: true,
  title: '6" Pot / Green'
};

// 购物车更新时（cart.js）
window.theme.cart = { item_count: 3, total_price: 8997 };

// 自定义事件
window.theme.variantChange  // CustomEvent
window.theme.cartUpdated    // CustomEvent
```

---

## 6. CSS 状态（视觉响应式）

### 6.1 颜色令牌继承链

```
:root {
  --bt-color-bg: #F5F1E8;          ← theme.liquid {% style %} 动态注入
  --bt-color-primary: #4A6B4F;     ← 商家在 theme editor 修改
  --bt-color-primary-hover: color-mix(...); ← 自动派生
}
  ↓ 全局继承
.bt-btn--primary {
  background: var(--bt-color-primary);  ← 自动拾取最新值
  color: var(--bt-color-primary-contrast);
}
  ↓ hover 状态自动派生
.bt-btn--primary:hover {
  background: var(--bt-color-primary-hover);
}
```

### 6.2 设计令牌 → 组件消费

```
设计令牌（design-tokens.css）
  ├─ --bt-fs-h1 → h1, .bt-h1
  ├─ --bt-space-md → 所有 gap/padding/margin
  ├─ --bt-radius-card → .bt-card, .bt-guarantee__inner
  └─ --bt-ease-out → 所有 transition
```

**修改一处令牌 → 全局生效。这是主题的"单一真相源"。**

---

## 7. 性能优化：何时不响应

| 场景 | 优化策略 | 原因 |
|------|---------|------|
| **reduced-motion** | 所有动效 duration → 0ms / animation: none | 无障碍要求 |
| **Collection AJAX 防抖** | `if (ajaxing) return;` 阻止并发请求 | 防止重复加载 |
| **Lazy loading 图片** | `loading="lazy"` + explicit `width`/`height` | 防 CLS |
| **Font preload** | `<link rel="preload" as="font">` | 防 FOUT |
| **CSS `{% stylesheet %}` 子集化** | Shopify 只输出渲染树中用到的 block 的 CSS | 减少 CSS payload |

---

## 8. 数据变更规则总结

| 规则 | 说明 |
|------|------|
| **单一真相源** | 购物车状态 → `fetch('/cart.js')`；颜色 → `--bt-color-*`；设置 → `settings_data.json` |
| **单向数据流** | 后端数据 → AJAX → DOM 更新。不反向写回 |
| **事件驱动** | 组件间通信用 CustomEvent，不直接调用对方的方法 |
| **DOM 作为状态** | `input[name="id"]` 的值就是当前选中 variant 的 ID；任何组件通过 `querySelector` 读取 |
| **URL 可分享** | 筛选/变体状态反映在 URL params 中 |

---

*关联文档：[[01-ARCHITECTURE]] [[02-LIFECYCLE]] [[04-FEATURE-TREE]] [[08-PERFORMANCE]]*
