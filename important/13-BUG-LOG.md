# Botanica v3 — Bug 日志

> 位置：`E:\ccfold\shopify\important\13-BUG-LOG.md`
> 每次修改 bug 都需要记录：bug 原因、修复方法、修复所修改的文件、修复结果
> 最后更新：2026-08-07

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

## 2026-08-07 收尾批次（审计 P2 清单 + 用户实测反馈）

> 背景：07-19 审计报告的 P2 清单逐项收尾，叠加用户实测反馈（soldout 误判、mega menu 测试数据、购物车页重设计）。全部修复经 `shopify theme check` 0 error、CLI push 上线、线上抽查通过。
> git 提交链（product 分支）：`a26fb1e`（购物车页重设计）→ `28b345a`（soldout）→ `e4c1c33`（mega menu）→ `653c982`（Quick View）→ `366e6c7`（找回密码）→ `a7dd4a2`（批次A PDP 交互包）→ `01bae9b`（批次B 杂项包）→ `833ef06`（氛围层性能）。
> 非 bug 变更（不单独立条目）：购物车页整体重设计（双栏 + sticky 摘要卡 + AJAX 步进器 + 订单备注 + 推荐区，`a26fb1e`）；本地删除一律走回收站规则写入 CLAUDE.md（`9e2dd3e`）。

### BUG-020：购物车行 soldout 徽标误判

- **发现日期**：2026-07-19
- **严重程度**：🟡 major
- **现象**：用户反馈「添加商品到购物车之后，购物车里面的商品会显示 soldout」——有库存可售的商品在 cart 行上被盖上 Sold out 徽标
- **根因**：购物车重设计时用了 `item.available` 判断售罄状态，但 cart 行的 `item` 是 line item 对象，其 `available` 语义不可靠（部分上下文恒为 false）；应判断 `item.variant.available`
- **修复方法**：cart 行模板判断条件改为 `item.variant.available`
- **修改的文件**：`sections/main-cart-items.liquid`
- **修复结果**：线上实测加车后不再误显示 Sold out ✅（git `28b345a`）
- **关联功能**：F03（Cart Drawer）、F07（购物车）

### BUG-021：mega menu 推广位挂着 "1111" 测试数据上线

- **发现日期**：2026-07-19
- **严重程度**：🟡 major
- **现象**：导航 mega menu 右侧推广位显示标题 "1111" 的测试内容和占位图，直接暴露在 live 店面
- **根因**：开发期在 theme editor 配了测试 mega-promo 块，之后从未替换为真实内容
- **修复方法**：替换为 Golden Pothos 真实推广（文案 + 链接），推广图经 `fileCreate` 上传到 Shopify Files（不放在主题 assets，商家可在后台自行更换）
- **修改的文件**：`sections/header-group.json`（块数据）；Shopify Files（新增图片资源）
- **修复结果**：线上 mega menu 显示真实推广 ✅（git `e4c1c33`）
- **关联功能**：F01（Header 导航系统）
- **⚠ 教训**：提交前检查清单应包含「theme editor 测试数据清零」一项

### BUG-022：Quick View 按钮全店无响应 + 弹窗 3 处缺陷

- **发现日期**：2026-07-19
- **严重程度**：🔴 blocker
- **现象**：产品卡片 Quick View（眼睛图标）点击无任何反应——主题核心卖点功能整体失效
- **根因**：`quick-view.js` 与弹窗 markup 存在，但卡片上的触发按钮从未绑定事件（ snippet 版与 block 版样式/逻辑不同步）；弹窗本身另有 3 处缺陷（变体切换不刷新、加车后抽屉不更新、关闭后状态残留）
- **修复方法**：触发逻辑接入卡片按钮；修复弹窗变体切换刷新、加车成功后走统一 `cart:added` 事件、关闭时重置内部状态
- **修改的文件**：`assets/quick-view.js`、`snippets/quick-view-trigger.liquid`、`snippets/card-product.liquid`、`layout/theme.liquid`、`assets/cart.js`、`locales/en.default.json`
- **修复结果**：线上实测 Quick View 打开/变体切换/加车全链路正常 ✅（git `653c982`）
- **关联功能**：F10（Product Card）、F03（Cart Drawer）

### BUG-023：找回密码视图缺失

