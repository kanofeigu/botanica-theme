# Botanica v3 — API 快速启动指南

> 目的：下次新会话中，用本文档 30 秒内恢复 API 访问能力
> 生成时间：2026-07-10

---

## 凭据信息

| 项目 | 值 |
|------|-----|
| 店铺域名 | `kano-u93kwgf9.myshopify.com` |
| Client ID | `dce5a09c5535810dc0c67b0f13e3c8c6` |
| Client Secret | `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` |
| GraphQL 端点 | `https://kano-u93kwgf9.myshopify.com/admin/api/2026-07/graphql.json` |
| REST 端点 | `https://kano-u93kwgf9.myshopify.com/admin/api/2026-04/` |

---

## 步骤 1：获取 Token（PowerShell）

```powershell
$body = @{ 
    grant_type="client_credentials"
    client_id="dce5a09c5535810dc0c67b0f13e3c8c6"
    client_secret="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"
}
$r = Invoke-RestMethod -Uri "https://kano-u93kwgf9.myshopify.com/admin/oauth/access_token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
$r | ConvertTo-Json
# 返回: { "access_token": "shpua_xxx", "scope": "...", "expires_in": 86399 }
```

Token 有效期 24 小时。

---

## 步骤 2：查询产品列表（Python）

```python
import requests

TOKEN = "shpua_xxx"  # 替换为实际 token
API = "https://kano-u93kwgf9.myshopify.com/admin/api/2026-07/graphql.json"
HEADERS = {"X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json"}

query = """
query {
  products(first: 80) {
    nodes {
      id
      title
      handle
      status
      productType
      tags
      totalInventory
    }
  }
}
"""

resp = requests.post(API, json={"query": query}, headers=HEADERS)
data = resp.json()
for p in data["data"]["products"]["nodes"]:
    print(f"[{p['status']}] {p['title']} ({p['handle']}) - {p['productType']}")
```

---

## 常用 GraphQL 操作

### 更新产品价格

```graphql
mutation {
  productVariantsBulkUpdate(
    productId: "gid://shopify/Product/8479298748607"
    variants: [{ id: "gid://shopify/ProductVariant/...", price: "45.00" }]
  ) {
    productVariants { id price }
    userErrors { field message }
  }
}
```

### 删除产品

```graphql
mutation {
  productDelete(productId: "gid://shopify/Product/XXXX") {
    deletedProductId
    userErrors { field message }
  }
}
```

### 查询集合

```graphql
query {
  collections(first: 10) { nodes { id title handle productsCount { count } } }
}
```

---

## CLI 替代方案（无需 Token）

```bash
shopify store execute -s kano-u93kwgf9.myshopify.com --query-file query.gql --json
shopify store execute -s kano-u93kwgf9.myshopify.com --query-file mutation.gql --allow-mutations --json
```

---

## 注意事项

- Token 24h 过期，每次新会话需重新获取
- 依赖 `requests` 库（`pip install requests`）
- GraphQL API 版本 `2026-07`，文档参考 `16-API-REFERENCE.md`
