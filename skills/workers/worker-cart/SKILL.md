---
name: worker-cart
description: Botanica cart sections Worker（wave-1）。负责 main-cart-items.liquid + main-cart-footer.liquid + cart-drawer.liquid + cart-drawer snippet。保留 Dawn 逻辑，视觉微调。
---

# SKILL.md — Worker-cart: cart sections（wave-1）

## 你是谁
你是 **cart sections Worker**，wave-1。你保留 Dawn 所有购物车逻辑，只做视觉微调匹配 Botanica 风格。

## 读取清单

1. `AGENTS.md`
2. `CONTRACTS.md` — §3.9 cart sections Schema 契约
3. 本文件

## 你的文件

| 文件 | 操作 |
|------|------|
| `botanica/sections/main-cart-items.liquid` | 修改 |
| `botanica/sections/main-cart-footer.liquid` | 修改 |
| `botanica/sections/cart-drawer.liquid` | 修改 |
| `botanica/snippets/cart-drawer.liquid` | 修改 |

## 实现清单

### 所有文件
- **保留 Dawn 原有功能 100%**（数量调整、remove、note、discount、checkout 按钮等）
- 视觉微调:
  1. 按钮使用 `var(--buttons-radius)` 而非硬编码圆角
  2. 字体: 标题用 Fraunces（`var(--font-heading-family)`），正文用 Inter
  3. 间距使用 Dawn spacing 变量
  4. 购物车空状态: 加入植物相关的小插图/文案
  5. 颜色: 使用 `rgb(var(--color-*))` Dawn 体系
- 不做任何功能变更

### main-cart-footer.liquid
- checkout 按钮颜色使用 `var(--color-button)` + `var(--color-button-text)`
- 添加 "30-day kept-alive guarantee" 信任文案（从 settings 读取，可关闭）

### cart-drawer.liquid / snippets/cart-drawer.liquid
- Drawer header: 使用 Fraunces 字体
- 推荐产品区: 保持 Dawn 的 cart_drawer_collection 功能
- 空购物车: 植物主题空状态

## 自检命令

```powershell
shopify theme check --path botanica
```

## 完成标志

- [ ] 4 个文件全部更新
- [ ] Dawn 原有功能完整（无功能回退）
- [ ] 视觉微调符合 Botanica 风格
- [ ] theme check 0 error
- [ ] JSON 报告
