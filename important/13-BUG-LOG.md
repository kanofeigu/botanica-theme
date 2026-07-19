# Botanica v3 — Bug 日志

> 位置：`E:\ccfold\shopify\important\13-BUG-LOG.md`
> 每次修改 bug 都需要记录：bug 原因、修复方法、修复所修改的文件、修复结果
> 最后更新：2026-07-06

---

## Bug 记录格式

```
### BUG-#XXX：[简短描述]

- **发现日期**：YYYY-MM-DD
- **严重程度**：🔴 blocker / 🟡 major / 🟢 minor
- **现象**：（用户看到什么）
- **根因**：（代码为什么出错）
- **修复方法**：（怎么修的）
- **修改的文件**：
  - `path/to/file` — 修改内容简述
- **修复结果**：（验证方式 + 结果）
- **关联功能**：[[04-FEATURE-TREE]] 中受影响的节点
```

---

## Bug 列表

### BUG-001：`--bt-border-width` 和 `--bt-border-style` CSS 变量未定义

- **发现日期**：2026-07-06
- **严重程度**：🟡 major
- **现象**：buy-buttons、collapsible-specs、quantity-selector、variant-picker 等 block 的边框样式不生效（CSS 变量回退到浏览器默认值 `medium none`）
- **根因**：6 个 `.liquid` 文件引用了 `var(--bt-border-width)` 和 `var(--bt-border-style)`，但 `design-tokens.css` 中未定义这两个变量
- **修复方法**：在 `assets/design-tokens.css` 的 `:root` 中添加：
  ```css
  --bt-border-width: 1.5px;
  --bt-border-style: solid;
  ```
- **修改的文件**：
  - `assets/design-tokens.css` — 添加两个 CSS 自定义属性
- **修复结果**：`shopify theme check` 0 error；所有引用该变量的组件边框正常渲染
- **关联功能**：buy-buttons、collapsible-specs、quantity-selector、variant-picker、password.liquid

---

### BUG-002：5 个 Section 的 `color_scheme` 设置引用孤立

- **发现日期**：2026-07-06
- **严重程度**：🟡 major
- **现象**：apps、main-product、product-care-guide、product-recommendations、risk-free-guarantee 这 5 个 section 的 schema 中有 `color_scheme` 设置项，markup 中有 `color-{{ section.settings.color_scheme }}` class，但 `settings_schema.json` 中没有定义任何 `color_scheme_group`。导致 theme editor 中渲染为空下拉框，且 markup 中的 class 永远为 `color-scheme-1`（无对应 CSS 样式）
- **根因**：代码某次重构中将 `color_scheme_group` 从 `settings_schema.json` 移除（或用独立的 `color` type 替代），但没有同步清理 section 中的引用
- **修复方法**：
  1. 从所有 5 个 section 的 markup 中移除 `color-{{ section.settings.color_scheme }}` class
  2. 从所有 5 个 section 的 schema 中移除 `color_scheme` 设置项
  3. 配色体系已通过全局 `--bt-color-*` token 覆盖，无需 per-section scheme
- **修改的文件**：
  - `sections/apps.liquid` — 移除 color_scheme class + schema setting
  - `sections/main-product.liquid` — 移除 schema 中的 color_scheme setting
  - `sections/product-care-guide.liquid` — 移除 color_scheme class + schema setting
  - `sections/product-recommendations.liquid` — 移除 color_scheme class + schema setting
  - `sections/risk-free-guarantee.liquid` — 移除 color_scheme class + schema setting
- **修复结果**：`shopify theme check` 0 error；全项目 grep `color_scheme` 零残留
- **关联功能**：apps section、PDP main-product、product-care-guide、product-recommendations、risk-free-guarantee

---

### BUG-003：`/listings/` 目录缺失

