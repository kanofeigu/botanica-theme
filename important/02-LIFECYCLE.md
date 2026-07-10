# Botanica v3 — 生命周期文档

> 位置：`E:\ccfold\shopify\important\02-LIFECYCLE.md`
> 每个组件和功能从创建→使用→联动→销毁的完整生命周期
> 最后更新：2026-07-06

---

## 核心概念

Shopify 主题的生命周期与 SPA 框架不同。组件生命周期分为三个层面：
1. **Liquid 渲染生命周期**（服务端，发生在 Shopify CDN）
2. **Custom Element / JS 组件生命周期**（客户端，浏览器中）
3. **Theme Editor 中商家交互生命周期**（管理后台）

---

## 1. Liquid 渲染生命周期（所有 .liquid 文件）

### 1.1 页面请求 → HTML 输出

```
HTTP 请求到达 Shopify CDN
  │
  ├─ 1. 解析模板 JSON（templates/*.json）
  │     └─ 读取 sections / order / blocks 配置
  │
  ├─ 2. 渲染 layout/theme.liquid
  │     ├─ <head> 阶段
  │     │   ├─ 注入 settings_colors_* → --bt-color-* CSS 变量
  │     │   ├─ 加载 design-tokens.css（全局令牌）
  │     │   ├─ 加载 base.css（基础样式）
  │     │   ├─ 加载 effects.css（动效）
  │     │   ├─ 加载 botanical-effects.css（植物特效）
  │     │   ├─ font_face 加载字体
  │     │   └─ {{ content_for_header }}（Shopify 注入：分析、app snippet 等）
  │     │
  │     ├─ <body> 阶段
  │     │   ├─ skip-link（无障碍跳转）
  │     │   ├─ {% sections 'header-group' %} → 渲染 header.liquid
  │     │   ├─ <main> {{ content_for_layout }}
  │     │   │   └─ 按 templates/*.json 的 order 数组依次渲染每个 section
  │     │   │       └─ 每个 section:
  │     │   │           ├─ section.liquid 外壳
  │     │   │           ├─ {% content_for "blocks" %} 渲染子块
  │     │   │           │   └─ 每个 block.liquid:
  │     │   │           │       ├─ Liquid 逻辑（读 block.settings）
  │     │   │           │       ├─ HTML markup
  │     │   │           │       ├─ {% stylesheet %} → Shopify 收集并去重
  │     │   │           │       └─ {% javascript %} → Shopify 收集并去重
  │     │   │           └─ {% schema %}（只用于 theme editor，不输出 HTML）
  │     │   │
  │     │   ├─ {% sections 'footer-group' %} → 渲染 footer.liquid
  │     │   ├─ cart drawer（如果 settings.cart_type == 'drawer'）
  │     │   ├─ predictive search 容器
  │     │   ├─ quick-view 容器（<bt-quick-view>）
  │     │   └─ <script> 标签（cart.js / search.js / quick-view.js / sticky-atc.js）
  │     │
  │     └─ HTML 完整输出 → 发送给浏览器
```

### 1.2 Section 渲染条件

每个 section 必须处理**空状态**（无数据/无 blocks 时不应输出孤立标签）：

```liquid
{%- if section.settings.heading != blank or section.blocks.size > 0 -%}
  <section class="bt-section bt-xxx">...</section>
{%- endif -%}
```

### 1.3 Block 渲染条件

```liquid
{%- if block.settings.text != blank -%}
  <p class="bt-eyebrow" {{ block.shopify_attributes }}>{{ block.settings.text }}</p>
{%- endif -%}
```

`{{ block.shopify_attributes }}` 是关键——它注入 data 属性让 theme editor 的"拖动排序/选中高亮"功能正常工作。

---

## 2. JS 组件生命周期（客户端）

### 2.1 cart.js — 购物车状态管理

```
┌─ 页面加载（DOMContentLoaded）
│   ├─ 初始化：querySelector 获取 cart drawer / ATC buttons
│   ├─ 绑定事件：
│   │   ├─ click [data-cart-open]    → 打开 cart drawer
│   │   ├─ click [data-cart-close]   → 关闭 cart drawer
│   │   ├─ click [data-cart-overlay] → 点击遮罩关闭
│   │   ├─ submit form[action*="cart"] → AJAX 加车
│   │   └─ keydown Escape            → 关闭 drawer
│   │
│   ├─ 加车流程：
│   │   ├─ 阻止默认表单提交
│   │   ├─ fetch('/cart/add.js') POST
│   │   ├─ 成功后 fetch('/cart.js') GET 获取最新 cart 状态
│   │   ├─ 更新 cart drawer 内容（商品列表/价格/免运费进度条）
│   │   ├─ 更新 header cart count dot
│   │   ├─ 打开 cart drawer
│   │   └─ aria-live 播报 "Item added to your cart"
│   │
│   └─ 销毁：无（cart.js 存在于整个页面生命周期）
│
├─ 变体切换联动（由 variant-selects.js 触发）
│   └─ 更新隐藏 input[name="id"] → cart.js 读取最新 variant ID
│
└─ sticky-atc.js 联动
    └─ 移动端 sticky bar 的 ATC 按钮复用同一个 form submit 事件
```

