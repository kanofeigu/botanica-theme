---
name: worker-hero
description: Botanica hero-lookbook section Worker（wave-1）。负责 hero-lookbook.liquid + hero-lookbook.css + hero-lookbook-content.liquid + hero-lookbook-placeholder.liquid。
---

# SKILL.md — Worker-hero: hero-lookbook section（wave-1）

## 你是谁
你是 **hero-lookbook section Worker**，处于 DAG 的 **wave-1**。
你只负责 hero-lookbook 这个 section 的 4 个文件。你不关心其他 section —— 只从 botanica.css 引用全局 token。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — 特别关注 §3.1 hero-lookbook Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/hero-lookbook.liquid` | 修改 |
| `botanica/assets/hero-lookbook.css` | 修改 |
| `botanica/snippets/hero-lookbook-content.liquid` | 修改 |
| `botanica/snippets/hero-lookbook-placeholder.liquid` | 修改 |

## 实现清单

### hero-lookbook.liquid
- 顶部加载 CSS: `section-image-banner.css`, `component-slider.css`, `hero-lookbook.css`
- 两种布局模式: `design=split` → CSS grid 两栏; `design=stacked` → flex column
- Split 模式: 图片位置由 `split_image_position` 控制（左图右文 / 右图左文）
- Split 模式: 最小高度由 `split_min_height` 控制
- Stacked 模式: 图片在下（或上），文字叠加区域用 `overlay_color` + `overlay_opacity`
- 图片比例由 `image_ratio` 控制（portrait=3/4, square=1/1, landscape=4/3, wide=16/9）
- 内容位置: `content_position_x`（left/center/right）+ `content_position_y`（top/center/bottom）
- 文字区域: 杂志标签 "ISSUE 01" + 话题 "Indoor foliage" → 小号大写字体
- 使用 `{% for block in section.blocks %}` 渲染内容块（eyebrow/heading/subheading/buttons）
- 每个 block wrapper 有 `{{ block.shopify_attributes }}`
- content snippet: `{% render 'hero-lookbook-content' %}` 抽取文字区域
- placeholder snippet: 当无图片时 `{% render 'hero-lookbook-placeholder' %}`
- section 用 `section-{{ section.id }}-padding` 动态 padding
- `color_scheme` 应用到 section + `panel_color_scheme` 应用到文字面板

### hero-lookbook.css
- 类名前缀: `.hero-lookbook`
- Split 模式: `display: grid; grid-template-columns: 1fr 1fr; min-height: var(--split-min-height)`
- Stacked 模式: `display: flex; flex-direction: column`
- 叠加层: `::after` 伪元素
- 杂志标签: `.hero-lookbook__issue-label` — 大写、宽字间距、小号
- 文字面板: `.hero-lookbook__content-panel` — 独立配色方案
- 响应式: < 750px 强制 stacked 单列

### hero-lookbook-placeholder.liquid
- 当没有图片时显示 SVG placeholder
- 使用 botanica 的 sage 色调

### hero-lookbook-content.liquid
- 渲染 eyebrow + heading + subheading + buttons
- 纯展示逻辑，无 business logic

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 4 个文件全部更新
- [ ] liquid 顶部有 CSS stylesheet_tag
- [ ] {% schema %} 完整（settings + blocks + presets）
- [ ] Schema 包含 CONTRACTS.md §3.1 定义的所有 settings
- [ ] 两种布局模式都实现（split + stacked）
- [ ] `shopify theme check` error = 0
- [ ] JSON 报告

## JSON 报告

```json
{
  "worker_id": "Worker-hero",
  "wave": "wave-1",
  "status": "ok | error",
  "files_created": [],
  "files_modified": ["botanica/sections/hero-lookbook.liquid", "botanica/assets/hero-lookbook.css", "botanica/snippets/hero-lookbook-content.liquid", "botanica/snippets/hero-lookbook-placeholder.liquid"],
  "self_check": "passed | failed",
  "errors": []
}
```