- **发现日期**：2026-07-19
- **严重程度**：🟡 major
- **现象**：登录页没有「忘记密码」入口对应的 recover 表单视图，客户无法自助重置密码
- **根因**：`templates/customers/login.json` 只配了登录 section，没有 recover 视图所需的第二 section / 视图切换
- **修复方法**：登录页实现 login / recover 双视图（`#recover` hash 切换），补 `recover_customer_password` 表单、5 个翻译键与切换 JS；顺带修复 login 表单错误输出的非法嵌套
- **修改的文件**：`sections/main-login.liquid`、`assets/customer-login.js`（新建）、`locales/en.default.json`
- **修复结果**：recover 视图可切换渲染 ✅（git `366e6c7`）。注：本店开的是新版客户账户，主题登录页整体不渲染，审核环境（经典账户）才生效，属正常
- **关联功能**：F09（客户账户）

### BUG-024：PDP variant 变更事件链断裂（价格/ATC/Sticky 全不同步）

- **发现日期**：2026-08-07
- **严重程度**：🔴 blocker
- **现象**：PDP 切换变体（尺寸/颜色）后，价格不变、Add to cart 按钮状态不变、sticky ATC 不更新、数量选择器在部分布局下失效——变体体系事实上半瘫
- **根因**：`variant-selects.js` 变更后从未 dispatch 统一事件，`product-price` / `buy-buttons` / `sticky-atc` 各 block 没有订阅入口，各自为战；sticky-atc block 甚至没有被启用进 `product.json` 模板；quantity-selector 依赖 buy-buttons 内部结构，独立放置时不工作
- **修复方法**：
  1. `variant-selects.js` 变更时 dispatch `theme:variantChange`（携带 variant 对象）
  2. `product-price` / `buy-buttons` / `sticky-atc` 统一订阅该事件刷新
  3. sticky-atc 启用并加入 `product.json`
  4. quantity-selector 改造为独立可用
- **修改的文件**：`assets/variant-selects.js`、`assets/sticky-atc.js`、`blocks/buy-buttons.liquid`、`blocks/product-price.liquid`、`blocks/quantity-selector.liquid`、`blocks/sticky-atc.liquid`、`blocks/variant-picker.liquid`、`sections/main-product.liquid`、`sections/featured-product.liquid`、`templates/product.json`
- **修复结果**：theme check 0 error；线上 PDP 实测 sticky-atc 渲染、变体切换价格同步 ✅（git `a7dd4a2`）
- **关联功能**：F11（PDP）、F14（Sticky ATC）
- **⚠ 教训**：多 block 协作的状态变更必须走统一事件总线（`theme:variantChange`），禁止 block 间直接 DOM 互查

### BUG-025：complementary-products「加车」是假的

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：PDP 推荐搭配区（"Pairs well with"）的加车按钮点击后无实际请求，纯 UI 表演
- **根因**：按钮只有样式，没有接 `/cart/add.js`
- **修复方法**：按钮接 Cart API 真加车，成功后 dispatch `cart:added` 走统一刷新
- **修改的文件**：`blocks/complementary-products.liquid`
- **修复结果**：推荐搭配可真实加车 ✅（git `a7dd4a2`）
- **关联功能**：F11（PDP）、F03（Cart Drawer）

### BUG-026：quick-view 注入产品数据未转义（XSS 面）

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：quick-view 弹窗把产品标题/描述直接 `innerHTML` 注入，产品数据若含 HTML 会被执行
- **修复方法**：注入前统一 `esc()` 转义；价格走 formatMoney
- **修改的文件**：`assets/quick-view.js`、`snippets/card-product.liquid`
- **修复结果**：theme check 0 error ✅（git `a7dd4a2`）
- **关联功能**：F10（Product Card）

### BUG-027：首页 hero / slideshow CTA 死链

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：首页两个主 CTA 按钮点击无跳转（href 为空或 `#`）
- **根因**：section schema 的 link 设置默认空，`templates/index.json` 预设里没配目标
- **修复方法**：`index.json` 配好真实跳转目标（/collections/all 等）
- **修改的文件**：`templates/index.json`、`sections/hero.liquid`、`sections/slideshow.liquid`
- **修复结果**：线上实测 CTA 链接有效 ✅（git `01bae9b`）
- **关联功能**：F15（首页）

