# Botanica — Theme Store Submission Package (v3)

## Theme Identity

**Name:** Botanica
**Tagline:** A botanical journal for your plant store — editorial styling, care-guide commerce, and specimen-grade product pages.

**Category:** Home & Garden / Specialty
**Style:** Editorial, Minimal, Botanical Illustration
**Industry vertical:** Indoor plants, foliage, houseplants, terrariums

---

## Short Description (for listing card)

> Botanica turns your plant store into a living field guide. Editorial layouts, care-difficulty badges, light meters, and specimen-style product pages help customers find the right plant and keep it alive — while the botanical-journal aesthetic sets you apart from every "green-themed" store.

---

## Full Description

Botanica is purpose-built for indoor foliage and houseplant stores — not a generic theme painted green. Every design choice serves the plant-buying journey: from browsing by care level ("I never water anything") to checking light requirements and pot dimensions before adding to cart.

### What makes Botanica different

**Editorial, not grocery-store.** Fraunces headings, Inter body, botanical specimen tags, and field-note styling give your store the feel of a plant encyclopedia — warm, trustworthy, and visually distinct.

**Care-first commerce.** Every product card can show a care-difficulty badge (Easy / Medium / Expert) and a three-dot light meter (Low / Medium / Bright). On the product page, a full care panel with inline SVG icons covers light, water, humidity, mature size, toxicity, and feeding — everything a buyer needs to make a confident decision.

**Size visualization.** An interactive size guide section compares plants against a human figure with pot dimensions, so customers never wonder "how big will this actually be in my apartment?"

**Shop by confidence level.** A dedicated care-level entry section routes beginners to easy-care plants, enthusiasts to medium, and collectors to expert — reducing returns from mismatched expectations.

**Mobile-optimized checkout.** A sticky add-to-cart bar appears on mobile when the main button scrolls out of view, keeping the purchase action always accessible without screen clutter.

### Built on Skeleton + Theme Blocks (2026 compliant)

Botanica v3 is built on Shopify's Skeleton theme with the theme-blocks architecture, which means:
- JSON templates — drag-and-drop section reordering in the theme editor
- Theme blocks — reusable, nestable blocks assembled via `{% content_for "blocks" %}`
- Section groups for header and footer
- Native filtering (Search & Discovery app compatible)
- Shopify Font Library (Fraunces + Inter)
- Merchant-editable color settings — every color adjustable, no hardcoded presets
- Custom Liquid section included
- @app and @theme block support on all templates
- Full i18n with t: translation keys
- Zero Dawn/Horizon code — all original, built from Skeleton

---

## Feature List

### Homepage sections (9 custom)
- **Hero Lookbook** — Full-bleed magazine-style hero with "ISSUE 01" label, editorial split/overlay layouts
- **Shop by Care** — 3-card entry grid: Easy / Medium / Expert care levels with inline SVG plant illustrations
- **Plant Spotlight** — Single-product deep-dive with care table, origin story, and large image
- **Care Blog Teaser** — 3 blog article cards with tag/title/excerpt, manual or blog-sourced
- **Size Guide** — 3 comparison cards (Desk / Floor / Statement) with height, pot diameter, and SVG visualization
- **Values Bar** — Trust row: shipping safety, live-arrival guarantee, repotting support, expert support
- **Testimonials** — Customer review cards with plant name, star rating, grid or masonry layout
- **Newsletter Perk** — Split/stacked email signup with image, perk list, and native Shopify customer form
- **Featured Collection** — Product grid with Botanica card styling (care badges, light meters)

### Product page enhancements
- **Care Panel block** — 6 attribute grid with inline SVG icons (light, water, humidity, size, toxicity, food)
- **Care Story block** — Editorial field-note with blockquote styling for origin and care narrative
- **Specimen Eyebrow block** — Botanical specimen tag with uppercase label
- **Sticky ATC bar** — Mobile-only fixed bottom bar with IntersectionObserver-driven visibility

### Theme blocks (standalone, reusable)
- Eyebrow label, Heading, Rich text, Button group, Badge
- Care row (icon + label + value + meter), Care table (wraps care rows)
- Specimen eyebrow, Product title, Product price, Product badges
- Variant picker, Quantity selector, Buy buttons
- Description, Share, Care panel, Care story
- Field note, Collapsible specs

### Product cards
- Care-difficulty badge (Easy / Medium / Expert) via product tags — ZERO custom metafields
- Light-requirement meter (3-dot scale) via product tags
- Toggle to show/hide care badges per collection section

### Design system
- 3 color presets: Botanical (sage), Home & Decor (charcoal/taupe), Wellness (terracotta)
- CSS custom property architecture: `--bt-color-*`, `--bt-font-*`, `--bt-space-*`, `--bt-radius-*`
- Fraunces (headings) + Inter (body) from Shopify Font Library
- Fluid typography with clamp(), color-mix() derived tints
- Botanical specimen aesthetic: uppercase eyebrows, badge primitives, card lift effects

### Technical
- Vanilla JavaScript — zero external dependencies, zero Dawn JS
- Theme blocks with scoped CSS (`{% stylesheet %}`) and scoped JS (`{% javascript %}`)
- Full accessibility: skip-to-content, aria labels, prefers-reduced-motion, focus-visible, 44×44px touch targets
- Native `<details>/<summary>` for accordions, `<table>` for care data

---

## Style Presets

