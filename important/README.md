# Botanica v3 — 项目文档中心

> 位置：`E:\ccfold\shopify\important\`
> 用途：Botanica Shopify 主题的完整文档体系
> 最后更新：2026-07-06
>开始指令“继续 Botanica 项目”
---

## 📖 文档索引

| 文件 | 内容 | 适用对象 |
|------|------|---------|
| **[01-ARCHITECTURE.md](01-ARCHITECTURE.md)** | 代码架构：四层架构、数据流、命名规范、架构决策、依赖关系图 | AI / 开发者 |
| **[02-LIFECYCLE.md](02-LIFECYCLE.md)** | 生命周期：Liquid 渲染、JS 组件（创建→使用→联动→销毁）、Theme Editor 交互 | AI / 开发者 |
| **[03-STATE-MANAGEMENT.md](03-STATE-MANAGEMENT.md)** | 状态管理：购物车/变体/筛选/URL/CSS 状态的响应式管理、性能优化时机 | AI / 开发者 |
| **[04-FEATURE-TREE.md](04-FEATURE-TREE.md)** | 功能树：每个功能的完整依赖关系图，修改 A 前必看对 B 的影响 | AI / 开发者 |
| **[05-QUICK-START.md](05-QUICK-START.md)** | 快速了解项目：5 分钟速览架构、关键文件位置、铁律、绝对不能做的事 | 新 AI / 新开发者 |
| **[06-COMPOSABLE-MODULES.md](06-COMPOSABLE-MODULES.md)** | 组合式功能模块：20+ blocks、snippets、CSS 模块的复用规则和创建规范 | AI / 开发者 |
| **[07-SECURITY.md](07-SECURITY.md)** | 安全性：XSS 防护、CSRF、数据注入安全、App Block 隔离 | AI / 开发者 |
| **[08-PERFORMANCE.md](08-PERFORMANCE.md)** | 性能优化：CSS 子集化、JS defer、图片优化、字体策略、性能目标 | AI / 开发者 |
| **[09-CHANGE-MANAGEMENT.md](09-CHANGE-MANAGEMENT.md)** | 功能修改要求：修改前强制检查流程、影响等级、具体场景示例、联动测试清单 | AI / 开发者 |
| **[10-CODE-REVIEW.md](10-CODE-REVIEW.md)** | 代码审查：Liquid/CSS/JS/Schema/无障碍的逐条审查清单 | AI / 开发者 |
| **[11-TESTING.md](11-TESTING.md)** | 代码测试：语法/功能/性能/无障碍/兼容性测试的全部检查点 | AI / 开发者 |
| **[12-FEATURE-DESCRIPTIONS.md](12-FEATURE-DESCRIPTIONS.md)** | 项目功能详细描述：F01–F17 每个功能的用途、实现方式、关联功能 | AI / 开发者 / 产品 |
| **[13-BUG-LOG.md](13-BUG-LOG.md)** | Bug 日志：历史 bug 记录（原因→修复→文件→结果），防止重复踩坑 | AI / 开发者 |
| **[16-API-REFERENCE.md](16-API-REFERENCE.md)** | ★ API 参考 & 项目技巧：认证、GraphQL 常用操作、REST 备选、脚本模板、避坑速查 | AI / 开发者 |

---

## 🗂 关联文档

| 路径 | 内容 |
|------|------|
| `../docs/botanica-v3/README.md` | v3 项目蓝图入口 |
| `../docs/botanica-v3/02-PLAN.md` | 施工蓝图（P0–P5 分阶段） |
| `../docs/botanica-v3/04-COMPLIANCE.md` | 提交合规门禁清单 |
| `../docs/botanica-v3/05-AUDIT-REPORT.md` | 2026-07-06 审计报告 |
| `../botanica/SUBMISSION.md` | Theme Store 提交包说明 |

---

## ⚡ 快速查找

| 你想知道 | 去看 |
|---------|------|
| 项目整体架构 | [[01-ARCHITECTURE]] |
| 某组件从创建到销毁全过程 | [[02-LIFECYCLE]] |
| 数据如何响应式更新 | [[03-STATE-MANAGEMENT]] |
| 修改 A 功能会影响哪些功能 | [[04-FEATURE-TREE]] |
| 5 分钟上手 | [[05-QUICK-START]] |
| 有哪些可复用组件 | [[06-COMPOSABLE-MODULES]] |
| 安全检查项 | [[07-SECURITY]] |
| 性能优化怎么做 | [[08-PERFORMANCE]] |
| 修改功能前要检查什么 | [[09-CHANGE-MANAGEMENT]] |
| Code review 清单 | [[10-CODE-REVIEW]] |
| 测试流程 | [[11-TESTING]] |
| 每个功能完整描述 | [[12-FEATURE-DESCRIPTIONS]] |
| 历史 bug 记录 | [[13-BUG-LOG]] |
| ★ API 认证、GraphQL 操作、脚本模板、避坑 | [[16-API-REFERENCE]] |

---

## 🔑 项目三句话

1. **底座**：Skeleton + theme-blocks（规则强制，全原创代码）
2. **定位**：多用途精品主题 + 植物旗舰 demo（$199、3 套预设）
3. **底线**：只剩 2 次提交机会，按门禁一次做到位
