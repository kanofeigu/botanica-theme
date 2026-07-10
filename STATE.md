# STATE.md — Botanica 状态持久化机制

> **定位**: 定义流水线运行时状态（STATE.json）的 schema、读写规则、断点续跑。
> **读者**: Orchestrator（读写）、维护者（理解）。Worker 不读此文件。
> **版本**: 1.0.0

---

## 一、STATE.json Schema

```json
{
  "schema_version": "1.0.0",
  "project": "Botanica",
  "pipeline": {
    "started_at": "2026-06-26T00:00:00Z",
    "last_updated": "2026-06-26T00:00:00Z",
    "current_stage": "stage-2-wave-1",
    "status": "in_progress",
    "phase": "phase-2"
  },
  "stages": {
    "stage-0": { "status": "completed", "shopify_cli_version": "3.x", "finished_at": "..." },
    "stage-1": { "status": "completed", "phase": "phase-2", "pending_sections": ["hero-lookbook","shop-by-care","plant-spotlight","care-blog-teaser","botanica-size-guide","botanica-values-bar"], "finished_at": "..." },
    "stage-1.5": { "status": "completed", "skeleton_verified": true, "theme_check_errors": 0, "finished_at": "..." },
    "stage-2": {
      "status": "in_progress",
      "waves": {
        "wave-0": { "status": "completed", "finished_at": "..." },
        "wave-1": { "status": "in_progress" },
        "wave-2": { "status": "pending" }
      }
    },
    "stage-3": { "status": "pending" },
    "stage-4": { "status": "pending" }
  },
  "workers": [
    {
      "worker_id": "Worker-0",
      "wave": "wave-0",
      "skill": "skills/workers/worker-foundation/SKILL.md",
      "status": "completed",
      "files": [
        {"path": "botanica/config/settings_schema.json", "operation": "modified"},
        {"path": "botanica/assets/botanica.css", "operation": "modified"}
      ],
      "report": { "self_check": "passed", "errors": [] },
      "started_at": "...",
      "finished_at": "...",
      "retries": 0
    }
  ],
  "verify_results": {
    "last_theme_check_errors": 0,
    "last_verify_ps1": "PASS",
    "last_run": "..."
  }
}
```

---

## 二、读写规则

### Orchestrator 写入时机
1. Stage 0 初始化：创建 STATE.json
2. 每个 Stage/波次开始/结束：更新 stages 状态
3. 每个 Worker spawn 前：登记 worker 条目（status=pending）
4. 每个 Worker 返回后：更新 status + files + report
5. 每次 verify 后：更新 verify_results

### Orchestrator 读取时机
1. 启动时：读取 STATE.json，判断从哪续跑
2. spawn Worker 前：检查该 Worker 是否已 completed（跳过）

---

## 三、断点续跑

```text
1. 读取 STATE.json
   ├─ 不存在 → 全新开始（Stage 0）
   └─ 存在 → 检查 pipeline.status
       ├─ completed → 提示"项目已完成"
       └─ in_progress/failed → 从 current_stage 续跑

2. 续跑: 已完成且 status=completed 的 Worker 跳过
```

---

## 四、.gitignore

```gitignore
# 流水线运行时状态
STATE.json
```
