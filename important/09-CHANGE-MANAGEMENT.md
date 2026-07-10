# Botanica v3 — 功能修改要求文档

> 位置：`E:\ccfold\shopify\important\09-CHANGE-MANAGEMENT.md`
> 每次更新功能都必须考虑与其关联的其他功能是否受影响
> 最后更新：2026-07-06

---

## 1. 修改前强制检查流程

修改任何文件前，必须完成以下 5 步检查：

### Step 1：识别影响范围

在 [[04-FEATURE-TREE]] 中查找你要修改的组件，确认它的所有 `→`（被依赖方）和 `⇄`（双向联动方）。

### Step 2：读取关联文件

修改 A 文件前，必须**至少读取**所有标记为 `→ A`（依赖 A）的文件，理解它们如何使用 A。

### Step 3：检查 CSS 变量依赖

确认修改不破坏 `design-tokens.css` 中任何被全站消费的变量。

### Step 4：检查 JS 事件依赖

确认修改不破坏 `window.theme.*` 自定义事件的 data schema。

### Step 5：运行验证

```bash
shopify theme check --path botanica    # 必须 0 error
```

---

## 2. 修改影响等级与对应流程

### 🔴 等级 1：修改全局基础设施

**涉及文件**：`design-tokens.css`、`base.css`、`theme.liquid`、`settings_schema.json`、`en.default.json`

**强制流程**：
1. 在 [[04-FEATURE-TREE]] §1 中确认所有依赖方
2. 修改后 grep 全项目确认无遗漏引用
3. `shopify theme check` 0 error
4. 手动检查至少 3 个不同页面（home / product / collection）

### 🟡 等级 2：修改核心 JS

**涉及文件**：`cart.js`、`variant-selects.js`、`gallery.js`、`quick-view.js`、`sticky-atc.js`

**强制流程**：
1. 在 [[04-FEATURE-TREE]] §8 中确认依赖图
2. 修改后检查所有监听该 JS 事件的组件
3. 测试 PDP 完整流程：变体切换 → 加车 → cart drawer 打开 → 关闭
4. 如果修改 `variant-selects.js`，测试 PDP + featured-product + quick-view

### 🟢 等级 3：修改单个 Block/Section

**涉及文件**：单个 `blocks/xxx.liquid` 或 `sections/xxx.liquid`

**强制流程**：
1. 确认该 block 被哪些 section/template 使用（grep type name）
2. 修改后检查所有使用该 block 的页面
3. 不破坏 `{{ block.shopify_attributes }}`（theme editor 依赖）

---

## 3. 具体修改场景示例

### 场景 A：改 design-tokens.css 中的颜色变量

```
修改 --bt-color-primary: #4A6B4F → #5B8B6F
  │
  ├─ 影响范围：全站所有使用 var(--bt-color-primary) 的元素
  │   ├─ .bt-btn--primary 背景色
  │   ├─ .bt-badge 背景色
  │   ├─ header active link 颜色
  │   ├─ cart count dot 颜色
  │   ├─ meter dot .is-on 颜色
  │   ├─ focus ring 颜色
  │   └─ ...所有 block 的 {% stylesheet %} 中引用此变量的地方
  │
  ├─ 检查方法：grep "bt-color-primary" *.css *.liquid → 确认所有使用点
  └─ 测试方法：home + product + collection 页面的所有按钮/徽章/链接颜色
```

### 场景 B：修改 variant-selects.js

```
修改变体切换逻辑
  │
  ├─ 直接影响：
  │   ├─ PDP product-price 价格更新
  │   ├─ PDP buy-buttons disabled 状态
  │   ├─ PDP gallery 主图切换
  │   ├─ URL query string (?variant=xxx)
  │   └─ window.theme.variantChange 事件
  │
  ├─ 间接影响：
  │   ├─ sticky-atc.js（监听 variantChange 事件）
  │   ├─ featured-product.liquid（同样使用 variant-picker block）
  │   └─ quick-view.js（弹窗内变体选择）
  │
  └─ 测试方法：
      1. PDP 页面切换变体 → 检查价格/ATC/图集
      2. 刷新 PDP → URL 中 variant 参数是否恢复上次选择
      3. featured-product section 中切换变体
      4. quick-view 弹窗中切换变体 → 加车
```

### 场景 C：修改 card-product.liquid snippet

```
修改产品卡 HTML 结构
  │
  ├─ 使用该 snippet 的位置：
  │   ├─ sections/featured-collection.liquid（首页）
  │   ├─ sections/main-collection-product-grid.liquid（分类页）
  │   ├─ sections/product-recommendations.liquid（PDP）
  │   └─ 可能的其他 section（featured-product、相关产品等）
  │
  ├─ 影响：
  │   ├─ 产品卡视觉（全局统一外观）
  │   ├─ care badge 显示
  │   ├─ quick-view 触发按钮
  │   └─ collection 页面的 AJAX 筛选（卡片的 class/DOM 结构被 JS 操作吗？→ 检查）
  │
  └─ 测试方法：home + collection + search + PDP recommendations 的产品卡一致性
```

