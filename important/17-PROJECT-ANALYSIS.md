# Botanica v3 — 项目分析报告

> 生成时间：2026-07-10（本次工作会话总结）
> 工具：Marvis AI 助手

---

## 1. Demo 店铺状态

| 项目 | 值 |
|------|-----|
| 店铺域名 | `kano-u93kwgf9.myshopify.com` |
| 产品总数 | 69 个（全部 ACTIVE） |
| 库存状态 | 全部为 0（未填充） |
| Token 权限 | write_customers, write_products, write_content, write_themes |
| Token 有效期 | 24 小时（需每次会话重新获取） |

### 产品类型分布

| 类型 | 数量 |
|------|------|
| Indoor Plant | 47 |
| Hanging Plant | 5 |
| Indoor Tree | 3 |
| Flowering Plant | 2 |
| Fern | 2 |
| Cactus | 1 |
| 其他/空类型 | 2 |

### 已发现问题

| 问题 | 详情 |
|------|------|
| 库存为 0 | 全部 69 个产品 inventory: 0 |
| 重复产品 | Jade Plant (#13/#17)、Chinese Evergreen (#16/#19) |
| 测试残留 | Test Plant CLI (#57)、Two Step Test (#58) |
| Tag 体系分裂 | 前 57 个用旧 tag（`easy-care`、`medium-light`），后 12 个用 2026 新版 tag（含 `size-*`、`color-*`、`water-*`、`beginner`、`rare` 等维度） |

---

## 2. 代码完成度

| 维度 | 状态 |
|------|------|
| 主题源码 | 107 个 .liquid 文件，全原创，零 Dawn/Horizon 代码 |
| theme-blocks | 40+ blocks + 49 sections |
| 预设 | 3 套（Botanical / Home & Decor / Wellness） |
| CSS | 原生 CSS，`--bt-*` 令牌体系 |
| JS | 7 个 vanilla 模块，约 28.9KB raw |
| theme check | 0 error |
| 合规验证 | 23/23 通过 |

---

## 3. 待办事项（提交 Theme Store 前）

1. **填充产品数据** — 库存、图片、描述完善
2. **清理重复/测试产品** — 删除重复项和 Test Plant CLI / Two Step Test
3. **统一 Tag 体系** — 把前 57 个产品升级到新版 tag 格式
4. **Lighthouse 测试** — 性能 ≥ 60、无障碍 ≥ 90
5. **截取 listing 截图** — 750×1334 格式
6. **文档站 + 支持表单** — 上线

---

## 4. 数据导入工具

`botanica/demo/setup.mjs` — 批量创建 22 个植物产品 + 3 个集合到 demo 店。使用方式：

```bash
SHOPIFY_ADMIN_TOKEN=shpua_xxx SHOPIFY_STORE=kano-u93kwgf9.myshopify.com node botanica/demo/setup.mjs
```

`botanica/demo/products.csv` — 产品数据模板（26 行，含 20 个完整产品定义）。
