# CLAUDE.md

> ⚠️ **方向已更新（2026-06-27）** — 下文描述的 **Dawn-based v1 已被 Shopify Theme Store 拒绝**（自 2025-05-15 起，Dawn/Horizon 派生主题一律不允许提交）。
> 新主题在 **Skeleton** 上全原创重建。**权威蓝图：`docs/botanica-v3/`**（先读 `README.md`，施工读 `02-PLAN.md`，合规读 `04-COMPLIANCE.md`）。
> 磁盘上的 `botanica/` Dawn 树仅作 throwaway 原型，**不是提交物**。下文 Dawn 相关内容仅作历史参考。

> ★ **用户说"继续 Botanica 项目"时，必须先读 `important/` 目录。** 该目录是项目运行时的完整文档体系（架构、生命周期、功能树、修改检查、bug 日志、经验教训）。先读 `important/README.md`，再按需读其他文件。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Botanica is a Shopify theme for indoor foliage/plant stores (Monstera, fiddle-leaf fig, snake plant, etc.), built on **Dawn** (Shopify's reference theme). Target: official Shopify Theme Store. The theme is "plant encyclopedia" styled — editorial, botanical-illustration aesthetic — not "grocery store."

- **Working directory**: `botanica/` (the theme root)
- **Base**: Dawn (Shopify Online Store 2.0 / JSON templates architecture)
- **Fonts**: Fraunces (headings), Inter (body) — from Shopify Font Library
- **Colors**: Default sage green `#4A6B4F`, cream `#F5F1E8`, terracotta `#C97D5A`, bark `#2E2A24`

## Key commands

```bash
# Run theme check (zero errors required before any preview)
shopify theme check --path botanica

# Full verification pipeline (theme check + CSS link consistency + JSON/BOM)
.\verify.ps1

# Push theme to dev store for preview
shopify theme push --path botanica --store <store-name>

# Local dev server with hot reload
shopify theme dev --path botanica --store <store-name>
```

## Architecture

### Template structure (OS 2.0 JSON)

All templates are JSON files in `templates/` that reference sections by type. The homepage assembly is `templates/index.json`. Each template specifies `"sections"` (by type + settings + blocks) and `"order"` (vertical sequence). This is standard Dawn/OS2 — merchants reorder sections in the theme editor.

### Layout skeleton

`layout/theme.liquid` is the shell: `<head>` loads fonts, CSS variables from settings, global JS, then `{% sections 'header-group' %}`, `<main>` with `{{ content_for_layout }}`, then `{% sections 'footer-group' %}`. Header and footer are rendered via section groups (`sections/header-group.json`, `sections/footer-group.json`), not hardcoded.

### CSS architecture (3-layer)

1. **Dawn component CSS** — `component-*.css`, `section-*.css` (inherited from Dawn, loaded by Dawn sections/snippets)
2. **Botanica brand layer** — `assets/botanica.css` (loaded globally in `theme.liquid`): CSS custom properties for brand palette, `--botanica-*` tokens, typographic polish, card aspect-ratio overrides, badge primitives, utility classes (`.botanica-eyebrow`, `.botanica-badge`, `.botanica-lift`, `.botanica-section`)
3. **Per-section CSS** — custom sections each have a dedicated CSS file: `hero-lookbook.css`, `shop-by-care.css`, `plant-spotlight.css`, `care-blog-teaser.css`, `botanica-size-guide.css`, `botanica-values-bar.css`

**CSS loading rule**: Every section `.liquid` file must include `{{ '<name>.css' | asset_url | stylesheet_tag }}` at the top if a matching CSS file exists in `assets/`. The `verify.ps1` script catches missing links. Dawn's component CSS files (carts, facets, etc.) are loaded globally or via `media="print" onload` lazy-load pattern in `theme.liquid` — do not duplicate their loading in sections.

### Custom Botanica sections (Phase 2 deliverables)

All follow the same pattern: Liquid section with blocks, settings schema inline, dedicated CSS file, and use `botanica-eyebrow` / `botanica-lift` / `botanica-badge` utility classes from `botanica.css`.

| Section | Purpose | Key pattern |
|---|---|---|
| `hero-lookbook` | Full-bleed hero with text overlay + "ISSUE 01" magazine label | Split/stacked layouts, block-based content (eyebrow/heading/subheading/buttons) |
| `shop-by-care` | 3-card grid: easy/medium/expert care levels | Each block = one care card, inline SVG icons for plant shapes |
| `plant-spotlight` | Single product focus with care table, origin story, large image | Uses `care_row` blocks for light/water/humidity/size/toxicity rows |
| `care-blog-teaser` | 3 blog article cards (manual or from blog) | `manual_card` blocks with tag/title/excerpt |
| `botanica-size-guide` | 3 size comparison cards (desk/floor/statement) | `size_card` blocks with height_cm, pot_cm, SVG human+pot visualization |
| `botanica-values-bar` | Trust bar: shipping/guarantee/repot/support icons | `value_item` blocks with inline SVG icons |
| `featured-collection` | Dawn section, used as-is with Botanica card styling | Product cards get 1:1 aspect ratio via `botanica.css` |

### Section settings schema

Custom sections define their settings schema in `sections/<name>.liquid` using `{% schema %}` tag (standard Shopify). Block types, settings, and presets are all inline. Template JSON files (`templates/index.json`) hold the merchant-configured values.

### JS layer

All JS is vanilla ES modules from Dawn (`assets/*.js`). No external dependencies. Key files: `global.js`, `pubsub.js`, `constants.js`. Custom JS additions go in `assets/` and get loaded via `<script src="{{ 'file.js' | asset_url }}" defer="defer"></script>`.

### Locales

20+ languages in `locales/*.json`. Primary: `en.default.json` (fallback), `fr.json`, `zh-CN.json`. Schema files (`*.schema.json`) define translatable setting labels. Translation keys use dot notation: `t:settings_schema.colors.name`.

### Theme settings (`config/settings_schema.json`)

Global theme settings: logo, color schemes (3 presets — default sage, moss green, minimalist white), typography (Fraunces/Inter), layout (page width, grid spacing), animations (reveal on scroll, hover effects), buttons/inputs/cards/media/popups/drawers border-radius-shadow, badges, social links, cart type, predictive search, currency format.

**Color scheme system**: Dawn's `color_scheme_group` with role mapping (text, background, button, etc.) generates CSS variables as `--color-*` on `:root` and `.color-{scheme-id}`. Botanica's accent colors (`--botanica-*`) are separate tokens on top, not part of the scheme system.

## Development workflow

### Before every preview to user, run:

```powershell
.\verify.ps1
```

This runs 3 checks:
1. `shopify theme check` — must have **zero errors**
2. CSS link consistency — every `.liquid` with a matching `.css` in assets must include a `stylesheet_tag` for it
3. JSON validity + BOM check — all config/template/section JSON must parse, no UTF-8 BOM

### Historical bugs to avoid

- **CSS file created but not linked** → section collapses to text stack in split mode
- **PowerShell `ConvertTo-Json` + `Out-File` adds BOM** → theme check rejects with `ValidJSON` error. Use `Write-Output` piped or `[IO.File]::WriteAllText` with `new UTF8Encoding($false)` instead
- **Font handle not in Shopify Font Library** → settings_data upload fails silently
- **settings_data numeric field step mismatch** → server rejects upload

### Phase status (from PLAN.md)

Currently in **Phase 2** (HomePage sections). Phase 0-1 (Dawn skeleton, design tokens) are done.
- Phase 3 (product/collection/cart templates) — pending
- Phase 4 (CRO interactions — quick view modal, sticky ATC) — pending
- Phase 5 (compliance, Lighthouse ≥80, Theme Store submission) — pending

**Important constraint for Phase 4**: Theme Store requires features use native OS 2.0 capabilities or free public apps. Prefer section blocks over extra JS/service dependencies.

### Adding a new section

1. Create `sections/<name>.liquid` with settings schema, Liquid markup, block types
2. Create `assets/<name>.css` with scoped styles
3. Reference the CSS at the top of the liquid file: `{{ '<name>.css' | asset_url | stylesheet_tag }}`
4. Add the section to `templates/index.json` (or relevant template) in the `"sections"` dict and `"order"` array
5. Run `.\verify.ps1` before reporting completion

## Multi-Agent workflow (Orchestrator + Worker DAG)

This project uses the Workflow v2.0 multi-agent engineering pipeline adapted for Shopify theme development. See `LOOP.md` for the full pipeline.

### Quick reference
- **Entry point**: `LOOP.md` — read this to understand the full DAG pipeline
- **All-agent rules**: `AGENTS.md` — iron laws every Worker must obey
- **Section contracts**: `CONTRACTS.md` — file ownership, section schemas, CSS variable dependencies
- **Project spec**: `PROJECT.md` — full technical spec (Orchestrator only)
- **State tracking**: `STATE.md` / `STATE.json` — progress persistence for resume

### DAG Wave model (Shopify-adapted)
```
wave-0 (Foundation):   Worker-0 → settings_schema + botanica.css + locales
         ↓ barrier (theme check + verify.ps1)
wave-1 (Sections):     9 Workers parallel → each builds 1 section (liquid + css)
         ↓ barrier (theme check + verify.ps1)
wave-2 (Integration):  Worker-integration → templates/*.json + layout
         ↓ barrier (full verification)
```

### Worker dispatch
Each Worker reads only 3 files: `AGENTS.md` + `CONTRACTS.md` + `skills/workers/worker-*/SKILL.md`. They write only their assigned files (no overlap). After completion, each returns a JSON report.

### Contract verification (barrier check)
```powershell
.\scripts\verify-contracts.ps1    # Full check: file ownership + CSS link + JSON/BOM + theme check
.\verify.ps1                      # Original verify (also works)
shopify theme check --path botanica  # Just syntax/schema check
```
