# Botanica v3 — 注意文档：为什么有些问题需要反复提醒才能修复

> 位置：`E:\ccfold\shopify\important\15-LESSONS-LEARNED.md`
> 写给后续任何接手此项目的 AI 或开发者

---

## 核心问题诊断

今天出现了 8 个问题需要 2 次以上修复才解决。根因分析如下：

### 问题模式 1：假设数据而非验证数据

**表现**：博客 handle 用了 `field-journal` 和 `plant-care-journal`，实际是 `plant-care-journal-1`。

**根因**：我假设了 handle 的命名规则，没有用 API 查询实际数据。

**如何避免**：
- ✅ 操作任何 Shopify 资源前，**先用 `shopify store execute` 查询实际数据**
- ✅ 不要根据"命名惯例"推断 URL/handle/ID
- ✅ 创建链接前，用 `curl` 验证目标 URL 返回 200

---

### 问题模式 2：`theme check` 通过 ≠ 功能正常

**表现**：Schema 设置面板不显示，但 `shopify theme check` 0 error。实际原因是 option label 超过 Shopify 50 字符限制，整个 schema 被平台拒绝。

**根因**：`theme check` 只检查 Liquid 语法和 JSON 结构，不检查 Shopify 平台特定的限制（如 label 长度）。

**如何避免**：
- ✅ **每次修改 schema 后必须执行 `shopify theme push`**，push 的输出会报告平台级错误
- ✅ `theme check` = 语法层；`theme push` = 平台层。两者都要通过才算合格
- ✅ 记住 Shopify 平台限制：
  - Option label 最多 **50 字符**
  - Settings label 最多 **255 字符**
  - Section name 最多 **255 字符**
  - Block name 最多 **255 字符**

---

### 问题模式 3：修改后不验证视觉效果

**表现**：文章封面图被 `aspect-ratio: 21/9` 裁剪、SVG fallback 图被 `3/2` 裁剪、文字被 `truncate` 切出乱码。

**根因**：CSS 数值是用"设计直觉"写的，没有用实际内容测试。

**如何避免**：
- ✅ 修改 CSS 后，**用 `curl` 拉取实际页面 HTML，确认关键元素存在且结构正确**
- ✅ 图片比例问题：先用实际图片尺寸确认，再设 `aspect-ratio`
- ✅ 文字截断：用 `truncatewords` 而非 `truncate`（避免切断多字节 UTF-8 字符）
- ✅ 在 `object-fit: cover` 前先确认图片和容器的比例关系

---

### 问题模式 4：跨文件修改没有同步

**表现**：在 `main-article.liquid` schema 里用 `t:` key 引用 `en.default.schema.json`，但该文件缺少对应的 settings 定义。

**根因**：修改了 schema 的 label 引用方式（从硬编码字符串改为 t: key），但没有同步更新 locale 文件。

**如何避免**：
- ✅ **在 section 的 schema 中使用 `t:` key 后，必须同步检查 `en.default.schema.json`**
- ✅ 规则：`t:sections.{section_name}.settings.{setting_id}.label` → 需要在 `en.default.schema.json` → `sections.{section_name}.settings.{setting_id}.label` 有对应值
- ✅ 写一个快速 grep 检查：`grep "t:sections\." sections/*.liquid` → 逐一在 `en.default.schema.json` 中验证
- ✅ 对于硬编码字符串：不依赖 `t:` key 时，直接写字符串也能工作，但不利于 i18n

---

### 问题模式 5：没有在真实环境中验证

**表现**：dev server 多次返回 500，每次都要手动重启。但我在修改过程中没有检测到。

**根因**：修改文件后只跑 `theme check`，没有检查 dev server 是否还活着、页面是否正常渲染。

**如何避免**：
- ✅ **修改关键文件后，必须做一次 `curl http://127.0.0.1:9292/` 验证 200**
- ✅ 如果返回非 200，优先排查 dev server 状态
- ✅ 批量修改多个文件后，至少抽查 3 个页面（首页/博客/文章）

---

### 问题模式 6：组件设计时没有考虑实际内容

**表现**：首页博客区用了手动卡片（manual cards）写死的内容，而不是拉取实际博客文章。

