# Botanica v3 — PDP（产品页）细粒度规格（05-SPEC-PDP）

> 本文件把 `02-PLAN.md §7.1 / P1` 的产品页展开到 DeepSeek 可直接生成代码的粒度。
> **它也是范式样板**：其他自定义 section（collection、cart、spotlight…）请照此粒度（section 壳 + theme blocks + schema + a11y 契约 + 数据来源）推演。
> 铁律重申：Skeleton 全原创、theme-blocks、产品元素拆 block、支持 `@app`、养护数据走 **block 设置**（禁 `botanica.*` metafield）、a11y 一等公民。

---

## 1. 为什么 PDP 是重中之重

官方"唯一性"按**核心模板的整体体验**衡量，PDP 是权重最高的页面之一（性能权重 product=31/77）。v1 的 PDP 是 Dawn 默认布局——这正是被判"非原创"的关键。**v3 的 PDP 必须是一眼能认出的原创编辑式布局**，而非"Dawn 加个养护表"。

---

## 2. 布局蓝图（桌面）

```
┌───────────────────────────────────────────────────────────────┐
│  面包屑 / 返回系列                                              │
├──────────────────────────────┬────────────────────────────────┤
│                              │  [eyebrow: 拉丁学名 specimen]   │
│   编辑式画廊                  │  H1 产品名 (Fraunces)           │
│   - 4:5 主图 + 纸纹 overlay   │  价格 (售价/原价 visually-hidden)│
│   - 标本牌(角标: 产地/难度)   │  ── 细分隔线 ──                 │
│   - 缩略图竖排 / 点选         │  变体选择 (variant-picker)      │
│   - 支持视频(不自动播放)      │  数量 + 加车 + 动态结账(协调样式)│
│   (sticky 直到画廊结束)       │  ↓ 以下进入 sticky 养护面板    │
│                              │  ┌── 养护面板 (sticky) ──────┐ │
│                              │  │ care-table: 光/水/湿/尺/毒│ │
│                              │  │ (图标圆 + label + 计量器) │ │
│                              │  └───────────────────────────┘ │
├──────────────────────────────┴────────────────────────────────┤
│  田野笔记 (field-note, terracotta 左边框, 起源故事)            │
│  产品描述 (rich text)                                          │
│  规格 / 配送 / 退换 (collapsible, 原生 <details>)              │
│  @app 区 (评论等 app block 插入点)                             │
│  互补/搭配产品 · 相关产品                                      │
└───────────────────────────────────────────────────────────────┘
```
移动端：画廊 → 标题/价格 → 变体/数量 → 养护面板（横向滚动卡或堆叠）→ 笔记/描述/折叠。**sticky ATC 栏**在主加车滚出视口后出现（键盘可达、不遮焦点）。

---

## 3. Section 壳：`sections/main-product.liquid`

要点：
- 包一个 `<product-info>` 自定义元素（或等价 JS 控制器）处理变体/媒体/数量联动；ES module、defer、≤16KB。
- schema 声明 `"blocks": [{ "type": "@theme" }, { "type": "@app" }]`，markup 用 `{% content_for "blocks" %}` 渲染商家在编辑器排的 block 顺序。
- 颜色用 palette token（`color-{{ section.settings.color_scheme }}` 或直接 `var(--bt-color-*)`）。
- 提供**无代码布局设置**：画廊样式（缩略图位置/堆叠/轮播）、是否 sticky 养护面板、媒体宽度、section padding。
- **a11y**：变体/价格/库存变化用 `aria-live="polite"` 区域播报；媒体画廊键盘可操作；`<form>` 用 product form。

schema 骨架（节选）：
```json
{
  "name": "t:sections.main_product.name",
  "tag": "section",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "settings": [
    { "type": "select", "id": "gallery_layout", "label": "t:...gallery_layout",
      "options": [
        {"value":"thumb_left","label":"t:...thumb_left"},
        {"value":"thumb_below","label":"t:...thumb_below"},
        {"value":"stacked","label":"t:...stacked"}],
      "default":"thumb_left" },
    { "type": "checkbox", "id": "sticky_care", "label": "t:...sticky_care", "default": true },
    { "type": "color_scheme", "id": "color_scheme", "label": "t:...scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "min":0,"max":100,"step":4,"unit":"px","default":40,"label":"t:...pt" },
    { "type": "range", "id": "padding_bottom", "min":0,"max":100,"step":4,"unit":"px","default":40,"label":"t:...pb" }
  ],
  "presets": [
    { "name": "t:sections.main_product.name",
      "blocks": [
        {"type":"specimen-eyebrow"},
        {"type":"product-title"},
        {"type":"product-price"},
        {"type":"variant-picker"},
        {"type":"quantity-selector"},
        {"type":"buy-buttons"},
        {"type":"care-table"},
        {"type":"field-note"},
        {"type":"product-description"},
        {"type":"collapsible-specs"},
        {"type":"share"}
      ] }
  ]
}
```