- **发现日期**：2026-07-06
- **严重程度**：🔴 blocker（Theme Store 提交要求）
- **现象**：项目缺少 `/listings/` 目录结构，提交打包时可能被拒
- **根因**：开发过程中未创建此目录（预设数据已在 `settings_data.json` 中完整定义）
- **修复方法**：创建 3 个预设对应的 listing 目录：
  - `listings/botanical/`
  - `listings/home-and-decor/`
  - `listings/wellness/`
  如需 section-group 覆盖，在对应目录下放 `sections/` 子目录
- **修改的文件**：
  - 新建 3 个 listing 目录
- **修复结果**：目录结构符合 Theme Store 要求
- **关联功能**：F16（3 套预设系统）

---

### BUG-004：Collection 页面 AJAX 导航拦截产品链接，PDP 无法打开

- **发现日期**：2026-07-07
- **严重程度**：🔴 blocker
- **现象**：从 `/collections/all-plants` 点击任何产品卡片，页面不跳转、卡在当前页不动。直接访问产品 URL 正常。
- **根因**：`main-collection-product-grid.liquid` 中的 AJAX click delegate 拦截了 `.bt-collection-grid` 内所有 `<a>` 点击，包括产品卡片的链接。`ajaxNavigate()` 尝试用 fetch 拉产品页 HTML 并在其中查找 `.bt-collection-grid` 容器来替换内容——但产品页没有这个容器，`newGrid` 为 null，代码静默失败不执行任何导航。
- **修复方法**：在 click handler 中加一行排除产品链接：
  ```javascript
  if (href.indexOf('/products/') !== -1) return;
  ```
- **修改的文件**：
  - `sections/main-collection-product-grid.liquid` — 第 488 行新增 2 行
- **修复结果**：产品卡片点击正常跳转 PDP；筛选/排序的 AJAX 导航不受影响
- **关联功能**：F05（Collection 筛选系统）、F03（PDP）

---

### BUG-005：`shopify theme push` / `pull` 循环导致 header-group.json 块配置丢失

- **发现日期**：2026-07-07
- **严重程度**：🔴 blocker
- **现象**：导航栏 mega menu 的促销图片块（mega-promo blocks）消失，右侧 promo 列不显示任何内容
- **根因**：`header-group.json` 是 section group 定义文件，其中的 `blocks` 数据由 theme editor 管理。在同一次会话中交替使用 `shopify theme push`（写本地→远程）和 `shopify theme pull`（写远程→本地），加上 `shopify theme dev` 的双向同步，导致本地 JSON 文件中的块配置与远程 theme editor 中的实际配置互相覆盖。一次 `pull` 拉下来没有 blocks 的版本覆盖了本地，再次 `push` 就把空 blocks 写回了远程。
- **修复方法**：
  1. 杀掉 dev server，只用 `push` 单向同步
  2. 在 theme editor 中手动重新添加 mega-promo blocks
  3. 或者通过 API 写入正确的 blocks 到 header-group.json
- **修改的文件**：
  - `sections/header-group.json` — 多次被覆盖后重建
  - 导航菜单数据（Shopify 后台）— 通过 `menuUpdate` API 重建
- **修复结果**：导航 3 级菜单恢复，mega-promo 块可在编辑器添加
- **关联功能**：F01（Header 导航系统）
- **⚠ 教训**：push 和 pull 不要同时用。dev 模式下只 pull 不 push。Section group 的块配置很容易在 push/pull 中丢失。

---

### BUG-006：mega menu 渲染代码被过度修改导致右侧 promo 列样式崩溃

- **发现日期**：2026-07-07
- **严重程度**：🟡 major
- **现象**：hover 导航菜单后，右侧 promo 列图片和文字被挤出容器、多张卡片堆叠
- **根因**：为了支持 flyout_item（子菜单关联图片），在 `header.liquid` 的 mega-promo 渲染代码中加了三层嵌套 Liquid 循环（for child → for block → if match），还把多个 flyout 专用卡片和一个默认卡片全部塞进 `bt-mega__promo-col` 容器，CSS flex 布局无法处理动态数量的堆叠卡片
- **修复方法**：回退到最简实现——promo 块渲染只加一个 `data-promo-for` 属性（匹配 flyout ID）+ 一个 `bt-mega__promo--hidden` class（初始隐藏），不改 DOM 结构、不嵌套循环
- **修改的文件**：
  - `sections/header.liquid` — mega-promo 渲染分支（最终改动 8 行 Liquid）
