# Botanica 2.0 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Botanica from Skeleton Theme into the best Shopify theme on the Theme Store — 32 sections, 5 presets, 29 cinematic CSS effects, 40+ micro-interactions, ≥90 desktop Lighthouse, ≥95 accessibility, 20 locales.

**Architecture:** Skeleton Theme base → Botanica design token layer → 4-layer CSS (tokens → base → animations → sections) → vanilla JS ES modules → JSON templates (14 types) + `/listings` (5 presets) → 25-product demo store.

**Tech Stack:** Shopify Skeleton Theme, Liquid, vanilla CSS (custom properties), vanilla JS (ES modules, IntersectionObserver, requestAnimationFrame), Shopify CLI, Theme Check.

**Estimated total:** 15-16 weeks. Each phase checkpoint requires `shopify theme check` zero errors.

---

## File Structure Map

```
botanica/
├── assets/
│   ├── design-tokens.css          # P1 — all --bt-* variables
│   ├── botanica-base.css          # P1 — reset, typography, .btn, .card, forms, utilities
│   ├── botanica-animations.css    # P5 — @keyframes, .anim-*, reduced-motion
│   ├── critical.css               # P7 — above-fold critical CSS (inlined in <head>)
│   ├── section-*.css              # P2–P4 — one per section (26 files)
│   ├── theme.js                   # P4 — global: nav, search, cart-notification
│   ├── scroll-animations.js       # P5 — IntersectionObserver: reveals, parallax
│   ├── quick-view.js              # P4 — quick view modal
│   ├── sticky-atc.js              # P4 — mobile sticky ATC bar
│   ├── plant-finder.js            # P4 — quiz engine
│   ├── compare-slider.js          # P4 — before/after comparison
│   ├── lookbook-gallery.js        # P4 — masonry + lightbox
│   └── mega-menu.js               # P4 — image-preview mega menu
├── blocks/                        # P2 — reusable theme blocks
│   ├── care-panel.liquid
│   ├── care-story.liquid
│   ├── specimen-plate.liquid
│   └── social-grid-item.liquid
├── config/
│   ├── settings_schema.json       # P0 — 9 tab groups
│   └── settings_data.json         # P6 — 5 presets with real data
├── layout/
│   └── theme.liquid               # P0 — custom skeleton
├── listings/                      # P1 — 5 preset folders
│   ├── botanica/templates/        # index.json, product.json, collection.json
│   ├── greenhouse/templates/
│   ├── nocturne/templates/
│   ├── herbarium/templates/
│   └── conservatory/templates/
├── locales/                       # P8 — 20 language files
│   ├── en.default.json
│   ├── fr.json, de.json, es.json, it.json, ...
│   └── *.schema.json
├── sections/                      # P2–P4 — 32 section .liquid files
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero-lookbook.liquid
│   ├── shop-by-care.liquid
│   ├── plant-spotlight.liquid
│   ├── plant-finder.liquid
│   ├── ... (28 more)
├── snippets/                      # P0–P4 — reusable Liquid
│   ├── icon-*.liquid              # SVG icon snippets (light, water, humidity, etc.)
│   ├── card-product.liquid        # Product card snippet
│   ├── card-article.liquid        # Article card snippet
│   ├── badge-care.liquid          # Care level badge
│   ├── meter-light.liquid         # Light meter dots
│   ├── meter-water.liquid         # Water meter dots
│   ├── grain-overlay.liquid       # Paper grain texture
│   ├── price.liquid               # Price display with compare-at
│   └── social-icons.liquid        # Social media icon set
└── templates/                     # P1 — 14 base JSON templates
    ├── index.json
    ├── product.json
    ├── collection.json
    ├── cart.json
    ├── search.json
    ├── page.json
    ├── page.contact.json
    ├── page.about.json
    ├── page.faq.json
    ├── blog.json
    ├── article.json
    ├── list-collections.json
    ├── 404.json
    ├── password.json
    ├── gift_card.json
    └── customers/
        ├── account.json
        ├── activate_account.json
        ├── addresses.json
        ├── login.json
        ├── order.json
        ├── register.json
        └── reset_password.json
```

---

## Phase 0: Foundation (Week 1–2)

> **Checkpoint:** `shopify theme check` zero errors. Skeleton Theme init complete. Design tokens loaded. Theme skeleton renders with custom header/footer.

### Task 0.1: Initialize Skeleton Theme

**Files:** Create entire directory structure.

- [ ] **Step 1: Clone Skeleton Theme**

```bash
cd E:/ccfold/shopify
shopify theme init botanica
# When prompted, name it "Botanica"
```

- [ ] **Step 2: Verify base structure**

```bash
ls botanica/
# Expected: assets/ blocks/ config/ layout/ locales/ sections/ snippets/ templates/
shopify theme check --path botanica
# Expected: 0 errors
```

- [ ] **Step 3: Remove Skeleton CSS and JS we'll replace**

```bash
rm botanica/assets/*.css botanica/assets/*.js 2>/dev/null
# We'll write our own from scratch
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p botanica/listings/{botanica,greenhouse,nocturne,herbarium,conservatory}/templates
mkdir -p botanica/templates/customers
mkdir -p botanica/blocks
```

- [ ] **Step 5: Commit**

```bash
cd botanica && git init && git add -A && git commit -m "feat: init Botanica 2.0 from Skeleton Theme"
```

### Task 0.2: Design Tokens

**Files:** Create `assets/design-tokens.css`.

- [ ] **Step 1: Write the CSS custom properties**

