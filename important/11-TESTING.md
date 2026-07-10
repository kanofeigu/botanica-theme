# Botanica v3 — 代码测试文档

> 位置：`E:\ccfold\shopify\important\11-TESTING.md`
> 测试策略与检查点
> 最后更新：2026-07-06

---

## 1. 测试层次

```
① 语法测试：shopify theme check（自动）
  ↓
② 功能测试：手动走通关键流程
  ↓
③ 性能测试：Lighthouse CI（自动 + 基准数据集）
  ↓
④ 无障碍测试：手动键盘 + 读屏 + Lighthouse
  ↓
⑤ 兼容性测试：桌面/移动/平板视口
```

---

## 2. 语法测试（每次修改后必须跑）

```bash
shopify theme check --path botanica
```

**目标**：0 error。0 warning 理想但非必须。

---

## 3. 功能测试 — 关键用户流程

### 3.1 首页 → 产品 → 加车 → 结账

```
□ 首页加载（14 个 sections 依次渲染）
  ├─ □ 氛围特效正常运行
  ├─ □ Hero section 图片 + 文字 + 按钮
  ├─ □ Shop by care 3 张卡片（计量器不是 ***）
  ├─ □ Featured collection 产品网格
  ├─ □ Plant spotlight 养护表格
  ├─ □ Size guide 尺寸卡片（cm/inch 切换）
  ├─ □ Care blog teaser 文章卡片
  └─ □ Newsletter 订阅表单

□ 点击产品卡 → PDP 跳转
  ├─ □ 产品图集加载（主图 + 缩略图）
  ├─ □ 标本标签显示（No. XXXX）
  ├─ □ 价格显示（sale 价 + 划线原价）
  ├─ □ 变体切换：
  │   ├─ □ 选中新变体 → 价格更新
  │   ├─ □ ATC 按钮状态更新
  │   ├─ □ 主图切换到对应 variant 图片
  │   └─ □ URL 更新（?variant=xxx）
  ├─ □ 数量 +/- 控件正常
  ├─ □ 点击 ATC → cart drawer 滑入
  │   ├─ □ 商品在 drawer 中显示
  │   ├─ □ 小计正确
  │   ├─ □ 免运费进度条更新
  │   └─ □ header cart count 更新
  ├─ □ 关闭 cart drawer（点击遮罩/ESC/关闭按钮）
  ├─ □ 养护四宫格显示
  ├─ □ 产品描述显示
  ├─ □ 田野笔记引用显示
  ├─ □ 可折叠规格展开/折叠
  ├─ □ 社交分享
  ├─ □ 产品推荐加载
  └─ □ 质保承诺条

□ 打开 cart drawer → 点击 "Check out"
  └─ □ 跳转到 Shopify checkout 页面
```

### 3.2 分类页筛选流程

```
□ Collection 页面加载
  ├─ □ Banner 显示
  ├─ □ 侧边栏筛选：
  │   ├─ □ 可用性筛选 checkbox 正常工作
  │   ├─ □ 价格筛选 popover 正常
  │   └─ □ 筛选后 AJAX 刷新（无全页刷新）
  ├─ □ 排序 popover 正常
  ├─ □ 产品卡 care badge 正确显示
  ├─ □ Quick view 触发 → 弹窗打开
  │   ├─ □ 弹窗内变体切换 → 加车
  │   └─ □ 关闭弹窗
  ├─ □ 浏览器后退 → 恢复之前筛选状态
  └─ □ 分页正常
```

### 3.3 移动端流程

```
□ 移动视口（< 750px）
  ├─ □ 移动端导航（hamburger → drawer 滑入）
  │   ├─ □ 搜索栏在 drawer 中可用
  │   └─ □ 多级菜单 accordion 展开/折叠
  ├─ □ PDP：sticky ATC bar
  │   ├─ □ 主 ATC 按钮滚出视口 → sticky bar 显示
  │   └─ □ 主 ATC 按钮滚回视口 → sticky bar 隐藏
  └─ □ Collection：筛选按钮 → 侧边栏滑入
```