### 2.2 variant-selects.js — 变体选择器

```
┌─ 创建（main-product.liquid 中包含 variant-picker block 时）
│   ├─ 自定义元素 <variant-selects> 挂载
│   ├─ 读取 data-section / data-url / data-picker-type
│   ├─ 解析产品 JSON（data-variants 脚本标签）
│   │
│   ├─ 绑定事件：
│   │   ├─ change input[type="radio"] → 变体切换
│   │   └─ 可选：swatch hover → 预览图片
│   │
│   ├─ 变体切换流程：
│   │   ├─ 获取选中的 option values
│   │   ├─ 在 variants 数组中匹配 variant
│   │   ├─ 更新隐藏 input[name="id"]（cart.js 读取）
│   │   ├─ 更新 data-variant-id 属性
│   │   ├─ 更新价格显示（data-current-price）
│   │   ├─ 更新 compare_at_price 显示
│   │   ├─ 更新库存状态（data-aria-live 播报）
│   │   ├─ 更新 ATC 按钮 disabled 状态
│   │   ├─ 切换 gallery 主图（data-gallery-main）
│   │   ├─ 更新 URL（pushState）保持可分享
│   │   └─ 触发 window.theme.variantChange 自定义事件
│   │
│   ├─ 与其他组件联动：
│   │   ├─ → cart.js：变体 ID 变更 → 下次加车用新 variant
│   │   ├─ → gallery.js：主图切换
│   │   ├─ → sticky-atc.js：移动端 ATC 按钮同步 disabled/价格
│   │   └─ → quick-view.js：弹窗内变体切换
│   │
│   └─ 销毁：页面跳转时自然销毁；theme editor 中 section 被移除时 DOM 移除
```

### 2.3 gallery.js — 产品图集缩放

```
┌─ 创建（main-product.liquid 中存在 .bt-product__gallery 时）
│   ├─ 获取所有缩略图按钮（[data-gallery-thumb]）
│   ├─ 获取主图区域（[data-gallery-main]）
│   ├─ 获取 zoom dialog（#bt-gallery-zoom-{{ section.id }}）
│   │
│   ├─ 绑定事件：
│   │   ├─ click [data-gallery-thumb] → 切换主图
│   │   ├─ click [data-zoom-open]     → 打开 zoom dialog
│   │   ├─ click [data-zoom-close]    → 关闭 zoom dialog
│   │   ├─ click [data-zoom-prev]     → 上一张
│   │   ├─ click [data-zoom-next]     → 下一张
│   │   ├─ keydown Escape/ArrowLeft/ArrowRight → 导航
│   │   └─ click dialog::backdrop      → 关闭
│   │
│   └─ 与 variant-selects.js 联动：
│       └─ 变体切换时 → gallery 切换到对应 variant 的 featured_media
│
└─ 销毁：zoom dialog 关闭时通过 dialog.close() 隐藏（DOM 保留复用）
```

### 2.4 quick-view.js — 快速预览弹窗

```
┌─ 创建（页面中包含 quick-view-trigger block 时）
│   ├─ 自定义元素 <bt-quick-view> 挂载
│   ├─ 初始状态：hidden
│   │
│   ├─ 触发流程：
│   │   ├─ click [data-quick-view] → 获取产品 handle
│   │   ├─ fetch('/products/' + handle + '?view=quick-view')
│   │   ├─ 解析返回的 HTML
│   │   ├─ 填充 <bt-quick-view> 内容（产品图/标题/价格/变体/ATC）
│   │   ├─ dialog.showModal()
│   │   ├─ 初始化内部 variant-selects（复用 variant-selects.js）
│   │   └─ 绑定内部 cart.js ATC 行为
│   │
│   ├─ 销毁：
│   │   ├─ dialog.close() → 关闭弹窗
│   │   ├─ 清空内部内容（防止内存泄漏）
│   │   └─ 恢复 body scroll
│   │
│   └─ 联动：
│       └─ variant-selects.js / cart.js 在弹窗内独立运行
```

### 2.5 sticky-atc.js — 移动端粘性加购条