### 场景 D：修改 en.default.json 翻译 key

```
修改/删除一个 t: key
  │
  ├─ 影响范围：所有使用该 key 的 .liquid 文件
  ├─ 检查方法：grep "t:old_key_name" *.liquid *.json → 确认所有引用
  ├─ 如果 key 被 section schema 使用：
  │   └─ 已保存的 templates/*.json 中可能有该 section 的配置 → 不会直接报错但翻译会丢失
  └─ 规则：可以新增 key，但不要删除/重命名已有 key（除非同步更新所有引用）
```

---

## 4. 联动测试清单（修改后必测）

### 修改任何与 PDP 相关的文件后：

- [ ] 产品页加载正常
- [ ] 变体切换：价格更新、ATC 按钮状态、主图切换
- [ ] 加车：cart drawer 打开、内容正确、免运费进度条
- [ ] 关闭 cart drawer：焦点归还
- [ ] 移动端：sticky ATC bar 显示/隐藏
- [ ] Quick view：弹窗打开/关闭、内部变体切换、内部加车

### 修改任何与 Collection 相关的文件后：

- [ ] 分类页加载正常
- [ ] 筛选：checkbox 点击、AJAX 刷新、URL 更新
- [ ] 排序：popover 打开/选择/关闭
- [ ] 浏览器后退：恢复到之前筛选状态
- [ ] 产品卡 hover：第二图显示、quick-view 按钮

### 修改任何与全局样式相关的文件后：

- [ ] Home 页面加载正常（14 个 sections 依次渲染）
- [ ] Product 页面加载正常
- [ ] Collection 页面加载正常
- [ ] Cart 页面加载正常
- [ ] 移动端（< 750px）布局正常
- [ ] 平板端（750-990px）布局正常
- [ ] 桌面端（> 990px）布局正常

---

## 5. 版本控制建议

```
每次修改前：
  记录当前 theme_version（config/settings_schema.json）
  确保可以在出错时回滚

每次修改后：
  更新 release-notes.md（merchant-facing 语言）
  更新本文件的"修改历史"表
```

---

## 6. 修改历史

| 日期 | 修改内容 | 修改文件 | 影响范围 | 验证结果 |
|------|---------|---------|---------|---------|
| 2026-07-06 | 添加 `--bt-border-width` / `--bt-border-style` CSS 变量 | `design-tokens.css` | 6 个 block 的边框样式 | theme check 0 error |
| 2026-07-06 | 移除 5 个 section 的 `color_scheme` 引用 | `apps.liquid`、`main-product.liquid`、`product-care-guide.liquid`、`product-recommendations.liquid`、`risk-free-guarantee.liquid` | 仅影响这些 section 的 schema + markup | theme check 0 error |
| 2026-07-07 | 修复 collection AJAX 拦截产品链接 | `main-collection-product-grid.liquid` | collection 页面所有产品卡点击 | BUG-004 修复 |
| 2026-07-07 | 3 级导航菜单重建 | Shopify 后台（menuUpdate API） | 全站导航 | 需要 theme editor 配置 mega blocks |
| 2026-07-07 | mega-promo block 支持 flyout_item（子菜单图片切换） | `sections/header.liquid`（schema + 渲染）、`locales/en.default.schema.json` | header mega menu 右侧 promo 列 | theme check 0 warning |
| 2026-07-07 | collection products_per_page 12→24 | `templates/collection.json` | collection 页面分页 | 需确认线上生效 |
| 2026-07-07 | header-group.json blocks 多次覆盖→最终清空 | `sections/header-group.json` | header section group 块配置 | 需在编辑器重建 |
| 2026-07-07 | 45→54 个 $0 产品批量设价 | API 数据操作 | 全店 69 个产品 | BUG-007 修复 |
| 2026-07-07 | 69 个产品发布到 Online Store | REST API `PUT /products/{id}.json` | 商店前台 | BUG-008 修复 |
| 2026-07-07 | 创建 10 个 metafield 定义 + 填充 69 个产品 | GraphQL `metafieldDefinitionCreate` + `metafieldsSet` | Search & Discovery 筛选 | 筛选用数据就绪 |
| 2026-07-07 | 主题打包 zip + 用户导入发布 | `shopify theme package` → admin 导入 | 新主题 #153451266239 | 用户在后台 Publish |
| 2026-07-07 | OAuth client_credentials 认证获取 token | Partner Dashboard App | API 操作权限 | `shpua_` token 24h 有效 |

---

*关联文档：[[04-FEATURE-TREE]] [[10-CODE-REVIEW]] [[11-TESTING]] [[13-BUG-LOG]]*