**根因**：我先创建了 demo 内容而非接入真实数据源。

**如何避免**：
- ✅ **优先连接真实数据源**（blog articles 用 `use_manual: false`），手动内容仅作 fallback
- ✅ 创建 demo 内容时同步创建真实内容（或确保 demo 指向的资源存在）
- ✅ 规则：如果 section 有 `blog` 设置，默认值应该是实际存在的 blog handle

---

## 完整修复检查清单（修改后必做）

### 每次修改代码后：

```
□ shopify theme check --path botanica      # 语法检查
□ shopify theme push（如果是 schema 改动）  # 平台限制检查
□ curl http://127.0.0.1:9292/ → 200       # Dev server 存活
□ curl 修改涉及的实际页面 → 200            # 页面正常渲染
□ grep 新增的 t: key → 在 locale 文件中验证 # 翻译不漏
```

### 每次修改 CSS 后：

```
□ 检查 aspect-ratio 与图片实际比例一致
□ 检查 object-fit: cover 不会裁剪关键内容
□ 检查 truncate/truncatewords 不会切乱码
□ 检查颜色值是否使用 var(--bt-*) 无硬编码
```

### 每次操作 Shopify 数据后：

```
□ 查询实际数据（menu/blog/article handle），不假设
□ 用 API 验证修改结果
□ 刷新预览页确认
```

---

## Shopify 平台常量速查

| 限制项 | 值 |
|--------|-----|
| Option label 最大长度 | 50 字符 |
| Settings label 最大长度 | 255 字符 |
| Section/Block name 最大长度 | 255 字符 |
| 预设数量上限 | 5 |
| 预设文件大小上限 | 1.5 MB |
| JS 体积指南值 | ≤ 16 KB minified |
| Lighthouse 性能门槛 | ≥ 60 |
| Lighthouse 无障碍门槛 | ≥ 90 |
| 对比度正文 | 4.5:1 |
| 对比度大字 | 3:1 |
| 触控目标 | ≥ 24×24px (CTA 44×44) |

---

## 开发服务器

| 操作 | 命令 |
|------|------|
| 启动 | `shopify theme dev --path botanica` |
| 检查状态 | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292` |
| 杀掉卡死进程 | `netstat -ano \| grep ":9292.*LISTENING"` → `taskkill //F //PID <id>` |
| 推送主题 | `shopify theme push --path botanica --theme 153130598591` |
| GraphQL 查询 | `shopify store execute --store kano-u93kwgf9.myshopify.com --query '...'` |
| GraphQL 修改 | 同上 + `--allow-mutations` |

---

## 2026-07-07 新增教训

### 问题模式 7：不读项目专属文档就开始动手

**表现**：`important/` 目录有 15 个文件（架构、生命周期、功能树、修改检查、bug 日志、经验教训等），但整个 07-07 会话的前半段完全没有读取这个目录。README.md 第 6 行写了 `>开始指令"继续 Botanica 项目"`，这就是入口指令，但被跳过。结果把 07-06 已经修好的所有坑又精准踩了一遍。

**如何避免**：
- ✅ **用户说"继续"时，第一件事是读 `important/README.md`**
- ✅ CLAUDE.md 已经加上了这条规则（见 `CLAUDE.md` 顶部）
- ✅ 不要凭记忆或"上次知道的东西"直接干活——项目每个会话都可能有人改过

---

### 问题模式 8：改完代码不测试页面

**表现**：改了 AJAX 导航代码后只跑 `theme check`（0 error），没有手动打开 collection 页面点一个产品链接试试。结果所有产品链接都卡死，用户反馈才知道。

**如何避免**：
- ✅ **修改任何 JS 交互逻辑后，必须手动在预览中测试关键路径**
- ✅ 改 collection 页面 → 测试：筛选、排序、点产品卡、浏览器后退
- ✅ 改 PDP → 测试：变体切换、加车、弹窗
- ✅ 改 header → 测试：桌面导航 hover、移动端汉堡菜单、mega menu flyout
- ✅ `theme check` 只管 Liquid/JSON 语法，管不了 JS 逻辑和页面交互

---

### 问题模式 9：push/pull/dev 三线混用导致数据丢失