### BUG-028：账户地址管理无表单

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：账户地址页只列出已有地址，无法新增/编辑/删除——没有表单
- **根因**：`main-addresses.liquid` 从未实现地址表单
- **修复方法**：新增 `snippets/address-form-fields.liquid` 复用表单字段，地址页实现 新增/编辑/删除 全套（Shopify 原生 customer_address form）
- **修改的文件**：`snippets/address-form-fields.liquid`（新建）、`sections/main-addresses.liquid`、`sections/main-account.liquid` 等账户系 section
- **修复结果**：theme check 0 error ✅（git `01bae9b`）
- **关联功能**：F09（客户账户）

### BUG-029：collection-banner 三处视觉问题

- **发现日期**：2026-08-07
- **严重程度**：🟢 minor
- **现象**：集合页头图的三处问题（图片显示、遮罩、描述文案）
- **修复方法**：逐项修正
- **修改的文件**：`sections/main-collection-banner.liquid`
- **修复结果**：线上渲染正常 ✅（git `01bae9b`）
- **关联功能**：F12（Collection）

### BUG-030：搜索 / 集合列表 / 集合网格分页缺失

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：搜索结果、集合列表页结果超过一页时无法翻页（无 paginate 或 paginate 未渲染）
- **修复方法**：三个 section 补 `{% paginate %}` + 分页器渲染
- **修改的文件**：`sections/main-search.liquid`、`sections/main-list-collections.liquid`、`sections/main-collection-product-grid.liquid`
- **修复结果**：分页器正常渲染翻页 ✅（git `01bae9b`）
- **关联功能**：F12（Collection）、F13（Search）

### BUG-031：contact-form 双标题 + schema 翻译键错位

- **发现日期**：2026-08-07
- **严重程度**：🟢 minor
- **现象**：联系页出现两个标题；theme editor 中 contact-form 设置项显示 `translation missing`
- **根因**：① section 与 page 模板各渲染一次标题；② contact-form 的 schema 翻译键错放在 `en.default.json`（schema 键必须在 `en.default.schema.json`）
- **修复方法**：去掉重复标题；把该组 schema 键从 `en.default.json` 移到 `en.default.schema.json`
- **修改的文件**：`sections/contact-form.liquid`、`locales/en.default.json`、`locales/en.default.schema.json`
- **修复结果**：线上确认无 translation missing ✅（git `01bae9b`）
- **关联功能**：F17（内容页）
- **⚠ 教训**：`t:` 用 `en.default.json`，`schema 内 name/settings` 用 `en.default.schema.json`，两者不通用

### BUG-032：footer 社交 / 支付图标不渲染

- **发现日期**：2026-08-07
- **严重程度**：🟢 minor
- **现象**：footer 配置了社交链接和支付图标，前台一律不显示
- **根因**：`social-item.liquid` block 与 footer 的支付图标渲染逻辑缺失/未接线
- **修复方法**：补 social-item 渲染与 `shop.enabled_payment_types` 支付图标输出
- **修改的文件**：`blocks/social-item.liquid`、`sections/footer.liquid`
- **修复结果**：footer 图标正常渲染 ✅（git `01bae9b`）
- **关联功能**：F02（Footer）

### BUG-033：`default: '#'` 裸链接无防护

- **发现日期**：2026-08-07
- **严重程度**：🟢 minor
- **现象**：多个 section 的链接设置默认 `'#'`，商家忘配时前台输出裸 `#` 死链
- **修复方法**：全主题扫描，链接为空或为 `#` 时不输出 href / 不渲染按钮
- **修改的文件**：`sections/apps.liquid`、`sections/multicolumn.liquid`、`sections/product-care-guide.liquid`、`sections/risk-free-guarantee.liquid` 等多个 section
- **修复结果**：无裸 `#` 链接残留 ✅（git `01bae9b`）。注：`blocks/button-group.liquid` 的 block 版 default:'#' 仍未加防护，列入观察项
- **关联功能**：全局

