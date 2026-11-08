# Verdant — Shopify OS 2.0 Theme

An original Shopify Online Store 2.0 theme for indoor plant & foliage stores.
Editorial "plant encyclopedia" aesthetic — not a Dawn derivative.

- **Theme source**: [`botanica/`](botanica/)
- **Live demo**: [kano-u93kwgf9.myshopify.com](https://kano-u93kwgf9.myshopify.com) (password: `tivaws`)
- **Target**: Shopify Theme Store submission

## Branches

| Branch | State | Purpose |
|---|---|---|
| `main` | ✅ in sync | Default branch — always mirrors the latest stable work |
| `product` | ✅ in sync | Active development branch; merged into `main` at each milestone |
| `product-data` | archived | Store data tooling (metafield scripts, audits) |
| `redesign/*` | archived | Historical layout exploration branches |

## Status

| Gate | Result |
|---|---|
| `shopify theme check` | 0 offenses (153 files) |
| Lighthouse (mobile) | perf 72–80 · a11y 97–100 · SEO 100 · CLS ≈ 0 |
| Templates | 15 required templates incl. 404 / search / password / cart |
| External JS libs | none |
| Mobile UX | dedicated mobile design (not a scaled-down desktop) |

## Highlights

- **Mobile-first redesign** — scrim hero with single full-width CTA, PDP swipe gallery with dot pagination + sticky ATC, horizontal product rails, accordion care guide & footer, 48px touch targets
- **Fluid scaling** — `clamp()` type/spacing scale, `svh` viewport units, smooth 390→1440px with no breakpoint jumps
- **SVG sprite icons** — 14 symbols referenced via `<use>`, no repeated path data
- **Original v3 codebase** — zero Dawn code (Dawn-derived themes are rejected by the Theme Store since 2025-05)

## Repository layout

```
botanica/        Theme source (sections, blocks, snippets, assets, templates)
screenshots/     Theme Store listing screenshots (11, current)
docs/            Merchant documentation site (index / faq / sections / support)
important/       Runtime docs: architecture, lifecycle, bug log, lessons
scripts/         Store data & audit tooling
```

> ⚠️ `AGENTS.md`, `PROJECT.md`, `CLAUDE.md`, `PLAN.md`, `CONTRACTS.md`, `LOOP.md`
> describe the rejected Dawn-based v1 and are kept for history only.
> The authoritative blueprint is `docs/botanica-v3/` (read `02-PLAN.md`, `04-COMPLIANCE.md`).

## Development

```bash
# Validate (must stay at 0 offenses)
shopify theme check --path botanica

# Push to the live dev store
shopify theme push --path botanica --theme 155548713151 --allow-live
```

**Deployment rule**: `shopify://shop_images/...` references must never stay in source.
Push everything first, then push `templates/index.json` alone with the image
references, then restore the local file.

**Deletion rule**: nothing is permanently deleted. Local files go to the Windows
Recycle Bin; Shopify resources are `ARCHIVED`, not deleted; git files use `git rm`.

## Deliverables

Packaged submission assets live in `E:\ccfold\shopify-dev\` (local only, not in git):

```
01-theme/        Verdant-1.0.0.zip + full source snapshot
02-screenshots/  Listing screenshots
03-docs/         Documentation site (deploy before submitting)
```
