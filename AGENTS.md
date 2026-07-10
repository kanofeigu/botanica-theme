> ⚠️ **已废弃 / SUPERSEDED（2026-06-27）**
> 本文件的铁律（尤其"Dawn 基准"）描述的是**被拒的 Dawn 套壳 v1**，已失效（Dawn 派生主题不再允许提交）。
> 新铁律见 **`docs/botanica-v3/03-WORKFLOW.md §4`**；蓝图见 `02-PLAN.md`。下面内容仅作历史参考，**勿照此操作**。

# AGENTS.md — Botanica Shopify Theme Agent 协作总指令

> **定位**: 所有 Agent（Orchestrator 和 Worker）的通用铁律。
> **版本**: 1.0.0

---

## 项目定位
Botanica 是一个 **Shopify Online Store 2.0 主题**，面向室内观叶/盆栽植物店。
技术栈：Liquid + CSS + Vanilla JS + JSON（OS 2.0 模板架构）。基础：Shopify Dawn 主题。
目标平台：Shopify 官方 Theme Store（审核通过后上架）。交付物：可 push 的主题目录。

---

## 多 Agent 架构

本项目采用 **Orchestrator + Worker** 模式（详见 LOOP.md）：

- **Orchestrator**: 主 Agent，读取 LOOP.md，负责协调阶段推进和 spawn Worker
- **Worker**: 子 Agent，每个只负责 1 个 section（.liquid + .css + 可选 snippets），只读 3 个文件（AGENTS.md + CONTRACTS.md + 自己的 SKILL.md）
- **CONTRACTS.md**: 所有 Worker 共享的接口契约——定义了 section schema 输入输出、CSS 变量依赖、文件所有权

**架构好处**: 每个 section 是独立模块（自含 Liquid + CSS + schema），Worker 间无文件重叠，可并行开发。

---

## 核心铁律（最高优先级——所有 Agent 都必须遵守）

1. **Dawn 基准**: 所有代码基于 Dawn 主题模式。参考 Dawn 的 Liquid 写法、CSS 命名、JS 架构。
2. **Shopify 合规**: 代码必须通过 `shopify theme check` 零 error。不引入外部 JS 库。所有字符串走 locales 翻译。
3. **契约驱动**: Worker 严格按 CONTRACTS.md 的 section schema 实现，不猜测、不越界。CSS 变量从 botanica.css 读取。
4. **职责隔离**: Worker 只写自己的 section 文件（liquid + css + 子 snippet），不碰其他 section 的文件。
5. **0 error 铁律**: 每次写完代码后 `shopify theme check --path botanica` 必须零 error。
6. **CSS 必须 link**: 每个 section 的 .liquid 文件顶部必须 `{{ '<name>.css' | asset_url | stylesheet_tag }}` 引用同名 CSS。
7. **无 BOM**: 所有文件用 UTF-8 without BOM 保存。
8. **OS 2.0 模式**: 所有模板用 JSON，section 必须有 `{% schema %}` + presets，settings 用 `t:` 翻译 key。

---

## 角色判定

如果你是**主 Agent**（能 spawn 子 Agent），你的角色是 **Orchestrator**。
→ 读取 `skills/cross-cutting/orchestrator/SKILL.md` 和 `LOOP.md`

如果你被 spawn 为**子 Agent**，你的角色是 **Worker**。
→ 读取 `AGENTS.md`（本文件）+ `CONTRACTS.md` + 你被分配的那个 `skills/workers/worker-*/SKILL.md`

---

## 技术决策记录（已确认，所有 Agent 不质疑）

- ✅ 基础骨架: Shopify Dawn 主题（已 fork 并重命名为 Botanica）
- ✅ 模板体系: OS 2.0 JSON templates（非 legacy Liquid templates）
- ✅ 配色系统: 3 套预设（sage / moss / minimal-white），通过 settings_schema color_scheme_group 实现
- ✅ 字体: Fraunces（headings）+ Inter（body），来自 Shopify Font Library
- ✅ CSS 架构: Dawn component CSS + botanica.css 品牌层 + 每个 section 独立 CSS
- ✅ JS: 零外部依赖，继承 Dawn 的 ES module 体系
- ✅ 交付物: `shopify theme push` 到 dev store 的可运行主题
- ✅ 验证流水线: `.\verify.ps1`（theme check + CSS link 一致性 + JSON/BOM）

---

## 禁止事项（所有 Agent 必须遵守）

- ❌ 不引入任何外部 JS 库或 CSS 框架（Theme Store 规则）
- ❌ 不在 Liquid 中硬编码用户可见文本（必须走 `t:` locale key 或 settings 字段）
- ❌ 不在 section 中引用其他 section 的内部结构
- ❌ 不创建无对应 .liquid 引用的孤立 CSS 文件
- ❌ 不在 settings_data.json 中手动编辑（应通过 settings_schema + theme editor 生成）
- ❌ Worker 不读取其他 Worker 的 SKILL.md 或 PROJECT.md 全文
- ❌ Worker 不修改其他 Worker 负责的文件
- ❌ 不让 `shopify theme check` 有 error
- ❌ 不用 PowerShell `ConvertTo-Json` + `Out-File`（默认带 BOM，theme check 拒绝）

---

## 允许事项

- ✅ 使用 Dawn 中已有的 component CSS（component-card.css, component-price.css 等）
- ✅ 在 botanica.css 中添加新的全局 CSS 变量
- ✅ 使用 `{% render 'snippet-name' %}` 引用 snippet
- ✅ 在 section schema 中定义 settings 和 blocks
- ✅ 使用 `{{ section.settings.xxx }}` 读取 section 级设置
- ✅ 使用 `{{ block.shopify_attributes }}` 标记 block wrapper
- ✅ Orchestrator 可 spawn 最多 7 个 Worker

---

## 代码质量标准（所有 Agent）

### Liquid
- 使用 `{%- -%}` 空格控制（非 `{% %}`）
- 复杂逻辑用 `{%- liquid -%}` 块集中到文件顶部
- 条件渲染用 `{% if %}` 包裹，不输出空 div
- 图片统一用 `| image_url: width: N` + `sizes` + `loading="lazy"`

### CSS
- 命名: BEM 风格（`.section-name__element--modifier`）
- 变量: Dawn 的 `--color-*` + Botanica 的 `--botanica-*`（不使用硬编码颜色）
- 作用域: 所有选择器放在 section 的顶级 class 下
- 响应式: 移动优先，breakpoint 用 Dawn 的 `750px`、`990px`

### JS
- ES module 模式，defer 加载
- 文件名 kebab-case
- 事件监听用 `document.addEventListener`
- 不操作其他 section 的 DOM

### JSON
- 2 空格缩进
- 所有 key 双引号
- settings_schema 中所有 label/info 用 `t:` locale key

---

## 项目相对路径约定

所有文件路径相对于项目根目录 `E:\ccfold\shopify\`：
- 主题源码: `botanica/`
- Shopify CLI 路径参数: `--path botanica`
- verify 脚本: `.\verify.ps1`
