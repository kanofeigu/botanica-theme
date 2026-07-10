---
name: worker-collection
description: Botanica collection sections Worker（wave-1）。负责 main-collection-banner.liquid + main-collection-product-grid.liquid + featured-collection.liquid + template-collection.css + card-product.liquid。增加照护难度筛选 + 产品卡 badge。
---

# SKILL.md — Worker-collection: collection sections（wave-1）

## 你是谁
你是 **collection sections Worker**，wave-1。负责 5 个文件。在 Dawn 分类页基础上增加植物特有的筛选维度 + 产品卡视觉升级。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.8 collection sections Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/main-collection-banner.liquid` | 修改 |
| `botanica/sections/main-collection-product-grid.liquid` | 修改 |
| `botanica/sections/featured-collection.liquid` | 修改 |
| `botanica/assets/template-collection.css` | 修改 |
| `botanica/snippets/card-product.liquid` | 修改 |

## 实现清单

### card-product.liquid（核心修改）
- 保留 Dawn 原有逻辑（图片、标题、价格、badge、quick-add）
- 新增: 养护难度徽章 — 使用 metafield 或 tag 读取 `care_level`，渲染 `.botanica-badge--easy/medium/expert`
- 新增: 光照 icon — 使用 metafield 或 tag 读取 `light_level`，渲染 `.botanica-light-meter` 组件
- 新增: "存活保证" badge — 小号绿色 shield icon + "30-day"
- Badge 位置: 产品图左上角叠放
- 所有新增功能用 settings 控制开关: `show_care_badge`, `show_light_meter`, `show_survival_badge`

### main-collection-banner.liquid
- 保留 Dawn 功能
- 新增: `care_filter_style` setting — quick filter pills below banner

### main-collection-product-grid.liquid
- 保留 Dawn 功能（facet filtering, sorting, pagination）
- 新增: care level quick filter pills（easy/medium/expert）— 基于 tag 或 metafield 的客户端筛选
- Quick filter pills 使用 `.botanica-badge` 样式
- 如果 `show_care_filter` 为 false 则不显示

### featured-collection.liquid
- 保留 Dawn 功能
- 新增: `show_care_badge` setting — 是否在产品卡上显示养护难度

### template-collection.css
- Quick filter pills 样式
- 产品卡 badge 定位

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 5 个文件全部更新
- [ ] card-product 有 care badge + light meter + survival badge（可开关）
- [ ] main-collection-product-grid 有 care level quick filter pills
- [ ] 所有新增 settings 在 schema 中定义
- [ ] theme check 0 error
- [ ] JSON 报告
