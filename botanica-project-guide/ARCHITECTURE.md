# Botanica 架构手册

## 技术栈

- **基础**：Shopify Dawn v13（Online Store 2.0 / JSON 模板）
- **模板引擎**：Liquid
- **CSS**：Dawn component CSS + botanica.css 品牌层 + 每个 section 独立 CSS
- **JS**：Dawn 原生 ES modules，无外部依赖
- **字体**：Fraunces（标题）+ Inter（正文），来自 Shopify Font Library

## 三层 CSS 架构（核心模式）

```
Layer 1: Dawn 组件 CSS (component-*.css, section-*.css)
         ↓ 全局加载，继承不改
Layer 2: Botanica 品牌层 (assets/botanica.css)
         ↓ CSS 自定义属性、工具类、卡片覆盖
Layer 3: 每 Section CSS (assets/hero-lookbook.css, shop-by-care.css, ...)
         ↓ 按 section 独立加载，作用域限定
```

### 品牌层 CSS 变量示例

```css
:root {
  --botanica-sage: #4A6B4F;
  --botanica-cream: #F5F1E8;
  --botanica-terracotta: #C97D5A;
  --botanica-bark: #2E2A24;
  --botanica-font-heading: 'Fraunces', serif;
  --botanica-font-body: 'Inter', sans-serif;
}
```

### 工具类系统

```css
.botanica-eyebrow       /* 小标签/分类标签 */
.botanica-badge         /* 徽章系统 */
.botanica-lift          /* hover 上浮效果 */
.botanica-section       /* section 容器 */
.botanica-eyebrow-stack /* 标签堆叠 */
```

## Section 标准模板

每个自定义 section 遵循统一模式：

```liquid
{{ 'section-name.css' | asset_url | stylesheet_tag }}

{%- style -%}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<div class="section-name color-{{ section.settings.color_scheme }} gradient">
  {% for block in section.blocks %}
    <!-- block 渲染 -->
  {% endfor %}
</div>

{% schema %}
{
  "name": "Section Name",
  "settings": [ /* ... */ ],
  "blocks": [ /* ... */ ],
  "presets": [{ "name": "Section Name" }]
}
{% endschema %}
```

## 自定义 Section 清单（Phase 2）

| Section | 文件 | 核心功能 |
|---------|------|---------|
| Hero Lookbook | `hero-lookbook.liquid` | 分屏/叠加英雄区 + ISSUE 标签 + block 化内容 |
| Shop by Care | `shop-by-care.liquid` | 3 卡养护等级（简单/中等/专家）+ 光照水分计量 |
| Plant Spotlight | `plant-spotlight.liquid` | 单产品聚焦 + 养护表格 + 产地故事 |
| Care Blog Teaser | `care-blog-teaser.liquid` | 3 篇养护博客卡片（手动/自动） |
| Size Guide | `botanica-size-guide.liquid` | 3 尺寸对比卡 + SVG 人像比例尺 |
| Values Bar | `botanica-values-bar.liquid` | 信任栏（运输/保障/换盆/客服） |
| Testimonials | `testimonials.liquid` | 3 列证言网格 |
| Newsletter Perk | `newsletter-perk.liquid` | 分屏订阅 + 权益列表 |

## 配色方案（4 预设）

```json
scheme-1: 奶油背景 + 深棕文字 + 鼠尾草绿按钮（默认 Sage）
scheme-2: 纯白背景 + 深棕文字 + 鼠尾草绿按钮（Minimalist）
scheme-3: 鼠尾草绿背景 + 奶油文字 + 奶油按钮（Dark Sage）
scheme-4: 树皮背景 + 奶油文字 + 赤陶按钮（Bark）
```

## 多语言支持

20+ 语言在 `locales/*.json`，主文件 `en.default.json`（14 顶级键）。

翻译键用点号命名：`t:settings_schema.colors.name`

## JS 层

全部来自 Dawn 原生 ES modules。关键文件：
- `global.js` — 全局逻辑
- `pubsub.js` — 发布/订阅事件总线
- `constants.js` — 常量定义

自定义 JS 按需添加到 `assets/`，在 `theme.liquid` 中用 `<script defer>` 加载。