- **修复结果**：mega menu 图片切换正常，样式恢复
- **关联功能**：F01（Header 导航系统）
- **⚠ 教训**：实现新功能优先复用现有机制（`switchPromo` JS 函数已支持 `data-promo-for` + hidden class 切换），不要重写渲染逻辑

---

## Bug 统计

| 严重程度 | 数量 | 已修复 | 未修复 |
|---------|------|--------|--------|
| 🔴 blocker | 3 | 3 | 0 |
| 🟡 major | 3 | 3 | 0 |
| 🟢 minor | 0 | 0 | 0 |
| **合计** | **9** | **9** | **0** |

---

### BUG-007：54 个产品价格为 $0.00，商店前台不显示

- **发现日期**：2026-07-07
- **严重程度**：🔴 blocker
- **现象**：用户看到 All Plants 页面只显示 12 个产品。API 查询显示 69 个产品，但 54 个价格是 $0.00。
- **根因**：通过 GraphQL API 创建产品时，`productCreate` 自动生成默认变体（价格 $0.00）。第二步 `productVariantsBulkCreate` 有时静默失败（CLI 返回成功但实际未执行），导致大量产品保留 $0 价格。Shopify 前端对 $0 产品的行为不确定。
- **修复方法**：查询所有产品→筛选 $0 价格→用 `productVariantsBulkUpdate` 批量设价。第一次因用 handle 代替 product ID 失败（假成功），第二次用正确 ID 修复。
- **修改的文件**：无代码文件修改（纯数据操作）
- **修复结果**：69 个产品全部有真实价格（$16-$120）
- **关联功能**：F14（产品数据管理）

---

### BUG-008：产品未发布到 Online Store 渠道，前台看不到

- **发现日期**：2026-07-07
- **严重程度**：🔴 blocker
- **现象**：商店前台 `/collections/all-plants` 显示 0 个产品，但 Admin API 确认 69 个产品 ACTIVE、在集合中、有价格
- **根因**：2026 年产品发布机制改变。`productCreate` 的 `status: ACTIVE` 只让产品在 admin 中可见，但**不会自动发布到销售渠道**。需要显式调用 `publishablePublish` 或 REST API 的 `published: true`。旧的 `write_products` scope 不包含渠道发布权限。
- **修复方法**：使用 REST Admin API `PUT /products/{id}.json` + `{"product":{"published":true}}` 批量发布。REST API 虽然被标记 deprecated，但产品发布操作仍有效且不需要 `write_publications` scope。
- **修改的文件**：`demo/publish.mjs`（批量发布脚本）
- **修复结果**：69 个产品全部发布到 Online Store，前台可见
- **关联功能**：F14（产品数据管理）

---

### BUG-009：REST API 批量 metafield 创建失败

- **发现日期**：2026-07-07
- **严重程度**：🟡 major
- **现象**：用 REST API `POST /products/{id}/metafields.json` 批量写入 metafield，56/69 失败
- **根因**：REST API 的 metafield 端点不支持一次写入多个 metafield 数组（或格式不对）
- **修复方法**：改用 GraphQL `metafieldsSet` 突变，支持 `[MetafieldsSetInput!]!` 数组参数
- **修改的文件**：无代码文件修改（纯数据操作）
- **修复结果**：69 个产品成功写入 10 个筛选维度 metafield
- **关联功能**：F05（Collection 筛选系统）

---

## 新增架构发现