**表现**：同时开了 `shopify theme dev`（双向同步）、多次 `shopify theme push`、多次 `shopify theme pull`。header-group.json 里的块配置在这三个操作之间反复被覆盖，最终丢失。

**如何避免**：
- ✅ **一次会话只用一种同步方式**
  - 用 `shopify theme dev` → 就别再 push/pull，编辑器改的东西自动同步到本地
  - 用 `shopify theme push` → 先 pull 一次对齐，然后只 push 不 pull
- ✅ **Section group 的块数据极易丢失**——header-group.json 和 footer-group.json 的 blocks 字段存在本地，但由编辑器管理。push 空的会覆盖编辑器里配好的
- ✅ **改 block 配置优先在编辑器里做**，不要直接写 JSON

---

### 问题模式 10：实现功能时过度修改渲染逻辑

**表现**：用户问"图片能不能关联子菜单"（= 能否给 mega-promo block 加 flyout_item 绑定 Level 2）。正确做法：在 schema 加一个 text 字段 + 在渲染时给 div 加 `data-promo-for` 属性（现有 `switchPromo` JS 函数已支持）。实际做法：重写了整个 promo 列的渲染循环，嵌套三层 Liquid，改 DOM 结构，引入 CSS 布局 bug，最后全部回退。

**如何避免**：
- ✅ **先确认现有代码是否已支持你要的功能**——`switchPromo` 函数已经处理 `data-promo-for` + `bt-mega__promo--hidden` 切换
- ✅ **新功能 = 最小改动**。加一个属性就够的，不要动渲染循环
- ✅ **改之前 grep 相关函数名**——`switchPromo` 已经存在，读一下就知道了
- ✅ 方案先说给用户确认，再动手

---

### 问题模式 11：没有先查 Shopify 最新 API 规范就写代码

**表现**：产品导入脚本用了 REST API（2025 年 2 月已废弃），`shopify graphql` 命令不存在（CLI 4.x 改了命令结构），`productCreate` 不支持 `variants` 字段（2026 API 拆成了两步）。反复试了 5 种方案才找到 `shopify store execute`。

**如何避免**：
- ✅ **先查 `shopify` CLI 当前版本有什么命令**：`shopify help` → `shopify help store`
- ✅ **查 API changelog**：`WebSearch "Shopify Admin API 2026-07 breaking changes"`
- ✅ 不要假设"上次能用的现在还能用"——Shopify API 每季度改

---

### 问题模式 12：产品创建 ≠ 产品上架

**表现**：API 创建产品（`status: ACTIVE`）、加入集合、设好价格——但商店前台一个都看不到。
**根因**：2026 年产品创建后需要**显式发布到销售渠道**。`status: ACTIVE` 只让产品在 admin 可见，不自动发布到 Online Store。
**如何避免**：
- ✅ 创建产品后用 REST API `PUT /products/{id}.json` + `{"product":{"published":true}}` 发布
- ✅ 或 GraphQL `publishablePublish`（需要 `write_publications` scope）
- ✅ 不要假设 "ACTIVE = 前台可见"

---

### 问题模式 13：GraphQL mutation 返回成功 ≠ 数据已变更

**表现**：`productVariantsBulkUpdate` 用了错误 product ID（handle 而不是数字 ID），CLI 返回成功，但所有价格仍是 $0。
**根因**：GraphQL 对不存在的资源 ID 可能返回空数组而非 error，静默失败。
**如何避免**：
- ✅ 批量变更后**必须抽样验证**：拉取 2-3 个数据确认
- ✅ 使用 `product.id`（`gid://shopify/Product/123`）而非 `product.handle`

---

### 问题模式 14：REST API 虽被标记 deprecated 但仍有用

**表现**：GraphQL `publishablePublish` 需要特殊 scope 权限；REST `PUT /products/{id}.json` 的 `published` 字段仍有效且不需要额外 scope。
**如何避免**：
- ✅ REST API 标记 deprecated 不意味着立即失效——部分端点仍稳定
- ✅ 遇到权限问题时先试 REST 替代方案
- ✅ `write_products` scope 的 REST 权限范围比 GraphQL 同名 scope 广

---

