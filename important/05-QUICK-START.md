# Botanica v3 — 快速了解项目文档

> 位置：`E:\ccfold\shopify\important\05-QUICK-START.md`
> 用途：辅助不同 AI（Claude、DeepSeek、GPT 等）在 5 分钟内理解项目全貌
> 最后更新：2026-07-06

---

## 🎯 这个项目是什么

**Botanica** = 一个 Shopify 多用途精品主题，旗舰 demo 为植物店。

- 卖 $199，提交到 Shopify Theme Store
- 基于 **Skeleton**（唯一批准的底座），**全原创代码**
- 采用 **theme-blocks 架构**（2026 官方标准）
- 3 套预设：Botanical（植物）、Home & Decor（家居）、Wellness（护肤）

---

## 🚀 5 分钟速览

### 第一步：明白你在看什么

```
botanica/           ← 这就是主题的全部源码
docs/botanica-v3/   ← 项目蓝图文档（先读 README.md）
important/          ← 本文档集（架构、生命周期、功能树等）
```

### 第二步：记住 3 条铁律

1. **禁止用任何 Dawn/Horizon 代码**（2025-05-15 起一票否决）
2. **数据走 block/section 设置**，禁用自定义 metafield（`botanica.*`）
3. **颜色必须商家可改**（当前用 8 个 `color` type 设置 → CSS 变量注入）

### 第三步：理解 4 层架构

```
templates/*.json     → 定义页面由哪些 section 组成
sections/*.liquid    → 薄壳容器，用 {% content_for "blocks" %} 组装 blocks
blocks/*.liquid      → 可复用的功能单元（自带 CSS/JS/Schema，独立作用域）
assets/*.css/*.js    → 全局样式令牌 + 全局 JS（cart/search/variant 等）
```

### 第四步：知道核心文件在哪

| 你想做什么 | 去看哪个文件 |
|-----------|------------|
| 改颜色 | `config/settings_schema.json` → `layout/theme.liquid`（注入）→ `assets/design-tokens.css`（消费） |
| 改产品页布局 | `sections/main-product.liquid` + 相关的 `blocks/product-*.liquid` |
| 添加新 section | 新建 `sections/xxx.liquid` → 在 `templates/index.json` 中引用 |
| 添加新 block | 新建 `blocks/xxx.liquid` → 在 section schema 中 `@theme` 自动可用 |
| 改购物车逻辑 | `assets/cart.js` |
| 改变体逻辑 | `assets/variant-selects.js` + `blocks/variant-picker.liquid` |
| 改翻译文本 | `locales/en.default.json` |
| 新预设 | `config/settings_data.json` 的 `presets` 字段 |

---

## 📂 目录结构速查

```
botanica/
├── assets/
│   ├── design-tokens.css     ← 所有 CSS 变量（色板/字体/间距/阴影/缓动）
│   ├── base.css              ← Reset、排版、按钮、表单、卡片、布局工具类
│   ├── effects.css           ← 纸纹、标本框、微交互、滚动动画
│   ├── botanical-effects.css ← 12 种植物滚动特效（落叶、藤蔓、斑驳光……）
│   ├── cart.js               ← 购物车 AJAX
│   ├── search.js             ← 预测搜索
│   ├── variant-selects.js    ← 变体选择器
│   ├── gallery.js            ← 产品图集缩放
│   ├── quick-view.js         ← 快速预览弹窗
│   ├── sticky-atc.js         ← 移动端粘性加购条
│   └── pickup-availability.js← 自提信息
│
├── blocks/（20+ 个可复用 blocks）
│   ├── 文本类：eyebrow, heading, text, button-group, badge, editorial-quote
│   ├── 产品类：product-title, product-price, product-badges, product-description
│   ├── 购买类：buy-buttons, variant-picker, quantity-selector
│   ├── 养护类：care-row, care-table, care-panel, care-icons, light-meter, water-meter
│   ├── 展示类：spotlight-media, image, specimen-eyebrow, collapsible-specs
│   ├── 交互类：quick-view-trigger, sticky-atc, size-guide-link, share, mega-menu
│   └── 数据类：complementary-products, pickup-availability, filter-group
│
├── sections/（50 个 sections）
│   ├── 框架：header, footer, apps, custom-liquid, header-group.json, footer-group.json
│   ├── PDP：main-product, risk-free-guarantee, product-care-guide, product-recommendations
│   ├── 首页：hero, rich-text, shop-by-care, plant-spotlight, size-guide, care-blog-teaser
│   ├── 多用途：image-with-text, multicolumn, collage, featured-collection, featured-product
│   ├── 列表：collection-list, slideshow, testimonials, logo-list, faq-accordion, gallery
│   ├── 营销：newsletter, contact-form
│   ├── 特效：botanical-ambience
│   └── 系统：main-*（collection/collection-banner/search/cart/blog/article/page/404/
│              login/register/account/addresses/order/activate-account/reset-password/
│              password-header/password-footer/password-content/list-collections）
│
├── snippets/（纯函数式复用片段）
│   ├── card-product.liquid       ← 产品卡（全站统一）
│   ├── icon-*.liquid             ← SVG 图标（search/cart/hamburger/close/social）
│   ├── pagination.liquid         ← 分页组件
│   ├── quick-view-trigger.liquid ← 快速预览触发按钮
│   ├── botanical-divider.liquid  ← 植物风格分割线
│   ├── specimen-tag.liquid       ← 标本标签
│   ├── field-note.liquid         ← 田野笔记
│   └── botanical-ambience.liquid ← 氛围特效触发
│
├── templates/（JSON 模板）
│   ├── index.json        ← 首页（14 个 sections 组装）
│   ├── product.json      ← PDP（5 个 sections + 15 个 blocks）
│   ├── collection.json   ← 分类页
│   ├── cart.json         ← 购物车页
│   ├── search.json       ← 搜索页
│   ├── blog.json, article.json, page.json, page.contact.json
│   ├── 404.json, password.json, gift_card.liquid
│   ├── list-collections.json
│   └── customers/        ← 7 个客户账户模板
│
├── config/
│   ├── settings_schema.json   ← 主题设置定义（颜色/字体/布局/按钮/卡片/徽章/社交/搜索/购物车）
│   └── settings_data.json     ← 当前设置 + 3 套预设（Botanical / Home & Decor / Wellness）
│
├── layout/
│   ├── theme.liquid      ← HTML 骨架（<head> 注入 + cart drawer + predictive search + JS 加载）
│   └── password.liquid   ← 密码页骨架
│
├── locales/
│   └── en.default.json   ← 英文翻译（完整覆盖所有 sections/blocks/settings）
│
└── listings/             ← Theme Store 预设 listing（提交打包用）
    ├── botanical/
    ├── home-and-decor/
    └── wellness/
```

