# Botanica 2.0 — Design Specification

**Date:** 2026-06-27
**Status:** Approved
**Version:** 2.0 (Skeleton Theme rebuild)
**Target:** Best theme on Shopify Theme Store — every dimension, no compromise.

---

## 1. Vision

Botanica 2.0 is not a plant store theme. It is the best theme on the Shopify Theme Store, period, that happens to be built for plants and botanical lifestyle.

**Quality bar:** Every page, every section, every hover state, every scroll interaction must feel like a custom-coded $30,000 storefront. Not "good for a Shopify theme" — good against any ecommerce experience on the web.

**Design language:** "Botanical editorial" — the experience of flipping through a lavishly printed botanical field guide. Paper texture, specimen labels, measured illustrations, field notes. Not techy. Not minimal-generic. Distinctive.

---

## 2. Competitive Positioning

### 2.1 Target Tier
Botanica competes directly with: Prestige ($380), Impulse ($380), Motion ($360), Athora, Taiga ($380-490).

**Botanica pricing: $350** — positioned slightly below the $380 tier for launch, with a clear path to $380 after 50+ reviews.

### 2.2 Differentiation Matrix

| Dimension | Industry Standard | Botanica 2.0 Target |
|-----------|-------------------|---------------------|
| **Sections** | 20-30 | **32+** |
| **Presets** | 3-5 | **5** |
| **Lighthouse Perf (desktop)** | 60-80 | **≥ 90** |
| **Lighthouse Perf (mobile)** | 40-60 | **≥ 75** |
| **Lighthouse Accessibility** | 70-90 | **≥ 95** |
| **CSS effects** | 5-10 basic | **25+ cinematic** |
| **Micro-interactions** | 10-15 | **40+** |
| **Locales** | 5-10 | **20** |
| **Built-in conversion tools** | 3-5 | **12+** |
| **Unique vertical features** | 0 | **6** (care system, plant finder, size viz, care timeline, before/after, specimen plate) |

### 2.3 Competitive Advantages (Moat)

1. **Plant care metafield system** — No other theme has this. It's a data model, not just a visual.
2. **Plant Finder interactive quiz** — Built-in product recommendation engine. Replaces a $20/mo app.
3. **Size visualization** — Human-scale comparison with draggable slider. Solves the #1 anxiety in online plant buying.
4. **Botanical editorial aesthetic** — Instantly recognizable. Cannot be achieved by customizing a generic theme.
5. **Care content ecosystem** — Care guides, care timeline, field notes, specimen plates. Turns the store into a resource.
6. **Performance with cinematic effects** — 90+ desktop Lighthouse while having 25+ CSS animations. Only Taiga competes on this axis.

### 2.4 Competitive Weaknesses (Mitigated in v2)

| Weakness | Mitigation |
|----------|------------|
| No mega menu | ✅ Added in v2 with image previews |
| No promo tools | ✅ Added: promo banner, countdown, sale badges, free shipping bar |
| Only 1 preset (v1) | ✅ 5 presets in v2 |
| Hardcoded care data | ✅ `botanica.*` metafield namespace |
| Dawn-dependent (v1) | ✅ Ground-up Skeleton Theme rebuild |
| No social proof grid | ✅ Instagram/Social Grid section |
| No wishlist | ⚠️ Phase 2 (post-launch) — Shopify requires app for server-side wishlist |
| No back-in-stock | ⚠️ Requires app integration (Shopify limitation) |

---

## 3. Visual Quality Standards

### 3.1 The "Botanical Editorial" Design Language

Every element must feel like it belongs in a printed botanical field guide:

| Element | Botanical Treatment |
|---------|-------------------|
| Typography | Fraunces headings (serif, botanical), Inter body (clean, readable). Headings use `font-variant-numeric: oldstyle-nums` for vintage figure styling |
| Color | Cream paper base, sage green accents, terracotta highlights, bark text. Gradients only as subtle paper tone shifts (not tech gradients) |
| Texture | Paper grain overlay on hero images, card backgrounds, and panels. CSS-only via `radial-gradient` noise pattern |
| Borders | Fine 1px lines with 15% opacity (pencil-line weight). Botanical specimen label borders |
| Corners | 2px-4px on labels/tags (specimen card corners), 12-16px on cards (soft paper edge) |
| Shadows | Warm brown-black, not pure black. `rgba(46, 42, 36, 0.12)` — reads as paper depth, not UI shadow |
| Spacing | Generous. 60-80px between sections. Content breathes. White space is editorial, not wasted |
| Iconography | Custom inline SVG in sage green, 1.5px stroke weight. Botanical line-art style (not filled, not geometric) |

### 3.2 Typography Scale

```
--bt-font-display:     clamp(3.2rem, 5vw, 5.6rem)    // Hero title
--bt-font-h1:          clamp(2.2rem, 3.5vw, 3.2rem)   // Page titles
--bt-font-h2:          clamp(1.8rem, 2.5vw, 2.4rem)   // Section headings
--bt-font-h3:          clamp(1.4rem, 1.8vw, 1.8rem)   // Card titles
--bt-font-body:        1rem                              // Body text
--bt-font-eyebrow:     0.72rem                           // Uppercase labels
--bt-font-specimen:    0.68rem                           // Specimen data
--bt-font-caption:     0.8rem                            // Image captions
```

All headings use `text-wrap: balance`. Body text max-width is 65ch.

---

## 4. CSS Effects Catalog

### 4.1 Scroll-Triggered Effects (Intersection Observer)

| # | Effect | Applied To | Technique |
|---|--------|-----------|-----------|
| 1 | **Fade Up + Blur Out** | Section headers, cards | `opacity 0→1, translateY(24px→0), filter blur(8px→0)` |
| 2 | **Parallax Drift** | Hero background, image banners | `translateY(-15%)` on scroll, rate limited to 60fps |
| 3 | **Scale Reveal** | Spotlight product images | `scale(0.92→1)` with `ease-out-expo` |
| 4 | **Staggered Card Reveal** | Card grids (shop-by-care, collection) | `transition-delay: calc(var(--index) * 80ms)` |
| 5 | **Split Text Reveal** | Hero title (split mode) | Each word `clip-path: inset(0 100% 0 0 → 0 0 0 0)` |
| 6 | **Horizontal Scroll Gallery** | Lookbook section | `overflow-x: auto` with snap points and progress indicator |
| 7 | **Sticky Stack Cards** | Plant spotlight on mobile | Cards stack and pin via `position: sticky` with z-index stagger |
| 8 | **Scroll-Progress Bar** | Care guide articles | Thin line at top of viewport tracking scroll percentage |
| 9 | **Image Uncover** | Image-with-text section | Image stays fixed, text scrolls over it with `clip-path` reveal |

### 4.2 Hover / Pointer Effects (CSS-only where possible)

| # | Effect | Applied To | Technique |
|---|--------|-----------|-----------|
| 10 | **Card Lift + Paper Shadow** | All cards | `translateY(-4px) + box-shadow` expansion, 280ms cubic-bezier |
| 11 | **Image Zoom (contained)** | Product card images | `scale(1.04)` on hover, `overflow: hidden` on container |
| 12 | **Second Image Swap** | Product cards with hover | `opacity 0→1` on second `<img>`, 300ms ease |
| 13 | **Underline Reveal from Center** | Text links | `::after` pseudo-element, `scaleX(0→1)`, `transform-origin: center` |
| 14 | **Button Hover Glow** | Primary buttons | `box-shadow` expands + warm amber glow on sage green |
| 15 | **Icon Micro-Bounce** | Cart icon on add | `@keyframes` bounce, 400ms, triggered by JS event |
| 16 | **Badge Pulse** | Sale/new badges | Subtle `scale(1.02)` pulse on first view, stops after 3s |
| 17 | **Arrow Slide** | CTA links in cards | Arrow SVG `translateX(0→4px)` on card hover |
| 18 | **Quantity Button Feedback** | +/- buttons | `scale(0.9→1.04→1)` on click, 150ms |
| 19 | **Color Swatch Select** | Variant swatches | Border widens + outer glow, `transition: border 150ms, box-shadow 200ms` |

