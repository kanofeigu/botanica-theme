> ⚠️ **已废弃 / SUPERSEDED（2026-06-27）**
> 本文件描述的是**被 Theme Store 拒绝的 Dawn 套壳 v1**（Dawn 派生主题已不允许提交）。已被 **`docs/botanica-v3/`** 取代。
> 工作流请改读 `docs/botanica-v3/03-WORKFLOW.md`；蓝图见 `02-PLAN.md`。下面内容仅作历史参考，**勿照此操作**。

# LOOP.md — Botanica Shopify Theme 多 Agent 并行工程流水线

> **版本**: 2.0.0（Shopify 主题适配版）
> **用途**: 将此项目交给 Agent，Agent 自动编排子 Agent 分波次并行完成 Shopify 主题开发。
> **核心机制**: Stage 2 使用 N 个 Worker 分波次并行开发 section，每个 Worker 负责 1 个 section（liquid + css + snippets），无文件重叠。

---

## 启动指令

```text
请读取 LOOP.md，按多 Agent 流水线自动完成 Botanica 主题开发。从 [当前阶段] 开始。
```

---

## 流水线总览

```text
┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────────────────┐  ┌──────────────────┐  ┌──────────┐
│ Stage 0  │▶│ Stage 1  │▶│ Stage 1.5  │▶│ Stage 2 (DAG 分波次并行) │▶│ Stage 3          │▶│ Stage 4  │
│ 环境准备 │  │ 需求确认 │  │ 骨架验证   │  │ wave-0 → wave-1 → wave-2 │  │ 测试 + 审查     │  │ 提交审核 │
│ 编排器   │  │ 编排器   │  │ 编排器     │  │ 编排器 dispatch + 屏障   │  │ 编排器 + Worker │  │ 编排器   │
└──────────┘  └──────────┘  └────────────┘  └──────────────────────────┘  └──────────────────┘  └──────────┘
```

---

## Agent 角色定义