### 2026 年 Shopify 认证方式变更
- **旧**：Admin 后台创建 Custom App → `shpat_` token（永久有效）
- **新（2026-01 起）**：Partner Dashboard 创建 App → Client Credentials OAuth → `shpua_` token（24 小时过期）
- token 端点：`POST /admin/oauth/access_token` + `grant_type=client_credentials` + `client_id` + `client_secret`
- 管理 API 的 token scope 在 Partner Dashboard 配置，变更后需重新获取 token

### REST vs GraphQL 产品操作
- **GraphQL `productCreate`**：只能创建产品 + 默认变体（$0），变体价格需单独 `productVariantsBulkCreate`
- **GraphQL `publishablePublish`**：需要 `write_publications` scope
- **REST `PUT /products/{id}.json`**（已标记 deprecated）：`published: true` 仍有效，不需要额外 scope
- **metafield 批量写入**：用 GraphQL `metafieldsSet`，不要用 REST

---

### BUG-010：集合页快捷加车按钮（+）完全无功能

- **发现日期**：2026-07-10
- **严重程度**：🔴 blocker
- **现象**：集合页产品卡片 hover 后出现 + 按钮，点击无任何反应，产品未加车
- **根因**：`card-product.liquid` 中的快捷加车按钮是 `<button type="button">`，没有任何 JS click handler 或 form 包裹。`cart.js` 只实现了 cart drawer 的开关 UI，没有加车逻辑
- **修复方法**：
  1. 给按钮添加 `data-variant-id="{{ product.selected_or_first_available_variant.id }}"`
  2. 在 `main-collection-product-grid.liquid` 的 JS 中添加 `initQuickAdd()` 函数：监听 `.bt-card__quick-add` 点击 → `fetch('/cart/add.js', {method:'POST', body:JSON.stringify({id,quantity:1})})` → 更新 cart count → 显示 loading/success 状态
  3. 添加 `.is-loading` 和 `.is-added` CSS 状态样式
- **修改的文件**：
  - `snippets/card-product.liquid` — 按钮加 `data-variant-id` + 内联 SVG 替代 `{% render 'icon-plus' %}`
  - `sections/main-collection-product-grid.liquid` — 新增 `initQuickAdd()` AJAX 加车函数
  - `assets/cart.js` — 曾添加后移除（移到集合页 JS 保证加载）
  - `sections/header.liquid` — cart count span 添加 `data-cart-count` 属性
- **修复结果**：集合页点击 + 按钮 → 转圈 → 对勾 → 购物车数量更新 ✅
- **关联功能**：F05（Collection 筛选系统）、F07（购物车）

---

### BUG-011：PDP "Add to cart" 按钮点击无反应

- **发现日期**：2026-07-10
- **严重程度**：🔴 blocker
- **现象**：产品详情页点击 Add to cart 按钮，页面无任何反应，产品未加车
- **根因**：`buy-buttons.liquid` 和 `variant-picker.liquid` 中的 `form="{{ product_form_id }}"` 引用的是 `main-product.liquid` 中定义的 Liquid 变量。但 block 通过 `{% content_for "blocks" %}` 渲染时，`product_form_id` 可能在某些上下文中为空值，导致 `form` 属性指向空字符串 — HTML5 规范下，`form` 属性为空值时按钮不关联任何表单，即使按钮是表单的子元素
- **修复方法**：移除 `buy-buttons.liquid` 中 submit 按钮和 quantity 输入的 `form` 属性、移除 `variant-picker.liquid` 中 radio 输入的 `form` 属性。这些元素已经在 `<form>` 内部，HTML 原生的表单关联即可工作，不需要显式 `form` 属性
- **修改的文件**：
  - `blocks/buy-buttons.liquid` — 去掉 submit 按钮和 quantity 输入的 `form="{{ product_form_id }}"`
  - `blocks/variant-picker.liquid` — 去掉 radio 输入的 `form="{{ product_form_id }}"`
