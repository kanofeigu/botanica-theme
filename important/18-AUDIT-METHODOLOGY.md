# Botanica v3 — 功能审计方法（泛用版）

> 位置：`E:\ccfold\shopify\important\18-AUDIT-METHODOLOGY.md`
> 用途：每次宣布"代码就绪"前，用此方法逐页审计。不依赖具体功能清单，适用于任何改动。
> 最后更新：2026-07-10

---

## 为什么需要这个方法

`shopify theme check` 检查的是：
- Liquid 语法对不对
- JSON 结构合法不
- 有没有未定义变量

它检查不了：
- 按钮点了有没有反应
- 表单能不能成功提交
- 链接能不能跳转
- 筛选后页面会不会崩
- AJAX 请求后 DOM 更新是否完整

**"代码结构正确" 和 "功能可用" 之间有一条鸿沟。** 这个方法就是过这条鸿沟的桥。

---

## 核心原则

> **页面上每一个可交互元素，都必须有一条从"用户动作"到"系统响应"的完整链路。**

审计的任务是：**逐元素检查这条链路是否通畅。**

---

## 第一步：交互元素盘点

对当前改动的**每个页面模板**，列出所有用户可操作的节点：

### 通用分类法（不依赖具体页面）

| 元素类型 | CSS 选择器模式 | 预期行为 | 检查方式 |
|---------|---------------|---------|---------|
| **链接** `<a>` | `a[href]` | 点击跳转到 `href` 指向的 URL | `curl` 目标 URL → 200 |
| **表单** `<form>` | `form[action]` | 提交到 `action`，携带 `input[name]` 数据 | 确认 `action` 端点有效 + 所有 `input` 有 `name` |
| **提交按钮** `[type=submit]` | `button[type=submit], input[type=submit]` | 关联到某个 `<form>`（子元素或 `form` 属性） | 确认 `form` 属性值匹配实际 `form[id]` |
| **普通按钮** `[type=button]` | `button:not([type=submit])` | 必须有 JS `click` 事件处理器 | grep JS 文件确认有对应 handler |
| **文本输入** `input[type=text/number/...]` | `input:not([type=hidden/radio/checkbox])` | 必须有 `name` 属性，或 data-* 被 JS 读取 | 确认在表单内 或 JS 中有 `querySelector` 引用 |
| **复选框/单选框** `input[type=checkbox/radio]` | `input[type=checkbox], input[type=radio]` | 必须在表单内，或有 change handler | 同上 |
| **详情折叠** `<details>` | `details` | 浏览器原生展开/收起，或 JS 控制 | 如 JS 控制 → 确认 handler；如原生 → 确认无 JS 阻止 |
| **弹窗/对话框** `<dialog>` | `dialog` | 有打开触发器和关闭机制 | 确认 `showModal()`/`close()` 调用存在 |
| **下拉菜单** (自定义) | `[aria-haspopup], [data-popover]` | 有展开/收起 JS + ESC 关闭 + 外部点击关闭 | 确认完整的 open/close/dispose 逻辑链 |

### 交互元素与 JS handler 的关联检查

对每个 `button[type=button]`、每个无 `form` 归属的 `input`、每个自定义 toggle：

```
1. 在元素上找 data-* 属性 → 在 JS 中 grep 该属性名
2. 在元素上找 class → 在 JS 中 grep 该 class 名
3. 在元素上找 id → 在 JS 中 grep 该 id
4. 以上都没有 → 该元素无 JS 行为，属于死元素
```

如果 1-3 都找不到匹配 → **这是 Bug：一个可交互元素没有关联任何行为。**

---

## 第二步：链路追踪

对每个交互元素，追踪完整的行为链：

### 链接链路

```
<a href="X"> → curl X → 200? → 页面包含预期内容?
```

### 表单链路（标准提交）

```
form[action="/cart/add"]
  → 所有 input 都有 name? （没有 name 的 input 不会被提交）
  → submit 按钮在表单内 OR form="formId" 匹配?
  → action URL 可访问?
  → 提交后（curl POST）→ 返回预期响应?
```

### 表单链路（AJAX 提交）

```
fetch/post 调用
  → URL 正确? （相对路径 /cart/add.js vs 绝对路径）
  → method 正确? （POST/GET）
  → body/params 完整? （id, quantity, sections 等必填字段）
  → .then() 处理了响应?
  → .catch() 处理了错误?
  → DOM 更新逻辑存在? （count bubble, drawer, notification）
```

### 按钮链路