| 角色 | 技能文件 | 波次 | 负责的文件 |
|------|----------|------|-----------|
| **Orchestrator** | `skills/cross-cutting/orchestrator/SKILL.md` | 全程 | 协调、dispatch、验证、写 STATE |
| Worker-0 | `skills/workers/worker-foundation/SKILL.md` | **wave-0** | settings_schema.json, settings_data.json, botanica.css, en.default.json |
| Worker-hero | `skills/workers/worker-hero/SKILL.md` | wave-1 | hero-lookbook section |
| Worker-care | `skills/workers/worker-care/SKILL.md` | wave-1 | shop-by-care section |
| Worker-spotlight | `skills/workers/worker-spotlight/SKILL.md` | wave-1 | plant-spotlight section |
| Worker-blog | `skills/workers/worker-blog/SKILL.md` | wave-1 | care-blog-teaser section |
| Worker-size | `skills/workers/worker-size/SKILL.md` | wave-1 | botanica-size-guide section |
| Worker-values | `skills/workers/worker-values/SKILL.md` | wave-1 | botanica-values-bar section |
| Worker-product | `skills/workers/worker-product/SKILL.md` | wave-1 | main-product section |
| Worker-collection | `skills/workers/worker-collection/SKILL.md` | wave-1 | collection sections + card-product |
| Worker-cart | `skills/workers/worker-cart/SKILL.md` | wave-1 | cart sections |
| Worker-integration | `skills/workers/worker-integration/SKILL.md` | **wave-2** | templates/*.json, layout/theme.liquid |

---

## 编排器执行流程

### 前置：读取指令体系

```text
1. 读取 LOOP.md（本文件）
2. 读取 AGENTS.md（铁律）
3. 读取 CONTRACTS.md（Section 接口契约 + 文件所有权）
4. 读取 STATE.md（状态持久化机制）
5. 读取 skills/cross-cutting/orchestrator/SKILL.md（编排器操作手册）
```

---

### Stage 0: 环境准备（Orchestrator 本地执行）

| Step | 操作 | 验证 |
|------|------|------|
| 0.1 | 检查 `shopify` CLI 已安装 | `shopify version` |
| 0.2 | 检查 `botanica/` 目录结构完整 | Dawn 基准文件存在 |
| 0.3 | 运行 `shopify theme check --path botanica` | 确认当前基线错误数 |
| 0.4 | 确认 `verify.ps1` 可执行 | PowerShell 脚本存在 |
| 0.5 | **初始化 STATE.json**（如不存在则创建） | STATE.json 存在 |

**输出**: `✅ Stage 0 完成` + 写入 STATE.json

---

### Stage 1: 需求确认（Orchestrator 本地执行）

| Step | 操作 |
|------|------|
| 1.1 | 读取 `PLAN.md` 了解开发阶段和优先级 |
| 1.2 | 读取 `VERIFY.md` 了解验证流程 |
| 1.3 | 确认当前 Phase（目前 Phase 2 — HomePage sections） |
| 1.4 | 确认需要开发的 section 列表和优先级 |
| 1.5 | 写入 STATE.json（记录当前 phase 和待开发 section 列表） |

**输出**: `✅ Stage 1 完成` + 阶段摘要

---

### Stage 1.5: 骨架验证（Orchestrator 本地执行）⭐

> **目的**: 在并行开发前确认 Dawn 骨架正常、现有 section 无 error、shopify theme check 0 error 基线。

| Step | 操作 | 验证 |
|------|------|------|
| 1.5.1 | 运行 `shopify theme check --path botanica` | error = 0 |
| 1.5.2 | 运行 `.\verify.ps1` | 全 PASS |
| 1.5.3 | 检查所有现有 section 的 CSS 都已 link | verify.ps1 step 2 通过 |
| 1.5.4 | 检查 botanica.css 变量层完整 | 包含所有 `--botanica-*` 变量 |
| 1.5.5 | 写入 STATE.json（skeleton_verified=true） | STATE 更新 |

**输出**: `✅ Stage 1.5 完成` — 骨架 0 error，可进入并行开发

---

### Stage 2: 编码实现（DAG 分波次 dispatch）⭐核心

**前置条件**: Stage 1.5 骨架验证通过（theme check 0 error）。

#### 波次模型

```text
wave-0 (基础层，最先):
  Worker-0 ████████████  ← 产出 settings_schema + botanica.css + en.default.json
      │
      ▼ barrier（theme check 通过 + verify.ps1 通过 + CSS 变量层可被引用）
wave-1 (section 层，并行):
  Worker-hero ████████████
  Worker-care ████████████
  Worker-spotlight ████████
  Worker-blog ████████████    ← 9 个 Worker 同时跑
  Worker-size ████████████
  Worker-values ██████████
  Worker-product █████████
  Worker-collection ███████
  Worker-cart ████████████
      │
      ▼ barrier（所有 section theme check 通过 + CSS 都已 link）
wave-2 (集成层，最后):
  Worker-integration ████████  ← 串联 templates + layout
      │
      ▼ barrier（全量 theme check + verify.ps1）
```

#### wave-0 dispatch

```text
你是 Worker-0（基础层，wave-0）。工作目录: E:\ccfold\shopify。
必须按顺序读取:
  1. AGENTS.md
  2. CONTRACTS.md（特别关注 §零 共享契约层）
  3. skills/workers/worker-foundation/SKILL.md
产出: 全局设置 schema、CSS token 层、基础翻译。
完成后报告 JSON。
```

#### barrier-0 → wave-1

```text
等待 Worker-0 完成。
运行 shopify theme check --path botanica（确定 0 error）。
运行 .\verify.ps1（CSS link 一致性 + JSON/BOM）。

同时 spawn wave-1 的所有 Worker:
每个 Worker 消息格式:

你是 Worker-{ID}（{section名}，wave-1）。工作目录: E:\ccfold\shopify。
必须按顺序读取:
  1. AGENTS.md
  2. CONTRACTS.md（特别关注与你 section 相关的 §3.X 输出契约）
  3. skills/workers/worker-{dir}/SKILL.md
wave-0 已产出 botanica.css 和 settings_schema.json，请直接引用其中的 CSS 变量和 settings 定义。
严格按照 SKILL.md 的实现清单编写代码。完成后报告 JSON。
```

#### barrier-1 → wave-2

```text
等待所有 wave-1 Worker 完成。
运行 shopify theme check --path botanica（确定 0 error）。
运行 .\verify.ps1（CSS link 一致性）。

spawn Worker-integration:

你是 Worker-integration（集成层，wave-2）。工作目录: E:\ccfold\shopify。
必须读取:
  1. AGENTS.md
  2. CONTRACTS.md（特别关注 §3.10 集成层输出契约）
  3. skills/workers/worker-integration/SKILL.md
你的输入是 wave-0/1 已产出的所有 section。
任务: 组装 templates/*.json、更新 layout/theme.liquid、更新 section groups。
完成后报告 JSON。
```

#### 验证

- [ ] `shopify theme check --path botanica` error = 0
- [ ] `.\verify.ps1` 全 PASS
- [ ] 所有 Worker JSON 报告 status=ok

**输出**: `✅ Stage 2 完成 (10 Workers, 3 waves)`

---

### Stage 3: 测试与审查

#### Step 3a: 自动化验证

```bash
shopify theme check --path botanica
.\verify.ps1
```

#### Step 3b: 代码审查（Orchestrator 本地执行）

读取 `skills/cross-cutting/code-review/SKILL.md`，按 Shopify 主题六维度审查：

1. **Theme Check 合规**（阻断项）: 0 error
2. **Section Schema 完整性**: 每个 section 有 schema + presets，设置类型正确
3. **CSS 链接一致性**: 每个 section 的 liquid 有对应的 stylesheet_tag
4. **Liquid 质量**: `{%- -%}` 空格控制、无硬编码文本、图片使用 asset_url
5. **CSS 质量**: BEM 命名、变量使用、作用域正确、响应式完整
6. **JSON 合法性**: 无 BOM、parse 通过

#### Step 3c: 视觉验证

```bash
shopify theme push --path botanica --store <store-name>
# → 浏览器检查每个 section 渲染效果
```

**输出**: `✅ Stage 3 完成`

---

### Stage 4: 提交准备（Orchestrator 本地执行）

| Step | 操作 | 验证 |
|------|------|------|
| 4.1 | 确认 theme check 0 error | 通过 |
| 4.2 | 确认 verify.ps1 全 PASS | 通过 |
| 4.3 | 生成变更摘要（CHANGELOG） | — |
| 4.4 | 截图/录屏准备（如需要） | — |
| 4.5 | 写入 STATE.json（pipeline=completed） | STATE 更新 |

**输出**: `✅ Stage 4 完成` + 提交就绪

---

## Dispatch 模板（Orchestrator 直接复制使用）

```text
你是 Worker-{ID}（{模块名}，wave-{N}）。工作目录: E:\ccfold\shopify。

## 必须按顺序读取的 3 个文件
1. E:\ccfold\shopify\AGENTS.md           ← 铁律和禁止项
2. E:\ccfold\shopify\CONTRACTS.md        ← 接口契约（核心参考，特别关注与你相关的 §3.X）
3. E:\ccfold\shopify\skills\workers\worker-{DIR}\SKILL.md ← 你的实现清单

## 注意
- 只读上述 3 个文件，不要读其他 Worker 的 SKILL.md 或 PROJECT.md 全文
- 严格按照 CONTRACTS.md 中定义的 section schema 实现
- 遵守 AGENTS.md 的所有铁律（0 error、CSS 必 link、无 BOM、无外部库）
- wave-0 已产出 botanica.css（CSS token）和 settings_schema.json，请直接引用

## 完成后必须返回 JSON 报告
{
  "worker_id": "Worker-{ID}",
  "wave": "wave-{N}",
  "status": "ok | error",
  "files_created": ["绝对路径列表"],
  "files_modified": ["绝对路径列表"],
  "self_check": "passed | failed",
  "errors": ["如有错误描述，否则空数组"]
}
```

---

## Worker 回滚与状态恢复策略

### 单 Worker 失败
1. 查看 Worker 的 JSON 报告中的 errors 字段
2. 运行 `shopify theme check --path botanica` 定位具体错误
3. 修复 CONTRACTS.md 中的歧义（如需要）
4. 重新 spawn 该 Worker（使用相同的 message）
5. 其他 Worker 的产出不受影响（文件集合不重叠）

### 断点续跑（基于 STATE.json）
- Orchestrator 每个 Stage/波次结束都写入 STATE.json
- 重新启动时先读 STATE.json，跳过 status=completed 的 Worker
- 详见 `STATE.md`

---

## 文件体系

```text
shopify/
├── LOOP.md                          ← ★ 入口（本文件）
├── AGENTS.md                        ← 铁律（所有 Worker 都读）
├── CONTRACTS.md                     ← Section 接口契约 + 文件所有权（所有 Worker 都读）
├── PROJECT.md                       ← 完整规范（仅 Orchestrator 按需读）
├── STATE.md                         ← 状态持久化机制
├── STATE.json                       ← 运行时状态（gitignore）
├── PLAN.md                          ← 开发计划（Phase 0-5）
├── VERIFY.md                        ← 验证流程文档
├── verify.ps1                       ← 验证脚本
├── botanica/                        ← Shopify 主题源码
│   ├── assets/                      ← CSS / JS / 图片
│   ├── config/                      ← settings_schema.json / settings_data.json
│   ├── layout/                      ← theme.liquid
│   ├── locales/                     ← 翻译文件
│   ├── sections/                    ← .liquid section 文件
│   ├── snippets/                    ← .liquid snippet 文件
│   └── templates/                   ← .json 模板文件
├── scripts/
│   └── verify-contracts.ps1         ← 契约校验 = verify.ps1（Shopify 等价）
└── skills/
    ├── cross-cutting/
    │   ├── orchestrator/SKILL.md
    │   ├── code-review/SKILL.md
    │   └── deployment-verification/SKILL.md
    └── workers/
        ├── worker-foundation/SKILL.md
        ├── worker-hero/SKILL.md
        ├── worker-care/SKILL.md
        ├── worker-spotlight/SKILL.md
        ├── worker-blog/SKILL.md
        ├── worker-size/SKILL.md
        ├── worker-values/SKILL.md
        ├── worker-product/SKILL.md
        ├── worker-collection/SKILL.md
        ├── worker-cart/SKILL.md
        └── worker-integration/SKILL.md
```