```css
/* ============================================
   Botanica Design Tokens — --bt-* namespace
   ============================================ */

:root {
  /* ── Brand Palette ── */
  --bt-sage-900: #1F3322;
  --bt-sage-700: #3A5A40;
  --bt-sage-500: #4A6B4F;
  --bt-sage-400: #5F7A5C;
  --bt-sage-300: #8AA386;
  --bt-sage-200: #C7D4C4;
  --bt-sage-100: #E8EFE6;

  --bt-cream-100: #FAF7EF;
  --bt-cream-200: #F5F1E8;
  --bt-cream-300: #ECE4D2;
  --bt-cream-400: #D9CFB8;

  --bt-terracotta-700: #8B3A26;
  --bt-terracotta-500: #C97D5A;
  --bt-terracotta-400: #D89576;
  --bt-terracotta-300: #E8B89E;
  --bt-terracotta-200: #F5D8C8;

  --bt-bark-900: #1A1714;
  --bt-bark-700: #2E2A24;
  --bt-bark-500: #4D4840;
  --bt-bark-300: #8A8378;
  --bt-bark-100: #C4BFB6;

  /* ── Accent Aliases ── */
  --bt-accent: var(--bt-terracotta-500);
  --bt-accent-soft: var(--bt-terracotta-300);
  --bt-success: var(--bt-sage-500);
  --bt-success-soft: var(--bt-sage-200);
  --bt-warning: #D4A24E;
  --bt-error: #C44D4D;

  /* ── Typography ── */
  --bt-font-heading: 'Fraunces', Georgia, 'Times New Roman', serif;
  --bt-font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --bt-font-mono: 'SF Mono', 'Fira Code', monospace;

  --bt-fs-display: clamp(3.2rem, 5vw, 5.6rem);
  --bt-fs-h1: clamp(2.2rem, 3.5vw, 3.2rem);
  --bt-fs-h2: clamp(1.8rem, 2.5vw, 2.4rem);
  --bt-fs-h3: clamp(1.4rem, 1.8vw, 1.8rem);
  --bt-fs-h4: 1.25rem;
  --bt-fs-body: 1rem;
  --bt-fs-body-sm: 0.875rem;
  --bt-fs-eyebrow: 0.72rem;
  --bt-fs-specimen: 0.68rem;
  --bt-fs-caption: 0.8rem;

  --bt-lh-tight: 1.08;
  --bt-lh-snug: 1.35;
  --bt-lh-normal: 1.6;
  --bt-lh-relaxed: 1.75;

  --bt-ls-tight: -0.02em;
  --bt-ls-normal: 0;
  --bt-ls-wide: 0.08em;
  --bt-ls-eyebrow: 0.16em;

  --bt-fw-light: 300;
  --bt-fw-regular: 400;
  --bt-fw-medium: 500;
  --bt-fw-semibold: 600;
  --bt-fw-bold: 700;

  /* ── Spacing ── */
  --bt-space-3xs: 0.25rem;   /* 4px */
  --bt-space-2xs: 0.5rem;    /* 8px */
  --bt-space-xs: 0.75rem;    /* 12px */
  --bt-space-sm: 1rem;       /* 16px */
  --bt-space-md: 1.5rem;     /* 24px */
  --bt-space-lg: 2rem;       /* 32px */
  --bt-space-xl: 3rem;       /* 48px */
  --bt-space-2xl: 4rem;      /* 64px */
  --bt-space-3xl: 5rem;      /* 80px */
  --bt-space-section: clamp(3rem, 6vw, 5rem);
  --bt-space-section-sm: clamp(1.5rem, 3vw, 2.5rem);

  --bt-page-width: 1300px;
  --bt-page-gutter: clamp(1rem, 5vw, 2.5rem);
  --bt-content-max: 65ch;

  /* ── Borders & Radii ── */
  --bt-radius-xs: 2px;       /* specimen labels */
  --bt-radius-sm: 4px;       /* inputs */
  --bt-radius-md: 8px;       /* small cards */
  --bt-radius-lg: 14px;      /* cards */
  --bt-radius-xl: 20px;      /* large panels */
  --bt-radius-full: 999px;   /* pills, badges */

  --bt-border-thin: 1px;
  --bt-border-medium: 1.5px;
  --bt-border-opacity: 0.12;

  /* ── Shadows (warm bark-tinted, not pure black) ── */
  --bt-shadow-xs: 0 1px 3px rgba(46, 42, 36, 0.06);
  --bt-shadow-sm: 0 4px 12px rgba(46, 42, 36, 0.08);
  --bt-shadow-md: 0 10px 22px rgba(46, 42, 36, 0.12);
  --bt-shadow-lg: 0 18px 40px -8px rgba(46, 42, 36, 0.16);
  --bt-shadow-xl: 0 28px 56px -12px rgba(46, 42, 36, 0.2);
  --bt-shadow-button: 0 4px 14px rgba(74, 107, 79, 0.3);
  --bt-shadow-card-hover: 0 12px 28px rgba(46, 42, 36, 0.16);

  /* ── Transitions ── */
  --bt-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --bt-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --bt-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --bt-duration-fast: 150ms;
  --bt-duration-normal: 280ms;
  --bt-duration-slow: 450ms;
  --bt-duration-reveal: 600ms;

  /* ── Z-Index Scale ── */
  --bt-z-base: 0;
  --bt-z-dropdown: 100;
  --bt-z-sticky: 200;
  --bt-z-overlay: 300;
  --bt-z-modal: 400;
  --bt-z-toast: 500;

  /* ── Grain Texture (reusable) ── */
  --bt-grain: radial-gradient(rgba(0,0,0,0.7) 0.5px, transparent 0.5px);
  --bt-grain-size: 3px;
  --bt-grain-opacity: 0.06;
}

/* ── Paper grain utility ── */
.bt-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  opacity: var(--bt-grain-opacity);
  mix-blend-mode: overlay;
  background-image: var(--bt-grain);
  background-size: var(--bt-grain-size) var(--bt-grain-size);
}
```

- [ ] **Step 2: Verify CSS parses**

```bash
# No build step — just confirm the file is valid CSS
head -5 botanica/assets/design-tokens.css
```

- [ ] **Step 3: Commit**

```bash
git add botanica/assets/design-tokens.css
git commit -m "feat: add Botanica design tokens (--bt-* namespace)"
```

### Task 0.3: Base CSS — Reset, Typography, Grid

**Files:** Create `assets/botanica-base.css`.

Write the complete base layer (reset, typography scale, grid primitives, button system, form inputs, card primitives, utility classes). Full file is ~400 lines. Key excerpts:

- [ ] **Step 1: Write reset + typography**

```css
/* ============================================
   Botanica Base — Reset, Typography, Primitives
   ============================================ */

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
  height: 100%;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  font-family: var(--bt-font-body);
  font-size: var(--bt-fs-body);
  font-weight: var(--bt-fw-regular);
  line-height: var(--bt-lh-normal);
  color: var(--bt-bark-700);
  background: var(--bt-cream-200);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
  height: auto;
}

img[width][height] { height: auto; }

/* ── Typography ── */
h1, .h1 { font-family: var(--bt-font-heading); font-size: var(--bt-fs-h1); font-weight: var(--bt-fw-regular); line-height: var(--bt-lh-tight); letter-spacing: var(--bt-ls-tight); text-wrap: balance; }
h2, .h2 { font-family: var(--bt-font-heading); font-size: var(--bt-fs-h2); font-weight: var(--bt-fw-regular); line-height: var(--bt-lh-tight); letter-spacing: var(--bt-ls-tight); }
h3, .h3 { font-family: var(--bt-font-heading); font-size: var(--bt-fs-h3); font-weight: var(--bt-fw-medium); line-height: var(--bt-lh-snug); }
h4, .h4 { font-family: var(--bt-font-heading); font-size: var(--bt-fs-h4); font-weight: var(--bt-fw-medium); line-height: var(--bt-lh-snug); }

p { margin-bottom: var(--bt-space-sm); max-width: var(--bt-content-max); }

.bt-eyebrow {
  font-family: var(--bt-font-body);
  font-size: var(--bt-fs-eyebrow);
  font-weight: var(--bt-fw-semibold);
  letter-spacing: var(--bt-ls-eyebrow);
  text-transform: uppercase;
  opacity: 0.72;
}

/* ── Links ── */
a {
  color: var(--bt-sage-500);
  text-decoration: none;
  transition: color var(--bt-duration-fast) var(--bt-ease-out);
}
a:hover { color: var(--bt-sage-700); }

.bt-link-underline {
  position: relative;
  display: inline;
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0% 100%;
  background-repeat: no-repeat;
  background-size: 0% 1px;
  transition: background-size var(--bt-duration-normal) var(--bt-ease-out);
}
.bt-link-underline:hover { background-size: 100% 1px; }

/* ── Selection ── */
::selection {
  background: var(--bt-sage-100);
  color: var(--bt-sage-900);
}
```

- [ ] **Step 2: Write button system**

