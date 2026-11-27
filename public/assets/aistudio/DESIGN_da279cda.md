---
name: Obsidian Operations
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c4c7c9'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#8e9193'
  outline-variant: '#444749'
  surface-tint: '#c5c6c8'
  primary: '#ffffff'
  on-primary: '#2e3132'
  primary-container: '#e1e2e4'
  on-primary-container: '#626566'
  inverse-primary: '#5c5f60'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffffff'
  on-tertiary: '#472a00'
  tertiary-container: '#ffddb8'
  on-tertiary-container: '#8d5900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e2e4'
  primary-fixed-dim: '#c5c6c8'
  on-primary-fixed: '#191c1e'
  on-primary-fixed-variant: '#444749'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is built for **Fieldnote**, a modern minimalist SaaS workflow and operations dashboard designed for operations leads, engineering managers, and product teams who spend hours triaging tasks, monitoring pipelines, and coordinating cross-functional work. The interface should evoke calm authority, precision, and effortless focus—eliminating visual noise so critical operational signals stand out immediately.

The aesthetic blends **Minimalism** with **Corporate / Modern** discipline: deep obsidian and charcoal surfaces, razor-thin 1px structural borders, and high-contrast off-white typography. Rather than relying on decorative gradients or heavy skeuomorphic depth, visual clarity comes from disciplined tonal layering, crisp geometric type, and restrained semantic accents that communicate status at a glance.

## Colors

The palette is anchored in a high-contrast dark mode designed to reduce eye strain during extended operational sessions while keeping primary actions and status indicators unmistakably clear.

- **Background & Surface Tiers:**
  - **Canvas (`#0B0D10`):** The deepest obsidian layer, used for the main application viewport.
  - **Surface (`#12151A`):** Deep charcoal used for persistent navigation sidebars, top bars, and secondary panels.
  - **Elevated Surface (`#181C23`):** Used for cards, modals, dropdowns, and interactive containers that sit above the base canvas.
- **Borders & Dividers:**
  - **Subtle Border (`#262B36`):** A 1px hairline border used to define structure between surfaces without harsh contrast.
- **Typography & Foreground:**
  - **Primary Text (`#F3F4F6`):** Crisp off-white for headings, primary data values, and active labels.
  - **Secondary Text (`#9CA3AF`):** Muted slate for metadata, timestamps, table headers, and supporting descriptions.
- **Primary Action:**
  - **High-Contrast Light (`#F3F4F6`):** Primary buttons use a crisp off-white surface paired with `#0B0D10` dark text, creating an immediate focal point against the dark canvas.
- **Semantic Status Accents:**
  - **Success / Healthy (`#10B981`):** Emerald green for completed workflows, active systems, and positive trends.
  - **Warning / Pending (`#F59E0B`):** Amber for queued items, approaching SLAs, and cautionary states.
  - **Error / Critical (`#EF4444`):** Coral red for failed runs, blocked tasks, and destructive actions.

## Typography

**Hanken Grotesk** serves as the unified geometric sans-serif across all interface levels, delivering sharp legibility at small operational sizes and confident structure in dashboard headers.

- **Hierarchy & Weight:** Headlines use SemiBold (`600`) with tight negative letter-spacing (`-0.01em` to `-0.02em`) to feel compact and intentional. Body copy stays at Regular (`400`) for effortless scanning, while interactive labels and table headers use Medium (`500`) or SemiBold (`600`) with slight positive tracking.
- **Tabular Alignment:** For metric cards, timestamps, and operational tables, enable `font-variant-numeric: tabular-nums` so numbers align cleanly across rows.
- **Responsive Scaling:** On viewports below `640px`, `headline-lg` steps down to `headline-lg-mobile` (`28px`) to preserve vertical space above the fold.

## Layout & Spacing

The design system uses a **fluid 12-column grid** tailored for dense, scannable operational dashboards. A persistent left sidebar (`240px`–`260px` on desktop, collapsible to an icon rail or drawer) anchors the workspace, while the main content area fluidly expands to fill the remaining viewport with a `1rem` (`16px`) column gutter and `1.5rem` (`24px`) outer canvas margins.