---

## 4. 性能测试

### 4.1 Lighthouse CI

在 GitHub Action 中运行，使用 Shopify 基准数据集（而非自己的 demo 数据）：

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse
  uses: shopify/lighthouse-ci-action@v1
  with:
    theme_root: botanica/
    store: ${{ secrets.STORE_URL }}
    password: ${{ secrets.STORE_PASSWORD }}
```

### 4.2 测试页面

| 页面 | 性能目标 | 无障碍目标 |
|------|---------|-----------|
| Home（index） | ≥ 60 | ≥ 90 |
| Product（PDP） | ≥ 60 | ≥ 90 |
| Collection | ≥ 60 | ≥ 90 |

取三者平均。

### 4.3 手动 Chrome DevTools 测试

```
1. 打开隐̧身窗口（避免扩展干扰）
2. F12 → Lighthouse 标签
3. 选择 Mode: Navigation
4. 选择 Device: Mobile（然后 Desktop 再跑一次）
5. Categories: Performance + Accessibility + Best Practices + SEO
6. Run
```

---

## 5. 无障碍测试

### 5.1 键盘导航

```
□ Tab 键走通：skip-link → header links → 产品卡 → ATC → footer links
□ Enter/Space 激活按钮和链接
□ Escape 关闭弹窗/drawer
□ 焦点环始终可见（:focus-visible 未被抹除）
□ 弹窗打开时焦点锁在弹窗内
□ 弹窗关闭时焦点归还到触发元素
□ 移动端 hamburger menu 键盘可达
```

### 5.2 读屏测试

```
□ NVDA（Windows）或 VoiceOver（Mac）走通：
  ├─ □ 导航链接正确播报
  ├─ □ 产品图有 alt 文本
  ├─ □ 变体切换后价格/库存 aria-live 播报
  ├─ □ 加车后 cart drawer 打开播报
  ├─ □ 弹窗打开/关闭播报
  └─ □ 表单字段 label 关联正确
```

### 5.3 对比度

```
□ 正文文本 4.5:1（在背景色上）
□ 大字（≥24px 或 ≥18.5px bold）3:1
□ 边框/图标等非文字元素 3:1
□ 焦点环与背景对比足够
⚠ terracotta #C97D5A 在 cream #F5F1E8 上仅 ~3.2:1 → 只能用于大字/标题
```

### 5.4 触控

```
□ 交互元素最小 24×24 CSS px
□ 主 CTA 按钮 44×44 CSS px
□ 相邻可点击元素间距足够
```

---

## 6. 兼容性测试

| 浏览器 | 版本 | 测试要点 |
|--------|------|---------|
| Chrome | 最新 | 全部功能 |
| Safari | 最新 | CSS `color-mix()` fallback、`<dialog>` 支持 |
| Firefox | 最新 | View Transitions 降级、`<dialog>` 支持 |
| Edge | 最新 | 同 Chrome |
| Safari iOS | 最新 | 移动端 sticky ATC、触控目标 |
| Chrome Android | 最新 | 移动端整体体验 |

---

## 7. 回归测试清单（提交前）

```
□ shopify theme check 0 error
□ 3 个预设切换正常工作
□ Home 页面 14 个 sections 全部渲染
□ PDP 变体切换 + 加车完整流程
□ Collection 筛选 + 排序 + AJAX 导航
□ Cart drawer 打开/关闭 + 免运费进度条
□ Predictive search 正常
□ 移动端菜单 + sticky ATC
□ Quick view 弹窗
□ 无控制台错误（JS）
□ 无 404 请求
□ 无 CLS 明显布局偏移
```

---

*关联文档：[[04-FEATURE-TREE]] [[09-CHANGE-MANAGEMENT]] [[10-CODE-REVIEW]] [[13-BUG-LOG]]*
