---
name: worker-foundation
description: Botanica 基础层 Worker（wave-0）。产出全局 settings_schema.json、settings_data.json（3 套配色预设）、botanica.css（品牌 CSS token 层 + 全局工具类）、en.default.json（基础翻译）。
---

# SKILL.md — Worker-0: 基础层（wave-0）

## 你是谁
你是 Botanica 主题的**基础层 Worker**，处于 DAG 的 **wave-0**（最先执行）。
你负责整个主题的"契约层"——全局设置 schema、CSS 设计 token、基础翻译。
后续所有 section Worker（wave-1）都依赖你产出的 CSS 变量和 settings 定义。

## 读取清单（开工前必读）

1. `AGENTS.md` — 铁律（特别关注：Shopify 合规、0 error、CSS 必 link）
2. `CONTRACTS.md` — 特别关注 §零 共享契约层 + §0.2 CSS 变量契约
3. 本文件 `skills/workers/worker-foundation/SKILL.md`

## 你的文件

| 文件 | 说明 | 操作 |
|------|------|------|
| `botanica/config/settings_schema.json` | 全局主题设置（色板、字体、布局、按钮、卡片等） | 修改 |
| `botanica/config/settings_data.json` | 默认设置值（3 套配色预设：sage/moss/white） | 修改 |
| `botanica/assets/botanica.css` | Botanica 品牌 CSS 变量层 + 全局工具类 | 修改 |
| `botanica/locales/en.default.json` | 基础翻译（settings_schema 用的所有 label/info key） | 修改 |

## 实现清单

### 1. botanica.css — 品牌 token 层

确保以下内容完整且最新：

**品牌色板**（已基本完成，检查对齐）:
- `--botanica-sage-*` (100-500): sage 绿色色阶
- `--botanica-cream-*` (100-300): 奶油暖白色阶
- `--botanica-terracotta-*` (300-500): 陶土色色阶
- `--botanica-bark-*` (300-700): 深褐文字色阶

**语义别名**:
- `--botanica-accent: var(--botanica-terracotta-500)`
- `--botanica-accent-soft: var(--botanica-terracotta-300)`
- `--botanica-success: var(--botanica-sage-500)`
- `--botanica-success-soft: var(--botanica-sage-200)`

**Section 间距变量**:
- `--botanica-section-gap-y`
- `--botanica-section-pad-y`
- `--botanica-edge-pad`

**排版微调**:
- `--botanica-tracking-tight`, `--botanica-tracking-wide`
- `--botanica-line-tight`, `--botanica-line-snug`

**阴影**:
- `--botanica-shadow-float`, `--botanica-shadow-card`

**全局工具类**（确保都存在）:
- `.botanica-eyebrow` — 大写宽间距标签
- `.botanica-badge`, `.botanica-badge--easy`, `.botanica-badge--medium`, `.botanica-badge--expert`
- `.botanica-light-meter`, `.botanica-light-meter__dot`, `.botanica-light-meter__dot--on`
- `.botanica-lift` — hover 浮动效果（含 prefers-reduced-motion 保护）
- `.botanica-section`, `.botanica-section--wide-gap`
- 产品卡 1:1 aspect-ratio 强制（`.product-grid .card__inner { aspect-ratio: 1/1 }`）
- 合集卡 4:5 aspect-ratio
- 博客卡 4:3 aspect-ratio

### 2. settings_schema.json — 全局设置

确认以下设置组完整：

1. **theme_info** — theme_name="Botanica", version="1.0.0"
2. **Logo** — logo image, logo_width, favicon
3. **Colors** — color_scheme_group（含 3 套预设的 role mapping）
4. **Typography** — type_header_font (Fraunces), type_body_font (Inter), heading_scale, body_scale
5. **Layout** — page_width, spacing_sections, spacing_grid
6. **Animations** — animations_reveal_on_scroll, animations_hover_elements
7. **Buttons** — border thickness/opacity/radius/shadow
8. **Variant Pills** — 同上
9. **Inputs** — 同上
10. **Cards** — product card / collection card / blog card 各自 style/padding/radius/shadow
11. **Content containers** — text_boxes border/radius/shadow
12. **Media** — border/radius/shadow
13. **Popups & Drawers** — border/radius/shadow
14. **Badges** — position, sale/sold_out color_scheme
15. **Brand information** — brand_headline, brand_description, brand_image
16. **Social media** — 社交链接
17. **Search input** — predictive_search 设置
18. **Currency format** — currency_code_enabled
19. **Cart** — cart_type (drawer/page/notification), cart_drawer_collection

### 3. settings_data.json — 默认值

确保 3 套配色预设的 color_schemes 数组存在：
1. **scheme-1** (默认 Sage): background=#F5F1E8, text=#2E2A24, button=#4A6B4F
2. **scheme-2** (苔藓深绿): background=#2E2A24, text=#F5F1E8, button=#4A6B4F
3. **scheme-3** (极简白): background=#FFFFFF, text=#2E2A24, button=#4A6B4F

### 4. en.default.json — 基础翻译

确保所有 settings_schema 中引用的 `t:` key 在 en.default.json 中存在。特别是：
- `t:settings_schema.colors.name`
- `t:settings_schema.typography.name`
- `t:settings_schema.layout.name`
- 以及它们内部每个 setting 的 label

## 自检命令

```powershell
shopify theme check --path botanica
.\verify.ps1
```

## 完成标志

- [ ] 4 个文件全部更新
- [ ] botanica.css 包含所有 §0.2 列出的 CSS 变量和工具类
- [ ] settings_schema.json 所有设置组完整、合法 JSON
- [ ] settings_data.json 3 套配色预设完整
- [ ] en.default.json 包含所有引用的 locale key
- [ ] `shopify theme check` error = 0
- [ ] `.\verify.ps1` 全 PASS
- [ ] 所有文件 UTF-8 without BOM
- [ ] 返回 JSON 报告

## 完成后必须返回 JSON 报告

```json
{
  "worker_id": "Worker-0",
  "wave": "wave-0",
  "status": "ok | error",
  "files_created": [],
  "files_modified": ["botanica/config/settings_schema.json", "botanica/config/settings_data.json", "botanica/assets/botanica.css", "botanica/locales/en.default.json"],
  "self_check": "passed | failed",
  "errors": []
}
```
