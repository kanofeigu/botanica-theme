# Botanica v3 — API 参考 & 项目技巧

> 位置：`E:\ccfold\shopify\important\16-API-REFERENCE.md`
> 最后更新：2026-07-07

---

## 1. 认证：获取 API Token

### 方法 A：OAuth Client Credentials（推荐）

```bash
curl -X POST https://kano-u93kwgf9.myshopify.com/admin/oauth/access_token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=dce5a09c5535810dc0c67b0f13e3c8c6" \
  -d "client_secret=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"
```

返回 `{"access_token":"shpua_xxx","scope":"...","expires_in":86399}`（24 小时过期）

### 方法 B：CLI 自带认证（无 token 文件，无 24h 限制）

```bash
shopify store execute -s kano-u93kwgf9.myshopify.com --query-file query.gql --json
shopify store execute -s kano-u93kwgf9.myshopify.com --query-file mutation.gql --allow-mutations --json
```

**选哪个**：
- 批量操作、复杂查询 → 方法 A（token 用 fetch/node 脚本）
- 单次查询/修改 → 方法 B（直接 CLI，零配置）

---

## 2. GraphQL API 常用操作

### 查询产品

```graphql
query {
  products(first: 80, query: "vendor:Botanica") {
    nodes {
      id          # gid://shopify/Product/123456
      title
      handle
      status
      tags
      totalInventory
      variants(first: 1) { nodes { id price inventoryQuantity } }
    }
  }
}
```

### 查询集合

```graphql
query {
  collectionByHandle(handle: "all-plants") {
    id
    title
    productsCount { count }
    products(first: 24) { nodes { title handle status } }
  }
}
```

### 创建产品（两步）

```graphql
# Step 1：创建产品（自动生成 $0 默认变体）
mutation {
  productCreate(product: {
    title: "Plant Name"
    handle: "plant-handle"
    vendor: "Botanica"
    productType: "Indoor Plant"
    tags: ["care-easy", "light-low"]
    status: ACTIVE
  }) {
    product { id variants(first: 1) { nodes { id } } }
    userErrors { field message }
  }
}

# Step 2：替换默认变体（设价格/SKU）
mutation {
  productVariantsBulkCreate(
    productId: "gid://shopify/Product/123"
    variants: [{
      price: "29.99"
      compareAtPrice: "39.99"
      sku: "SKU-001"
      optionValues: [{ optionName: "Size", name: "6 inch" }]
      requiresShipping: true; taxable: true
    }]
    strategy: REMOVE_STANDALONE_VARIANT
  ) {
    productVariants { id price }
    userErrors { field message }
  }
}
```

### 更新变体价格

```graphql
mutation {
  productVariantsBulkUpdate(
    productId: "gid://shopify/Product/123"
    variants: [{ id: "gid://shopify/ProductVariant/456", price: "35.00" }]
  ) {
    productVariants { id price }
    userErrors { field message }
  }
}
```

### 创建 Metafield 定义（筛选用）

```graphql
mutation {
  metafieldDefinitionCreate(definition: {
    namespace: "botanica"
    key: "care_level"
    name: "Care Level"
    type: "single_line_text_field"
    ownerType: PRODUCT
    pin: true
    capabilities: {
      smartCollectionCondition: { enabled: true }
      adminFilterable: { enabled: true }
    }
  }) {
    createdDefinition { id key }
    userErrors { field message }
  }
}
```

### 批量填充 Metafield

```graphql
mutation($m: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $m) {
    metafields { id }
    userErrors { field message }
  }
}
# variables: { m: [{ ownerId: "gid://shopify/Product/123", namespace: "botanica", key: "care_level", value: "easy", type: "single_line_text_field" }, ...] }
```

### 导航菜单操作

```graphql
# 查询
query { menus(first: 10) { nodes { id handle title items { id title type url items { id title type url } } } } }

# 重建（全量替换）
mutation {
  menuUpdate(id: "gid://shopify/Menu/242607915199", title: "Main menu", items: [
    { title: "Shop Plants", type: HTTP, url: "/collections/all-plants", items: [
      { title: "By Care", type: HTTP, url: "#", items: [
        { title: "Easy", type: HTTP, url: "/collections/all-plants?filter.v.tags=care-easy" }
      ]}
    ]}
  ]) {
    menu { id }
    userErrors { field message }
  }
}
```

