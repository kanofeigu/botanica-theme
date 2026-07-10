---
name: worker-care
description: Botanica shop-by-care section Worker（wave-1）。负责 shop-by-care.liquid + shop-by-care.css。3 卡片养护难度入口（easy/medium/expert），含 inline SVG 植物图标、光照/水分指示器。
---

# SKILL.md — Worker-care: shop-by-care section（wave-1）

## 你是谁
你是 **shop-by-care section Worker**，处于 DAG 的 **wave-1**。
你只负责这个 section 的 2 个文件。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — 特别关注 §3.2 shop-by-care Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/shop-by-care.liquid` | 修改 |
| `botanica/assets/shop-by-care.css` | 修改 |

## 实现清单

### shop-by-care.liquid
- 顶部加载 CSS: `component-card.css`, `shop-by-care.css`
- 使用 botanica 工具类: `.botanica-eyebrow`（眉题）, `.botanica-lift`（卡片 hover）
- 3 种 care_level 各对应 inline SVG 植物图标（leaf/fern/flower shapes）
- `show_light_meter` 为 true 时显示 `.botanica-light-meter` 组件
- 每个 block 是 `<li>` 元素，带 `data-level="{{ care_level }}"` 属性
- 链接支持 `link`（url）或 `collection`（自动生成 /collections/xxx）
- Grid 列数由 `columns_desktop` 控制
- `background_tone`: cream → 浅暖色背景; sage → 浅绿背景; default → 无额外背景
- `{{ block.shopify_attributes }}` 在 li 上
- {% schema %} 包含 CONTRACTS.md §3.2 的所有 settings 和 blocks

### shop-by-care.css
- 类名前缀: `.shop-by-care`
- Grid: `grid-template-columns: repeat(var(--cols), 1fr)`
- Card: 圆角卡片，padding，hover 时配合 `.botanica-lift`
- Cream tone: `background: var(--botanica-cream-200)`
- Sage tone: `background: var(--botanica-sage-100)`
- SVG 图标: 颜色使用 `currentColor`，大小 64x64
- 响应式: < 750px → 单列

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 2 个文件全部更新
- [ ] liquid 顶部有 CSS stylesheet_tag
- [ ] {% schema %} 完整（含 blocks 和 presets）
- [ ] 3 种 care_level (easy/medium/expert) 的 SVG 图标正确
- [ ] 光照/水分指示器可用 `.botanica-light-meter`
- [ ] `shopify theme check` error = 0
- [ ] JSON 报告
