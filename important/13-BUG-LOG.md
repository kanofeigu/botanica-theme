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

*关联文档：[[09-CHANGE-MANAGEMENT]] [[10-CODE-REVIEW]] [[11-TESTING]]*
