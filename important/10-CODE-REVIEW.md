# Botanica v3 — 代码审查文档

> 位置：`E:\ccfold\shopify\important\10-CODE-REVIEW.md`
> 每次代码提交前的审查清单
> 最后更新：2026-07-06

---

## 1. 审查流程

```
代码修改完成
  ↓
① 自审（本清单逐条过）
  ↓
② shopify theme check（必须 0 error）
  ↓
③ 关联功能验证（参考 [[09-CHANGE-MANAGEMENT]]）
  ↓
④ 提交审查
```

---

## 2. 自审查清单

### A. Liquid 代码审查

- [ ] 所有可见文本使用 `t:` translation key（无硬编码英文字符串）
  ```liquid
  {% comment %} ✅ {% endcomment %}
  <span>{{ 'products.product.add_to_cart' | t }}</span>
  {% comment %} ❌ {% endcomment %}
  <span>Add to cart</span>
  ```

- [ ] 所有用户输入正确转义
  ```liquid
  {% comment %} ✅ {% endcomment %}
  {{ block.settings.text | escape }}
  {{ product.title | json }}    ← JS 上下文中
  {% comment %} ❌ {% endcomment %}
  {{ block.settings.text }}     ← 无转义
  ```

- [ ] 空状态处理（设置为空时不输出孤立标签）
  ```liquid
  {% comment %} ✅ {% endcomment %}
  {%- if block.settings.text != blank -%}
    <p>{{ block.settings.text | escape }}</p>
  {%- endif -%}
  {% comment %} ❌ {% endcomment %}
  <p>{{ block.settings.text | escape }}</p>  ← text 为空时输出空 <p>
  ```

- [ ] Block 有 `{{ block.shopify_attributes }}`
- [ ] Section 有 `{{ section.shopify_attributes }}`
- [ ] `{% schema %}` 完整：name、settings、presets（block 必须有 preset）

### B. CSS 审查

- [ ] 所有颜色使用 `var(--bt-color-*)`，无硬编码色值
  ```css
  /* ✅ */
  color: var(--bt-color-text);
  /* ❌ */
  color: #2E2A24;
  ```

- [ ] 无 `!important`（除非必要且注明原因）
- [ ] 响应式断点正确：749px（移动端）、989px（平板）
- [ ] `prefers-reduced-motion` 守卫（所有动画）
- [ ] `:focus-visible` 样式不被抹除
- [ ] 触控目标 ≥ 24×24px（CTA ≥ 44×44px）

### C. JS 审查

- [ ] 零外部依赖（无 import from npm / CDN）
- [ ] 使用 `defer` 加载
- [ ] 事件监听使用委托模式（`e.target.closest()`）
- [ ] `fetch()` 请求有错误处理（`.catch()`）
- [ ] 无 `eval()`、`new Function()`、未消毒的 `innerHTML`
- [ ] `IntersectionObserver`/`MutationObserver` 有 disconnect 清理

### D. Schema 审查（settings_schema.json / section schemas）

- [ ] 无 `botanica.*` / `custom.*` / `shopify://` 引用
- [ ] 设置 label 使用 `t:` key（指向 `locales/en.default.json` 或 `*.schema.json`）
- [ ] 设置 `default` 值合理
- [ ] `type` 正确（color / font_picker / image_picker / richtext / text / url / checkbox / range / select / product / collection / link_list）
- [ ] 无 `config/markets.json` 打包

### E. 无障碍审查

- [ ] 语义 HTML（`<nav>`、`<main>`、`<button>`、`<table>` 等）
- [ ] 图片有 `alt` 属性（装饰性图片 `aria-hidden="true"`）
- [ ] 表单字段有 `<label>` 关联
- [ ] 弹窗/抽屉有 `role="dialog"` + `aria-modal="true"` + `aria-label`
- [ ] 动态内容有 `aria-live` 播报
- [ ] 颜色不是唯一的信息传达方式（配合图标/文本）
- [ ] `:focus-visible` 焦点环存在且可见

---

## 3. 审查重点区域

| 区域 | 审查重点 |
|------|---------|
| `cart.js` | AJAX 加车、cart drawer 内容更新、焦点管理、aria-live 播报 |
| `variant-selects.js` | 变体切换、价格更新、ATC 同步、URL 更新、不可用变体处理 |
| `buy-buttons.liquid` | 数量控件、ATC disabled 状态、动态结账按钮、trust badge |
| `card-product.liquid` | 产品卡结构、图片 ratio、care badge 逻辑、quick-view 触发 |
| `header.liquid` | Mega menu 交互、移动端 drawer、cart count 同步 |
| `theme.liquid` | 颜色注入、字体加载、JS 加载顺序、cart drawer/predictive 容器 |

---

## 4. 常见错误速查

| 错误 | 修复 |
|------|------|
| `ValidJSON` 错误 | 检查 JSON 无尾逗号、双引号、UTF-8 without BOM |
| 空 section 渲染孤立标签 | 添加 `{% if setting != blank %}` 守卫 |
| CSS 变量未定义 | 检查 `design-tokens.css` 中是否存在该 `--bt-*` 变量 |
| `t:` key 找不到 | 检查 `locales/en.default.json` 或 `*.schema.json` 中是否有对应 key |
| Block 在 editor 中不可选 | 检查 `{% schema %}` 中是否有 `"presets"` |
| Shopify CDN 图片不显示 | 检查 `image_url` filter 后是否接 `| image_tag` 或手动写 `<img>` |

---

## 5. 最终提交审查

- [ ] `shopify theme check` 0 error
- [ ] Lighthouse 性能 ≥ 60（home+product+collection 平均）
- [ ] Lighthouse 无障碍 ≥ 90
- [ ] 手动键盘走通 home → product → add to cart → checkout
- [ ] NVDA/VoiceOver 读屏走通
- [ ] 对比度：正文 4.5:1、大字 3:1
- [ ] 触控目标 ≥ 24×24（CTA ≥ 44×44）
- [ ] JS ≤ 16 KB minified
- [ ] `docs/botanica-v3/04-COMPLIANCE.md` 逐条勾过

---

*关联文档：[[04-FEATURE-TREE]] [[09-CHANGE-MANAGEMENT]] [[11-TESTING]] [[13-BUG-LOG]]*