```css
/* ── Buttons ── */
.bt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding: 0.75em 1.6em;
  font-family: var(--bt-font-body);
  font-size: var(--bt-fs-body-sm);
  font-weight: var(--bt-fw-semibold);
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-decoration: none;
  border: var(--bt-border-medium) solid transparent;
  border-radius: var(--bt-radius-full);
  cursor: pointer;
  transition: transform var(--bt-duration-fast) var(--bt-ease-out),
              box-shadow var(--bt-duration-fast) var(--bt-ease-out),
              background var(--bt-duration-fast) var(--bt-ease-out),
              border-color var(--bt-duration-fast) var(--bt-ease-out);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.bt-btn:focus-visible {
  outline: 2px solid var(--bt-sage-500);
  outline-offset: 2px;
}

.bt-btn:active { transform: scale(0.97); }

.bt-btn--primary {
  background: var(--bt-sage-500);
  color: #FFFFFF;
  border-color: var(--bt-sage-500);
}
.bt-btn--primary:hover {
  background: var(--bt-sage-700);
  border-color: var(--bt-sage-700);
  box-shadow: var(--bt-shadow-button);
  transform: translateY(-1px);
}

.bt-btn--secondary {
  background: transparent;
  color: var(--bt-bark-700);
  border-color: var(--bt-bark-100);
}
.bt-btn--secondary:hover {
  border-color: var(--bt-bark-300);
  background: rgba(46, 42, 36, 0.04);
}

.bt-btn--outline {
  background: transparent;
  color: currentColor;
  border-color: currentColor;
  backdrop-filter: blur(4px);
}
.bt-btn--outline:hover { background: rgba(255,255,255,0.12); }

.bt-btn--sm { padding: 0.5em 1.1em; font-size: 0.8rem; }
.bt-btn--lg { padding: 0.95em 2em; font-size: 1rem; }

.bt-btn:disabled,
.bt-btn[aria-disabled="true"] {
  opacity: 0.4;
  pointer-events: none;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Write form inputs**

```css
/* ── Forms ── */
.bt-input,
.bt-select,
.bt-textarea {
  width: 100%;
  padding: 0.7em 1em;
  font-family: var(--bt-font-body);
  font-size: var(--bt-fs-body);
  color: var(--bt-bark-700);
  background: #FFFFFF;
  border: var(--bt-border-thin) solid rgba(46, 42, 36, var(--bt-border-opacity));
  border-radius: var(--bt-radius-sm);
  transition: border-color var(--bt-duration-fast) var(--bt-ease-out),
              box-shadow var(--bt-duration-fast) var(--bt-ease-out);
}
.bt-input:focus,
.bt-select:focus,
.bt-textarea:focus {
  outline: none;
  border-color: var(--bt-sage-500);
  box-shadow: 0 0 0 3px rgba(74, 107, 79, 0.15);
}
.bt-input::placeholder { color: var(--bt-bark-300); opacity: 0.7; }

.bt-label {
  display: block;
  margin-bottom: 0.4em;
  font-size: var(--bt-fs-body-sm);
  font-weight: var(--bt-fw-medium);
  color: var(--bt-bark-500);
}

/* ── Checkbox / Radio ── */
.bt-checkbox,
.bt-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  cursor: pointer;
  font-size: var(--bt-fs-body-sm);
}
.bt-checkbox input,
.bt-radio input {
  width: 1.1em; height: 1.1em;
  accent-color: var(--bt-sage-500);
}
```

- [ ] **Step 4: Write card primitives**

```css
/* ── Cards ── */
.bt-card {
  position: relative;
  background: #FFFFFF;
  border: var(--bt-border-thin) solid rgba(46, 42, 36, var(--bt-border-opacity));
  border-radius: var(--bt-radius-lg);
  overflow: hidden;
  transition: transform var(--bt-duration-normal) var(--bt-ease-out),
              box-shadow var(--bt-duration-normal) var(--bt-ease-out);
}

.bt-card--lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--bt-shadow-card-hover);
}

.bt-card__media {
  position: relative;
  overflow: hidden;
  background: var(--bt-sage-100);
}

.bt-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--bt-duration-slow) var(--bt-ease-out);
}

.bt-card__media--zoom:hover img { transform: scale(1.04); }

.bt-card__body {
  padding: var(--bt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--bt-space-xs);
}

.bt-card__body > *:last-child { margin-bottom: 0; }
```

- [ ] **Step 5: Write utility classes**

```css
/* ── Utilities ── */
.bt-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

.bt-page-width {
  max-width: var(--bt-page-width);
  margin-inline: auto;
  padding-inline: var(--bt-page-gutter);
}

.bt-page-width--narrow { max-width: 900px; }

.bt-section-padding {
  padding-block: var(--bt-space-section);
}

.bt-section-padding--sm {
  padding-block: var(--bt-space-section-sm);
}