- **修复结果**：PDP 提交按钮正常关联表单，点击 Add to cart 成功加车 ✅
- **关联功能**：F03（PDP）、F07（购物车）
- **⚠ 教训**：`form` 属性在 HTML5 中是"覆盖父表单"的语义 — 如果属性值为空或无效 ID，按钮不属于任何表单。对于已经在表单内部的元素，不要加 `form` 属性；只在按钮确实在表单外部时才需要

---

### BUG-012：价格筛选使用硬编码分档，商家无法自定义

- **发现日期**：2026-07-10
- **严重程度**：🟡 major
- **现象**：集合页价格筛选显示为下拉菜单，选项是 0-50 / 50-100 / 100-200 / 200+ 四个固定档位。商家无法在 Search & Discovery 中自定义价格范围
- **根因**：`main-collection-product-grid.liquid` 的 `price_range` case 用 `steps = '50,100,200'` 硬编码分档，渲染为自定义 popover 下拉菜单。代码约 70 行 Liquid + 专用 JS
- **修复方法**：改为 Shopify 原生的 From / To 数字输入框，使用 `filter.min_value` / `filter.max_value` 动态数据。商家在 Search & Discovery 配置价格策略后，输入框的最大值自动匹配集合内的最高价。添加 350ms 防抖 AJAX 提交
- **修改的文件**：
  - `sections/main-collection-product-grid.liquid` — 替换 `price_range` case（-70 行旧代码，+30 行新代码 + JS handler）
  - `locales/en.default.json` — 添加 `collections.filters.from` / `collections.filters.to` 翻译键
- **修复结果**：价格筛选显示为 From/To 输入框，支持自由输入，防抖自动筛选 ✅
- **关联功能**：F05（Collection 筛选系统）

---

### BUG-013：69 个产品的 metafield 数据只有 3 个 key 有值

- **发现日期**：2026-07-10
- **严重程度**：🟡 major
- **现象**：Search & Discovery 配置完成后，集合页只有 price 筛选出现，分类标签（养护难度、光照、尺寸等）不显示。API 查询发现多数产品没有 metafield 数据
- **根因**：10 个 metafield 定义已创建，但产品的 metafield 数据从未被批量填充。历史操作中 metafield 写入可能部分失败（类似 BUG-009）
- **修复方法**：
  1. 从产品 tags 中提取已有数据（例如 `care-easy` → `care_level: easy`）
  2. 编写 Node.js 脚本 `write-metafields.mjs`，用 GraphQL `metafieldsSet`（variables 格式，避免 JSON→GraphQL 字面量转换的语法错误）批量写入
  3. 23 批次写入 571 个 metafield 值，68/69 产品成功填充
- **修改的文件**：
  - `scripts/write-metafields.mjs`（新建）— 批量 metafield 写入脚本
  - `scripts/map-metafields.mjs`（新建）— tags→metafield 映射测试脚本
  - `scripts/apply-metafields.mjs`（新建）— 备选方案
- **修复结果**：68 个产品拥有完整的 10 维 metafield 数据（care_level / difficulty / light_needs / water_needs / plant_size / pet_safe / air_purifying / plant_color / growth_habit / placement），Search & Discovery 配置后可正常筛选 ✅
- **关联功能**：F05（Collection 筛选系统）、F14（产品数据管理）
- **⚠ 教训**：GraphQL mutation 中不能直接嵌入 `JSON.stringify()` 作为 inline argument — Shopify 的 GraphQL parser 要求 GraphQL 字面量格式（无引号 key），需要改用 GraphQL variables（`$metafields: [MetafieldsSetInput!]!`）传递 JSON 数据

---

## 2026-07-19 深度审计修复批次（Kimi Work 审计组）

> 背景：07-19 对全项目做「逐按钮逐功能」审计 + 店面密码实测，发现 5 个功能 blocker。已全部修复并推送到 live 主题（git product 分支 `5910f60` + `d94492a`），线上回归验证通过。

### BUG-014：`Shopify.formatMoney` 全主题未定义，加车后抽屉崩溃