---

## 4. Block 清单（每个 = `blocks/<name>.liquid`，可复用/可嵌套）

> 通则：每个 block 自带 `{% stylesheet %}` 作用域 CSS + `{% schema %}`（含 `presets`）+ `{{ block.shopify_attributes }}` + a11y。文本走 `t:` key。**数据优先用产品原生对象 + block 设置；禁自定义 metafield**。

| Block | 用途 | 关键设置 | 数据来源 | a11y 要点 |
|---|---|---|---|---|
| `specimen-eyebrow` | 拉丁学名/标本编号小标签 | text；可绑 `product.vendor` 或商家填 | 产品原生 / block 设置 | 装饰，正常文本 |
| `product-title` | H1 产品名 | heading tag、size | `product.title` | 页面唯一 H1 |
| `product-price` | 价格 + 售价/原价 | 显示单价开关 | `product.selected_or_first_available_variant.price` | 售价/原价 visually-hidden 文本区分；价格变化 `aria-live` |
| `product-badges` | 难度/库存/新品徽章 | 徽章类型、颜色(palette) | 产品标签/系列/库存 | 不只靠颜色，带文本 |
| `variant-picker` | 变体（按钮/下拉/色板） | 样式、是否色板 | `product.options_with_values` | 不可用变体置灰+strikethrough+tooltip；`on:change` 更新；label 关联 |
| `quantity-selector` | 数量 +/- | — | — | 按钮 `aria-label`；输入 `<input type=number>`；±按钮 44×44 |
| `buy-buttons` | 加车 + 动态结账 | 显示动态结账开关、payment-button | product form | 动态结账按钮**保留原生但容器协调间距/圆角**；加车后 `aria-live` "Added" |
| `care-table` | ★ 养护要点表（容器） | 行数据来自嵌套 `care-row`；标题 | **嵌套 care-row block 设置** | 真 `<table>`+`<caption>`；见 §5 |
| `care-row` | 单行养护项（私有 `_care-row`?或公开） | icon 选择、label、值文本、计量器等级(0-3 select) | **block 设置（商家填）**；可选 dynamic-source 接**标准** "Care guide" | 计量器有 visually-hidden 文本 |
| `field-note` | 起源故事/田野笔记 | richtext、terracotta 左边框开关 | block 设置 | 引用语义 |
| `product-description` | 产品描述 | — | `product.description` | — |
| `collapsible-specs` | 配送/退换/规格折叠 | 多个折叠项(标题+内容) | block 设置 | 原生 `<details>/<summary>`；可聚焦 |
| `share` | 分享 | — | `shop.url` + product | 链接有可见文本/aria-label |
| `complementary` | 互补产品 | product list / 推荐 | `recommendations`/block | 列表语义 |
| `pickup-availability` | 自提（如启用） | — | 原生 | — |

> **画廊**：作为 section 内固定结构或独立 `product-gallery` block 实现；4:5 主图 + 纸纹 overlay + 标本角标；缩略图键盘可选；支持视频（**不自动播放**或可暂停）；主图 `fetchpriority="high"` + width/height 防 CLS；其余 `loading="lazy"`。

---

## 5. ★ 养护数据契约（最容易踩雷，单列）

