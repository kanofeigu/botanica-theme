# Botanica v3 — 项目功能详细描述

> 位置：`E:\ccfold\shopify\important\12-FEATURE-DESCRIPTIONS.md`
> 每个功能的完整描述：用途、实现方式、关联功能
> 最后更新：2026-07-06

---

## 功能目录

| 编号 | 功能 | 类型 | 页面 |
|------|------|------|------|
| F01 | 全局设计系统 | 基础设施 | 全站 |
| F02 | Mega Menu 导航 | 组件 | 全站 |
| F03 | Cart Drawer | 组件 | 全站 |
| F04 | Predictive Search | 组件 | 全站 |
| F05 | Hero Section | Section | 首页 |
| F06 | Shop by Care | Section | 首页 |
| F07 | Plant Spotlight | Section | 首页 |
| F08 | Size Guide | Section | 首页 |
| F09 | Care Blog Teaser | Section | 首页 |
| F10 | Product Card | Snippet | 全站 |
| F11 | PDP — Product Page | 页面 | PDP |
| F12 | Collection — Filter & Sort | 页面 | 分类页 |
| F13 | Quick View Modal | 交互 | 全站 |
| F14 | Sticky ATC Bar | 交互 | PDP（移动端） |
| F15 | Botanical Ambience Effects | 特效 | 全站（可选） |
| F16 | 3 Presets System | 系统 | 全站 |
| F17 | Multi-purpose Sections | Section 组 | 全站 |

---

## F01：全局设计系统

**用途**：统一全站视觉语言，一处修改全局生效。

**实现方式**：
- `assets/design-tokens.css`：定义 ~80 个 CSS 自定义属性（色板、字体、字号、间距、圆角、阴影、缓动、z-index）
- `layout/theme.liquid`：从 `settings.colors_*` 动态注入颜色令牌
- `assets/base.css`：消费令牌输出基础样式（按钮/表单/卡片/徽章/布局工具类）

**关联功能**：所有其他功能都依赖此系统。

---

## F02：Mega Menu 导航

**用途**：多级导航，支持桌面端的 mega menu flyout 和移动端的 accordion drawer。

**实现方式**：
- `sections/header.liquid`：原创导航系统，含桌面端 3 列 mega panel（侧边栏 + flyout 子菜单 + 促销图）
- 移动端：原生 `<details>/<summary>` accordion
- JS：hover 打开/关闭 flyout、fade 动画、Escape 关闭、焦点管理
- `blocks/mega-menu.liquid`：促销块（mega-promo / mega-links / mega-collections）

**关联功能**：F03（cart count）、F04（搜索图标）、`cart.js`（cart count 更新）

---

## F03：Cart Drawer

**用途**：侧滑购物车抽屉，支持免运费进度条、数量修改、直接结账。

**实现方式**：
- `layout/theme.liquid` 中硬编码 cart drawer 结构（始终存在，全局可用）
- `assets/cart.js`：AJAX 加车 + drawer 打开/关闭 + 内容更新
- 免运费进度条基于真实 `cart.total_price` vs `settings.free_shipping_threshold`
- 焦点管理：打开时焦点移到 drawer、关闭时焦点归还触发按钮

**关联功能**：F13（quick-view 内复用 cart.js）、F14（sticky ATC 复用）、F02（header cart count）

---

## F04：Predictive Search

**用途**：实时搜索建议下拉。

**实现方式**：
- `assets/search.js`：监听搜索框输入 → `fetch('/search/suggest?q=X')` → 渲染结果
- 结果显示产品图片、标题、价格
- 容器在 `theme.liquid` 中全局挂载

**关联功能**：F02（搜索触发图标在 header 中）

---

## F05：Hero Section

**用途**：全幅/分栏/堆叠式首页英雄区域。

**实现方式**：
- `sections/hero.liquid`：3 种布局可选（split/stacked/full）
- Blocks：eyebrow + heading + text + button-group
- 文字压图有渐变 scrim 保证对比度
- LCP 图片 `fetchpriority="high"` + 显式尺寸

**关联功能**：F01（设计令牌）、eyebrow/heading/text/button-group blocks

---

## F06：Shop by Care

**用途**：按养护难度分类的入口区域（Easy / Moderate / Expert 三张卡）。

**实现方式**：
- `sections/shop-by-care.liquid`
- `blocks/care-card.liquid` × 3：每张卡含图标、徽章、标题、描述、light-meter、water-meter
- 卡片背景按 difficulty 用 `color-mix()` 派生淡色
- 链接绑到对应 collection

**关联功能**：light-meter/water-meter blocks、collection 链接

---

## F07：Plant Spotlight

**用途**：单品深度展示——含养护表格、田野笔记、标本图像。

**实现方式**：
- `sections/plant-spotlight.liquid`：薄壳容器 + `{% content_for "blocks" %}`
- Blocks 组装：eyebrow → heading → spotlight-media（4:5 画框 + 纸纹） → text → care-table → care-row × 5 → editorial-quote → button-group
- 养护数据全部走 block 设置（light/water/humidity/size/toxicity）

**关联功能**：spotlight-media、care-table、care-row、editorial-quote blocks

---

## F08：Size Guide

**用途**：三张尺寸对比卡片（Desk / Floor / Statement），含人+盆 SVG 可视化。

**实现方式**：
- `sections/size-guide.liquid`
- `blocks/size-card.liquid` × 3：height_cm / pot_cm / description
- 可选 cm/inch 切换

**关联功能**：size-card block、F16（预设中不同间距配置）

---

## F09：Care Blog Teaser

**用途**：养护博客文章卡片（手动或自动从 blog 拉取）。

