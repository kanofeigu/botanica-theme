---
name: worker-blog
description: Botanica care-blog-teaser section Worker（wave-1）。负责 care-blog-teaser.liquid + care-blog-teaser.css。3 篇养护指南博客卡片。
---

# SKILL.md — Worker-blog: care-blog-teaser section（wave-1）

## 你是谁
你是 **care-blog-teaser section Worker**，wave-1。仅负责 2 个文件。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.4 care-blog-teaser Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/care-blog-teaser.liquid` | 修改 |
| `botanica/assets/care-blog-teaser.css` | 修改 |

## 实现清单

### care-blog-teaser.liquid
- 顶部 CSS: `component-article-card.css`, `care-blog-teaser.css`
- 两种模式: blog 为空 → 用手动卡片(manual_card blocks); blog 非空 → 拉取该 blog 最新 3 篇文章
- 手动卡片: tag(小 badge) + title + excerpt(richtext) + cta_label + link 或 image
- Blog 模式: 使用 `{% for article in blogs[section.settings.blog].articles limit:3 %}`
- `show_date` / `show_author` 控制 meta 信息
- `show_badge` 控制 tag badge
- `view_all_label` + `view_all_link` 底部链接
- background_tone: default/cream/sage → 对应 CSS class

### care-blog-teaser.css
- 类名前缀: `.care-blog-teaser`
- Grid: 3 列 `repeat(3, 1fr)`
- Card: 图片(4:3) + tag badge(.botanica-badge) + title + excerpt + link
- 响应式: < 990px → 2 列, < 750px → 1 列

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 2 个文件全部更新
- [ ] liquid 顶部有 CSS stylesheet_tag
- [ ] {% schema %} 含 manual_card blocks + presets
- [ ] 支持手动卡片 + blog 两种模式
- [ ] theme check 0 error
- [ ] JSON 报告