### 4.3 Page-Load / Entrance Animations

| # | Effect | Applied To | Technique |
|---|--------|-----------|-----------|
| 20 | **Hero Content Stagger** | Hero section children | Each child fades up 80ms apart, first-child no delay |
| 21 | **Header Reveal** | Sticky header on scroll-up | `translateY(-100%→0)` when scrolling up, hidden on scroll down |
| 22 | **Cart Drawer Slide** | Cart sidebar | `translateX(100%→0)` with backdrop blur, 320ms ease-out |

### 4.4 Loading / Transition States

| # | Effect | Applied To | Technique |
|---|--------|-----------|-----------|
| 23 | **Image Lazy-Load Fade** | All `<img loading="lazy">` | `opacity 0→1, filter blur(10px→0)` on `onload` |
| 24 | **Skeleton Placeholder** | Product grids loading | Shimmer gradient animation, CSS `background-position` animation |
| 25 | **Section Reveal Threshold** | Below-fold sections | Only animate when ≥15% visible (Intersection Observer threshold) |
| 26 | **Quick View Modal** | Product quick view | Backdrop blur + panel scale(0.95→1) + opacity, 200ms |

### 4.5 Atmosphere Effects

| # | Effect | Applied To | Technique |
|---|--------|-----------|-----------|
| 27 | **Paper Grain Overlay** | Hero, spotlight, cards | `background-image: radial-gradient(rgba(0,0,0,0.7) 0.5px, transparent 0.5px)` at 3px spacing, 6% opacity, `mix-blend-mode: overlay` |
| 28 | **Botanical Line Border** | Specimen plates, care panels | 1px solid with 15% opacity, `border-radius: 2px` for specimen-card feel |
| 29 | **Warm Paper Gradient** | Section backgrounds | `linear-gradient(180deg, #FAF7EF 0%, #F5F1E8 30%, #ECE4D2 100%)` — subtle, not flat |

### 4.6 Reduced Motion Compliance

Every single effect wraps in:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animation here */
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4.7 Performance Budget for Effects

