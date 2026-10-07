---
name: mobile-web-ux
description: Mobile web UX doctrine and audit checklist for the Verdant Shopify theme. Use when designing, building, reviewing, or fixing any mobile viewport UI in this theme — layouts, navigation, PDP, cart, forms, touch interactions. Not for native app design.
---

# Mobile Web UX (Verdant Theme)

Core law: **mobile is NOT a small desktop**. Design for thumbs, one hand, intermittent attention, and cellular networks. Every change must be verified with a real 390px-wide screenshot, never assumed.

## Theme architecture constraints (do not violate)

- Section-scoped CSS: mobile styles go in the section's own `.css` file under its top-level class (e.g. `.bt-hero`). Never add global mobile overrides to `botanica.css` unless truly global.
- Breakpoints: `750px` (phone) and `990px` (tablet) — mobile-first, `min-width` queries only. Do not invent new breakpoints.
- CSS variables only (`--color-*`, `--botanica-*`), no hardcoded colors. BEM naming `.section__el--mod`.
- Zero external JS/CSS libraries. Vanilla JS ES modules, defer.
- After every change: `shopify theme check --path botanica` must stay 0 error.

## Touch & interaction rules

1. All tappable elements ≥ 44×44px (buttons, icons, menu items, variant swatches, qty steppers). If visual size must be smaller, expand with padding or a transparent ::before hit-area.
2. No hover-dependent interactions on mobile — everything must work on tap. Hover states are progressive enhancement only.
3. Carousels/swipers: native scroll-snap or swipe; always show partial next item (peek) so users know it scrolls.
4. Sticky elements: PDP gets a sticky bottom Add-to-Cart bar (thumb zone); announcement/header sticky only if height stays ≤ 60px.
5. Modals/drawers on mobile: full-screen or bottom-sheet, close on backdrop tap + visible × button ≥ 44px.
6. `input`, `select`, `textarea` font-size ≥ 16px (prevents iOS auto-zoom).
7. No horizontal scroll anywhere below 750px except intentional carousels. Audit with `document.documentElement.scrollWidth === innerWidth`.

## Layout & typography

1. Mobile type scale: body 15–16px, line-height 1.5–1.65; headings use `clamp()` fluid sizes; hero H1 ≤ 2.5rem on phone.
2. Section vertical padding: 32–48px on phone (not the desktop 80–120px).
3. Multi-column desktop grids collapse to 1 column (products may use 2-up grid on phone, never more).
4. Long text blocks: max-width ~38rem, avoid full-bleed walls of text.
5. Tables (size guides, specs): convert to stacked key/value cards or horizontal-scroll wrapper with visible affordance.
6. Images: `sizes` attribute must reflect real mobile layout (e.g. `100vw`), srcset includes 375/414/750w; hero uses `loading="eager"` + `fetchpriority="high"`, everything below the fold `lazy`.

## E-commerce mobile patterns

1. PDP order on mobile: gallery → title/price → variant picker → ATC → care/details in `<details>` accordions. Description below.
2. Variant selection: swatches/buttons, never tiny dropdowns; sold-out states visible without tapping.
3. Cart: drawer or dedicated page with thumb-reachable checkout button; qty steppers ≥ 44px.
4. Collection: filters open as bottom sheet with apply/count; sort is a single select; active filter chips removable.
5. Forms (newsletter, contact): one column, labels above inputs, correct `inputmode`/`autocomplete` (`email`, `tel`).
6. Checkout buttons full-width on phone.

## Audit procedure

1. Screenshot at 390×844 (iPhone 14) with puppeteer — homepage, PDP, collection, cart, one blog article. Password storefront: type password from user-provided value first.
2. Check per page: horizontal overflow, tap target sizes, sticky ATC presence, text legibility (zoom to 100%, judge body text), image cropping.
3. Compare against rules above; list violations with section + selector + fix.
4. Fix in section CSS (mobile-first media queries), re-run theme check, re-screenshot same pages, confirm fixed.
5. Re-run Lighthouse mobile after changes: performance must stay ≥ 60, accessibility ≥ 90.
