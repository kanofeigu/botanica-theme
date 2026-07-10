> ⚠️ **已废弃 / SUPERSEDED（2026-06-27）**
> 本规范描述的是**被拒的 Dawn 套壳 v1**。权威规范已迁移到 **`docs/botanica-v3/`**（`00-AUDIT` / `01-STRATEGY` / `02-PLAN`）。
> 下面内容仅作历史参考，**勿照此操作**。

# PROJECT.md — Botanica Shopify Theme 完整项目规范

> **定位**: 项目的权威真相源。Orchestrator 在 Stage 1 时按需读取。
> **读者**: 仅 Orchestrator。Worker 从 CONTRACTS.md 获取接口信息。
> **版本**: 1.0.0

---

## 一、项目概述

### 1.1 产品定位
Botanica 是面向室内观叶/盆栽植物店的 Shopify Online Store 2.0 主题。设计调性为"植物百科"而非"杂货店"——ins-m 极简 + 植物科普插画风。

### 1.2 目标用户
- 室内植物零售商（Monstera/龟背竹/琴叶榕/虎尾兰等）
- Z 世代消费者
- 需要通过 Shopify Theme Store 上架的 merchant

### 1.3 核心价值
在"绿色调 + 功能堆砌"同质化竞品中，通过设计 grammar + CRO 互动 + 合规性能三个差异化抓手突围。

### 1.4 差异化策略
1. **设计 grammar**: ins-m 极简 + 植物科普插画风，文案与 UI 像"植物百科"
2. **CRO 互动**: 照护难度标签 + 光照/水分需求可视化 + 尺寸对照 + 快速查看
3. **合规性能**: Dawn 地基 + Lighthouse ≥ 80 + 完整 i18n + 0 Theme Check error

---

## 二、功能需求

### 2.1 核心功能（P0 — Phase 2 HomePage sections）

| 编号 | Section | 描述 | 状态 |
|------|---------|------|------|
| F-001 | hero-lookbook | 大图 + 杂志式文字叠加 + CTA | ✅ 基本完成 |
| F-002 | shop-by-care | 按养护难度入口(易/中/挑战) 3 卡片 | ✅ 基本完成 |
| F-003 | plant-spotlight | 单品聚焦 + 养护要点表 + 起源故事 | ✅ 基本完成 |
| F-004 | care-blog-teaser | 3 篇养护指南博客卡片 | ✅ 基本完成 |
| F-005 | botanica-size-guide | 尺寸对照可视化(小/中/大) | ✅ 基本完成 |
| F-006 | botanica-values-bar | 信任栏(配送/保活/换盆/客服) | ✅ 基本完成 |
| F-007 | featured-collection | 当季精选产品网格(Dawn 原生) | ✅ 已配置 |

### 2.2 Phase 3 功能（P0 — 关键模板）

| 编号 | 功能 | 描述 |
|------|------|------|
| F-101 | main-product | 重设计产品页：养护需求面板 + 360度场景图 + 毒性提示 |
| F-102 | main-collection | 重设计分类页：按照护难度/光照/空间三维筛选 |
| F-103 | card-product | 产品卡增加难度徽章 + 光照icon + 存活badge |
| F-104 | cart | 微调购物车保留 Dawn 逻辑 |

### 2.3 Phase 4 功能（P1 — CRO 互动）

| 编号 | 功能 | 描述 |
|------|------|------|
| F-201 | 快速查看 modal | 不跳页查看产品 + 加车 |
| F-202 | sticky ATC | 移动端 sticky 加车栏 |
| F-203 | size-guide 可视化 | 纯 CSS/SVG 不引入外部库 |

### 2.4 Phase 5 功能（P1 — 合规上架）

| 编号 | 功能 | 描述 |
|------|------|------|
| F-301 | 完整 locales | en/fr/zh-CN 三语 + 编校 |
| F-302 | Lighthouse ≥ 80 | 移动端性能达标 |
| F-303 | 可访问性 | axe-core 0 critical |
| F-304 | Theme Store 审核 | 截图 + 预览视频 + 上架文案 |

---

## 三、技术栈

| 层次 | 技术选型 | 说明 |
|------|----------|------|
| 模板引擎 | Liquid | Shopify 专用模板语言 |
| 样式 | CSS (Vanilla) | Dawn CSS 变量体系 + botanica.css 品牌层 |
| 脚本 | Vanilla JS (ES Modules) | 零外部依赖 |
| 模板架构 | OS 2.0 JSON templates | 非 legacy Liquid 模板 |
| 基础主题 | Dawn | Shopify 官方基准主题 |
| 验证 | Shopify CLI `theme check` + verify.ps1 | 零 error 铁律 |
| 部署 | `shopify theme push` | Partner dev store |

### 禁止引入

