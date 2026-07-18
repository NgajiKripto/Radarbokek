# Design — Radar Bokek

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
modern-minimal

## Macrostructure family
- Landing page: Marquee Hero (editorial split, asymmetric, typographic hero)
- App pages (map, dashboard): Workbench (functional layout, persistent chrome)
- Content pages (profile, topup, auth): Long Form (single-column, generous whitespace)

## Theme
- `--color-paper`      oklch(97% 0.01 75)     /* warm cream */
- `--color-paper-2`    oklch(94% 0.01 75)     /* slightly deeper cream */
- `--color-paper-3`    oklch(90% 0.01 75)     /* hover/active surface */
- `--color-ink`        oklch(15% 0.01 60)     /* near-black warm */
- `--color-ink-2`      oklch(40% 0.01 60)     /* secondary text */
- `--color-rule`       oklch(85% 0.01 60)     /* dividers, borders */
- `--color-accent`     oklch(55% 0.18 25)     /* merah-terakota, warm red */
- `--color-accent-ink` oklch(99% 0.00 0)      /* white on accent */
- `--color-focus`      oklch(55% 0.18 25)     /* same as accent for focus ring */
- `--color-teal`       oklch(62% 0.08 175)    /* secondary action, QRIS badge */
- `--color-teal-ink`   oklch(99% 0.00 0)      /* white on teal */
- `--color-yellow`     oklch(88% 0.14 85)     /* highlight, active state */
- `--color-yellow-ink` oklch(20% 0.05 60)     /* dark on yellow */
- `--color-error`      oklch(52% 0.20 25)     /* error, same hue family as accent */
- `--color-error-ink`  oklch(99% 0.00 0)

## Typography
- Display: Instrument Serif, weight 400–700, style normal (NEVER italic on headings)
- Body: DM Sans, weight 300–600
- Mono: JetBrains Mono, weight 400–500 (for data, labels, code-like UI)
- Display tracking: -0.02em
- Type scale anchor: `--text-display` = clamp(2.5rem, 5vw + 1rem, 4rem)

## Spacing
4-point named scale. The values are in `tokens.css`. Pages must use named
tokens (`var(--space-md)`), never raw values.

## Motion
- Easings: cubic-bezier(0.16, 1, 0.3, 1) named `--ease-out`, etc.
- Reveal pattern: fade + subtle slide (≤20px, ≤400ms)
- Reduced-motion fallback: opacity-only, ≤ 150 ms
- Transform and opacity only — never layout properties

## Microinteractions stance
- Silent success (no celebratory toasts)
- Hover delay 800ms on tooltips · focus delay 0ms
- Optimistic update + undo over confirmation dialogs
- Counter animation on stats (number count-up)

## CTA voice
- Primary CTA: pill shape (border-radius: 999px), accent fill, DM Sans 600, subtle lift on hover
- Secondary CTA: pill outline, ink border, transparent fill, DM Sans 500

## Per-page allowances
- Landing page MAY use enrichment (Tier-A CSS art, decorative elements)
- App pages (map, dashboard) MUST NOT use enrichment — function carries the page
- Content pages: typography only

## What pages MUST share
- The wordmark / logotype (Instrument Serif, "Radar Bokek")
- The accent colour and its placement (≤ 5% per viewport)
- Instrument Serif display + DM Sans body fonts
- The CTA voice (pill buttons, consistent border-radius, padding rhythm)
- Section heading rhythm (display heading + body subtext pattern)

## What pages MAY differ on
- Macrostructure within the page-type family
- Hero archetype (within the family's allowance)
- Enrichment — only on landing page, only Tier-A or Tier-B

## Component voice
- Cards: 1px border (--color-rule), subtle shadow (not hard-shadow), rounded (8px)
- Inputs: 1px border, rounded (8px), clean focus ring (accent, 2px offset)
- Badges: pill shape, small caps (DM Sans 500, 11px), teal or accent background
- Bottom nav: floating pill shape (not full-width slab)
- Icons: Material Symbols Outlined (keep), no emoji in buttons

## Exports

### tokens.css
```css
:root {
  --color-paper:      oklch(97% 0.01 75);
  --color-paper-2:    oklch(94% 0.01 75);
  --color-paper-3:    oklch(90% 0.01 75);
  --color-ink:        oklch(15% 0.01 60);
  --color-ink-2:      oklch(40% 0.01 60);
  --color-rule:       oklch(85% 0.01 60);
  --color-accent:     oklch(55% 0.18 25);
  --color-accent-ink: oklch(99% 0.00 0);
  --color-focus:      oklch(55% 0.18 25);
  --color-teal:       oklch(62% 0.08 175);
  --color-teal-ink:   oklch(99% 0.00 0);
  --color-yellow:     oklch(88% 0.14 85);
  --color-yellow-ink: oklch(20% 0.05 60);
  --color-error:      oklch(52% 0.20 25);
  --color-error-ink:  oklch(99% 0.00 0);

  --font-display: "Instrument Serif", Georgia, serif;
  --font-body:    "DM Sans", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  --space-3xs: 0.25rem;  --space-2xs: 0.5rem;  --space-xs: 0.75rem;
  --space-sm:  1rem;     --space-md:  1.5rem;  --space-lg: 2rem;
  --space-xl:  3rem;     --space-2xl: 4.5rem;  --space-3xl: 7rem;

  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-md: 1.125rem;
  --text-lg: 1.375rem; --text-xl: 1.75rem;  --text-2xl: 2.25rem;
  --text-3xl: 3rem;    --text-display: clamp(2.5rem, 5vw + 1rem, 4rem);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.85, 0, 0.15, 1);
  --dur-short: 180ms;
  --dur-med:   300ms;
  --dur-long:  450ms;

  --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px;
  --radius-pill: 999px;
}
```