| Constraint | Limit |
|------------|-------|
| Simultaneous animated elements | ≤ 12 |
| Animation frame budget | ≤ 8ms per frame (leaves 8ms for other work at 60fps) |
| GPU-accelerated properties only | `transform`, `opacity`, `filter` (no `width`/`height`/`top`/`left` animations ever) |
| Intersection Observer threshold | 15% (don't animate things barely on screen) |
| Animation distance threshold | 200px (don't animate elements farther than 200px below viewport) |
| Parallax rate limit | `requestAnimationFrame` throttled, `will-change: transform` scoped |

---

## 5. Micro-Interaction Specification

### 5.1 Every Interactive Element

| Element | Hover | Active/Click | Focus | Disabled |
|---------|-------|-------------|-------|----------|
| **Primary Button** | bg darken 8% + shadow expand 6px | scale(0.97) 100ms | 2px outline + 2px offset | 40% opacity, no pointer |
| **Secondary Button** | border darken + bg 5% tint | scale(0.97) | same as primary | same |
| **Text Link** | underline expand from center | color shift to darker shade | standard outline | dimmed, no underline |
| **Card** | translateY(-4px) + shadow | none (whole card click) | 2px outline on card | none |
| **Input** | border-color shift | border-color focus + outer glow 4px | 2px ring | greyed out |
| **Checkbox/Radio** | border darken | checkmark scale(0→1) bounce | 2px ring | greyed out |
| **Select/Dropdown** | border-color shift | chevron rotate 180° | 2px ring | greyed out |
| **Quantity +/-** | bg tint | scale pop (0.9→1.04→1) | 2px ring | greyed out |
| **Drawer Close** | rotate 90° | scale(0.9) | 2px ring | — |
| **Mega Menu Trigger** | underline reveal + dropdown fade | — | standard outline | — |
| **Mobile Menu Toggle** | color shift | icon morph (hamburger→X) | 2px ring | — |
| **Swiper Arrow** | bg appear + arrow slide | scale(0.95) | 2px ring | hidden |
| **Color Swatch** | border widen + glow | checkmark appear | 2px ring | — |
| **Favorite/Wishlist** | heart fill animation | heart scale burst | 2px ring | — |

### 5.2 Feedback States

| Interaction | Visual Response | Duration |
|-------------|----------------|----------|
| Add to cart | Button text → "Added ✓" + cart icon bounce + drawer slide | 1.5s total |
| Remove from cart | Row slide out left + height collapse | 300ms |
| Form validation error | Input shake (3px horizontal) + border reddens | 400ms shake |
| Form success | Green checkmark fades in + input border greens | 500ms |
| Newsletter subscribe | Button text → "Subscribed ✓" + success message fade in | 600ms |
| Search no results | "No plants found" + illustration fade in | 400ms |
| Plant Finder complete | Results cards stagger reveal + confetti-like leaf particles | 800ms |
| Image loaded | Blur-out reveal | 400ms |
| Variant unavailable | Option greys out + strikethrough + "Unavailable" tooltip | 200ms |

---

## 6. Architecture

### 6.1 Codebase
- **Base:** Skeleton Theme (Shopify's official minimal reference)
- **Zero Dawn dependency** — no Dawn CSS, no Dawn JS, no Dawn Liquid snippets
- All CSS, JS, and Liquid are custom-built for Botanica
- **No jQuery. No Bootstrap. No Tailwind.** Pure CSS custom properties + vanilla JS.

### 6.2 Directory Structure

```
botanica/
├── assets/                    # CSS, JS, images
│   ├── design-tokens.css      # --bt-* CSS custom properties
│   ├── botanica-base.css      # Reset, typography, buttons, forms, card primitives
│   ├── botanica-animations.css # All keyframes + animation utility classes
│   ├── section-hero.css
│   ├── section-shop-by-care.css
│   ├── section-plant-spotlight.css
│   ├── ... (one CSS per section)
│   ├── theme.js               # Global: nav, search, scroll-observer, cart-notification
│   ├── scroll-animations.js   # Intersection Observer: fade-ups, parallax, reveals
│   ├── quick-view.js          # Quick view modal
│   ├── sticky-atc.js          # Mobile sticky add-to-cart
│   ├── plant-finder.js        # Interactive quiz engine
│   ├── compare-slider.js      # Before/after image comparison
│   ├── lookbook-gallery.js    # Masonry layout + lightbox
│   └── mega-menu.js           # Image-preview mega menu
├── blocks/                    # Reusable theme blocks
├── config/
│   ├── settings_schema.json   # 9 tab groups
│   └── settings_data.json     # 5 presets
├── layout/
│   └── theme.liquid
├── listings/
│   ├── botanica/              # Preset 1: Default cream editorial
│   ├── greenhouse/            # Preset 2: White modern botanical
│   ├── nocturne/              # Preset 3: Dark moody luxe
│   ├── herbarium/             # Preset 4: Vintage dried-plant aesthetic
│   └── conservatory/          # Preset 5: Light, airy, architectural
├── locales/                   # 20 language files
├── sections/                  # 32 section .liquid files
├── snippets/                  # Reusable Liquid fragments
└── templates/                 # Base JSON templates (14 types)
```

### 6.3 CSS Architecture (4-layer)

```
Layer 0: design-tokens.css         → --bt-* CSS custom properties
Layer 1: botanica-base.css         → Reset, typography scale, .btn primitives, .card--botanica, form inputs
Layer 2: botanica-animations.css   → @keyframes, .anim-* utility classes, reduced-motion overrides
Layer 3: section-*.css             → One CSS file per section, scoped to section class
```

### 6.4 CSS Naming Convention
- Components: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--outline`
- Cards: `.card--botanica`, `.card--product`, `.card--article`
- Utilities: `.u-sr-only`, `.u-text-balance`, `.u-grain`
- States: `.is-active`, `.is-loading`, `.is-visible`, `.has-error`
- JS hooks: `[data-js-cart-toggle]`, `[data-js-scroll-reveal]`
- **No BEM**. No Dawn prefixes. Clean, readable, 2026 conventions.

---

## 7. Templates (14 types)

| Template | Description | Unique Botanica Feature |
|----------|-------------|------------------------|
| `index.json` | Homepage | 12-section brand narrative flow |
| `product.json` | Product page | Custom: stacked gallery + sticky care panel + field note + specimen plate + care data metafields |
| `collection.json` | Collection page | Care-level filter + light-need filter + plant card grid with care badges |
| `cart.json` | Cart page | Care tip upsell + free shipping progress bar |
| `search.json` | Search page | Faceted predictive search with plant-specific filters |
| `page.json` | Generic page | All 32 sections available |
| `page.contact.json` | Contact page | Plant consultation form with care questionnaire |
| `page.about.json` | About page | Brand story with timeline + grower profiles |
| `page.faq.json` | FAQ page | Accordion care FAQ with article links |
| `blog.json` | Blog listing | Care knowledge base with category filter |
| `article.json` | Article detail | Long-form care guide with progress bar + related articles |
| `list-collections.json` | Collections hub | Plant category cards with care badges + image preview |
| `404.json` | Not found | Botanical illustration + plant finder CTA |
| `password.json` | Coming soon | Conservatory glasshouse aesthetic |
| `gift_card.json` | Gift card | Branded botanical card design |
| `customers/*` | Account (6) | Brand-styled, fully functional |

---

## 8. Sections — 32 Total

### 8.1 Hero & Banner Sections (4)

| # | Section | Key Effects |
|---|---------|-------------|
| 1 | **Hero Lookbook** | Parallax bg, split-text reveal, grain overlay, video bg option, carousel mode, issue-tag slide-in |
| 2 | **Image Banner** | Full-bleed parallax, overlay text, CTA buttons |
| 3 | **Video Hero** | Autoplay video bg, poster fallback, muted by default |
| 4 | **Slideshow** | Crossfade transitions, caption animations, touch-swipe |

### 8.2 Plant-Specific Sections (8) ★ MOAT

| # | Section | Key Effects |
|---|---------|-------------|
| 5 | **Shop by Care** | Care-level tinted cards, light/water meters, hover lift, arrow slide, metafield-driven |
| 6 | **Plant Spotlight** | Large image with grain, care table with icon circles, field note with terracotta left-border, specimen plate tag |
| 7 | **Plant Finder** | Multi-step quiz, progress dots, smooth step transitions, results stagger reveal, leaf particle celebration |
| 8 | **Care Timeline** | Horizontal timeline with SVG plant growth stages, seasonal care markers, scroll-triggered |
| 9 | **Size Guide** | Draggable comparison slider, human+plant SVG scale, size cards with badges, cm/inch toggle |
| 10 | **Before & After** | Image comparison slider (drag handle), growth documentation, label overlay |
| 11 | **Care Blog Teaser** | 3-card grid, auto-pull from blog or manual, tag badges, hover lift |
| 12 | **Collection Mosaic** | Asymmetric grid, mixed card sizes, hover zoom, care badges |

### 8.3 Social Proof & Trust (4)

| # | Section | Key Effects |
|---|---------|-------------|
| 13 | **Testimonials** | Quote mark SVG, star ratings, avatar placeholders, verified badges, masonry/carousel modes |
| 14 | **Values Bar** | Inline SVG icons (12 choices), horizontal scroll on mobile, subtle icon color |
| 15 | **Social Grid** | Instagram-style masonry, lazy-load images, hover overlay with heart/comment icons |
| 16 | **Press & Awards** | Logo grid with grayscale→color on hover, subtle scale |

### 8.4 Conversion Sections (5)

| # | Section | Key Effects |
|---|---------|-------------|
| 17 | **Newsletter Perk** | Split layout, perks checklist, email form with error shake + success animation |
| 18 | **Featured Collection** | Product card grid, hover image swap, quick-view trigger, care badges on plant products |
| 19 | **Featured Product** | Single product focus, variant picker inline, quantity selector, sticky ATC on mobile |
| 20 | **Shop the Look** | Image with product hotspots (pulsing dots), click to quick-view/add, hotspot tooltip |
| 21 | **Promo Banner** | Countdown timer (optional), CTA button, dismissable, color scheme toggle, marquee mode |

### 8.5 Content & Editorial (5)

| # | Section | Key Effects |
|---|---------|-------------|
| 22 | **Rich Text** | Centered, max-width constrained, botanical styling, optional divider ornament |
| 23 | **Image with Text** | Split layout, image parallax or sticky, text reveal on scroll, 4 layout variants |
| 24 | **Multi-column** | Icon + text grid, 2-6 columns, icon color theming |
| 25 | **Collage** | Mixed-media layout, 3 layout presets, image+video+text blocks |
| 26 | **Lookbook Gallery** | Masonry grid, lightbox viewer, lazy-load with blur-up, optional captions |

### 8.6 Utility & System (6)

| # | Section | Key Effects |
|---|---------|-------------|
| 27 | **Contact Form** | Styled inputs, validation animations, success state |
| 28 | **FAQ Accordion** | Smooth height transition, +/- icon rotate, search filter |
| 29 | **Video** | Responsive embed, botanical frame border, aspect-ratio lock |
| 30 | **Custom Liquid** | Merchant code block, no styling applied |
| 31 | **App Blocks** | `@app` block support |
| 32 | **Mega Menu Content** | Snippet (not section): image-preview dropdown, 4-column layout, care-level icons |

---

## 9. Settings Schema (9 Tab Groups)

```
1. Logo & Brand
   - Logo image, logo width, favicon
   - Brand tagline, brand description
   - Brand image (for About page)

2. Colors (5 presets)
   ├── Botanica:      Cream bg, Sage accent, Bark text        (default, editorial)
   ├── Greenhouse:    White bg, Moss accent, Charcoal text     (modern, clean)
   ├── Nocturne:      Dark brown bg, Terracotta accent, Cream  (moody, luxe)
   ├── Herbarium:     Aged paper bg, Sepia accent, Umber text  (vintage, dried-plant)
   └── Conservatory:  Off-white bg, Glass green accent, Iron   (airy, architectural)

3. Typography
   - Heading font: Fraunces + variants
   - Body font: Inter + variants
   - Heading scale, body scale
   - Letter spacing presets (tight / normal / wide)

4. Layout
   - Page width, grid spacing
   - Card style, card radius
   - Section spacing presets
   - Mobile column control

5. Plant Settings ★
   - Care system show/hide
   - Size unit: cm / inches
   - Light meter display
   - Toxicity badge display
   - Plant finder enable/disable
   - Care timeline enable/disable

6. Product Display
   - Image ratio (square / 4:5 portrait / 3:4)
   - Second image on hover
   - Quick view enable
   - Care badge on cards
   - Sale badge color scheme
   - Sold out badge color scheme

7. Cart & Checkout
   - Cart type: drawer / page / notification
   - Sticky ATC on mobile
   - Free shipping threshold ($)
   - Cart upsell (care tips)
   - Quick buy buttons

8. Promotions ★ NEW
   - Promo banner: enable, text, link, countdown date
   - Sale badge: color scheme, animation
   - Free shipping bar: enable, threshold, message
   - Newsletter popup: enable, delay (seconds), discount code offer

9. Social & Search
   - Social media links (9 platforms)
   - Predictive search enable
   - Social grid section: Instagram handle, layout
   - Currency code display
```

---

## 10. Performance Budget

| Metric | Target | How We Achieve It |
|--------|--------|-------------------|
| **Lighthouse Perf (desktop)** | ≥ 90 | CSS-only effects where possible, Intersection Observer not scroll events, lazy loading, font preload, critical CSS inline |
| **Lighthouse Perf (mobile)** | ≥ 75 | Same + reduced animation complexity, smaller images via `srcset`, mobile-first CSS |
| **Lighthouse Accessibility** | ≥ 95 | Semantic HTML, `:focus-visible` everywhere, ARIA labels, color contrast 4.5:1+, screen-reader text, keyboard navigation |
| **LCP** | < 1.8s | Hero image `fetchpriority="high"`, font preload, critical CSS inline, no render-blocking JS |
| **CLS** | < 0.05 | Explicit width/height on all images, `aspect-ratio` on containers, font `size-adjust` fallback, reserve space for injected content |
| **TTI** | < 2.5s | JS deferred, modules async, Intersection Observer for non-critical work |
| **Total CSS size** | < 50KB gzipped | No framework, CSS custom properties, deduplication |
| **Total JS size** | < 40KB gzipped | Vanilla ES modules, no polyfills, no libraries |
| **Font load** | < 200KB total | `font-display: swap`, subset to latin + extended latin, preload woff2 |
| **Animation frame budget** | ≤ 8ms | GPU-only properties (`transform`, `opacity`), `will-change` scoped and removed after animation |

---

## 11. Accessibility (Target ≥95 Lighthouse)

### 11.1 Beyond the Minimum
- **Motion sensitivity:** Every animation respects `prefers-reduced-motion`. Animation toggle in settings (on/off/reduced).
- **Color independence:** Care levels use icons AND colors. Toxicity uses icon + text, not just red/green.
- **Touch targets:** All interactive elements ≥ 44×44px (mobile). Quantity buttons, swatches, close buttons.
- **Focus ring:** `:focus-visible` with 2px offset, high-contrast color. Never `outline: none` without replacement.
- **Screen reader:** Care tables use proper `<table>` with `<caption>`. SVG icons have `aria-hidden="true"` with adjacent screen-reader text. Plant Finder uses `aria-live` region for results.
- **Keyboard:** Mega menu navigable with arrow keys. Drawer traps focus. Quick view modal traps focus. Esc closes all overlays.
- **Form errors:** Announced via `aria-live` region, linked to field via `aria-describedby`.
- **Skip link:** "Skip to content" + "Skip to product filters" + "Skip to cart".

### 11.2 Accessibility Testing Protocol
- [ ] Tab through every interactive element on every template
- [ ] VoiceOver/NVDA read-through on product, collection, and cart
- [ ] Axe DevTools scan on every template
- [ ] Color contrast audit on all 5 presets
- [ ] Reduced motion audit (all animations disabled)
- [ ] 200% zoom test on all breakpoints
- [ ] Keyboard-only purchase flow (homepage → product → cart → checkout)

---

## 12. Demo Store Specification

### 12.1 Product Catalog (25 products)

**Plants (16):** Monstera deliciosa, Fiddle Leaf Fig, Snake Plant 'Moonshine', ZZ Plant, Golden Pothos, Rubber Plant 'Burgundy', Bird of Paradise, Chinese Money Plant, String of Pearls, Peace Lily, Calathea 'Medallion', Hoya 'Krimson Queen', Philodendron 'Brasil', Alocasia 'Polly', Strelitzia nicolai, Maranta 'Prayer Plant'

**Pots (5):** Terracotta cylinder, Glazed ceramic bowl, Seagrass basket, Concrete planter, Wall-mounted planter

**Lifestyle (4):** Plant care tool kit, Organic neem oil spray, Botanical soy candle, Propagation station

### 12.2 Product Images
- AI-generated (Midjourney/Flux) with consistent prompt template: "professional product photography, [plant name] in [terracotta/ceramic] pot, cream background, soft natural window light, editorial botanical style, 4K, shot on Fujifilm GFX"
- 3 images per product: white bg studio shot, lifestyle room setting, detail close-up
- Consistent color temperature (5600K daylight) across all images

### 12.3 Metafield Schema
```
botanica.light_level        → low | medium_low | medium | bright
botanica.water_frequency    → sparing | weekly | frequent
botanica.humidity_range     → low_30_40 | medium_50_60 | high_70_plus
botanica.mature_height_cm   → number
botanica.pot_diameter_cm    → number
botanica.toxicity           → none | mild | toxic
botanica.care_level         → easy | medium | expert
botanica.origin_story       → text (field note content)
botanica.botanical_name     → text (Latin name)
```

### 12.4 Content Pages
- **Care Guides (3 articles):** Watering 101, Reading Room Light, When to Repot
- **About + Sustainability:** Brand origin story, grower profiles, packaging philosophy
- **FAQ:** 8-10 plant care questions in accordion format
- **Contact:** Consultation form with "What plant are you interested in?" dropdown

### 12.5 Navigation
```
Shop → All Plants | Easy Care | Medium Care | Expert Care | Pots | Lifestyle
Learn → Care Guides | Plant Finder | Size Guide | FAQ
About → Our Story | Sustainability | Contact
```

---

## 13. Locale Strategy

20 languages, 3 tiers:

**Tier 1 (human + review):** English, French, German, Spanish, Italian, Japanese, Chinese (Simplified)
**Tier 2 (AI + review):** Portuguese (BR+PT), Dutch, Danish, Swedish, Norwegian, Finnish, Czech, Polish
**Tier 3 (AI only, post-launch review):** Greek, Hungarian, Croatian, Bulgarian, Korean

All locale keys follow Shopify convention: `t:section.shop_by_care.eyebrow`, not hardcoded strings.

---

## 14. Submission Readiness Checklist

### Structure
- [ ] Skeleton Theme base confirmed
- [ ] Zero Dawn files in repository
- [ ] `/listings/` folder with 5 preset subdirectories
- [ ] All 14 template types covered
- [ ] `--bt-*` CSS namespace exclusively used
- [ ] `botanica.*` metafield namespace defined

### Quality
- [ ] `shopify theme check` → zero errors
- [ ] All `.liquid` files load matching `.css` via `stylesheet_tag`
- [ ] All JSON valid, no BOM
- [ ] Lighthouse scores verified across all 5 presets
- [ ] Accessibility audit passed (≥95)

### Demo Store
- [ ] 25 products with 3+ AI-generated images each
- [ ] All 32 sections present and populated in at least one template
- [ ] Care metafields on all 16 plant products
- [ ] 5 content pages complete
- [ ] Zero lorem ipsum
- [ ] Navigation fully configured with mega menu
- [ ] All 5 presets visually distinct and demo-ready

### Compliance
- [ ] No external links, affiliate links, or designer credits
- [ ] Exclusive distribution through Shopify Theme Store
- [ ] 20 locales with real translations
- [ ] Mobile-responsive on all 14 templates
- [ ] JS-disabled fallback functional (nav, forms, cart)
- [ ] No `config/markets.json` in ZIP

---

## 15. Implementation Phases

| Phase | Scope | Duration |
|-------|-------|----------|
| **P0: Foundation** | Skeleton init, design tokens, 4-layer CSS, layout skeleton, header with mega menu, footer | 2 weeks |
| **P1: Templates** | All 14 JSON templates + `/listings` 5 presets + metafield schema | 2 weeks |
| **P2: Core Sections** | 8 plant-specific sections (the moat) — shop-by-care, spotlights, finders, guides | 3 weeks |
| **P3: Remaining Sections** | 14 content/conversion/utility sections + 5 hero/banner sections + 4 social proof + mega menu content | 2.5 weeks |
| **P4: JS Ecosystem** | theme.js, scroll-animations.js, quick-view, sticky-atc, plant-finder, compare-slider, lookbook-gallery, mega-menu | 2 weeks |
| **P5: CSS Effects** | Implement all 29 effects catalog + 40+ micro-interactions + reduced-motion variants | 1.5 weeks |
| **P6: Demo Store** | 25 products, AI images, metafields, 5 content pages, navigation, 5 preset demos | 1.5 weeks |
| **P7: Performance** | Lighthouse optimization, CLS elimination, font strategy, critical CSS, lazy loading audit | 1 week |
| **P8: Compliance** | 20 locales, theme check, accessibility audit, keyboard testing, screen reader testing | 1 week |
| **P9: Polish** | Cross-browser, cross-device, 5-preset visual QA, bug fixes, submit | 1 week |
| **Total** | | **15-16 weeks** |

---

## 16. Pricing & Launch Strategy

- **Launch price:** $350 (one-time, lifetime updates)
- **Raise to $380** after 50+ reviews
- **Launch preset order:** Botanica (hero) → Greenhouse → Nocturne → Herbarium → Conservatory
- **Listing page assets:** Professional screenshots of all 5 presets, demo store URL, feature comparison vs Prestige/Impulse