- **发现日期**：2026-07-19
- **严重程度**：🔴 blocker
- **现象**：PDP/快捷加车本身成功（商品入车），但 cart drawer 打开后永远显示空车旧内容、header 数量角标不更新，必须刷新页面
- **根因**：`assets/cart.js` 5 处调用 `Shopify.formatMoney`（Dawn 在 global.js 定义它，本主题没有），非空车渲染时抛 TypeError，被 `_refreshCart` 的 catch 静默吞掉。quick-view.js 有 typeof 守卫而 cart.js 没有（作者不一致）
- **修复方法**：cart.js 顶部加防御性 polyfill（`window.Shopify.formatMoney`，Dawn 经典 placeholder 实现，默认取 `window.theme.moneyFormat`）
- **修改的文件**：`assets/cart.js`
- **修复结果**：线上 CDN cart.js 确认 polyfill 存在 ✅
- **关联功能**：F03（Cart Drawer）、F11（PDP）、F14（Sticky ATC）
- **⚠ 教训**：从其他主题移植逻辑时，其依赖的全局工具函数必须一并移植或加守卫

### BUG-015：集合页快捷加车监听器无限叠加 + 数量徽标 undefined

- **发现日期**：2026-07-19
- **严重程度**：🔴 blocker
- **现象**：① AJAX 筛选/排序/翻页 N 次后，点一次 + 按钮发出 N+1 个 `/cart/add.js`（重复加 N+1 件）；② 徽标显示 "undefined"；③ 首页 featured-collection 的 8 个 + 按钮完全无 handler
- **根因**：`initQuickAdd()` 在 `initAll()` 内每次 AJAX 后重复绑定 document 监听器且无去重守卫（同文件其他 init 都有守卫）；从 `/cart/add.js` 响应读不存在的 `item_count` 字段；handler 只存在于集合页 section 的 `{% javascript %}`
- **修复方法**：逻辑移入 `assets/cart.js` 全局单 document 委托（模块加载绑定一次）；成功后 dispatch `cart:added` 由 CartDrawer 统一刷新打开；删除旧 initQuickAdd；`header.liquid` 角标改为始终渲染（空车 hidden）——否则空车首次加车角标无法出现
- **修改的文件**：`assets/cart.js`、`sections/main-collection-product-grid.liquid`、`sections/header.liquid`
- **修复结果**：线上 cart.js 确认全局 handler；`/cart/add.js` 响应实测确认无 `item_count` 字段 ✅
- **关联功能**：F10（Product Card）、F03（Cart Drawer）、F12（Collection）
- **⚠ 教训**：所有「加车成功后的 UI 更新」必须走统一的 `cart:added` 事件单入口，不允许各自 fetch 各写 DOM

### BUG-016：预测搜索整体失效（死功能）

- **发现日期**：2026-07-19
- **严重程度**：🔴 blocker
- **现象**：header 搜索图标只能跳转 /search 页，实时建议下拉从不出现；`settings.predictive_search_enabled` 形同虚设
- **根因**：① `<bt-predictive-search>` 容器内没有任何 `input[type="search"]`，search.js 初始化直接 return；② fetch 端点 `/search/suggest?q=` 是 HTML 端点（实测 422），代码却按 JSON 解析；③ 结果渲染未转义（XSS 面）
- **修复方法**：theme.liquid 容器内补全搜索面板（form + input + 结果容器）；header 搜索图标加 `data-search-toggle`，search.js 整体重写：端点改 `/search/suggest.json?resources[type]=product`、面板显隐/焦点/Escape 管理、`esc()` 转义、价格走 formatMoney；base.css 补面板样式
- **修改的文件**：`layout/theme.liquid`、`sections/header.liquid`、`assets/search.js`、`assets/base.css`
- **修复结果**：线上首页确认输入框存在（2 个 type="search"）；`/search/suggest.json` 实测 200 返回产品数据 ✅
- **关联功能**：F04（Predictive Search）、F02（Mega Menu 导航）