**绝不**这样做（v1/旧计划的错）：
```liquid
{{ product.metafields.botanica.light_level }}   ❌ 自定义 metafield = 点名拒因 + 空店渲染空
```
**正确**做法——`care-row` 用 block 设置承载，商家在 theme editor 填：
```liquid
{% comment %} blocks/care-row.liquid {% endcomment %}
{%- liquid
  assign icon = block.settings.icon
  assign label = block.settings.label
  assign value = block.settings.value
  assign level = block.settings.level | plus: 0
-%}
{%- if label != blank -%}
<tr class="bt-care__row" {{ block.shopify_attributes }}>
  <th scope="row" class="bt-care__key">
    {% render 'icon', name: icon %}<span>{{ label }}</span>
  </th>
  <td class="bt-care__val">
    {%- if block.settings.show_meter -%}
      <span class="bt-meter" role="img" aria-label="{{ value }}">
        {%- for i in (1..3) -%}
          <span class="bt-meter__dot{% if i <= level %} is-on{% endif %}" aria-hidden="true"></span>
        {%- endfor -%}
      </span>
      <span class="bt-sr-only">{{ value }}</span>
    {%- else -%}
      {{ value }}
    {%- endif -%}
  </td>
</tr>
{%- endif -%}
{% schema %}
{ "name":"t:blocks.care_row.name",
  "settings":[
    {"type":"select","id":"icon","label":"t:...icon","options":[
      {"value":"light","label":"Light"},{"value":"water","label":"Water"},
      {"value":"humidity","label":"Humidity"},{"value":"size","label":"Size"},
      {"value":"toxicity","label":"Toxicity"},{"value":"temperature","label":"Temperature"}],"default":"light"},
    {"type":"text","id":"label","label":"t:...label","default":"Light"},
    {"type":"text","id":"value","label":"t:...value","default":"Bright indirect"},
    {"type":"checkbox","id":"show_meter","label":"t:...show_meter","default":true},
    {"type":"range","id":"level","min":0,"max":3,"step":1,"default":2,"label":"t:...level"}
  ],
  "presets":[{"name":"t:blocks.care_row.name"}] }
{% endschema %}
```
- 计量器是 **SVG/CSS 圆点带 `is-on` 填充**（绝不是 `***`），有 `bt-sr-only` 文本。
- **可选增强**：高级商家可把某行 value 在编辑器里接 dynamic source 到**标准** "Care guide" 定义——但**默认不绑**，空店也完整渲染。
- 大目录商家想批量用 metafield？文档里教他们手动建定义并在编辑器接 dynamic source；**主题不依赖、不默认绑、JSON 里不出现**。

---

## 6. PDP 的 a11y 契约（DeepSeek 必须实现）

- [ ] 唯一 H1 = 产品名；价格/库存变化 `aria-live="polite"` 播报。
- [ ] 售价/原价用 `bt-sr-only` 文本区分（"Sale price" / "Regular price"）。
- [ ] 变体不可用：置灰 + strikethrough + `aria-disabled` + tooltip "Unavailable"。
- [ ] 数量 ± 按钮 `aria-label` + 44×44；输入 `type="number"` 有 label。
- [ ] 画廊：缩略图 `button`，键盘可选，主图 `alt` 描述植物；视频不自动有声播放。
- [ ] care-table：`<table>` + `<caption>`；计量器 `bt-sr-only` 文本（不只颜色/形状）。
- [ ] 折叠用原生 `<details>/<summary>`（键盘可达）。
- [ ] 加车成功播报；sticky ATC 键盘可达、不遮挡当前焦点。
- [ ] 焦点环 `:focus-visible` 不被自定义 CSS 抹除。

---

## 7. PDP 验收（并入 P1 门禁）

- [ ] 布局原创（非 Dawn 默认）；自检"商家无法调成另一个商店主题"。
- [ ] 产品元素全部 block 化；section 支持 `@theme` + `@app`，用 `{% content_for "blocks" %}`。
- [ ] 养护数据走 block 设置，JSON/schema 无 `botanica.*`/`custom.`/`shopify://`；空店完整渲染。
- [ ] 键盘走通"进入 PDP → 选变体 → 改数量 → 加车"；读屏播报正常。
- [ ] 计量器是精致 SVG（非 `***`）；动态结账按钮与品牌协调。
- [ ] 性能（含真实图）≥60、无障碍≥90（CI 基准）。

---

> 推演提示：collection 页照此把"原创网格 + 筛选 + card-product block + @app"展开；cart 照此把"真实免运费进度条 + 养护 upsell block"展开；spotlight/size-guide/shop-by-care 照 §7.x 把"care-row/size-card/care-card block + 计量器 + 数据走设置"展开。**任何 section 的数据都不准依赖自定义 metafield。**