### 问题模式 15：2026 年认证方式已全面改变

**表现**：用户提供 `shpss_`（Client Secret）+ `client_id`，不是旧的 `shpat_` token。需要 OAuth client_credentials 换临时 token。
**如何避免**：
- ✅ 2026-01 起不再支持后台创建 Custom App 的 `shpat_` token
- ✅ 新流程：Partner Dashboard → 配置 scope → `POST /admin/oauth/access_token` → 24h 过期 token
- ✅ Token scope 变更后需重新获取（不会自动刷新 scope）

---

### 问题模式 16：合规审计 ≠ 功能验证（2026-07-10 新增）

**表现**：本次会话对项目做了"全面审计"——跑 theme check（0 error）、verify.ps1（3/3 PASS）、检查 Dawn 代码（零引用）、检查 @app 支持（全覆盖）、统计文件数（107 liquid + 40 blocks + 47 sections）、验证 i18n（60KB+）——然后宣布"代码已提交就绪，~94% 完成"。

但用户随后发现了 4 个实际功能 Bug：
1. **价格筛选**是硬编码分档（`steps = '50,100,200'`），商家无法自定义
2. **集合页快捷加车按钮**完全无功能（`<button type="button">`，无 JS 处理）
3. **PDP 加车按钮**点了没反应（`form="{{ product_form_id }}"` 在 block 里拿不到值）
4. **店面有密码保护**导致 curl 拉不到页面、筛选不工作

**根因**：审计跑的是**静态代码检查**（语法、模式匹配、文件计数），但**没有执行任何功能测试路径**：
- 没有打开集合页点一个 + 按钮加车
- 没有打开 PDP 选变体后点 Add to cart
- 没有在集合页操作价格筛选
- 没有 `curl` 实际页面验证返回 200 而非 302 到密码页

**为什么静态检查发现了 Dawn 代码、JSON 注释、@app 缺失这种问题，却漏了加车功能这种基本 Bug？**

因为检查清单是**从合规文档（`04-COMPLIANCE.md`）推导出来的**，不是从**用户行为路径**推导出来的。我检查了：
- 文件存不存在 → ✅
- 语法对不对 → ✅
- Dawn 代码有没有 → ✅
- 模板支不支持 @app → ✅

但我没有检查：
- **用户能不能完成一次完整的购物流程**（浏览→筛选→加车→结账）
- **每个按钮点击后有没有反应**
- **表单能不能成功提交**
- **店面能不能正常访问**

**如何避免**：
- ✅ **每次审计后必须手动走 3 条核心用户路径**：
  1. **首页 → 集合页 → 筛选 → 点+加车 → 购物车有商品**
  2. **首页 → 点产品 → PDP → 选变体 → 点 Add to cart → 购物车有商品**
  3. **首页 → 导航 hover → mega menu 展开 → 点子菜单 → 跳转正确**
- ✅ **不要用"代码结构合理"代替"功能可工作"**
- ✅ 合规门禁（theme check / verify / Dawn scan）是**必要条件**，不是**充分条件**
- ✅ Shopify 主题的验证层次：① Liquid 语法 → ② 平台限制 → ③ **用户交互 → ④ 业务流程**。只做到①②就宣布完成是错的
- ✅ `curl` 实际页面 URL → 确认返回 200（不是 302/密码页）→ 检查关键 DOM 元素存在

---

## Shopify 平台常量速查（更新）

| 限制项 | 值 |
|--------|-----|
| Header section 最大 block 数 | **8** |
| 菜单最大嵌套层级 | 3 |
| `products_per_page` 上限 | 48 |
| REST Admin API 产品端点 | 标记 deprecated 但 `published` 仍有效 |
| CLI GraphQL 命令 | `shopify store execute` |
| CLI 版本 | 4.4.0 |
| OAuth token 端点 | `POST /admin/oauth/access_token` |
| Token 有效期 | 24 小时（client_credentials） |
| Token 前缀 | `shpua_`（新）vs `shpat_`（旧/已废弃） |

---

*关联文档：[[13-BUG-LOG]] [[09-CHANGE-MANAGEMENT]] [[10-CODE-REVIEW]] [[11-TESTING]]*
