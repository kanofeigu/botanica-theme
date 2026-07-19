# Botanica v3 — 商店操作指令

> 位置：`E:\ccfold\shopify\important\17-STORE-OPERATIONS.md`
> 用途：推送主题、打开预览/编辑器、获取 API token 等日常操作
> 最后更新：2026-07-10

---

## 商店信息

| 项目 | 值 |
|------|---|
| 商店名 | kano-u93kwgf9.myshopify.com |
| 主题 ID | 153451266239 |
| 主题名 | botanica-3-0-0 |
| 角色 | live（已发布） |

---

## 推送主题

```bash
# 必须加 --allow-live（因为主题是 live 状态，否则会弹交互确认）
shopify theme push --path botanica --store kano-u93kwgf9.myshopify.com --theme 153451266239 --allow-live --json
```

> ⚠ `--allow-live` 只在主题已经是 live 时需要。如果是 dev 主题不需要。
> ⚠ 不要混用 push/pull/dev，会丢 section group blocks（见 BUG-005）。

---

## 正确推送工作流（防止编辑器改动被覆盖）⚠

**问题**：`shopify theme push` 会用本地所有文件覆盖远程。模板 JSON（`templates/*.json`）和 `config/settings_data.json` 里存着用户在主题编辑器里做的图片选择、区块顺序、区块设置等数据。如果本地这些文件是旧的，push 后会冲掉编辑器改动。

**规则**：每次推送代码前，必须先拉取远程的配置和模板文件。

```bash
# 第1步：拉取远程配置（同步编辑器里的图片、区块设置等改动）
shopify theme pull --theme 153451266239 --store kano-u93kwgf9.myshopify.com --only "templates/*.json,config/settings_data.json,config/settings_schema.json"

# 第2步：推送全部代码（此时本地模板 JSON 已是最新，不会冲掉编辑器数据）
shopify theme push --path botanica --store kano-u93kwgf9.myshopify.com --theme 153451266239 --allow-live --json
```

> ⚠ 如果跳过第 1 步直接 push → 编辑器里保存的图片/区块设置会重置为本地旧状态。

---

## 打开预览页面

预览 URL 规则：`https://<store>/?preview_theme_id=<theme_id>`

```bash
# Windows — 在默认浏览器打开
start "" "https://kano-u93kwgf9.myshopify.com/?preview_theme_id=153451266239"
```

或者直接打开某个页面预览：
```bash
start "" "https://kano-u93kwgf9.myshopify.com/collections/all-plants"
```

> 当前主题是 live 状态，直接访问商店 URL 即可看到最新推送效果，不需要 `?preview_theme_id` 参数。

---

## 打开主题编辑器

编辑器 URL 规则：`https://admin.shopify.com/store/<store-handle>/themes/<theme_id>/editor`

```bash
# Windows — 在默认浏览器打开
start "" "https://admin.shopify.com/store/kano-u93kwgf9/themes/153451266239/editor"
```

---

## 获取 API Token（24h 过期）

```bash
curl -X POST https://kano-u93kwgf9.myshopify.com/admin/oauth/access_token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=dce5a09c5535810dc0c67b0f13e3c8c6" \
  -d "client_secret=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"
```

返回 `shpua_` token，有效期 24 小时。每次新会话可能需要重新获取。

---

## GraphQL 查询

```bash
TOKEN="shpua_xxx"

# 查询
curl -s -X POST "https://kano-u93kwgf9.myshopify.com/admin/api/2025-01/graphql.json" \
  -H "X-Shopify-Access-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(first: 10) { edges { node { id title } } } }"}'

# 修改（mutation）
curl -s -X POST "https://kano-u93kwgf9.myshopify.com/admin/api/2025-01/graphql.json" \
  -H "X-Shopify-Access-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { ... }"}'
```

---

## 代码验证

```bash
# 单文件检查
shopify theme check --path botanica

# 完整验证管线（theme check + CSS 链接 + JSON/BOM）
powershell -NoProfile -ExecutionPolicy Bypass -File verify.ps1
```

---

## 主题打包

```bash
shopify theme package --path botanica
```

---

## 快速双开（预览 + 编辑器）

```bash
start "" "https://kano-u93kwgf9.myshopify.com/collections/all-plants" && start "" "https://admin.shopify.com/store/kano-u93kwgf9/themes/153451266239/editor"
```

---

## 常见问题

| 问题 | 解决 |
|------|------|
| `shopify theme push` 弹交互确认 | 加 `--allow-live` |
| push 后前台不更新 | 检查是否开了密码保护（password_enabled） |
| API token 过期 | 重新获取（curl 见上） |
| push/pull 后导航 blocks 丢失 | 只用 push，不要 pull（BUG-005） |
| push 后编辑器改的图片/设置被重置 | push 前先 pull templates 和 settings_data，见上方「正确推送工作流」 |

---

*关联文档：[[16-API-REFERENCE]] [[13-BUG-LOG]]*