### BUG-017：产品推荐与抽屉 upsell 接口缺 `.json` 后缀（HTTP 422）

- **发现日期**：2026-07-19
- **严重程度**：🔴 blocker
- **现象**：PDP 永远显示 "No recommendations yet."，cart drawer upsell 永不渲染
- **根因**：fetch URL 为 `/recommendations/products?product_id=...`（无 .json），实测返回 422 空响应；正确端点 `/recommendations/products.json` 实测 200 返回 `{products: [...]}`，与代码的 `r.json()` 解析匹配
- **修复方法**：两处 URL 加 `.json` 后缀
- **修改的文件**：`sections/product-recommendations.liquid`、`assets/cart.js`（upsell）
- **修复结果**：线上 PDP 确认 `data-url="/recommendations/products.json?..."` ✅
- **关联功能**：F11（PDP）、F03（Cart Drawer）

### BUG-018：产品卡徽章 tag 前缀写反，care/light 徽章永不渲染

- **发现日期**：2026-07-19
- **严重程度**：🟡 major
- **现象**：产品卡上 Easy/Moderate/Expert 徽章和光照 dots 从不出现（主题核心卖点功能失效）
- **根因**：card-product.liquid 检测 `easy-care`/`medium-care`/`expert-care`、`bright-light`/`low-light`，但官方约定（SUBMISSION.md、demo 数据、线上产品实际 tag）是 `care-easy`/`light-low` 前缀格式
- **修复方法**：6 处 tag 字符串改为正确前缀；同步修正 en.default.schema.json 中商家指引文案
- **修改的文件**：`snippets/card-product.liquid`、`locales/en.default.schema.json`
- **修复结果**：线上集合页确认渲染 45 个徽章 chip（11 easy + 9 medium + 3 expert + 22 light）✅
- **关联功能**：F10（Product Card）、F06（Shop by Care）

### BUG-019：theme check 2 个 error（推送前拦截）

- **发现日期**：2026-07-19
- **严重程度**：🟢 minor
- **现象**：`shopify theme check` 报 2 error
- **根因**：① `blocks/size-card.liquid:23` render 标签参数上使用 filter（`number: height_cm | append: 'cm'`，UnsupportedFilterArguments）；② `layout/theme.liquid` 引用 `sections.cart.note_placeholder` 翻译键在 en.default.json 中缺失
- **修复方法**：① 改为预先 `assign size_number`；② en.default.json 补 `note_placeholder` 键
- **修改的文件**：`blocks/size-card.liquid`、`locales/en.default.json`
- **修复结果**：`shopify theme check` 0 error 0 warning ✅
- **关联功能**：F08（Size Guide）、F03（Cart Drawer）

### 2026-07-19 部署备注

- Shopify Admin API 的 `themeFilesUpsert`/`themeFilesDelete`（GraphQL）和 REST Assets **写操作**对本店 app 均不可用（需 Shopify 豁免；REST GET 可读）；主题推送只能用 Shopify CLI
- 本机原先没有 Shopify CLI：在 `kimi/workspace/shopify-cli/` 本地目录安装了 `@shopify/cli` 4.5.2（`npx shopify` 调用），认证信息本机已有缓存，push 直接成功
- 推送方式：`shopify theme push --path botanica --store kano-u93kwgf9.myshopify.com --theme 153451266239 --allow-live --json`

---

## Bug 统计

| 严重程度 | 数量 | 已修复 | 未修复 |
|---------|------|--------|--------|
| 🔴 blocker | 9 | 9 | 0 |
| 🟡 major | 6 | 6 | 0 |
| 🟢 minor | 1 | 1 | 0 |
| **合计** | **19** | **19** | **0** |

---

*关联文档：[[09-CHANGE-MANAGEMENT]] [[10-CODE-REVIEW]] [[11-TESTING]] [[18-AUDIT-METHODOLOGY]]*