| 类别 | 禁止 | 原因 |
|------|------|------|
| JS 框架 | React/Vue/jQuery 等 | Theme Store 审核规则 |
| CSS 框架 | Bootstrap/Tailwind | 已有 Dawn 体系 |
| 外部 CDN | 任何第三方 CDN 资源 | 性能 + 审核规则 |
| 数据库 | 任何后端依赖 | Shopify 主题纯前端 |

---

## 四、编码标准

### 4.1 Liquid
- 空格控制: `{%- -%}`
- 逻辑集中: `{%- liquid -%}` 块在文件顶部
- 条件渲染: 不输出空元素
- 图片: `| image_url: width: N` + `sizes` + `loading="lazy"`
- 翻译: 所有文本用 `t:` locale key 或 settings 字段

### 4.2 CSS
- 命名: BEM — `.section__element--modifier`
- 变量: `var(--botanica-*)` 或 `rgb(var(--color-*))`，不硬编码色值
- 作用域: 所有样式在 section 顶级 class 下
- 响应式: 移动优先，breakpoint 750px / 990px
- 无 BOM: UTF-8 without BOM

### 4.3 JS
- 模块: ES module，defer 加载
- 命名: kebab-case 文件名
- DOM: 不跨 section 操作

### 4.4 JSON
- 2 空格缩进
- 双引号
- settings_schema label/info 用 `t:` key

---

## 五、项目目录结构

```text
shopify/
├── AGENTS.md               ← Agent 铁律
├── LOOP.md                 ← 流水线入口
├── CONTRACTS.md            ← Section 接口契约
├── PROJECT.md              ← 本文件
├── STATE.md                ← 状态持久化
├── PLAN.md                 ← 开发计划
├── VERIFY.md               ← 验证流程
├── verify.ps1              ← 验证脚本
│
├── botanica/               ← Shopify 主题
│   ├── assets/             ← CSS + JS
│   │   ├── base.css        ← Dawn 全局基础
│   │   ├── botanica.css    ← Botanica 品牌 token 层 ⭐
│   │   ├── component-*.css ← Dawn 组件 CSS（30+）
│   │   ├── section-*.css   ← Dawn section CSS
│   │   ├── hero-lookbook.css
│   │   ├── shop-by-care.css
│   │   ├── plant-spotlight.css
│   │   ├── care-blog-teaser.css
│   │   ├── botanica-size-guide.css
│   │   ├── botanica-values-bar.css
│   │   └── *.js            ← Dawn 原生 JS
│   ├── config/
│   │   ├── settings_schema.json ← 全局主题设置
│   │   └── settings_data.json   ← 默认设置值
│   ├── layout/
│   │   ├── theme.liquid    ← 全局布局
│   │   └── password.liquid
│   ├── locales/            ← 20+ 语言翻译
│   ├── sections/           ← .liquid section 文件（50+）
│   ├── snippets/           ← .liquid snippet 文件（30+）
│   └── templates/          ← .json 模板文件
│       ├── index.json      ← 首页
│       ├── product.json
│       ├── collection.json
│       ├── cart.json
│       └── ...
└── skills/                 ← Agent 技能文件
```

---

## 六、设计 Token

### 6.1 配色

| Token | 色值 | 用途 |
|-------|------|------|
| Sage 500 | #4A6B4F | 主绿色、按钮、强调 |
| Sage 200 | #C7D4C4 | 浅绿背景 |
| Cream 200 | #F5F1E8 | 主背景 |
| Terracotta 500 | #C97D5A | 陶土强调色、CTA |
| Bark 700 | #2E2A24 | 主文字色 |

### 6.2 字体
- 标题: Fraunces (serif, Shopify Font Library)
- 正文: Inter (sans-serif, Shopify Font Library)

### 6.3 配色预设
1. **默认 Sage**: sage 主色 + cream 背景
2. **苔藓深绿**: 深绿主色 + 浅绿辅
3. **极简白**: 白底 + sage 点缀

---

## 七、安全与合规

1. 所有第三方资源（字体）走 Shopify CDN（fonts.shopifycdn.com）
2. 无硬编码外部链接
3. 表单使用 Shopify 原生 reCAPTCHA
4. 不收集任何用户数据（Shopify 平台负责）
5. Lighthouse 移动端 ≥ 80
6. 可访问性: 语义 HTML + ARIA labels + 键盘导航
7. Theme Check 零 error

---

## 八、测试策略

Shopify 主题无传统单元测试，验证靠：
1. **Theme Check**: `shopify theme check --path botanica` → 0 error
2. **CSS Link 一致性**: `.\verify.ps1` step 2
3. **JSON/BOM 检查**: `.\verify.ps1` step 3
4. **视觉回归**: `shopify theme push` 后浏览器手动检查
5. **Lighthouse**: Chrome DevTools 跑分
6. **可访问性**: axe-core 扫描