- **Desktop (`>= 1024px`):** Full 12-column grid. Metric summaries typically span 3 or 4 columns; primary workflow tables and activity feeds span 8 or 12 columns.
- **Tablet (`640px` – `1023px`):** Collapses to an 8-column grid. The sidebar becomes a slide-over drawer, and 4-column metric rows reflow into 2x2 grids.
- **Mobile (`< 640px`):** Single-column stack (`4-column` equivalent) with `1rem` outer margins. Tables convert to compact, stacked summary cards.
- **Component Rhythm:** Use `space-xs` (`4px`) for tight icon-to-label gaps, `space-sm` (`8px`) for related form elements, `space-md` (`16px`) for standard card padding and stack gaps, and `space-lg` (`24px`) to `space-xl` (`32px`) to separate major dashboard sections.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **tonal surface layering**, **refined 1px low-contrast borders**, and **subtle ambient shadows**.

- **Tonal Layers:** Depth is primarily communicated by stepping up surface luminance: `#0B0D10` (canvas) → `#12151A` (sidebar/panels) → `#181C23` (elevated cards and popovers).
- **1px Structural Borders:** Every elevated container, card, and input field is framed by a crisp `1px solid #262B36` border. This prevents dark surfaces from bleeding together and gives the interface its precise, architectural feel.
- **Ambient Shadows:** For floating elements (dropdowns, command palettes, modals, and tooltips), pair the `#262B36` border with a soft, diffused dark shadow (`0 8px 24px rgba(0, 0, 0, 0.45)`) to clearly separate them from the underlying workspace.

## Shapes

The design system uses a **Soft (`1`)** roundedness profile, balancing geometric precision with modern approachability.

- **Base Radius (`0.25rem` / `4px`):** Applied to compact elements such as checkboxes, small status badges, and inline code/ID tags.
- **Medium Radius (`0.5rem` / `8px` — `rounded-lg`):** The standard radius for buttons, input fields, dropdowns, and list items.
- **Large Radius (`0.75rem` / `12px` — `rounded-xl`):** Reserved for elevated dashboard cards, modals, and command palette containers.

## Components

- **Buttons:**
  - *Primary:* Solid `#F3F4F6` background with `#0B0D10` text, `0.5rem` radius, `0.5rem 1rem` padding, and `label-lg` typography. Hover state shifts to `#E5E7EB`.
  - *Secondary:* `#181C23` background with `1px solid #262B36` border and `#F3F4F6` text. Hover state lightens the border to `#374151`.
  - *Ghost / Icon:* Transparent background with `#9CA3AF` text/icon; hovers to `#181C23` surface with `#F3F4F6` text.
- **Cards:** `#181C23` background, `1px solid #262B36` border, `0.75rem` (`12px`) border-radius, and `1rem` (`16px`)–`1.5rem` (`24px`) internal padding.
- **Chips & Status Badges:** Compact `0.25rem` (`4px`) or pill-shaped (`9999px`) indicators using low-opacity semantic backgrounds (e.g., `rgba(16, 185, 129, 0.12)` for emerald, `rgba(245, 158, 11, 0.12)` for amber, `rgba(239, 68, 68, 0.12)` for coral red) paired with full-saturation semantic text and a `1px` matching subtle border.
- **Input Fields:** `#0B0D10` or `#12151A` background, `1px solid #262B36` border, `0.5rem` radius, `#F3F4F6` text, and `#9CA3AF` placeholder. Focus state highlights the border in `#F3F4F6` with a subtle `0 0 0 2px rgba(243, 244, 246, 0.15)` ring.
- **Checkboxes & Radio Buttons:** `16px × 16px` controls with `#12151A` fill and `1px solid #262B36` border. Checked state fills with `#F3F4F6` and displays a `#0B0D10` checkmark or inner dot.
- **Lists & Operational Tables:** Rows sit on `#12151A` or `#181C23` separated by `1px solid #262B36` horizontal dividers. Table headers use `label-sm` uppercase `#9CA3AF` text. Row hover states subtly shift to `#1E232C`.
- **Command Palette & Navigation:** A keyboard-first command bar (`Cmd+K`) styled as an elevated `#181C23` modal with a `1px solid #262B36` border and deep ambient shadow, allowing instant navigation across workflows and operational records.