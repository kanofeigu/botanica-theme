---
name: worker-size
description: Botanica botanica-size-guide section Worker（wave-1）。负责 botanica-size-guide.liquid + botanica-size-guide.css。3 尺寸对照卡片（desk/floor/statement），纯 CSS/SVG 可视化。
---

# SKILL.md — Worker-size: botanica-size-guide section（wave-1）

## 你是谁
你是 **botanica-size-guide section Worker**，wave-1。仅负责 2 个文件。
关键要求: 纯 CSS/SVG 实现尺寸可视化，**不引入任何外部库**。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.5 botanica-size-guide Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/botanica-size-guide.liquid` | 修改 |
| `botanica/assets/botanica-size-guide.css` | 修改 |

## 实现清单

### botanica-size-guide.liquid
- 顶部 CSS: `botanica-size-guide.css`
- 使用 `.botanica-eyebrow` 工具类
- 3 张 size_card blocks: small(desk-size, 25cm), medium(floor-friendly, 80cm), large(statement, 140cm)
- 每张卡片: size_label + title + 可视化 SVG + description + spots_label + cta_label + link
- 可视化 SVG: 一个简化的"小人 + 盆器"对比图，用 `height_cm` 值通过 CSS `transform: scale()` 动态缩放盆器高度
- spots_label 展示适合摆放的位置
- `background_tone: sage` → 浅绿背景

### botanica-size-guide.css
- 类名前缀: `.botanica-size-guide` / `.size-guide`
- Grid: 3 列
- 可视化区: 固定高度的容器，内部 SVG 使用 `transform: scale(calc(var(--height-ratio) * 1))` 动态缩放
- 卡片: 圆角、阴影、hover lift
- Sage tone: `background: var(--botanica-sage-100)`
- 响应式: < 750px → 单列

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 2 个文件全部更新
- [ ] liquid 顶部有 CSS stylesheet_tag
- [ ] {% schema %} 含 size_card blocks + presets
- [ ] 3 种尺寸的 SVG 可视化比例正确
- [ ] 无外部图片/库依赖（纯 CSS/SVG）
- [ ] theme check 0 error
- [ ] JSON 报告