```
button[type=button]
  → JS click handler 存在? （addEventListener / onclick）
  → handler 第一行过滤条件正确? （closest/querySelector 选择器）
  → 核心逻辑可到达? （没有被 if return 短路）
  → 异步操作有 loading/success/error 三态?
```

### 筛选/排序链路

```
input/filter change
  → URL 参数构建逻辑? （filter.v.price.gte, sort_by 等）
  → AJAX 导航或页面重载?
  → 如果是 AJAX：DOM 替换逻辑? → 替换后有残留的废弃节点?
  → URL 参数持久化? （浏览器前进/后退是否正常）
```

---

## 第三步：边界条件检查

对每个页面，用以下问题自检：

| 类别 | 问题 |
|------|------|
| **空状态** | 集合无产品、博客无文章、购物车空 → 页面不崩？不渲染空壳？ |
| **极端数据** | 产品价格 0、图片缺失、变体全 sold out、标签为空 → UI 不破版？ |
| **浏览器行为** | 后退按钮 → 页面状态还原？URL 参数保留？ |
| **并发** | 快速双击按钮 → 不会重复加车？不会重复提交？ |
| **加载失败** | fetch 返回 4xx/5xx → 有错误提示？不会静默卡死？ |
| **密码保护** | 店面有密码 → 管理员预览正常？顾客看到的密码页正确？ |

---

## 第四步：执行审计（操作流程）

### 先做代码层扫描（5 分钟）

```bash
# 1. 找出所有 button[type=button]（必须有 JS handler）
grep -rn 'type="button"' botanica/sections/ botanica/blocks/ botanica/snippets/

# 2. 找出所有 form（必须有 action 或 JS submit handler）
grep -rn '<form\|{% form\|{%- form' botanica/sections/ botanica/blocks/

# 3. 对每个 button[type=button]，逐一确认 JS 中有对应 handler
#    关键词：button 的 class 名、data-* 属性、id

# 4. 找出所有 fetch/post 调用 → 确认 .catch 存在
grep -rn 'fetch\|\.post\|\.ajax' botanica/assets/*.js
```

### 再做页面级验证（每页 2 分钟）

对每个改动的模板，按模板列表逐页检查：

```
模板文件              → 页面 URL                          → curl 返回码
templates/index.json  → /                                →
templates/product.json→ /products/{sample-handle}        →
templates/collection.json → /collections/{sample-handle} →
templates/cart.json   → /cart                            →
templates/search.json → /search?q=plant                  →
templates/page.json   → /pages/{sample-handle}           →
templates/blog.json   → /blogs/{blog-handle}             →
templates/article.json → /blogs/{blog-handle}/{article}  →
templates/404.json    → /nonexistent-page                →
...每个 customers 模板...
```

### 最后做交互验证（核心路径）

```
□ 集合页：点筛选 → URL 变 → 产品更新 → 点+加车 → 购物车有商品 → 点产品卡 → 跳转 PDP
□ PDP：切换变体 → 价格/图片/加车按钮状态更新 → 点 Add to cart → 购物车有商品
□ 导航：hover 一级菜单 → mega menu 展开 → hover 二级 → flyout 图片切换 → 点菜单项 → 跳转正确
□ 购物车：打开 drawer → 改数量 → 删商品 → 免运费进度条更新 → 点结账 → 跳转 checkout
□ 搜索：输入关键词 → 预测搜索下拉 → 点结果 → 跳转正确
```

---

## 集成到 CI（可选，未来做）

可以将以下检查自动化：

```bash
# 检查所有 button[type=button] 是否有 JS handler
# （静态分析，有 false positive，但能抓漏网之鱼）

# 检查所有 <a href> 的目标 URL 是否返回 200
# （需要 dev server 运行）

# 检查关键页面是否返回 200
for path in / /products /collections/all /cart /search; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:9292$path")
  [ "$code" != "200" ] && echo "FAIL: $path → $code"
done
```

---

## 与现有检查的关系

| 检查方法 | 层次 | 能发现什么 | 不能发现什么 |
|---------|------|-----------|-------------|
| `shopify theme check` | 语法 | Liquid 语法错误、JSON 结构错误 | 平台限制、功能 Bug |
| `verify.ps1` | 结构 | CSS 未链接、JSON 无效、BOM | 功能 Bug、交互缺陷 |
| `theme push` | 平台 | Schema label 超长、font handle 无效 | 功能 Bug |
| **本方法** | **功能** | **交互缺陷、死元素、链路断裂、边界 Bug** | 语法错误（交给上面的） |

**四层都通过 = 真正就绪。**

---

*关联文档：[[15-LESSONS-LEARNED]] [[10-CODE-REVIEW]] [[11-TESTING]] [[13-BUG-LOG]]*
