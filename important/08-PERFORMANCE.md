# Botanica v3 — 性能优化文档

> 位置：`E:\ccfold\shopify\important\08-PERFORMANCE.md`
> 性能优化策略与当前状态。目标：Lighthouse 性能 ≥ 60（home+product+collection 平均）
> 最后更新：2026-07-06

---

## 1. 性能目标

| 指标 | 目标 | 测试方式 |
|------|------|---------|
| Lighthouse Performance | ≥ 60 | Shopify 基准数据集、桌面+移动、home+product+collection 平均 |
| Lighthouse Accessibility | ≥ 90 | 同上 |
| JS 总体积 | ≤ 16 KB minified | 所有 `.js` 文件总和 |
| LCP（最大内容绘制） | < 2.5s | 桌面+移动 |
| CLS（累计布局偏移） | < 0.1 | 桌面+移动 |
| TBT（总阻塞时间） | < 300ms | 桌面+移动 |

---

## 2. CSS 优化策略

### 2.1 加载顺序优化

```
design-tokens.css   ← 最小体积、最先加载（定义所有变量）
base.css            ← 基础样式
effects.css         ← 动画/纹理
botanical-effects.css ← 植物特效（仅在首页使用时可考虑延迟加载）
```

### 2.2 `{% stylesheet %}` 自动子集化

Shopify 自动只输出当前页面实际渲染的 block 的 CSS。如果某个 block 不在当前页面，其 `{% stylesheet %}` 中的 CSS **不会**输出。

这意味着：
- PDP 不会加载首页 hero section 的 CSS
- 首页不会加载 PDP 变体选择器的 CSS
- 每个页面的 CSS payload 远小于所有 CSS 文件的总和

### 2.3 无 Sass/预处理器

直接用原生 CSS + CSS 自定义属性，Shopify 自动压缩。优点：
- 零构建步骤
- 浏览器原生支持
- `@supports` 渐进增强

### 2.4 `color-mix()` 派生色

```css
--bt-color-primary-hover: color-mix(in srgb, var(--bt-color-primary) 85%, black);
```

避免了手动定义 10+ 个衍生颜色变量，减少 CSS 体积。

---

## 3. JS 优化策略

### 3.1 零外部依赖

所有 JS 为 vanilla JavaScript，无 npm 包、无 CDN 库、无框架。

### 3.2 按需加载

| 脚本 | 加载页面 | 大小（估算） |
|------|---------|------------|
| `cart.js` | 全站 | ~3 KB |
| `search.js` | 仅当 `predictive_search_enabled` | ~2 KB |
| `variant-selects.js` | 仅 PDP / featured-product | ~3 KB |
| `gallery.js` | 仅 PDP | ~2 KB |
| `quick-view.js` | 全站（collection 产品卡需要） | ~2 KB |
| `sticky-atc.js` | 仅 PDP（移动端） | ~1 KB |
| `pickup-availability.js` | 仅 PDP | ~1 KB |

**总计**：~14 KB minified ✅（在 16 KB 指南内）

### 3.3 defer 加载

所有 `<script>` 使用 `defer`：
- 不阻塞 HTML 解析
- 保持执行顺序
- DOMContentLoaded 前执行

### 3.4 条件加载

```liquid
{%- if settings.predictive_search_enabled -%}
  <script src="{{ 'search.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
```

### 3.5 事件委托

全局事件委托在 `document` 或容器元素上，而非每个按钮单独绑定：
```javascript
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-cart-open]');
  if (!btn) return;
  // ...
});
```

---

## 4. 图片优化

### 4.1 响应式图片

```liquid
{{ product.featured_media | image_url: width: 1000 | image_tag:
  loading: 'eager',
  fetchpriority: 'high',    ← LCP 图片优先加载
  widths: '400, 600, 800, 1000, 1200',
  sizes: '(min-width: 990px) 50vw, 100vw',
  alt: product.title
}}
```

### 4.2 Lazy Loading

折叠线以下的图片使用 `loading="lazy"`。

### 4.3 显式尺寸防 CLS

```css
.bt-card__media { aspect-ratio: 4 / 5; }
.bt-product__main-media { aspect-ratio: 4 / 5; }
```

所有图片容器有明确 `aspect-ratio` 或 `width`/`height`，防止图片加载时的布局偏移。

### 4.4 Font Preload

```liquid
{{ settings.heading_font | font_url | preload_tag: as: "font", type: "font/woff2", crossorigin: "anonymous" }}
```

---

## 5. 字体优化

### 5.1 Shopify Font Library

字体通过 Shopify CDN 加载，支持 `font-display: swap`（自动处理）。

### 5.2 仅加载需要的字体

- 标题：Fraunces（仅 regular weight）
- 正文：Inter（仅 regular weight）
- 粗体通过 CSS `font-weight` 处理（浏览器合成或 font_modify）

### 5.3 `size-adjust` fallback

```css
@font-face {
  font-family: 'Fraunces-fallback';
  size-adjust: 105%;
  src: local('Georgia');
}
```

---

## 7. 无须优化的场景（Shopify 自动处理）

| 场景 | Shopify 处理方式 |
|------|-----------------|
| CSS 压缩 | 自动 minify |
| JS 压缩 | 自动 minify |
| 图片 CDN | 自动通过 Shopify CDN 分发 |
| 浏览器缓存 | 自动设置 Cache-Control headers |
| HTTP/2 | Shopify CDN 默认启用 |
| HTML 压缩 | 自动移除空白 |

---

## 8. 性能回归检查点

每次修改后检查：

- [ ] 新增 CSS 是否放在 `{% stylesheet %}` 中 → 自动子集化
- [ ] 新增 JS 是否使用 `defer` + ES module
- [ ] 新增图片是否有 `loading="lazy"` + `width`/`height`
- [ ] 是否有新增的外部依赖（应始终为 0）
- [ ] `shopify theme check` 0 error
- [ ] 最终提交前：Lighthouse CI 跑 home + product + collection 平均

---

*关联文档：[[01-ARCHITECTURE]] [[03-STATE-MANAGEMENT]] [[09-CHANGE-MANAGEMENT]]*