**实现方式**：
- `sections/care-blog-teaser.liquid`
- 支持 `manual_card` blocks 或自动从选定的 blog 拉取最新文章

**关联功能**：badge block（tag 徽章）

---

## F10：Product Card

**用途**：全站统一的产品卡片（首页/分类页/搜索/推荐）。

**实现方式**：
- `snippets/card-product.liquid`：接收多个参数（product / image_ratio / show_badges 等）
- 支持：hover 第二图、care badge、light badge、sale badge、quick-view 触发
- Care badge 通过 product tags 识别（`care-easy`/`care-medium`/`care-expert`）
- Light badge 通过 product tags 识别（`light-low`/`light-medium`/`light-bright`）

**关联功能**：F13（quick-view 触发）、badge block、F06/F07/F12/F17（所有显示产品网格的地方）

---

## F11：PDP — 产品详情页

**用途**：完整的产品展示页面——含图集、变体选择、养护信息、推荐。

**实现方式**：
- `templates/product.json`：组装 5 个 sections
- `sections/main-product.liquid`：核心 PDP，15 个 blocks 组装
  - 图集：4:5 主图 + 缩略图导航 + `<dialog>` 缩放 + 纸纹 overlay + 标本标签
  - 购买：变体选择器 + 数量 + ATC + 动态结账
  - 养护：四宫格快速养护 + 可折叠详细规格
  - 内容：产品描述 + 田野笔记 + 搭配推荐 + 社交分享 + 自提
- `assets/variant-selects.js`：变体切换主逻辑
- `assets/gallery.js`：图集缩放导航

**关联功能**：F03（cart drawer）、F13（quick-view 复用 variant-selects）、F14（sticky ATC）、F10（推荐产品卡）

---

## F12：Collection — 筛选与排序

**用途**：产品分类页，含侧边栏筛选、popover 排序、AJAX 导航。

**实现方式**：
- `sections/main-collection-product-grid.liquid`：完整的筛选+排序+产品网格
- 筛选：Shopify 原生 `collection.filters`（复选框 + 价格 popover）
- 排序：自定义 popover dropdown（附带动画）
- AJAX：筛选/排序/分页全部无刷新加载（fade-out → fetch → fade-up reveal）
- URL：history.pushState 保持可分享/可后退

**关联功能**：F10（产品卡）、F13（quick-view）、collection.filters（原生）

---

## F13：Quick View Modal

**用途**：产品卡上的快速预览弹窗——无需跳转 PDP 即可查看详情和加车。

**实现方式**：
- `blocks/quick-view-trigger.liquid`：触发按钮（嵌在产品卡中）
- `assets/quick-view.js`：原生 `<dialog>` 弹窗 → fetch 产品 HTML → 填充内容
- 弹窗内包含：产品图、标题、价格、变体选择器、ATC 按钮
- 内部复用 `variant-selects.js` 和 `cart.js` 逻辑

**关联功能**：F03（cart.js）、F11（variant-selects.js 复用）、F10（产品卡上的触发按钮）

---

## F14：Sticky ATC Bar

**用途**：移动端 PDP——主 ATC 按钮滚出视口后，底部浮出粘性加购条。

**实现方式**：
- `blocks/sticky-atc.liquid`：粘性条的 HTML 结构
- `assets/sticky-atc.js`：IntersectionObserver 监听主 ATC 按钮 → 控制显隐
- 同步：变体切换时 sticky bar 的价格/变体同步更新

**关联功能**：F03（cart.js 复用 ATC 逻辑）、F11（variant-selects.js → 价格/变体同步）

---

## F15：Botanical Ambience Effects

**用途**：12 种滚动驱动的植物氛围动画（落叶、藤蔓、斑驳光、孢子、剪影视差等）。

**实现方式**：
- `sections/botanical-ambience.liquid`：控制面板 section（开关 + 强度）
- `assets/botanical-effects.css`：全部 CSS-native（`animation-timeline: view()/scroll()`）
- 所有动效有 `prefers-reduced-motion` 三层守卫

**关联功能**：F01（设计令牌消费 `--bt-color-*`）

---

## F16：3 套预设系统

**用途**：3 套差异化视觉预设（Botanical / Home & Decor / Wellness）。

**实现方式**：
- `config/settings_data.json`：每个预设完整定义色板、字体、间距、圆角
- 色+字+构图三维不同（不是换色）
- `/listings/` 目录：每个预设一个 listing 目录

**关联功能**：F01（预设影响全站设计令牌注入）

---

## F17：多用途 Sections

**用途**：灵活的多用途页面构建块，商家可自由组合。

| Section | 描述 |
|---------|------|
| `rich-text` | 居中编辑式文本区 |
| `image-with-text` | 图+文分栏/堆叠布局 |
| `multicolumn` | 多列图标+文字（价值观/特色列表） |
| `collage` | 拼贴式图片布局 |
| `featured-collection` | 精选产品网格 |
| `featured-product` | 单品展示 |
| `collection-list` | 分类入口列表 |
| `slideshow` | 幻灯片（可暂停） |
| `newsletter` | 邮件订阅表单 |
| `testimonials` | 客户评价卡片 |
| `logo-list` | Logo 列表（品牌合作） |
| `faq-accordion` | FAQ 手风琴（原生 `<details>`） |
| `gallery` | 图片画廊 |
| `contact-form` | 联系表单 |

**关联功能**：全部依赖 F01（设计令牌）和通用 blocks（eyebrow/heading/text/button-group）

---

*关联文档：[[01-ARCHITECTURE]] [[04-FEATURE-TREE]] [[06-COMPOSABLE-MODULES]]*