```
┌─ 创建（PDP 页面包含 sticky-atc block 时）
│   ├─ IntersectionObserver 监听 main-product 的 ATC 按钮
│   │
│   ├─ 触发：
│   │   ├─ 主 ATC 按钮滚出视口 → sticky bar 显示（slide up 动画）
│   │   └─ 主 ATC 按钮滚回视口 → sticky bar 隐藏（slide down 动画）
│   │
│   ├─ sticky bar 内容：
│   │   ├─ 产品标题（截断）
│   │   ├─ 当前价格
│   │   ├─ 变体选择器（简化版）
│   │   └─ ATC 按钮
│   │
│   ├─ 联动：
│   │   ├─ ← variant-selects.js：变体切换 → 更新 sticky bar 价格/变体
│   │   ├─ → cart.js：ATC 按钮复用 cart.js 的加车逻辑
│   │   └─ ← window resize：重新计算 IntersectionObserver 阈值
│   │
│   └─ 销毁：页面跳转时自然销毁
```

### 2.6 页面级 JS 初始化流程

```
DOMContentLoaded
  │
  ├─ theme.liquid 内联脚本
  │   ├─ document.documentElement.className 移除 'no-js' 添加 'js'
  │   └─ Shopify.designMode 检测
  │
  ├─ cart.js 初始化
  │   └─ 绑定全局 ATC / cart drawer 事件
  │
  ├─ search.js 初始化（如 predictive_search_enabled）
  │   └─ 绑定搜索输入框 + fetch 结果
  │
  ├─ quick-view.js 初始化
  │   └─ 绑定 [data-quick-view] 触发按钮
  │
  ├─ sticky-atc.js 初始化（仅 PDP）
  │   └─ 启动 IntersectionObserver
  │
  ├─ variant-selects.js 初始化（仅 PDP / featured-product）
  │   └─ <variant-selects> custom element upgrade
  │
  ├─ gallery.js 初始化（仅 PDP）
  │   └─ 绑定缩略图 + zoom dialog
  │
  └─ pickup-availability.js 初始化（仅 PDP）
      └─ fetch 自提信息
```

---

## 3. Theme Editor 生命周期（商家交互）

### 3.1 Section 添加/移除/重排

```
商家在 theme editor 中操作
  │
  ├─ 添加 section：
  │   ├─ 从 section 列表选择 → preview iframe 中插入新 DOM
  │   ├─ section 按 preset 中的默认 blocks 初始化
  │   └─ 保存 → templates/*.json 写入新配置
  │
  ├─ 移除 section：
  │   ├─ DOM 移除 → Shopify 自动处理
  │   └─ 保存 → templates/*.json 删除该 section
  │
  └─ 重排 section：
      ├─ 拖拽 → DOM 重新排序（Shopify 处理）
      └─ 保存 → templates/*.json 更新 order 数组
```

### 3.2 Block 添加/移除/重排

```
商家在 section 内操作 blocks
  │
  ├─ 添加 block：
  │   ├─ 从 @theme 列表选择 block type
  │   ├─ section 重新渲染 → 新 block 插入 {% content_for "blocks" %}
  │   └─ 保存 → JSON 中 blocks dict + block_order 更新
  │
  ├─ 移除 block：
  │   └─ 同上反向
  │
  └─ 重排 block：
      └─ block_order 数组更新
```

### 3.3 设置变更 → 实时预览

```
商家修改 setting（颜色/字体/间距等）
  │
  ├─ preview iframe 接收变更事件
  ├─ 如果是颜色 → theme.liquid {% style %} 中的 --bt-color-* 更新
  ├─ 如果是 section setting → section 重新渲染
  ├─ 如果是 block setting → block 重新渲染
  └─ 保存 → config/settings_data.json 写入
```

---

## 4. 销毁/清理注意事项

| 场景 | 需要清理的内容 |
|------|---------------|
| **页面跳转** | 浏览器自动清理所有 DOM + 事件监听 |
| **AJAX 导航**（collection 筛选） | 旧 DOM 替换前：关闭所有 popover、移除 portal 到 body 的菜单元素 |
| **Quick view 关闭** | 清空内部内容、移除内部事件监听、恢复 body overflow |
| **Cart drawer 关闭** | 焦点归还到触发按钮 |
| **Zoom dialog 关闭** | `dialog.close()` 自动处理焦点归还 + backdrop 移除 |
| **Theme editor 移除 section** | Shopify 自动处理 DOM 移除 |

---

## 5. 事件总线（自定义事件）

主题使用 `window.theme` 对象和自定义事件进行组件间通信：

```javascript
// variant-selects.js 触发
window.theme.variantChange = new CustomEvent('theme:variantChange', {
  detail: { variant: {...}, sectionId: '...' }
});
window.dispatchEvent(window.theme.variantChange);

// cart.js 触发
window.theme.cartUpdated = new CustomEvent('theme:cartUpdated', {
  detail: { cart: {...} }
});
window.dispatchEvent(window.theme.cartUpdated);
```

**监听者**：
- sticky-atc.js 监听 `theme:variantChange` → 更新显示
- header cart count 监听 `theme:cartUpdated` → 更新数量

---

*关联文档：[[01-ARCHITECTURE]] [[03-STATE-MANAGEMENT]] [[04-FEATURE-TREE]] [[06-COMPOSABLE-MODULES]]*