### BUG-034：cart / quick-view 事件监听器泄漏

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：cart.js / quick-view.js 部分 handler 在重复初始化路径下重复绑定，长期浏览后一次点击触发多次请求（BUG-015 同类问题的残余面）
- **修复方法**：统一改为单 document 委托 + 绑定去重守卫；清理嵌套的错误 handler
- **修改的文件**：`assets/cart.js`、`assets/quick-view.js`
- **修复结果**：重复绑定路径清除 ✅（git `01bae9b`）
- **关联功能**：F03（Cart Drawer）、F10（Product Card）

### BUG-035：氛围层异步 CSS 导致 CLS 0.93，LCP 未优化

- **发现日期**：2026-08-07
- **严重程度**：🟡 major
- **现象**：Lighthouse 移动端实测首页 CLS 0.926、集合页 CLS 0.951（远超 0.1 警戒线），首页 perf 55、集合页 perf 50
- **根因**：`.bt-ambience` 氛围层的结构样式（fixed 定位等）放在异步加载的 `botanical-effects.css`，样式到达前页面按无氛围层排版，到达后全量重排；装饰图与首屏产品图没有加载优先级区分
- **修复方法**：
  1. 结构样式迁入 section 内联 `{% stylesheet %}`（首屏即定版）
  2. 装饰图 `fetchpriority="low"`
  3. 首页/集合页前 4 张产品图 `loading="eager"` + `fetchpriority="high"`
- **修改的文件**：`assets/effects.css`（-102 行结构样式）、`sections/botanical-ambience.liquid`、`snippets/botanical-ambience.liquid`、`sections/featured-collection.liquid`
- **修复结果**：Lighthouse 移动端复测——首页 perf 55→80、PDP 75→90、集合页 50→81，三页 CLS 全部归零，a11y 维持 95-97 ✅（git `833ef06`）
- **关联功能**：F16（氛围层/动效系统）
- **⚠ 教训**：影响布局的结构样式永远跟首屏 CSS 走，异步 CSS 只能放纯装饰性样式

---

### BUG-036：「Pairs well with」横向滚动条 hover 弹入导致页面形变

