---
name: code-review
description: Botanica Shopify Theme 代码审查技能。在 Stage 3 触发，按 Theme Check 合规/Schema 完整性/CSS 一致性/Liquid 质量/CSS 质量/JSON 合法性六维度审查。
---

# SKILL.md — Botanica 主题代码审查

## 技能名称
`code-review` — Botanica Shopify Theme 代码审查

## 触发条件
1. Stage 3（所有 section 开发完成后）
2. 准备 `shopify theme push` 前
3. 用户明确要求代码审查

## 角色
你是 Botanica 主题的**代码审查专家**。你的审查维度针对 Shopify 主题特性定制。

---

## 审查流程

### 第 1 步: 自动化检查（必须先通过）
```powershell
shopify theme check --path botanica    # 必须 0 error
.\verify.ps1                           # CSS link + JSON/BOM 必须全 PASS
```

### 第 2 步: Theme Check 合规审查（阻断项）

| # | 检查项 | 标准 |
|---|--------|------|
| 1 | theme check error = 0 | **阻断** — 任何 error 不可进入 Stage 4 |
| 2 | 无 MissingThemeLayout | layout/theme.liquid 存在 |
| 3 | 无 ValidHTMLTranslation | 所有 t: key 在 locale 文件中存在 |
| 4 | 无 AssetSizeJavaScript | JS 文件不超过 ~50KB |
| 5 | 无 AssetPreload | 字体预加载格式正确 |
| 6 | 无 MissingTemplate | JSON 模板引用的 section type 都存在 |

### 第 3 步: Section Schema 完整性审查

| # | 检查项 |
|---|--------|
| 1 | 每个 section 有 `{% schema %}` 标签 |
| 2 | schema 有 `name` 字段（用 t: locale key） |
| 3 | settings 的 type 是 Shopify 合法类型（text/select/range/image_picker/color_scheme 等） |
| 4 | 每个 section 至少有一个 `presets` 条目 |
| 5 | blocks 的 type 名称是 kebab-case |
| 6 | `{{ block.shopify_attributes }}` 在 block wrapper 元素上 |

### 第 4 步: CSS 链接一致性审查

| # | 检查项 |
|---|--------|
| 1 | 每个 section .liquid 顶部有同名 CSS 的 stylesheet_tag |
| 2 | 没有孤立的 CSS 文件（未被任何 liquid 引用）|
| 3 | Dawn component CSS 的正确加载方式（全局或 lazy-load） |

### 第 5 步: Liquid 质量审查

| # | 检查项 |
|---|--------|
| 1 | 使用 `{%- -%}` 空格控制 |
| 2 | 复杂逻辑集中在 `{%- liquid -%}` 块 |
| 3 | 无硬编码文本（所有可见文本走 settings 字段或 locale） |
| 4 | 图片使用 `| image_url: width: N` + `sizes` + `loading="lazy"` |
| 5 | 条件渲染无空 div 残留 |
| 6 | section settings 通过 `section.settings.xxx` 读取 |
| 7 | block settings 通过 `block.settings.xxx` 读取 |

### 第 6 步: CSS 质量审查

| # | 检查项 |
|---|--------|
| 1 | BEM 命名规范（`.section__element--modifier`） |
| 2 | 颜色使用 CSS 变量（不硬编码色值） |
| 3 | 所有选择器在 section 顶级 class 下（作用域正确） |
| 4 | 响应式断点正确（750px, 990px） |
| 5 | 使用 Dawn 的 spacing/sizing 变量体系 |
| 6 | 尊重 `prefers-reduced-motion` |

### 第 7 步: JSON 合法性审查

| # | 检查项 |
|---|--------|
| 1 | 所有 JSON 文件无 BOM |
| 2 | settings_data.json parse 通过 |
| 3 | settings_schema.json parse 通过 |
| 4 | templates/*.json parse 通过 |
| 5 | sections/*.json（如有）parse 通过 |

---

## 审查报告模板

```text
=== Botanica 主题代码审查报告 ===
审查时间: {时间}

🔴 阻断项（theme check error / CSS 未 link / Section schema 缺失）:
- {文件}: {问题描述}

🟡 建议项（Liquid/CSS 质量改进）:
- {文件}: {问题描述}

🟢 通过项:
- Theme Check 合规: {通过/不通过} (errors: N)
- Section Schema 完整性: {通过/不通过}
- CSS 链接一致性: {通过/不通过}
- Liquid 质量: {通过/不通过}
- CSS 质量: {通过/不通过}
- JSON 合法性: {通过/不通过}

结论: [通过 / 需修改后重新审查]
```

## 审查通过标准
- 0 个 🔴 阻断项
- theme check error = 0
- verify.ps1 全 PASS
- 所有 section 有 schema + presets + CSS link