---

## 3. REST API（已标记 deprecated 但以下操作仍有效）

### 发布产品到 Online Store

```javascript
fetch('https://store.myshopify.com/admin/api/2026-04/products/123.json', {
  method: 'PUT',
  headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ product: { id: 123, published: true } })
});
```

### 查询所有产品（简单）

```javascript
fetch('https://store.myshopify.com/admin/api/2026-04/products.json?vendor=Botanica&limit=80&fields=id,title,tags', {
  headers: { 'X-Shopify-Access-Token': TOKEN }
});
```

---

## 4. Node.js 脚本模板

```javascript
// 方法 1：用 token（批量操作）
const T = 'shpua_xxx';
const G = 'https://store.myshopify.com/admin/api/2026-07/graphql.json';
const H = { 'X-Shopify-Access-Token': T, 'Content-Type': 'application/json' };
async function gql(q, v) {
  return (await fetch(G, { method: 'POST', headers: H, body: JSON.stringify({ query: q, variables: v }) })).json();
}
// 使用：const data = await gql('{products(first:5){nodes{id title}}}');

// 方法 2：用 CLI（单次操作）
import { execSync } from 'child_process';
const result = JSON.parse(execSync(
  `shopify store execute -s store.myshopify.com --query-file query.gql --allow-mutations --json`,
  { encoding: 'utf8' }
));
```

---

## 5. 项目技巧

### 代码修改前
- **先读 `important/`**，特别是 `04-FEATURE-TREE.md`（依赖关系）和 `09-CHANGE-MANAGEMENT.md`（修改流程）
- `grep` 你要改的变量/函数名，确认影响范围
- 方案先说给用户确认，再动手

### 代码修改后
- `shopify theme check --path botanica` 必须 0 error
- **修改 JS 后必须手动测试页面**（theme check 管不了 JS 逻辑）
- 修改 header → 测试：桌面 hover、移动端汉堡、mega menu flyout
- 修改 collection → 测试：筛选、排序、点产品卡、浏览器后退
- 修改 PDP → 测试：变体切换、加车、弹窗

### 同步策略
- `shopify theme dev`（双向同步）和 `shopify theme push`（单向写）**只选一种**，不要混用
- Section group 的 blocks（header-group.json, footer-group.json）极易在 push/pull 中丢失
- 用户编辑器里配的 blocks 数据 → 用 dev 模式自动同步，不要手动写 JSON 覆盖

### Shopify 平台限制速查
| 限制 | 值 |
|------|-----|
| Header section 最大 blocks | 8 |
| 菜单最大嵌套 | 3 级 |
| products_per_page 上限 | 48 |
| Schema option label 最大 | 50 字符 |
| 预设数量上限 | 5 |
| 预设文件上限 | 1.5 MB |
| JS 体积指南值 | ≤ 16 KB minified |
| Lighthouse 性能 | ≥ 60 |
| Lighthouse 无障碍 | ≥ 90 |

### 常见坑
- `productCreate` 不设价格 → 默认变体 $0 → 前台可能不显示
- `productCreate` 后必须显式发布（REST `published: true`）
- GraphQL 用错 ID 格式（handle 代替数字 ID）→ 静默失败不报错
- OAuth token 24h 过期 → 每次新会话可能需要重新获取
- `shopify graphql` 命令不存在 → 用 `shopify store execute`
- 密码保护的商店 → 前台无法 curl 访问 → 用 Admin API 验证数据

### 导航相关
- 导航菜单数据在 Shopify 后台，**不随主题代码 push/pull**
- 用 `menuUpdate` API 可全量重建
- 3 级菜单：Level 1（顶级）→ Level 2（侧栏）→ Level 3（flyout 面板）
- `header-group.json` 有 blocks 字段存 mega menu 的 promo/link/collection 块

### 产品相关
- CSV 只是本地模板，需要手动导入或 API 创建
- 产品 tag 格式：`care-easy`、`light-medium`、`floor-plant`、`color-green`
- 一个产品可以绑多个 tag，tag 之间逗号分隔
- Metafield 用作筛选源需要 `adminFilterable: {enabled: true}`