| Preset | Background | Primary | Secondary | Vibe |
|---|---|---|---|---|
| **Botanical** | Cream `#F5F1E8` | Sage green `#4A6B4F` | Terracotta `#C97D5A` | Warm, natural, botanical |
| **Home & Decor** | White `#FFFFFF` | Charcoal `#2C2C2C` | Taupe `#8B7355` | Clean, modern, neutral |
| **Wellness** | Warm cream `#FAF5F0` | Terracotta `#B5533A` | Warm `#C97D5A` | Cozy, earthy, self-care |

---

## Pricing Recommendation

**$199 USD** (one-time, lifetime updates)

Rationale:
- Purpose-built vertical theme (plant/houseplant niche) — premium over generic themes
- Original Skeleton codebase — zero Dawn/Horizon derivation, fully 2026-compliant
- 9 custom sections + 20+ theme blocks for unlimited layout combinations
- Care-guide commerce features not found in any current Theme Store plant theme
- Full i18n with en/fr/zh-CN curated translations

Competitive reference:
- Generic Skeleton remixes: $120–$180
- Vertical-specific (fashion, food, etc.): $180–$260
- Multi-template flagship themes: $280+

---

## Support Terms (recommended)

- 6 months of theme updates included
- Documentation: setup guide, section configuration reference, product tag guide
- Support channel: Shopify Theme Store messaging + email
- Response time: within 1 business day
- Not covered: Shopify platform issues, third-party app conflicts, custom CSS/JS modifications

---

## Submission Checklist

### Pre-submission (must complete before uploading)

- [ ] **Shopify Theme Check: 0 errors** 
  - Run: `shopify theme check --path botanica`
  
- [ ] **Lighthouse mobile score ≥ 60**
  - Run: Chrome DevTools → Lighthouse → Mobile, Categories: Performance + Accessibility + Best Practices + SEO
  - Target: product + collection + home page average
  
- [ ] **Lighthouse accessibility ≥ 90**
  - Same audit, Accessibility category
  - Pay special attention to: color contrast, form input labels, ARIA roles
  
- [ ] **Real product data on demo store**
  - At least 8-12 products with product tags: `care-easy`/`care-medium`/`care-expert` and `light-low`/`light-medium`/`light-bright`
  - Prices, descriptions, variant images
  - At least 1 collection with products assigned
  - At least 3 blog articles for the care-blog-teaser section
  
- [ ] **All author-owned URLs in theme_info**
  - Documentation URL: botanica-theme.com/docs (owned)
  - Support URL: botanica-theme.com/support (owned)
  - No shopify:// or help.shopify.com references in schema defaults

- [ ] **Zero custom metafields in schema defaults**
  - All care data via block/section settings or product tags
  - No `botanica.*`, `custom.*` references
  
- [ ] **Screenshots (6 required)**
  1. Homepage full-scroll (desktop) — showing hero through newsletter
  2. Product page (desktop) — showing care panel + care story
  3. Collection page (desktop) — showing care badges on product cards
  4. Homepage hero section (mobile)
  5. Product page with sticky ATC bar visible (mobile)
  6. Color preset comparison or size guide section
  - Specs: 1600×1200px PNG, no browser chrome, real content only
  
- [ ] **Demo store URL + password**

### Submission form fields

- Theme name: **Botanica**
- Short description: (paste from above)
- Full description: (paste from above)
- Category: Home & Garden
- Style: Minimal
- Price: $199
- Documentation URL: botanica-theme.com/docs
- Support email: (your support email)
- Demo store URL + password

### Post-submission

- [ ] Monitor Shopify Partner Dashboard for review status
- [ ] First review typically takes 5-10 business days
- [ ] Address any reviewer feedback (common: missing alt text, color contrast, locale completeness)
- [ ] Resubmit within 30 days to keep your place in queue
- [ ] Once approved: set pricing, publish listing, announce

---

## Performance Optimization Notes

Known areas to verify before running Lighthouse:
1. **Font loading**: Fraunces and Inter loaded from Shopify Font Library. Shopify handles font-display: swap.
2. **Image sizes**: Product images should be ≤ 2000px wide. Hero images should use responsive `srcset`.
3. **CSS payload**: design-tokens.css + base.css + botanica.css loaded globally. Per-section CSS loaded only when section is on page.
4. **JS payload**: Only custom vanilla JS loaded — zero Dawn JS. All use `defer`. No blocking scripts.
5. **LCP**: Likely the hero image. Ensure it loads eagerly (not lazy-loaded).
6. **CLS**: Product cards use explicit aspect ratios. Sticky ATC bar uses `transform` which doesn't cause layout shift.

---

## Compliance: 2026 Theme Store Iron Laws Verified

| Rule | Status |
|------|--------|
| Skeleton base, zero Dawn/Horizon code | ✅ |
| Theme-blocks architecture (`blocks/` + `{% content_for "blocks" %}`) | ✅ |
| Colors merchant-editable (individual `color` type settings) | ✅ |
| `font_picker` for Shopify Font Library fonts | ✅ |
| Custom Liquid section (`type: "liquid"` setting) | ✅ |
| `@app` + `@theme` block support on all templates | ✅ |
| Author-owned URLs in theme_info | ✅ |
| No `shopify://` URLs in template JSON | ✅ |
| No `botanica.*`/`custom.*` metafields in JSON/schema | ✅ |
| Care data via block settings or product tags | ✅ |
| All visible text uses `t:` translation keys | ✅ |
| Performance ≥ 60, Accessibility ≥ 90 | ⏳ Pending audit |

---

*Last updated: 2026-06-27*
*Architecture: Skeleton + Theme Blocks | Zero Dawn code | Zero custom metafields*