.bt-text-center { text-align: center; }
.bt-text-balance { text-wrap: balance; }
```

- [ ] **Step 6: Commit**

```bash
git add botanica/assets/botanica-base.css
git commit -m "feat: add Botanica base CSS (reset, typography, buttons, forms, cards)"
```

### Task 0.4: Layout Skeleton (theme.liquid)

**Files:** Rewrite `layout/theme.liquid`.

- [ ] **Step 1: Write the complete theme.liquid**

```liquid
<!doctype html>
<html class="js" lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="{{ settings.color_accent | default: '#4A6B4F' }}">
  <link rel="canonical" href="{{ canonical_url }}">

  {%- if settings.favicon != blank -%}
    <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
  {%- endif -%}

  <link rel="preconnect" href="https://fonts.shopifycdn.com" crossorigin>

  <title>
    {{ page_title }}
    {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
    {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
    {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
  </title>

  {% if page_description %}
    <meta name="description" content="{{ page_description | escape }}">
  {% endif %}

  {% render 'social-meta-tags' %}

  {%- liquid
    assign body_font_bold = settings.type_body_font | font_modify: 'weight', 'bold'
    assign body_font_italic = settings.type_body_font | font_modify: 'style', 'italic'
    assign body_font_bold_italic = body_font_bold | font_modify: 'style', 'italic'
  -%}

  {% style %}
    {{ settings.type_body_font | font_face: font_display: 'swap' }}
    {{ body_font_bold | font_face: font_display: 'swap' }}
    {{ body_font_italic | font_face: font_display: 'swap' }}
    {{ body_font_bold_italic | font_face: font_display: 'swap' }}
    {{ settings.type_header_font | font_face: font_display: 'swap' }}

    :root {
      --bt-font-heading: {{ settings.type_header_font.family }}, {{ settings.type_header_font.fallback_families }};
      --bt-font-body: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
    }
  {% endstyle %}

  {{ 'design-tokens.css' | asset_url | stylesheet_tag }}
  {{ 'botanica-base.css' | asset_url | stylesheet_tag }}

  <script>
    document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
    if (Shopify.designMode) {
      document.documentElement.classList.add('shopify-design-mode');
    }
  </script>

  {{ content_for_header }}
</head>

<body>
  <a class="bt-sr-only bt-btn bt-btn--primary" href="#MainContent" style="position:fixed;top:1rem;left:1rem;z-index:9999">
    {{ 'accessibility.skip_to_text' | t }}
  </a>

  {% section 'header' %}

  <main id="MainContent" role="main" tabindex="-1">
    {{ content_for_layout }}
  </main>

  {% section 'footer' %}

  <script src="{{ 'theme.js' | asset_url }}" defer></script>

  {%- if settings.enable_animations -%}
    {{ 'botanica-animations.css' | asset_url | stylesheet_tag }}
    <script src="{{ 'scroll-animations.js' | asset_url }}" defer></script>
  {%- endif -%}
</body>
</html>
```

- [ ] **Step 2: Create empty JS placeholder to avoid 404**

```bash
echo '// Botanica theme entry — loaded on all pages' > botanica/assets/theme.js
```

- [ ] **Step 3: Verify theme loads**

```bash
shopify theme check --path botanica
# Expected: 0 errors (may warn about empty section references until we write header/footer)
```

- [ ] **Step 4: Commit**

```bash
git add botanica/layout/theme.liquid botanica/assets/theme.js
git commit -m "feat: add Botanica layout skeleton with design token loading"
```

### Task 0.5: Settings Schema

**Files:** Rewrite `config/settings_schema.json` with 9 tab groups.

Write the complete settings schema (~700 lines of JSON). Key structure:

```json
[
  {
    "name": "theme_info",
    "theme_name": "Botanica",
    "theme_version": "2.0.0",
    "theme_author": "Botanica Studio",
    "theme_documentation_url": "https://help.shopify.com/manual/online-store/themes",
    "theme_support_url": "https://support.shopify.com/"
  },
  {
    "name": "t:settings_schema.logo.name",
    "settings": [
      { "type": "image_picker", "id": "logo", "label": "t:settings_schema.logo.logo_image" },
      { "type": "range", "id": "logo_width", "min": 50, "max": 300, "step": 10, "default": 120, "unit": "px", "label": "t:settings_schema.logo.logo_width" },
      { "type": "image_picker", "id": "favicon", "label": "t:settings_schema.logo.favicon" }
    ]
  },
  {
    "name": "t:settings_schema.colors.name",
    "settings": [
      {
        "type": "select",
        "id": "color_preset",
        "label": "t:settings_schema.colors.preset",
        "options": [
          { "value": "botanica", "label": "t:settings_schema.colors.presets.botanica" },
          { "value": "greenhouse", "label": "t:settings_schema.colors.presets.greenhouse" },
          { "value": "nocturne", "label": "t:settings_schema.colors.presets.nocturne" },
          { "value": "herbarium", "label": "t:settings_schema.colors.presets.herbarium" },
          { "value": "conservatory", "label": "t:settings_schema.colors.presets.conservatory" }
        ],
        "default": "botanica"
      }
    ]
  },
  // ... remaining 7 groups: typography, layout, plant_settings, product_display,
  //     cart_checkout, promotions, social_search
]
```

Full settings_schema.json will be written during implementation (too long to inline here — 700+ lines). Reference the spec §9 for the complete tab structure.

- [ ] **Step 1: Write `config/settings_schema.json`** (all 9 tabs per spec §9)

- [ ] **Step 2: Write `config/settings_data.json`** with 5 preset definitions (per spec §9.1)

- [ ] **Step 3: Verify**

```bash
shopify theme check --path botanica
# Expected: 0 errors
```

- [ ] **Step 4: Commit**

```bash
git add botanica/config/settings_schema.json botanica/config/settings_data.json
git commit -m "feat: add Botanica settings schema (9 tabs, 5 presets)"
```

### Task 0.6: Header Section

**Files:** Create `sections/header.liquid` + `assets/section-header.css`.

Build the custom header: logo centered, nav left/right, search + cart right, mega menu support, sticky on scroll-up, mobile drawer.

- [ ] **Step 1: Write `sections/header.liquid`** with schema
- [ ] **Step 2: Write `assets/section-header.css`**
- [ ] **Step 3: Wire into theme.liquid** (already referenced as `{% section 'header' %}`)
- [ ] **Step 4: `shopify theme check`** → zero errors
- [ ] **Step 5: Commit**

### Task 0.7: Footer Section

**Files:** Create `sections/footer.liquid` + `assets/section-footer.css`.

Multi-column footer: brand info + quick links + care guides + newsletter + social icons + payment icons.

- [ ] **Step 1: Write `sections/footer.liquid`** with schema
- [ ] **Step 2: Write `assets/section-footer.css`**
- [ ] **Step 3: `shopify theme check`** → zero errors
- [ ] **Step 4: Commit**

### Task 0.8: SVG Icon Snippets

**Files:** Create `snippets/icon-*.liquid` for all plant care icons.

Create 12 icon snippets: `icon-light.liquid`, `icon-water.liquid`, `icon-humidity.liquid`, `icon-size.liquid`, `icon-toxicity.liquid`, `icon-temperature.liquid`, `icon-food.liquid`, `icon-pet.liquid`, `icon-truck.liquid`, `icon-shield.liquid`, `icon-pot.liquid`, `icon-chat.liquid`, `icon-leaf.liquid`, `icon-arrow.liquid`, `icon-close.liquid`, `icon-search.liquid`, `icon-cart.liquid`, `icon-check.liquid`, `icon-star.liquid`, `icon-quote.liquid`.

Each file:
```liquid
{% comment %}icon-light.liquid{% endcomment %}
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>
</svg>
```

- [ ] **Step 1: Create all 20 icon snippets**
- [ ] **Step 2: Commit**

### Task 0.9: Reusable Utility Snippets

**Files:** Create remaining snippet files.

- [ ] **Step 1: Create `snippets/grain-overlay.liquid`**

```liquid
<div class="bt-grain" aria-hidden="true"></div>
```

- [ ] **Step 2: Create `snippets/badge-care.liquid`**

```liquid
{%- liquid
  assign level = level | default: 'easy'
  assign label = 'care.' | append: level | append: '.label' | t
-%}
<span class="bt-badge bt-badge--{{ level }}">
  {{- label -}}
</span>
```

- [ ] **Step 3: Create `snippets/meter-light.liquid`** and `snippets/meter-water.liquid`
- [ ] **Step 4: Create `snippets/price.liquid`**
- [ ] **Step 5: Create `snippets/social-icons.liquid`**
- [ ] **Step 6: Create `snippets/card-product.liquid`**
- [ ] **Step 7: Create `snippets/card-article.liquid`**
- [ ] **Step 8: Commit**

> **Phase 0 Checkpoint:** `shopify theme check` → 0 errors. Header + footer render. Design tokens loaded. 9 settings tabs defined.

---

## Phase 1: Templates & Listings (Week 3–4)

> **Checkpoint:** All 14 templates have JSON definitions. 5 preset listings exist. Every template references valid sections.

### Task 1.1: Homepage Template

**Files:** Create `templates/index.json` with 12 sections in brand narrative flow.

```json
{
  "sections": {
    "hero": { "type": "hero-lookbook", "settings": { "design": "split" } },
    "values": { "type": "botanica-values-bar", "settings": {} },
    "care": { "type": "shop-by-care", "settings": {} },
    "spotlight": { "type": "plant-spotlight", "settings": {} },
    "size-guide": { "type": "botanica-size-guide", "settings": {} },
    "finder": { "type": "plant-finder", "settings": {} },
    "blog-teaser": { "type": "care-blog-teaser", "settings": {} },
    "testimonials": { "type": "testimonials", "settings": {} },
    "social-grid": { "type": "social-grid", "settings": {} },
    "featured": { "type": "featured-collection", "settings": {} },
    "newsletter": { "type": "newsletter-perk", "settings": {} },
    "before-after": { "type": "before-after", "settings": {} }
  },
  "order": [
    "hero", "values", "care", "spotlight", "size-guide",
    "finder", "blog-teaser", "testimonials", "social-grid",
    "featured", "newsletter", "before-after"
  ]
}
```

- [ ] **Step 1: Write `templates/index.json`**
- [ ] **Step 2: Commit**

### Task 1.2: Product Template

**Files:** Create `templates/product.json`.

- [ ] **Step 1: Write product template with custom block order** (vendor → title → price → variant_picker → quantity → buy_buttons → description → care_panel → care_story → specimen_plate → share)
- [ ] **Step 2: Commit**

### Task 1.3: Collection Template

**Files:** Create `templates/collection.json`.

- [ ] **Step 1: Write collection template with care-level + light-need filters**
- [ ] **Step 2: Commit**

### Task 1.4: Cart Template

**Files:** Create `templates/cart.json`.

- [ ] **Step 1: Write cart template with care-tip upsell + free shipping bar**
- [ ] **Step 2: Commit**

### Task 1.5: Search Template

**Files:** Create `templates/search.json`.

- [ ] **Step 1: Write search template with predictive search + faceted filters**
- [ ] **Step 2: Commit**

### Task 1.6: Remaining Templates (page, blog, article, etc.)

**Files:** Create 9 remaining templates.

- [ ] **Step 1: Write `templates/page.json`, `page.contact.json`, `page.about.json`, `page.faq.json`**
- [ ] **Step 2: Write `templates/blog.json`, `article.json`, `list-collections.json`**
- [ ] **Step 3: Write `templates/404.json`, `password.json`, `gift_card.json`**
- [ ] **Step 4: Write `templates/customers/*.json`** (6 files)
- [ ] **Step 5: Commit**

### Task 1.7: Listings — 5 Presets

**Files:** Create `/listings/{botanica,greenhouse,nocturne,herbarium,conservatory}/templates/` each with `index.json`, `product.json`, `collection.json`.

Each preset modifies only the sections that differ from the base template. For example, Botanica preset uses all 12 sections; Greenhouse uses a whiter, cleaner arrangement; Nocturne uses dark-themed color scheme override.

- [ ] **Step 1: Create Botanica preset listing**
- [ ] **Step 2: Create Greenhouse preset listing**
- [ ] **Step 3: Create Nocturne preset listing**
- [ ] **Step 4: Create Herbarium preset listing**
- [ ] **Step 5: Create Conservatory preset listing**
- [ ] **Step 6: Verify all 5 preset folders**

```bash
ls botanica/listings/*/templates/
# Expected: 5 directories, each with 3 JSON files
shopify theme check --path botanica
# Expected: 0 errors
```

- [ ] **Step 7: Commit**

> **Phase 1 Checkpoint:** All 14 templates defined. 5 presets in `/listings/`. `shopify theme check` → 0 errors.

---

## Phase 2: Plant-Specific Sections — The Moat (Week 5–7)

> **Checkpoint:** All 8 plant-specific sections built with Liquid + CSS. This is where Botanica becomes unique.

### Section Build Pattern (repeated for each section)

Each section follows this pattern:
1. **Create `sections/<name>.liquid`** — Liquid markup + `{% schema %}` with settings + blocks + presets
2. **Create `assets/section-<name>.css`** — Scoped styles with Botanica base primitives
3. **Reference CSS in liquid:** `{{ 'section-<name>.css' | asset_url | stylesheet_tag }}` at top of file
4. **Add to relevant template JSON**
5. **Verify:** `shopify theme check --path botanica` → zero errors
6. **Commit**

### Task 2.1: Shop by Care

**Files:** `sections/shop-by-care.liquid`, `assets/section-shop-by-care.css`.

Port from v1 with upgrades:
- Metafield-driven care data (not hardcoded)
- Collection link binding
- Animated light/water meters
- Care-level tinted card backgrounds
- Hover lift + arrow slide
- Intersection Observer stagger reveal
- Responsive: 3-col → 1-col stack

- [ ] **Step 1: Write Liquid** (~180 lines with schema)
- [ ] **Step 2: Write CSS** (~200 lines with all hover/scroll effects)
- [ ] **Step 3: Wire into `templates/index.json`**
- [ ] **Step 4: `shopify theme check`** → 0 errors
- [ ] **Step 5: Commit**

### Task 2.2: Plant Spotlight

**Files:** `sections/plant-spotlight.liquid`, `assets/section-plant-spotlight.css`.

- [ ] **Step 1: Write Liquid** (image frame + care table + field note + product block, 200 lines with schema)
- [ ] **Step 2: Write CSS** (4:5 portrait image frame, paper grain overlay, plate tag, care table with icon circles, field note left-border, 220 lines)
- [ ] **Step 3: Wire into `templates/index.json`**
- [ ] **Step 4: Commit**

### Task 2.3: Plant Finder (Quiz Engine)

**Files:** `sections/plant-finder.liquid`, `assets/section-plant-finder.css`, `assets/plant-finder.js`.

The quiz: 4 questions → 3 result plant recommendations.

Questions:
1. "How much light does your space get?" (Low / Medium indirect / Bright direct)
2. "How often do you want to water?" (Forgetful / Weekly / I love routines)
3. "Do you have pets or small children?" (Yes / No / Not sure)
4. "What's your style?" (Minimalist / Jungle / Statement piece)

Logic: Each plant product has `botanica.*` metafields. Quiz filters by matching answers.

- [ ] **Step 1: Write Liquid** (quiz UI with step indicators, progress dots, question/answer, results grid)
- [ ] **Step 2: Write CSS** (smooth step transitions, progress bar animation, result card stagger reveal, leaf particle celebration)
- [ ] **Step 3: Write JS** (question state machine, answer collection, filter logic, result rendering, particle effect)
- [ ] **Step 4: Commit**

### Task 2.4: Care Timeline

**Files:** `sections/care-timeline.liquid`, `assets/section-care-timeline.css`.

Horizontal scrollable timeline showing seasonal plant care: water schedule, feed schedule, repot timing, pruning seasons.

- [ ] **Step 1: Write Liquid** (horizontal timeline with SVG plant growth stages at each milestone)
- [ ] **Step 2: Write CSS** (horizontal scroll with snap points, progress line connecting dots, scroll-triggered reveals)
- [ ] **Step 3: Commit**

### Task 2.5: Size Guide (with Comparison Slider)

**Files:** `sections/botanica-size-guide.liquid`, `assets/section-botanica-size-guide.css`, `assets/compare-slider.js`.

- [ ] **Step 1: Write Liquid** (3 size cards + draggable comparison slider, human+plant SVG visualization)
- [ ] **Step 2: Write CSS** (slider handle, comparison viewport, size badge colors)
- [ ] **Step 3: Write JS** (drag-to-compare interaction, touch + mouse support)
- [ ] **Step 4: Commit**

### Task 2.6: Before & After

**Files:** `sections/before-after.liquid`, `assets/section-before-after.css`.

- [ ] **Step 1: Write Liquid** (image pair with draggable divider)
- [ ] **Step 2: Write CSS** (slider handle, label overlays, before/after labels)
- [ ] **Step 3: JS uses compare-slider.js**
- [ ] **Step 4: Commit**

### Task 2.7: Care Blog Teaser

**Files:** `sections/care-blog-teaser.liquid`, `assets/section-care-blog-teaser.css`.

- [ ] **Step 1: Write Liquid** (auto-pull from blog with fallback to manual cards)
- [ ] **Step 2: Write CSS** (3-card grid with article styling, tag badges, hover lift)
- [ ] **Step 3: Commit**

### Task 2.8: Collection Mosaic

**Files:** `sections/collection-mosaic.liquid`, `assets/section-collection-mosaic.css`.

Asymmetric grid with mixed-size collection cards.

- [ ] **Step 1: Write Liquid** (CSS Grid with `grid-template-areas` for 4 layout presets)
- [ ] **Step 2: Write CSS** (asymmetric grid, hover zoom, care badges, responsive collapse)
- [ ] **Step 3: Commit**

> **Phase 2 Checkpoint:** 8 moat sections built. Plant-specific UX is functional. This is Botanica's differentiation.

---

## Phase 3: Remaining Sections (Week 8–10)

> **Checkpoint:** All 32 sections built. Every section has Liquid + CSS + schema + preset.

### Task Group 3.1: Hero & Banner Sections (4 sections)

**Sections to build:**
- `hero-lookbook.liquid` + CSS (port from v1, add video bg + parallax + carousel modes)
- `image-banner.liquid` + CSS (full-bleed hero with overlay text)
- `video-hero.liquid` + CSS (autoplay video, poster fallback)
- `slideshow.liquid` + CSS (crossfade transitions, caption animations)

### Task Group 3.2: Social Proof & Trust (4 sections)

**Sections to build:**
- `testimonials.liquid` + CSS (quote marks, stars, avatars, carousel + masonry)
- `botanica-values-bar.liquid` + CSS (12 icons, horizontal mobile scroll)
- `social-grid.liquid` + CSS (Instagram-style masonry, lazy-load, hover overlay)
- `press-awards.liquid` + CSS (logo grid, grayscale→color hover)

### Task Group 3.3: Conversion Sections (5 sections)

**Sections to build:**
- `newsletter-perk.liquid` + CSS (split layout, perks checklist, form animations)
- `featured-collection.liquid` + CSS (product card grid, hover image swap, quick-view trigger, care badges)
- `featured-product.liquid` + CSS (single product, variant picker, quantity, sticky ATC)
- `shop-the-look.liquid` + CSS (image hotspots with pulsing dots, tooltips)
- `promo-banner.liquid` + CSS (countdown timer, dismissable, marquee mode)

### Task Group 3.4: Content & Editorial (5 sections)

**Sections to build:**
- `rich-text.liquid` + CSS (centered, max-width, divider ornament)
- `image-with-text.liquid` + CSS (4 layout variants, image parallax, text reveal)
- `multicolumn.liquid` + CSS (icon + text grid, 2-6 columns)
- `collage.liquid` + CSS (3 layout presets, mixed media blocks)
- `lookbook-gallery.liquid` + CSS (masonry grid, lightbox, lazy-load blur-up)

### Task Group 3.5: Utility & System (6 sections)

**Sections to build:**
- `contact-form.liquid` + CSS (styled inputs, validation states)
- `faq-accordion.liquid` + CSS (smooth height transition, +/- icon rotate, search filter)
- `video.liquid` + CSS (responsive embed, botanical frame)
- `custom-liquid.liquid` (merchant code block, no styling)
- App block `@app` support in all main sections
- `snippets/mega-menu-content.liquid` (4-column image-preview dropdown)

> **Phase 3 Checkpoint:** 32 sections complete. `shopify theme check` → 0 errors across all.

---

## Phase 4: JavaScript Ecosystem (Week 11–12)

> **Checkpoint:** All JS modules functional. No console errors. Vanilla ES modules, no libraries.

### Task 4.1: theme.js — Global Entry

**Files:** `assets/theme.js`.

```javascript
/**
 * Botanica theme.js — Global entry point
 * Handles: mobile nav, search toggle, cart notification count,
 *          header scroll behavior, disclosure toggles
 */
class BotanicaTheme {
  constructor() {
    this.init();
  }

  init() {
    this.initMobileNav();
    this.initSearchToggle();
    this.initCartListeners();
    this.initHeaderScroll();
    this.initDisclosures();
  }

  initMobileNav() {
    const toggle = document.querySelector('[data-js-nav-toggle]');
    const drawer = document.querySelector('[data-js-nav-drawer]');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      drawer.classList.toggle('is-active');
      document.body.classList.toggle('bt-nav-open');
    });
  }

  initSearchToggle() {
    /* search drawer toggle */
  }

  initCartListeners() {
    /* Listen for cart:updated events, update counter badge */
  }

  initHeaderScroll() {
    let lastScroll = 0;
    const header = document.querySelector('[data-js-header]');
    if (!header) return;

    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current <= 0) {
        header.classList.remove('bt-header--hidden');
        return;
      }
      if (current > lastScroll && current > 100) {
        header.classList.add('bt-header--hidden');
      } else if (current < lastScroll) {
        header.classList.remove('bt-header--hidden');
      }
      lastScroll = current;
    }, { passive: true });
  }

  initDisclosures() {
    /* <details> element polyfill enhancements */
  }
}

