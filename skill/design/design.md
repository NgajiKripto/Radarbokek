---
name: Street Food Radar
colors:
  surface: '#F8F7F4'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5b403a'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8f7069'
  outline-variant: '#e4beb6'
  surface-tint: '#b72301'
  primary: '#b72301'
  on-primary: '#ffffff'
  primary-container: '#ff5733'
  on-primary-container: '#580c00'
  inverse-primary: '#ffb4a4'
  secondary: '#6e5e00'
  on-secondary: '#ffffff'
  secondary-container: '#fddf54'
  on-secondary-container: '#736200'
  tertiary: '#006a68'
  on-tertiary: '#ffffff'
  tertiary-container: '#439f9c'
  on-tertiary-container: '#00302f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a4'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1800'
  secondary-fixed: '#ffe25c'
  secondary-fixed-dim: '#e2c63d'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#534600'
  tertiary-fixed: '#98f2ee'
  tertiary-fixed-dim: '#7cd5d2'
  on-tertiary-fixed: '#00201f'
  on-tertiary-fixed-variant: '#00504e'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  radar-yellow: '#FFE156'
  chili-red: '#FF5733'
  teal-fresh: '#46A29F'
  ink: '#1A1A1A'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The brand personality of this design system is high-energy, hyper-local, and community-centric. It captures the vibrant, fast-paced essence of street food culture while providing a reliable tool for discovery. The target audience consists of urban explorers and food enthusiasts looking for immediate, authentic culinary experiences.

The design style is **Modern Brutalism**. It utilizes high-contrast color pairings, bold strokes, and a mix of technical and geometric typography to create a "radar" or "scanner" aesthetic. The interface is intentionally "unrefined" in its confidence—using heavy borders and flat surfaces to evoke the raw, honest nature of street stalls, but polished with smooth transitions and a mobile-first architectural logic to ensure accessibility.

## Colors

The palette is driven by the sensory experience of street food. **Chili Red** (#FF5733) serves as the primary action color to stimulate appetite and urgency. **Radar Yellow** (#FFE156) is used for high-visibility highlights, search indicators, and badges, mimicking the "radar" theme. **Teal Fresh** (#46A29F) provides a cooling contrast for success states, verification badges, and price indicators.

The background uses **Surface** (#F8F7F4), a warm off-white that reduces glare during outdoor mobile use, while **Ink** (#1A1A1A) provides the structural foundation through borders, text, and heavy iconography.

## Typography

This design system employs a dual-typeface strategy to balance modern aesthetics with technical utility. 

**Space Grotesk** is used for all primary communication, headlines, and body copy. Its idiosyncratic curves and geometric structure feel contemporary and approachable. **JetBrains Mono** is reserved for labels, metadata (distance, price, timestamps), and "radar" data points. This monospaced font adds a technical, "scanned" feel to the data-heavy aspects of finding street food, ensuring that specific numbers and locations are easily legible at a glance.

## Layout & Spacing

The layout philosophy is **Mobile-First Fixed-Fluid**. On mobile devices, the system uses a 4-column grid with 16px margins, ensuring that content remains centered and accessible for one-handed operation. On desktop, the content is contained within a max-width of 1200px (12-column grid) to maintain readability.

The spacing rhythm is based on a 4px baseline, but defaults to 8px increments for standard element grouping. Large 40px (xl) gaps are used to separate distinct "zones" (e.g., the map view vs. the vendor list). Use heavy internal padding (16px+) for cards to maintain the "chunky" brutalist feel.

## Elevation & Depth

Hierarchy in this design system is achieved through **Bold Borders** and **Tonal Layering** rather than traditional shadows. 

1.  **Level 0 (Base):** The `Surface` color.
2.  **Level 1 (Cards/Containers):** Flat white background with a 2px `Ink` solid border. 
3.  **Level 2 (Interactive/Hover):** A "Hard Shadow" effect—a solid 4px offset block of `Ink` or `Primary` color behind the element to give it a physical, stamped appearance.
4.  **Level 3 (Modals/Pop-ups):** A heavy 4px `Ink` border with a `Radar Yellow` accent bar at the top to indicate the highest priority information.

Avoid blurs and soft shadows entirely to maintain the crisp, graphic intensity of the brand.

## Shapes

The shape language is **Soft-Brutalist**. Most UI elements use a subtle 4px (0.25rem) corner radius. This prevents the interface from feeling too sharp or aggressive while maintaining the structural integrity of the grid. 

- **Standard Buttons/Inputs:** 4px radius.
- **Search Bars:** Fully rounded (pill-shaped) to distinguish the primary "Radar" search action from content containers.
- **Badges/Chips:** 0px (Sharp) to emphasize the technical "data point" nature of tags like "Open Now" or "Halal".

## Components

### Buttons
Primary buttons use the `Chili Red` background with `Ink` text and a 2px `Ink` border. On hover or active states, they should shift 2px down and right, appearing to "press" into their hard shadow. Secondary buttons use `Radar Yellow` for high contrast against the `Surface` background.

### Cards
Vendor cards must feature a 2px `Ink` border. The title uses `Headline-MD` (Space Grotesk) while the metadata (distance/rating) uses `Label-MD` (JetBrains Mono) for a technical readout feel.

### Chips & Tags
Tags are used for food categories and status. They should be rectangular with 0px roundedness, a 1px border, and a background color that corresponds to the category (e.g., `Teal Fresh` for "Available").

### Inputs
Search inputs should be pill-shaped with a 2px `Ink` border. The placeholder text should be styled with `Label-MD` to look like a command line prompt (e.g., "> Search for Martabak...").

### Radar HUD (Special Component)
A floating action button or "Radar" overlay should use a circular shape with a pulse animation. It utilizes the `Secondary` color to ensure it is the most visible element on the screen at all times.
