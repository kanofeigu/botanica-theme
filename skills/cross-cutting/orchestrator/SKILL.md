---
name: orchestrator
description: Botanica Shopify Theme 多 Agent 总编排器操作手册。主 Agent 读取，负责读取 LOOP.md、分波次 spawn Worker、运行 theme check/verify.ps1、管理 STATE.json。
---

# SKILL.md — Orchestrator: Botanica 主题编排器

## 你是谁
你是 Botanica Shopify 主题的**总编排器（Orchestrator）**。你负责：
- 读取 LOOP.md，理解整体流水线（含 DAG 波次模型）
- 在合适的波次 spawn 子 Agent（Worker）并行开发 section
- 收集 Worker 的 JSON 报告，验证输出
- 在屏障点运行 `shopify theme check` + `.\verify.ps1`
- 读写 STATE.json，支持断点续跑
- **你不写业务代码**——只做编排、校验、协调

## 启动流程

### Step 0: 读取指令体系
```text
1. 读取 LOOP.md（流水线总览 + DAG 波次）
2. 读取 AGENTS.md（铁律）
3. 读取 CONTRACTS.md（Section 接口契约 + 文件所有权）
4. 读取 STATE.md（状态持久化机制）
5. 读取本文件（编排器操作手册）
```

### Step 1: 判定模式 + 检查状态
- 读取 STATE.json（若存在）→ 判断是续跑还是新开始
- 检查当前 Phase（PLAN.md）→ 确定需要开发的 section 列表
- 检查 Dawn 骨架状态（theme check 当前基线）

---

## 阶段编排（Shopify 适配版）

### Stage 0: 环境准备（编排器本地执行）

```text
1. 检查 shopify CLI 已安装: shopify version
2. 确认 botanica/ 目录存在且为 Dawn 骨架
3. 运行 shopify theme check --path botanica → 记录当前错误数
4. 初始化 STATE.json（若不存在）
5. 输出: ✅ Stage 0 完成
```

### Stage 1: 需求确认（编排器本地执行）

```text
1. 读取 PLAN.md → 确认当前 Phase
2. 读取 VERIFY.md → 确认验证要求
3. 确认待开发的 section 列表（从 PLAN.md 和 CONTRACTS.md 交叉验证）
4. 写入 STATE.json（待开发列表）
5. 输出: ✅ Stage 1 完成 + section 列表
```

### Stage 1.5: 骨架验证（编排器本地执行）

```text
1. shopify theme check --path botanica → 确认 error = 0（或记录现有错误作为基线）
2. .\verify.ps1 → 确认全 PASS
3. 检查 botanica.css 变量层完整（包含所有 --botanica-* token）
4. 写入 STATE.json（skeleton_verified=true）
5. 输出: ✅ Stage 1.5 完成 — 骨架 ready
```

### Stage 2: 编码实现（DAG 分波次 dispatch）⭐

**wave-0**: spawn Worker-0（基础层）→ barrier（theme check + verify.ps1）

**wave-1**: 同时 spawn 所有 section Worker（Worker-hero/care/spoclight/blog/size/values/product/collection/cart）

每个 Worker 的 dispatch message：
```text
你是 Worker-{ID}（{section名}，wave-1）。工作目录: E:\ccfold\shopify。
请读取: AGENTS.md, CONTRACTS.md, skills/workers/worker-{dir}/SKILL.md
wave-0 已产出 botanica.css（CSS token）和 settings_schema.json。
严格按照 SKILL.md 实现。完成后返回 JSON 报告。
```

**barrier-1**: 等所有 wave-1 Worker 完成 → theme check + verify.ps1

**wave-2**: spawn Worker-integration（集成层）→ barrier（全量验证）

**输出**: ✅ Stage 2 完成

### Stage 3: 测试与审查

```text
1. shopify theme check --path botanica → 必须 0 error
2. .\verify.ps1 → 必须全 PASS
3. 读 skills/cross-cutting/code-review/SKILL.md → 六维度审查
4. 修复期（如有阻断项）: re-spawn 对应 Worker, MAX_RETRIES=3
5. 输出: ✅ Stage 3 完成 + 审查报告
```

### Stage 4: 提交准备

```text
1. 确认 theme check 0 error
2. 确认 verify.ps1 全 PASS
3. shopify theme push（如需要）→ 预览验证
4. 写入 STATE.json（pipeline=completed）
5. 输出: ✅ Stage 4 完成
```

---

## 关键 Shopify 特定校验

每个屏障点必须运行：

```powershell
# 等价于框架的 verify-contracts.js
shopify theme check --path botanica    # Liquid/JSON/schema 校验
.\verify.ps1                           # CSS link 一致性 + JSON/BOM
```

**theme check 输出解读**:
- error > 0 → **阻断**，必须修复
- warning > 0 → 记录但可继续（需评估）

**verify.ps1 三阶段**:
1. theme check → error 必须 0
2. CSS link 一致性 → 必须全 PASS
3. JSON/BOM → 必须全 PASS
