# Botanica v3.0.0 — Release Notes

## First Release

Botanica is a multi-purpose premium Shopify theme with a flagship botanical/plant-store demo. Built from the ground up on Shopify Skeleton with the theme-blocks architecture, it delivers editorial design, care-guide commerce, and specimen-grade product pages — all without a single line of Dawn or Horizon code.

### What makes Botanica different

**Editorial design language.** Fraunces headings with oldstyle numerals, Inter body, botanical specimen tags, paper-texture overlays, and field-note styling. Not "green-themed" — it's built like a plant encyclopedia.

**Care-first commerce.** Every product card can show a care-difficulty badge (Easy / Medium / Expert) and a light-requirement meter. On the product page, a full care panel with inline SVG icons covers light, water, humidity, mature size, toxicity, and feeding — everything a buyer needs to make a confident decision.

**Size visualization.** An interactive size guide section compares plants against a human figure with pot dimensions in both centimeters and inches.

**Shop by confidence level.** A dedicated care-level entry section routes beginners to easy-care plants, enthusiasts to medium, and collectors to expert — reducing returns from mismatched expectations.

**Mobile-optimized checkout.** A sticky add-to-cart bar appears on mobile when the main button scrolls out of view, keeping the purchase action always accessible without screen clutter.

**Three curated presets.** Botanical (warm cream and sage), Home & Decor (clean white and charcoal), and Wellness (terracotta and warm cream) — each with distinct colors, spacing, and feel.

### Features

- **9 custom homepage sections**: Hero Lookbook, Shop by Care, Plant Spotlight, Care Blog Teaser, Size Guide, Values Bar, Testimonials, Newsletter Perk, Featured Collection
- **20+ reusable theme blocks**: Eyebrow, heading, text, button group, badge, care row, care table, specimen eyebrow, product title, product price, product badges, variant picker, quantity selector, buy buttons, description, share, care panel, care story, field note, collapsible specs
- **Multi-purpose sections**: Rich text, image with text, multicolumn, collage, slideshow, FAQ accordion, logo list, gallery, contact form, newsletter
- **Original product page architecture**: Editorial split-layout gallery, sticky care panel, field notes, collapsible specs — all built from independent theme blocks
- **Collection page**: Filtering by availability and price, sorting, care-difficulty badges on product cards
- **Cart drawer**: Slide-out cart with free shipping progress bar (real cart-total based), quantity controls, and care tips
- **Predictive search**: Instant results with product images, prices, and care badges
- **Full accessibility**: Skip-to-content link, keyboard navigation, ARIA live regions for price/variant changes, 44×44px touch targets, prefers-reduced-motion guards, focus-visible preserved everywhere
- **Performance**: Vanilla JavaScript (zero external dependencies, <16KB), CSS scoped to blocks, responsive images with srcset/sizes, font preloading, no render-blocking resources
- **Full i18n**: en.default.json with complete t: translation keys; 20+ additional language files included

### Technical

- **Base**: Shopify Skeleton (the only approved Theme Store base)
- **Architecture**: Theme blocks (blocks/ directory + {% content_for "blocks" %}), JSON templates, section groups
- **Zero Dawn/Horizon code**: Every line is original
- **Merchant-editable colors**: Individual color settings for background, surface, text, primary accent, secondary accent, and borders — no hardcoded presets
- **Shopify Font Library**: Fraunces (headings) and Inter (body) via font_picker
- **CSS**: Scoped per-block via {% stylesheet %}, design tokens via CSS custom properties, color-mix() derived tints with fallbacks
- **JavaScript**: ES modules, defer-loaded, no external libraries
- **Compliant with 2026 Theme Store rules**: Custom Liquid section included, @app block support on all templates, no custom metafields required, no shopify:// references

### Requirements

- Shopify Online Store 2.0
- Shopify Theme Store compatible

### Support

- Documentation: https://botanica-theme.com/docs
- Support: https://botanica-theme.com/support
- Response time: Within 2 business days

---

*Built for Shopify Theme Store. Zero Dawn code. Original architecture.*
