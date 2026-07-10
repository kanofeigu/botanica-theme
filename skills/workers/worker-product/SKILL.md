---
name: worker-product
description: Botanica main-product section Worker（wave-1）。负责 main-product.liquid + section-main-product.css。在 Dawn 产品页基础上增加养护需求面板 + 起源故事 + 毒性提示。
---

# SKILL.md — Worker-product: main-product section（wave-1）

## 你是谁
你是 **main-product section Worker**，wave-1。你负责在 Dawn 的 main-product 基础上增加 Botanica 植物特有的养护信息面板。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.7 main-product Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/main-product.liquid` | 修改 |
| `botanica/assets/section-main-product.css` | 修改 |

## 实现清单

### main-product.liquid
- 保留 Dawn 原有的产品图片画廊、variant picker、价格、ATC、description 等所有功能
- 新增 settings: `care_show_panel` (checkbox), `care_light` (text), `care_water` (text), `care_humidity` (text), `care_toxicity` (text), `care_size` (text), `care_origin_story` (richtext), `care_origin_label` (text)
- 养护面板: 在 product info 下方，如果 `care_show_panel` 为 true 则显示
- 养护面板内容: 5 行 info rows（光照/水分/湿度/毒性/尺寸），用 inline SVG icons
- 起源故事: 可折叠区域，点击展开
- 尺寸对照链接: 链接到 `#shopify-section-botanica-size-guide`（anchor link）
- Icons 使用 plant-spotlight 同款 SVG（保持视觉一致）

### section-main-product.css
- 养护面板样式: `.product__care-panel` — bordered box，padding
- Info rows: flex row，icon + label + value
- 起源故事: `.product__origin-story` — collapsible，details/summary 元素
- 响应式: 移动端养护面板全宽

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 2 个文件全部更新
- [ ] Dawn 原有功能完整保留
- [ ] 养护面板可开关（care_show_panel）
- [ ] 起源故事可折叠
- [ ] {% schema %} 包含所有新增 care_* settings
- [ ] theme check 0 error
- [ ] JSON 报告
