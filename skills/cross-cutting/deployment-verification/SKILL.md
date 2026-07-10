---
name: deployment-verification
description: Botanica Shopify Theme 部署与验证技能。在 Stage 4 触发，推送主题到 dev store、验证 section 渲染、生成交付物清单。
---

# SKILL.md — Botanica 主题部署验证

## 技能名称
`deployment-verification` — Botanica Shopify Theme 部署与验证

## 触发条件
1. Stage 4（所有代码完成、审查通过后）
2. 准备提交 Theme Store 审核前
3. 用户要求预览主题

## 角色
你是 Botanica 主题的**部署工程师**。你负责将主题推送到 Shopify dev store，验证功能完整性。

## 前置条件（Stage 4 开始前必须满足）
- [ ] Stage 3 审查通过（0 阻断项）
- [ ] theme check error = 0
- [ ] verify.ps1 全 PASS
- [ ] 所有 section 有 schema + presets

---

## 第 1 步: 推送前检查

### 1.1 文件完整性
对照 CONTRACTS.md §一 文件所有权清单，确认所有文件存在。

### 1.2 配置检查
- settings_schema.json: 合法 JSON，所有 label 有 t: key
- settings_data.json: 合法 JSON，step 值对齐 schema
- 无 `{{占位符}}` 残留

### 1.3 终检
```powershell
shopify theme check --path botanica    # 必须 0 error
.\verify.ps1                           # 必须全 PASS
```

---

## 第 2 步: 推送主题

```bash
shopify theme push --path botanica --store <store-name> --allow-live
```

或使用 dev server（本地热重载）:
```bash
shopify theme dev --path botanica --store <store-name>
```

---

## 第 3 步: 视觉验证清单

在浏览器中逐页检查：

### 3.1 首页 (index)
| # | 检查项 | 期望 |
|---|--------|------|
| 1 | hero-lookbook 渲染 | 图片 + 文字叠加正常 |
| 2 | shop-by-care 3 卡片 | SVG 图标显示、badge 正确 |
| 3 | plant-spotlight 布局 | 两栏布局、养护表完整 |
| 4 | care-blog-teaser 3 卡片 | tag/title/excerpt 显示 |
| 5 | size-guide 3 尺寸 | SVG 可视化显示、尺寸比例正确 |
| 6 | values-bar 4 图标 | icon + title + subtitle 显示 |
| 7 | featured-collection 产品网格 | 产品卡 1:1 比例 |
| 8 | 移动端响应式 | 所有 section 单列堆叠 |

### 3.2 产品页 (product)
| # | 检查项 |
|---|--------|
| 1 | 产品图片 + 缩略图 |
| 2 | variant picker |
| 3 | 价格 + ATC 按钮 |
| 4 | 养护需求面板（如已实现） |

### 3.3 分类页 (collection)
| # | 检查项 |
|---|--------|
| 1 | 产品网格 |
| 2 | 筛选/排序 |
| 3 | 产品卡 badge |

### 3.4 购物车 (cart)
| # | 检查项 |
|---|--------|
| 1 | cart drawer / page |
| 2 | 数量调整 |
| 3 | checkout 链接 |

---

## 第 4 步: 性能验证

```bash
# Chrome DevTools Lighthouse
# 目标: 移动端 ≥ 80
```

---

## 第 5 步: 交付物清单

```text
交付物:
├── botanica/                     ← 完整主题目录
├── 截图/                         ← Homepage + Product + Collection（至少 3 张）
├── 预览视频脚本                   ← 30-60 秒展示核心功能
├── 商业描述                       ← Theme Store listing 文案
├── 定价选项                       ← $180 ~ $320
└── 支持条款                       ← 更新频率、支持渠道
```

---

## 验证完成标准
- [ ] theme check 0 error
- [ ] verify.ps1 全 PASS
- [ ] 首页所有 section 渲染正确
- [ ] 移动端响应式正常
- [ ] 产品页/分类页/购物车功能正常
- [ ] Lighthouse 移动端 ≥ 80（目标）
- [ ] STATE.json 标记 completed
