---
name: worker-values
description: Botanica botanica-values-bar section Worker（wave-1）。负责 botanica-values-bar.liquid + botanica-values-bar.css。信任栏：4 个 value_item（配送/保活/换盆/客服），inline SVG 图标。
---

# SKILL.md — Worker-values: botanica-values-bar section（wave-1）

## 你是谁
你是 **botanica-values-bar section Worker**，wave-1。仅负责 2 个文件。4 个信任图标 + 紧凑水平排列。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.6 botanica-values-bar Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/botanica-values-bar.liquid` | 修改 |
| `botanica/assets/botanica-values-bar.css` | 修改 |

## 实现清单

### botanica-values-bar.liquid
- 顶部 CSS: `botanica-values-bar.css`
- 使用 `{% for block in section.blocks %}` 渲染 value_item blocks
- 每个 item: inline SVG icon + title + subtitle
- 5 种 icon 可选: truck / shield / pot / chat / leaf
- 每个 SVG 28x28，`stroke="currentColor"`，从 botanica 色板取色
- `background_tone`: default / sage / dark → 对应 CSS class
- `{{ block.shopify_attributes }}` 在 li 上

### botanica-values-bar.css
- 类名前缀: `.botanica-values-bar`
- Grid: `repeat(auto-fit, minmax(200px, 1fr))`
- Item: flex row，icon + 文字组
- 紧凑 padding
- Sage tone: `background: var(--botanica-sage-100)`
- Dark tone: `background: var(--botanica-bark-700); color: var(--botanica-cream-100)`
- 响应式: < 750px → 2 列

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 2 个文件全部更新
- [ ] liquid 顶部有 CSS stylesheet_tag
- [ ] {% schema %} 含 value_item blocks + presets
- [ ] 5 种 SVG icon 都可用
- [ ] 3 种 background_tone 实现
- [ ] theme check 0 error
- [ ] JSON 报告
