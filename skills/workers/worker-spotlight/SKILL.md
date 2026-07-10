---
name: worker-spotlight
description: Botanica plant-spotlight section Worker（wave-1）。负责 plant-spotlight.liquid + plant-spotlight.css + plant-spotlight-placeholder.liquid。单品聚焦 + 养护表 + 起源故事。
---

# SKILL.md — Worker-spotlight: plant-spotlight section（wave-1）

## 你是谁
你是 **plant-spotlight section Worker**，处于 wave-1。仅负责 3 个文件。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.3 plant-spotlight Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/plant-spotlight.liquid` | 修改 |
| `botanica/assets/plant-spotlight.css` | 修改 |
| `botanica/snippets/plant-spotlight-placeholder.liquid` | 修改 |

## 实现清单

### plant-spotlight.liquid
- 顶部 CSS: `component-card.css`, `component-price.css`, `plant-spotlight.css`
- 图片优先级: `spotlight_image` > `product.featured_image`
- 左栏(media): 大图 + 图片框 + 装饰性 PLATE NO. 标签
- 右栏(content): eyebrow + title + subtitle + 养护表(care rows) + 起源故事(story) + CTA
- 养护表: 用 `{% for block in section.blocks %}` 渲染 care_row blocks
  每个 care_row: SVG icon(light/water/humidity/size/toxicity) + label + value
- 起源故事: `{% if show_origin_story %}` 显示 story richtext + story_label
- 价格: `{% if show_price and product != blank %}` 显示 product.price
- CTA: `{% if cta_label != blank %}` 按钮 + cta_link
- background_tone: cream → `plant-spotlight--cream`, sage → `plant-spotlight--sage`, dark → `plant-spotlight--dark`
- placeholder: 无图片时显示 SVG placeholder

### plant-spotlight.css
- 类名前缀: `.plant-spotlight`
- 布局: `display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem, 6vw, 5rem)`
- 图片框: `border-radius: var(--media-radius); overflow: hidden; box-shadow: var(--botanica-shadow-float)`
- 养护表: flex 行，icon 28px，label 加粗，value 正文
- Cream tone: `background: var(--botanica-cream-200)`
- Sage tone: `background: var(--botanica-sage-100)`
- Dark tone: `background: var(--botanica-bark-700); color: var(--botanica-cream-100)`
- 响应式: < 750px → 单列，图片在上

### plant-spotlight-placeholder.liquid
- 无图片时的 SVG 占位符

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 3 个文件全部更新
- [ ] liquid 顶部有 CSS stylesheet_tag
- [ ] {% schema %} 含 care_row blocks + presets
- [ ] 5 种 care icon SVG 完整（light/water/humidity/size/toxicity）
- [ ] 3 种 background_tone 都实现
- [ ] theme check 0 error
- [ ] JSON 报告