document.addEventListener('DOMContentLoaded', () => new BotanicaTheme());
```

- [ ] **Step 1: Write theme.js** with all 5 init methods
- [ ] **Step 2: Test:** `shopify theme dev` and verify console has no errors
- [ ] **Step 3: Commit**

### Task 4.2: scroll-animations.js — Intersection Observer

**Files:** `assets/scroll-animations.js`.

```javascript
/**
 * scroll-animations.js — Botanica
 * Handles all scroll-triggered reveals, parallax, and sticky effects.
 * Uses IntersectionObserver for performance (no scroll event listeners).
 */
class ScrollAnimations {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersect.bind(this),
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    this.init();
  }

  init() {
    document.querySelectorAll('[data-anim]').forEach(el => {
      this.observer.observe(el);
    });
    this.initParallax();
  }

  handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const anim = entry.target.dataset.anim;
        const delay = entry.target.dataset.animDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('anim--visible');
          entry.target.classList.add(`anim--${anim}`);
        }, delay);
        this.observer.unobserve(entry.target);
      }
    });
  }

  initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          parallaxEls.forEach(el => {
            const rate = parseFloat(el.dataset.parallax) || 0.15;
            const scrolled = window.scrollY;
            el.style.transform = `translateY(${scrolled * rate}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('DOMContentLoaded', () => new ScrollAnimations());
}
```

- [ ] **Step 1: Write scroll-animations.js**
- [ ] **Step 2: Commit**

### Task 4.3: quick-view.js — Quick View Modal

**Files:** `assets/quick-view.js`.

Adapt v1's quick-view.js to v2's API (no Dawn dependency). Use `bt-*` class names.

- [ ] **Step 1: Write quick-view.js** (modal open/close, product data fetch, variant selection, add to cart from modal, focus trap, body scroll lock)
- [ ] **Step 2: Commit**

### Task 4.4: sticky-atc.js

**Files:** `assets/sticky-atc.js`.

NEW in v2. Mobile-only sticky add-to-cart bar.

- [ ] **Step 1: Write sticky-atc.js** (Intersection Observer to detect when main ATC scrolls out of view, show/hide sticky bar, update variant/price)
- [ ] **Step 2: Commit**

### Task 4.5: plant-finder.js

**Files:** `assets/plant-finder.js`.

- [ ] **Step 1: Write quiz engine** (question state machine, answer scoring, metafield filter logic, result rendering, confetti/leaf particle effect)
- [ ] **Step 2: Commit**

### Task 4.6: compare-slider.js

**Files:** `assets/compare-slider.js`.

Used by both "Before & After" and "Size Guide" sections.

- [ ] **Step 1: Write comparison slider** (drag handle, mouse + touch, clip-path reveal, percentage label)
- [ ] **Step 2: Commit**

### Task 4.7: lookbook-gallery.js + mega-menu.js

**Files:** `assets/lookbook-gallery.js`, `assets/mega-menu.js`.

- [ ] **Step 1: Write lookbook-gallery.js** (masonry layout calculation, lightbox viewer, lazy-load, keyboard nav)
- [ ] **Step 2: Write mega-menu.js** (hover intent, image preview loading, keyboard arrow nav, mobile collapse)
- [ ] **Step 3: Commit**

> **Phase 4 Checkpoint:** All 8 JS modules functional. Zero console errors. Mobile nav, scroll animations, quick view, sticky ATC, plant finder all working.

---

## Phase 5: CSS Effects & Animations (Week 12–13)

> **Checkpoint:** All 29 effects from spec §4 implemented. 40+ micro-interactions functional. Reduced motion respected.

### Task 5.1: botanica-animations.css — Keyframes & Utilities

**Files:** `assets/botanica-animations.css` (created, ~300 lines).

- [ ] **Step 1: Write all @keyframes**

```css
/* ============================================
   Botanica Animations — @keyframes + utility classes
   ============================================ */

/* ── Fade Up ── */
@keyframes bt-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Fade Up + Blur (for section reveals) ── */
@keyframes bt-fade-up-blur {
  from { opacity: 0; transform: translateY(24px); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* ── Scale Reveal ── */
@keyframes bt-scale-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

/* ── Slide In Right ── */
@keyframes bt-slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ── Split Text Reveal (clip-path) ── */
@keyframes bt-text-reveal {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

/* ── Card Entrance Stagger Base ── */
@keyframes bt-card-enter {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Image Uncover ── */
@keyframes bt-image-uncover {
  from { clip-path: inset(0 0 0 100%); }
  to { clip-path: inset(0 0 0 0); }
}

/* ── Cart Icon Bounce ── */
@keyframes bt-bounce {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  50% { transform: scale(0.9); }
  70% { transform: scale(1.08); }
}

/* ── Pulse (badge attention) ── */
@keyframes bt-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* ── Shake (form error) ── */
@keyframes bt-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

/* ── Shimmer (skeleton loading) ── */
@keyframes bt-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ── Leaf Fall (plant finder celebration) ── */
@keyframes bt-leaf-fall {
  0% { opacity: 0; transform: translateY(-20px) rotate(0deg) scale(0); }
  20% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: translateY(60px) rotate(45deg) scale(0.5); }
}

/* ── Progress Fill ── */
@keyframes bt-progress-fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* ── Underline Reveal ── */
@keyframes bt-underline-reveal {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

- [ ] **Step 2: Write animation utility classes**

```css
/* ── Utility Classes ── */
[data-anim="fade-up"].anim--visible { animation: bt-fade-up 0.6s var(--bt-ease-out) forwards; }
[data-anim="fade-up-blur"].anim--visible { animation: bt-fade-up-blur 0.7s var(--bt-ease-out) forwards; }
[data-anim="scale-in"].anim--visible { animation: bt-scale-in 0.5s var(--bt-ease-out) forwards; }
[data-anim="slide-right"].anim--visible { animation: bt-slide-in-right 0.5s var(--bt-ease-out) forwards; }
[data-anim="card-enter"].anim--visible { animation: bt-card-enter 0.55s var(--bt-ease-out) forwards; }

/* ── Stagger Delays ── */
[data-anim-delay="1"] { animation-delay: 80ms; }
[data-anim-delay="2"] { animation-delay: 160ms; }
[data-anim-delay="3"] { animation-delay: 240ms; }
[data-anim-delay="4"] { animation-delay: 320ms; }
[data-anim-delay="5"] { animation-delay: 400ms; }
[data-anim-delay="6"] { animation-delay: 480ms; }

/* ── Reduced Motion (MUST be last) ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  [data-anim] { opacity: 1 !important; transform: none !important; filter: none !important; }
  [data-parallax] { transform: none !important; }
}
```

- [ ] **Step 3: Commit**

### Task 5.2: Apply scroll-reveal data attributes

Add `[data-anim]` and `[data-anim-delay]` attributes to section Liquid files:

- Hero headings: `data-anim="fade-up-blur"`
- Section headers: `data-anim="fade-up"`
- Cards: `data-anim="card-enter"` with stagger delays
- Images: `data-anim="scale-in"`
- Text columns: `data-anim="slide-right"` with stagger

- [ ] **Step 1: Add data attributes to all 32 section Liquid files** (one file at a time)
- [ ] **Step 2: Commit after each section batch**

### Task 5.3: Micro-Interaction Polish

Review every interactive element per spec §5.1 and ensure all 4 states (hover/active/focus/disabled) are styled:

- [ ] **Step 1: Audit all `.bt-btn` uses** — verify hover glow, active scale, focus ring, disabled opacity
- [ ] **Step 2: Audit all form inputs** — verify focus border glow, error shake, success checkmark
- [ ] **Step 3: Audit all cards** — verify hover lift, shadow expansion
- [ ] **Step 4: Audit all links** — verify underline reveal animation
- [ ] **Step 5: Audit mega menu** — verify fade-in, arrow key navigation
- [ ] **Step 6: Audit drawers** — verify slide-in, backdrop blur, focus trap
- [ ] **Step 7: Audit quantity selectors** — verify button press bounce
- [ ] **Step 8: Audit cart icon** — verify add-to-cart bounce animation
- [ ] **Step 9: Commit**

> **Phase 5 Checkpoint:** All 29 effects implemented, 40+ micro-interactions polished. Reduced motion fully respected. Animations only fire when ≥15% visible.

---

## Phase 6: Demo Store (Week 13–14)

> **Checkpoint:** 25 products with real images, metafields, and content. Demo store looks like a real, operating plant shop.

### Task 6.1: Generate Product Images

**Files:** 75 images (25 products × 3).

- [ ] **Step 1: Define AI prompt template**

```
"professional product photography of a [plant name] in a [pot type],
cream paper background, soft natural window light from the left,
editorial botanical field guide style, shallow depth of field on leaves,
shot on Fujifilm GFX 100S, 4K, warm color temperature 5600K,
no text, no watermark, minimalist composition --ar 4:5"
```

- [ ] **Step 2: Generate all 75 images** using Midjourney or DALL-E
- [ ] **Step 3: Optimize images** — resize to max 2400px wide, compress WebP/JPEG
- [ ] **Step 4: Upload to Shopify Files** via admin or CLI
- [ ] **Step 5: Commit image references**

### Task 6.2: Create Products with Metafields

**Files:** `config/settings_data.json` (demo data section).

- [ ] **Step 1: Create 16 plant products** in demo store admin (or via Shopify REST API bulk import)
- [ ] **Step 2: Set `botanica.*` metafields on each plant product** (light_level, water_frequency, humidity_range, mature_height_cm, pot_diameter_cm, toxicity, care_level, origin_story, botanical_name)
- [ ] **Step 3: Create 5 pot products**
- [ ] **Step 4: Create 4 lifestyle products**
- [ ] **Step 5: Commit product data**

### Task 6.3: Content Pages

- [ ] **Step 1: Write 3 Care Guide articles** (Watering 101, Reading Room Light, When to Repot) — 800-1200 words each with botanical voice
- [ ] **Step 2: Write About page** — brand story + grower profiles
- [ ] **Step 3: Write FAQ page** — 10 plant care questions with answers
- [ ] **Step 4: Write Contact page** — with plant consultation form fields
- [ ] **Step 5: Commit content**

### Task 6.4: Navigation Setup

- [ ] **Step 1: Create main menu** in admin with structure per spec §12.5
- [ ] **Step 2: Create footer menu** (Quick Links + Care Guides + Policies)
- [ ] **Step 3: Verify mega menu triggers correctly**

### Task 6.5: Settings Preset Data

**Files:** Update `config/settings_data.json`.

- [ ] **Step 1: Write Botanica preset** (default, cream/sage/bark, full homepage)
- [ ] **Step 2: Write Greenhouse preset** (white/moss/charcoal, cleaner arrangement)
- [ ] **Step 3: Write Nocturne preset** (dark/terracotta/cream, moody)
- [ ] **Step 4: Write Herbarium preset** (aged paper/sepia/umber, vintage)
- [ ] **Step 5: Write Conservatory preset** (off-white/glass green/iron, airy)
- [ ] **Step 6: Verify all 5 presets render correctly**

```bash
# Switch presets in theme editor and verify each renders without errors
shopify theme check --path botanica
# Expected: 0 errors
```

- [ ] **Step 7: Commit**

> **Phase 6 Checkpoint:** Demo store complete. 25 products, 5 presets, 3 articles, FAQ, About, Contact. Zero lorem ipsum. Real plant data.

---

## Phase 7: Performance Optimization (Week 14–15)

> **Checkpoint:** Lighthouse desktop ≥90, mobile ≥75, accessibility ≥95. CLS < 0.05. LCP < 1.8s.

### Task 7.1: Critical CSS

**Files:** Create `assets/critical.css`. Extract above-fold styles (header, hero, first 2 sections).

- [ ] **Step 1: Identify above-fold CSS** — header styles, hero styles, first section typography
- [ ] **Step 2: Write critical.css** (~8KB max)
- [ ] **Step 3: Inline critical CSS in `<head>`**

```liquid
{%- liquid
  capture critical_css
    echo 'critical.css' | asset_url | stylesheet_tag
  endcapture
-%}
<style>{{ critical_css }}</style>
```

- [ ] **Step 4: Commit**

### Task 7.2: Font Strategy

- [ ] **Step 1: Preload woff2 fonts** in `<head>` with `crossorigin`
- [ ] **Step 2: Add `font-display: swap`** (already done in Liquid `font_face`)
- [ ] **Step 3: Subset to Latin + Extended Latin** (Shopify Font Library handles this)
- [ ] **Step 4: Add `size-adjust` fallback** for Inter

```css
@font-face {
  font-family: 'Inter Fallback';
  size-adjust: 104%;
  ascent-override: 90%;
  src: local('Arial');
}
```

- [ ] **Step 5: Commit**

### Task 7.3: Image Optimization

- [ ] **Step 1: Add explicit `width` and `height` to ALL `<img>` tags** (prevents CLS)
- [ ] **Step 2: Add `loading="lazy"`** to below-fold images, `fetchpriority="high"` on hero LCP image
- [ ] **Step 3: Add responsive `srcset` with `sizes`** to all product images
- [ ] **Step 4: Add `aspect-ratio` to all image containers**
- [ ] **Step 5: Commit**

### Task 7.4: Lighthouse Audit & Fix

- [ ] **Step 1: Run Lighthouse on homepage** (desktop + mobile)

```bash
# Use Shopify Lighthouse CI GitHub Action or Chrome DevTools
```

- [ ] **Step 2: Fix all Performance issues** — render-blocking resources, unused CSS/JS, large layout shifts
- [ ] **Step 3: Fix all Accessibility issues** — contrast, labels, focus order, alt text
- [ ] **Step 4: Re-run on all 5 presets + product + collection + cart**
- [ ] **Step 5: Iterate until targets met**
- [ ] **Step 6: Commit after each fix round**

### Task 7.5: Accessibility Audit

- [ ] **Step 1: Keyboard-only purchase flow** — tab through homepage → product → add to cart → checkout. Fix any trapped focus or missing focus styles.
- [ ] **Step 2: Screen reader test** — NVDA (Windows) or VoiceOver (Mac) on product page, collection page, cart. Fix missing labels/descriptions.
- [ ] **Step 3: Axe DevTools scan** on all 14 templates. Fix every violation.
- [ ] **Step 4: Color contrast audit** — verify all 5 presets pass 4.5:1 text contrast.
- [ ] **Step 5: 200% zoom test** — verify no content is cut off or overlapping.
- [ ] **Step 6: Reduced motion audit** — disable all animations, verify site still works.
- [ ] **Step 7: Commit**

> **Phase 7 Checkpoint:** Lighthouse targets met. Accessibility ≥95. CLS < 0.05. Keyboard navigation flawless.

---

## Phase 8: Locales & Compliance (Week 15)

> **Checkpoint:** 20 languages with real translations. All compliance items checked.

### Task 8.1: Locale Files

**Files:** All 20 `locales/*.json` files.

- [ ] **Step 1: Write `en.default.json`** — all translatable strings (~200 keys)
- [ ] **Step 2: Translate Tier 1 languages** (fr, de, es, it, ja, zh-CN) — human quality
- [ ] **Step 3: AI-translate Tier 2 languages** (pt-BR, pt-PT, nl, da, sv, nb, fi, cs, pl)
- [ ] **Step 4: AI-translate Tier 3 languages** (el, hu, hr, bg, ko) — flag for post-launch review
- [ ] **Step 5: Write `*.schema.json`** files for settings labels in all languages
- [ ] **Step 6: Commit**

### Task 8.2: Theme Check — Zero Errors

```bash
shopify theme check --path botanica
# Fix every warning and error until 0
```

- [ ] **Step 1: Run theme check** → fix all errors
- [ ] **Step 2: Verify no Dawn remnant files**
- [ ] **Step 3: Verify `--bt-*` namespace used in all CSS**
- [ ] **Step 4: Verify all `.liquid` files load matching `.css`**
- [ ] **Step 5: Verify all JSON files parse without errors**
- [ ] **Step 6: Commit**

### Task 8.3: Submission Checklist

Go through spec §14 item by item:

- [ ] **Step 1: Structure checklist** — Skeleton base, 5 listings, 14 templates, `--bt-*` namespace, metafield namespace
- [ ] **Step 2: Quality checklist** — theme check zero, CSS links verified, JSON valid, Lighthouse verified
- [ ] **Step 3: Demo store checklist** — 25 products, 32 sections populated, metafields, 5 content pages, zero lorem ipsum, navigation configured, 5 presets distinct
- [ ] **Step 4: Compliance checklist** — no external links, no credits, exclusive distribution, 20 locales, mobile-responsive all pages, JS-disabled fallback, no markets.json
- [ ] **Step 5: Commit final**

> **Phase 8 Checkpoint:** All compliance checked. 20 locales loaded. Zero theme check errors. Submission-ready.

---

## Phase 9: Polish & Submit (Week 16)

> **Checkpoint:** Cross-browser tested. All 5 presets visually QA'd. ZIP ready for submission.

### Task 9.1: Cross-Browser Testing

- [ ] **Step 1: Test on Chrome** (latest) — all pages, all interactions
- [ ] **Step 2: Test on Firefox** (latest) — check backdrop-filter, scroll behavior
- [ ] **Step 3: Test on Safari** (latest macOS + iOS) — check animations, sticky behavior, aspect-ratio
- [ ] **Step 4: Test on Edge** (latest) — verify no regressions from Chrome
- [ ] **Step 5: Fix any browser-specific bugs**
- [ ] **Step 6: Commit**

### Task 9.2: Mobile Device Testing

- [ ] **Step 1: iPhone (Safari)** — check safe-area-inset, sticky ATC, touch targets
- [ ] **Step 2: Android (Chrome)** — check font rendering, scroll performance
- [ ] **Step 3: Tablet (iPad)** — check layout at 768px-1024px breakpoints
- [ ] **Step 4: Fix any mobile-specific issues**
- [ ] **Step 5: Commit**

### Task 9.3: 5-Preset Visual QA

- [ ] **Step 1: Load Botanica preset** — verify cream/sage/bark, full homepage flow
- [ ] **Step 2: Load Greenhouse preset** — verify white/moss/charcoal, cleaner aesthetic
- [ ] **Step 3: Load Nocturne preset** — verify dark/terracotta/cream, moody consistency
- [ ] **Step 4: Load Herbarium preset** — verify aged paper/sepia/umber, vintage feel
- [ ] **Step 5: Load Conservatory preset** — verify off-white/glass green/iron, airy lightness
- [ ] **Step 6: Fix any preset-specific visual issues**
- [ ] **Step 7: Commit**

### Task 9.4: Final Theme Check & ZIP

```bash
shopify theme check --path botanica
# Must be 0 errors, 0 warnings

# Create submission ZIP
cd E:/ccfold/shopify
# Exclude .git, node_modules, etc.
zip -r botanica-2.0.0.zip botanica/ -x "botanica/.git/*" "botanica/.claude/*" "botanica/node_modules/*"
```

- [ ] **Step 1: Run final theme check** → zero errors, zero warnings
- [ ] **Step 2: Build ZIP** (correct structure, no hidden files)
- [ ] **Step 3: Verify ZIP structure** — `/listings/` at root, `/templates/` at root, all files present
- [ ] **Step 4: Commit ZIP to releases**

### Task 9.5: Submit

- [ ] **Step 1: Upload ZIP to Shopify Partner Dashboard**
- [ ] **Step 2: Fill submission form** — industry tags, catalog size, demo store URL, listing page description
- [ ] **Step 3: Submit for review**
- [ ] **Step 4: Monitor ticket #68560255 for response**

> **Phase 9 Checkpoint:** Submitted. Await Shopify Theme Review Team response.

---

## Implementation Notes

### File Creation Order Dependency
```
Phase 0 → Phase 1 → Phase 2+3 (parallel-possible) → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9
```

### Key Rules
1. **After every task:** `shopify theme check --path botanica` must return 0 errors
2. **CSS namespace:** Only `--bt-*` and `.bt-*`. No Dawn prefixes.
3. **JS:** Vanilla ES modules only. No jQuery, no polyfills, no npm.
4. **Commit:** After every completed task. Git is safety net.
5. **Test:** After every section, verify it renders in `shopify theme dev`.

### Testing Protocol (per section)
```bash
# 1. Syntax
shopify theme check --path botanica

# 2. Visual
shopify theme dev --path botanica --store <dev-store>
# Open http://127.0.0.1:9292, verify section renders

# 3. Responsive
# Resize browser: 375px, 768px, 1024px, 1440px

# 4. Interaction
# Hover, click, focus, keyboard-tab through all elements

# 5. Reduced motion
# Enable prefers-reduced-motion: reduce in DevTools, verify animations disable
```