---

## 🔑 关键设计决策速记

| 决策 | 一句话原因 |
|------|-----------|
| Skeleton 底座 | Shopify 强制要求 |
| theme-blocks | 产品元素拆成独立 block，商家可拖拽重组 |
| `--bt-*` CSS 变量 | 全站统一令牌，改一处全局生效 |
| 养护数据用 block settings | 不用 metafield，空店开箱即用 |
| Care badge 用 product tags | `care-easy`/`light-bright` 标签自动识别 |
| JS 全 vanilla | 零外部库、< 16KB、ES module、defer |
| `{% stylesheet %}` 作用域 | 每个 block 的 CSS 只在该 block 渲染时输出 |
| 3 套预设 | 色+字+间距三维不同，不是换色 |
| $199 定价 | 首发作、低于 $350+ 梯队、高于 $100 廉价档 |

---

## ⚡ 快速开发命令

```bash
# 语法检查（每次修改后必须跑，0 error）
shopify theme check --path botanica

# 推送到开发商店预览
shopify theme push --path botanica --store <store-name>

# 本地开发（热重载）
shopify theme dev --path botanica --store <store-name>

# 打包提交
shopify theme package --path botanica
```

---

## 🚨 绝对不能做的事

- ❌ **复制 Dawn/Horizon 任何代码**
- ❌ **在任何 JSON/schema default 中写 `botanica.*` / `custom.*` / `shopify://`**
- ❌ **硬编码颜色**（必须用 `var(--bt-color-*)`）
- ❌ **引入外部 JS 库/CDN/分析/追踪脚本**
- ❌ **用 Sass/SCSS**（只用原生 CSS）
- ❌ **预压缩 CSS/JS**（Shopify 自动压缩）
- ❌ **添加假紧迫元素**（倒计时/假库存/假浏览数）
- ❌ **添加心愿单/作者署名/外链/联盟链接**
- ❌ **打包 `config/markets.json`**

---

## 📖 更多文档

| 文档 | 内容 |
|------|------|
| [[01-ARCHITECTURE]] | 完整代码架构 |
| [[02-LIFECYCLE]] | 组件/功能生命周期 |
| [[03-STATE-MANAGEMENT]] | 数据响应式管理 |
| [[04-FEATURE-TREE]] | 功能依赖关系树 |
| [[06-COMPOSABLE-MODULES]] | 组合式功能模块 |
| `docs/botanica-v3/02-PLAN.md` | 施工蓝图 |
| `docs/botanica-v3/04-COMPLIANCE.md` | 提交合规清单 |
| `docs/botanica-v3/05-AUDIT-REPORT.md` | 2026-07-06 审计报告 |

---

*关联文档：[[01-ARCHITECTURE]] [[04-FEATURE-TREE]] [[06-COMPOSABLE-MODULES]]*
