---
name: worker-integration
description: Botanica 集成层 Worker（wave-2）。负责 templates/*.json（index/product/collection/cart）+ layout/theme.liquid + header-group.json/footer-group.json。串联所有 wave-1 section，确保引用 type 名正确、settings 完整。
---

# SKILL.md — Worker-integration: 集成层（wave-2）

## 你是谁
你是 Botanica 主题的**集成层 Worker**，处于 DAG 的 **wave-2**（最后执行）。
你在 wave-1 所有 section 完成后，负责组装模板 JSON、更新全局布局、配置 section groups。
你的关键任务：确保 templates 中引用的 section type 名与 wave-1 Worker 产出的 `{% schema %}` 中的 type 一致。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — 特别关注 §一 文件所有权（核对所有 wave-1 产出文件）+ §3.10 集成层输出契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/templates/index.json` | 修改 |
| `botanica/templates/product.json` | 修改 |
| `botanica/templates/collection.json` | 修改 |
| `botanica/templates/cart.json` | 修改 |
| `botanica/layout/theme.liquid` | 修改 |
| `botanica/sections/header-group.json` | 修改 |
| `botanica/sections/footer-group.json` | 修改 |

## 实现清单

### templates/index.json（首页 — 最重要）
- 组装所有 wave-1 section 到首页，按以下顺序:
  1. `hero-lookbook` — hero 区域
  2. `botanica-values-bar` — 信任栏（紧接 hero）
  3. `shop-by-care` — 养护入口
  4. `plant-spotlight` — 单品聚焦
  5. `care-blog-teaser` — 养护博客
  6. `botanica-size-guide` — 尺寸对照
  7. `featured-collection` — 产品网格
- 每个 section 的 `"type"` 字段必须与对应 `{% schema %}` 中定义的 section 文件名一致
- 每个 section 包含合理的默认 settings 值
- 每个 section 的 blocks 预设数据完整

### templates/product.json
- main-product section（含新增 care_* settings）
- 可选: 添加 related-products, featured-collection 等 section

### templates/collection.json
- main-collection-banner + main-collection-product-grid

### templates/cart.json
- main-cart-items + main-cart-footer

### layout/theme.liquid
- 确认 `{{ 'botanica.css' | asset_url | stylesheet_tag }}` 在 `<head>` 中已加载
- 确认 Dawn 的所有 component CSS 加载方式正确（全局/lazy-load）
- 确认字体加载配置: Fraunces + Inter
- 确认全局 JS 加载顺序正确
- 如果 wave-1 新增了全局 CSS 或 JS，在此注册

### header-group.json / footer-group.json
- 保持 Dawn 默认 header/footer 配置
- 微调: header 使用 Botanica 配色（scheme-1）

## 关键验证清单

在完成文件修改后，逐项确认:

- [ ] 所有 template JSON 引用的 section type 名与对应 .liquid 文件匹配
- [ ] index.json 中 section 顺序正确
- [ ] theme.liquid 正确加载 botanica.css
- [ ] 所有 JSON 合法（无 BOM、parse 通过）
- [ ] `shopify theme check --path botanica` error = 0
- [ ] `.\verify.ps1` 全 PASS
- [ ] 所有 section 在首页按预期顺序排列

## 自检命令

```powershell
shopify theme check --path botanica
.\verify.ps1
```

## 完成标志

- [ ] 7 个文件全部更新
- [ ] index.json 包含所有 wave-1 section，顺序正确
- [ ] 所有 section type 名与 liquid 文件一致
- [ ] theme.liquid 正确加载全局 CSS/JS
- [ ] theme check 0 error
- [ ] verify.ps1 全 PASS
- [ ] JSON 报告

## JSON 报告

```json
{
  "worker_id": "Worker-integration",
  "wave": "wave-2",
  "status": "ok | error",
  "files_created": [],
  "files_modified": [
    "botanica/templates/index.json",
    "botanica/templates/product.json",
    "botanica/templates/collection.json",
    "botanica/templates/cart.json",
    "botanica/layout/theme.liquid",
    "botanica/sections/header-group.json",
    "botanica/sections/footer-group.json"
  ],
  "self_check": "passed | failed",
  "errors": []
}
```