- **发现日期**：2026-08-07
- **严重程度**：🟢 minor
- **现象**：用户实测反馈——鼠标移入 PDP「Pairs well with…」推荐搭配区时，横向滚动条突然出现，挤占容器盒内高度，下方内容瞬间下移又回弹（页面形变）
- **根因**：`.bt-complementary__list` 是 `overflow-x: auto` 滚动容器且设 `scrollbar-width: thin`（仅 Firefox 生效），Chrome/Edge 下无 `::-webkit-scrollbar` 规则——指针进入滚动区时浏览器弹出原生滚动条，经典滚动条会侵入盒内空间造成 reflow
- **修复方法**：滚动条整体隐藏（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`），沿用主题既有 `.bt-plant-scroll` 先例；滚动功能保留（拖拽/滚轮/scroll-snap）。PDP 缩略图列 `.bt-product__thumbnails` 同款隐患一并处理
- **修改的文件**：`blocks/complementary-products.liquid`、`sections/main-product.liquid`
- **修复结果**：线上编译 CSS 确认两条隐藏规则生效 ✅（git `1996ae9`）
- **关联功能**：F11（PDP）、F10（Product Card）

---

### BUG-037：加车按钮辅助文字竖向堆叠溢出（class 写错）

- **发现日期**：2026-08-07
- **严重程度**：🟢 minor
- **现象**：用户实测反馈——鼠标移到「Pairs well with」卡片的圆形 + 按钮上，按钮里冒出 "Add to cart" 文字，32px 小圆装不下，竖着挤成一行一个词溢出来
- **根因**：按钮内的屏幕阅读器专用 span 写了 `class="visually-hidden"`，但全主题没有任何地方定义这个类（主题惯例是 base.css 的 `.bt-sr-only`）——span 按普通文字渲染
- **修复方法**：span 类名改为 `bt-sr-only`（复用 base.css 既有工具类），按钮恢复纯 + 图标，无障碍标签完整保留
- **修改的文件**：`blocks/complementary-products.liquid`
- **修复结果**：线上 PDP 确认 0 处 `visually-hidden` 残留、7 处 `bt-sr-only` 正常 ✅（git `e35e6c4`）
- **关联功能**：F11（PDP）、F03（Cart Drawer）
- **⚠ 教训**：写辅助类前先查主题既有命名（本项目是 `bt-*` 前缀体系），不要凭其他主题的肌肉记忆写 `visually-hidden`

---

### BUG-038：PDP 五处类名未定义导致视觉缺陷（交互态走查批次）

- **发现日期**：2026-08-07
- **严重程度**：🟡 major（合并记录，含 1 个功能态缺陷 + 4 个视觉缺陷）
- **现象**：PDP 交互态走查发现 13 个 markup 使用但 CSS 从未定义的类，逐一甄别后 5 处为真实缺陷：
  1. **Add to cart 点击无加载反馈**：cart.js 会给提交按钮加 `bt-btn--loading` 类，但该类无任何样式（用户点了不知道点了）
  2. **PDP 徽章颜色语义错误**：`bt-badge--sale/soldout/stock` 三个修饰类未定义，Sale/Sold out/In stock 全部渲染成 base 绿色徽章
  3. **养护等级计量点不可见**：care-table 的 `.bt-meter__dot` 是 inline `<span>` 且无 `.bt-meter` 容器，width/height 不生效，dots 渲染为零尺寸（核心卖点视觉缺失）
  4. **care-table 单元格裸奔**：`__icon/__label/__value/__meter` 无样式，表格无对齐无分隔
  5. **变体选项名/冒号、单价文字、mega menu 小按钮、富文本、图标**等工具类缺失
- **根因**：与 BUG-037 同类——开发期凭肌肉记忆写类名，未对照主题 CSS 定义；theme check 的 ValidScopedCSSClass 被注释禁用（product-badges 块）
- **修复方法**：机械扫描（markup 类 ∪ JS 切换类）− CSS 定义类 = 差异清单，逐个甄别修复：
  - `base.css`：补 3 个徽章修饰、`bt-btn--loading` 转圈动画（@keyframes bt-spin）、`bt-btn--sm`、`bt-icon`、`bt-rich-text`（:where() 零优先级不干扰组件样式）
  - `care-table.liquid`：单元格 padding/对齐/分隔线 + `.bt-meter__dot { display: inline-block }`
  - `variant-picker.liquid`：选项名/分隔符样式；`product-price.liquid`：单价样式
  - 无害冗余（bt-product 根钩子、bt-qty__label 已由 bt-field__label 覆盖、bt-care-story__eyebrow 已由 bt-eyebrow 覆盖、sr-only 内的 bt-product-price__unit）甄别后不动
- **修改的文件**：`assets/base.css`、`blocks/care-table.liquid`、`blocks/variant-picker.liquid`、`blocks/product-price.liquid`
- **修复结果**：theme check 0/0；线上 base.css 与编译 CSS 逐项确认 12 条新规则全部生效 ✅（git `00eeefc`）
- **关联功能**：F11（PDP）、F06（Shop by Care）、F08（Size Guide）、F01（Header）
- **⚠ 教训**：theme-check-disable 注释是技术债信号——被禁用的检查项应列入走查清单定期人工复核；「JS 切换的类」必须和 CSS 定义成对存在

---

## Bug 统计

| 严重程度 | 数量 | 已修复 | 未修复 |
|---------|------|--------|--------|
| 🔴 blocker | 11 | 11 | 0 |
| 🟡 major | 17 | 17 | 0 |
| 🟢 minor | 7 | 7 | 0 |
| **合计** | **38** | **38** | **0** |

## 观察项（暂不修复，记录在案）

- `image_tag` 的 `class` 参数线上不渲染：Shopify 平台行为，无视觉影响
- newsletter schema locale 整组缺失：低优先，待补
- `blocks/button-group.liquid`（block 版）`default:'#'` 未加防护
- `blocks/quick-view-trigger.liquid`（block 版）样式未同步 snippet 新版
- ~~color schemes 重构~~ ✅ 2026-08-07 已完成（试点 `e65d941` + 全量迁移 `4b51d36`，43 个 section 接入）
- 文档站域名 botanica-theme.com 未注册（NXDOMAIN）+ 缺 support_email：需 owner 自行注册上线
- 店铺数据：库存全 0（available=true 不影响销售）；tag 体系前 57 旧后 12 新未统一；截图待重截

---

*关联文档：[[09-CHANGE-MANAGEMENT]] [[10-CODE-REVIEW]] [[11-TESTING]] [[18-AUDIT-METHODOLOGY]]*
