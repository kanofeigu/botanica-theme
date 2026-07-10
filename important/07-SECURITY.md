# Botanica v3 — 安全性文档

> 位置：`E:\ccfold\shopify\important\07-SECURITY.md`
> Shopify 主题的前端安全注意事项
> 最后更新：2026-07-06

---

## 1. Shopify 平台安全基础

Shopify 主题运行在 Shopify CDN 上，托管在 `*.myshopify.com` 域名下。Shopify 负责：
- 服务器安全、DDoS 防护、TLS 加密
- 支付安全（PCI-DSS 合规）
- 管理后台认证

**主题开发者需要关注的是前端安全**。

---

## 2. XSS（跨站脚本）防护

### 2.1 Liquid 自动转义

Shopify Liquid 默认对所有 `{{ }}` 输出进行 HTML 转义：

```liquid
{{ product.title }}       → 自动转义 < > " ' &
{{ product.title | escape }} → 显式转义（等效）

{{ section.settings.body }}  → richtext 输出（不转义，允许 HTML）
```

**规则**：
- ✅ 纯文本 → 用 `{{ }}` 或 `| escape`
- ✅ 商家 richtext → 用 `{{ }}`（Shopify 在保存时已消毒 HTML）
- ❌ 绝不直接输出 `{{ request.params.* }}` 或 URL query string

### 2.2 JavaScript 上下文中的转义

```liquid
{% comment %} ✅ 正确：用 json filter 自动转义 {% endcomment %}
<script>
  window.theme.productTitle = {{ product.title | json }};
  window.theme.moneyFormat = {{ shop.money_format | json }};
</script>

{% comment %} ❌ 错误：无转义，标题含引号会破坏 JS {% endcomment %}
<script>
  window.theme.productTitle = "{{ product.title }}";  // 如果标题含 " 会破坏语法
</script>
```

本主题中所有 JS 数据注入均使用 `| json` filter（参见 `theme.liquid` 和 `main-product.liquid`）。

### 2.3 HTML 属性中的转义

```liquid
{% comment %} ✅ 正确 {% endcomment %}
data-label="{{ block.settings.label | escape }}"
aria-label="{{ 'products.product.add_to_cart' | t | escape }}"

{% comment %} ❌ 危险：用户输入直接放入属性 {% endcomment %}
data-label="{{ block.settings.label }}"
```

---

## 3. CSRF（跨站请求伪造）防护

Shopify 自动处理 CSRF 保护：
- 所有 POST 请求通过 `form` 标签自动附带 CSRF token
- `fetch('/cart/add.js')` 等 API 请求不需要额外 token（Shopify 自动验证 Origin/Referer）

**主题无需额外处理 CSRF**。

---

## 4. 数据注入安全

### 4.1 商家输入 → Liquid → HTML

```
商家在 theme editor 输入
  ↓
Shopify 保存到 settings_data.json（纯文本）
  ↓
Liquid {{ }} 渲染时自动 HTML 转义
  ↓
浏览器安全显示
```

**风险点**：`richtext` 类型设置允许 HTML，但 Shopify 在保存时已消毒（移除 `<script>`、`onerror=` 等）。

### 4.2 URL 安全

```liquid
{% comment %} ✅ Shopify 自动验证 URL 在白名单内 {% endcomment %}
<a href="{{ routes.cart_url }}">Cart</a>

{% comment %} ✅ 商家输入的 URL 通过 url 类型设置（Shopify 验证格式） {% endcomment %}
<a href="{{ block.settings.link }}">Link</a>

{% comment %} ❌ 绝不硬编码外部 URL 跳转 {% endcomment %}
```

---

## 5. 敏感数据保护

### 5.1 不暴露的数据

以下数据**不在前端**渲染（Shopify 只在服务端处理）：
- 客户密码
- 完整信用卡号
- 商家 API 密钥

### 5.2 前端可能暴露的数据（安全范围内）

- 产品信息（title/description/price/image）—— 公开数据
- Cart 内容 —— 仅当前会话
- 商家设置（颜色/字体/布局）—— 公开数据
- `shop.money_format` —— 公开数据

### 5.3 不在代码中硬编码

```liquid
{% comment %} ❌ 绝不 {% endcomment %}
{% assign api_key = "shpat_xxxxxxxxxxxx" %}

{% comment %} ❌ 绝不 {% endcomment %}
const STRIPE_KEY = "pk_live_xxxxxxxx";
```

---

## 6. 第三方 App 安全

### 6.1 App Block 隔离

`@app` blocks 在独立的沙盒中运行：
- App 的 JS/CSS 由 Shopify 管理
- App 无法访问主题的 Liquid 变量
- App 只能通过 `block.settings` 接收商家配置的数据

### 6.2 apps.liquid 样式协调

本主题的 `sections/apps.liquid` 使用通用选择器协调常见 review app 的外观，但**不深度耦合**任何单一 app 的内部 DOM。这是 Theme Store 合规要求。

---

## 7. 文件安全

| 文件 | 安全检查 |
|------|---------|
| `config/settings_data.json` | 无硬编码 API key / token |
| `locales/en.default.json` | 无敏感信息，仅翻译文本 |
| 所有 `.liquid` 文件 | 无内嵌外部脚本 / 追踪代码 |
| 所有 `.js` 文件 | 零外部 CDN 依赖 |

---

## 8. 提交安全清单

- [ ] 无硬编码 API key / token / 密码
- [ ] 所有用户输入通过 `| escape` 或 `| json` 过滤
- [ ] 无 `eval()`、`new Function()`、`innerHTML` 直接拼接用户输入
- [ ] 无外部 CDN / 第三方 JS 库引用
- [ ] 无隐藏的追踪/分析脚本
- [ ] `fetch()` 只请求 Shopify 自有域名（`/cart.js`、`/search/suggest`、`/recommendations/products`）
- [ ] `form` action 只指向 Shopify 路由
- [ ] 所有链接用 `routes.*` 而非硬编码 URL
- [ ] 无 `<iframe>` 嵌入外部内容

---

*关联文档：[[01-ARCHITECTURE]] [[09-CHANGE-MANAGEMENT]] [[11-TESTING]]*
