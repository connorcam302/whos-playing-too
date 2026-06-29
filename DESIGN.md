---
name: Whos Playing
description: A dense Dota 2 match and player statistics dashboard.
colors:
  background-dark: "#1a1d23"
  foreground-dark: "#e5e5e5"
  card-dark: "#242830"
  popover-dark: "#2f3436"
  muted-dark: "#444444"
  muted-foreground-dark: "#a3a3a3"
  background-light: "#f9f9fa"
  foreground-light: "#333333"
  card-light: "#ffffff"
  primary-green: "#34a85a"
  secondary-steel: "#4682b4"
  accent-cornflower: "#6495ed"
  accent-cyan: "#66d9ef"
  destructive-red: "#ef4444"
  impact-purple: "#9333ea"
  backdrop-deep: "#031018"
  chart-green: "#34a85a"
  chart-steel: "#4682b4"
  chart-cornflower: "#6495ed"
  chart-cyan: "#66d9ef"
  chart-forest: "#1a9641"
typography:
  headline:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.025em"
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  xl: "calc(0.5rem + 4px)"
spacing:
  unit: "0.25rem"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary-green}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "rgba(52, 168, 90, 0.9)"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.accent-cornflower}"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  panel:
    backgroundColor: "{colors.card-dark}"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.lg}"
    padding: "16px"
  data-chip:
    backgroundColor: "#27272a"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  rating-chip-s:
    backgroundColor: "rgba(234, 179, 8, 0.3)"
    textColor: "#eab308"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  rating-chip-a:
    backgroundColor: "rgba(34, 197, 94, 0.3)"
    textColor: "#22c55e"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  rating-chip-b:
    backgroundColor: "rgba(59, 130, 246, 0.3)"
    textColor: "#3b82f6"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  rating-chip-c:
    backgroundColor: "rgba(147, 51, 234, 0.3)"
    textColor: "#9333ea"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  rating-chip-d:
    backgroundColor: "rgba(249, 115, 22, 0.3)"
    textColor: "#f97316"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  rating-chip-f:
    backgroundColor: "rgba(239, 68, 68, 0.3)"
    textColor: "#ef4444"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  nav-active:
    backgroundColor: "#0ea5e9"
    textColor: "#082f49"
    rounded: "9999px"
    padding: "4px 0"
  match-win:
    backgroundColor: "rgba(20, 83, 45, 0.8)"
    textColor: "{colors.foreground-dark}"
    rounded: "0"
    padding: "0"
  match-loss:
    backgroundColor: "rgba(127, 29, 29, 0.8)"
    textColor: "{colors.foreground-dark}"
    rounded: "0"
    padding: "0"
---

# Design System: Whos Playing

## 1. Overview

**Creative North Star: "The Match Room"**

Whos Playing should feel like a compact analysis room for a Dota group: dark, information-rich, and built for repeat visits. The interface trusts the user to understand dense match data while making the next useful action obvious. It supports both light and dark modes via CSS custom properties, but the dark palette is the primary experience and the one this system is tuned for.

The design is a product UI, so it favors familiar controls, sortable data tables, compact filters, clear tabs, and restrained accent color. Visual energy comes from real Dota assets: role icons, win/loss color, hero images, impact rating chips, and data variation rather than decorative backgrounds. The shadcn/ui component library provides the structural primitives (Button, Card, Select, Tabs, Table, HoverCard) on top of bits-ui headless components, while custom components (MatchModal, RatingChip, MultiSelect, SearchBox) carry the product-specific vocabulary.

**Key Characteristics:**
- Dense dashboards with calm spacing.
- Dark neutral surfaces with restrained green primary and sky-blue navigation accents.
- Tables, filters, and chips as primary interface vocabulary.
- A six-tier impact rating system (S through F) with grade-specific color coding.
- Meaningful imagery from heroes, roles, and match context.
- Local interactions that preserve user momentum across tabs, filters, and modals.

## 2. Colors: The Match Room Palette

The palette is restrained: dark zinc surfaces for structure, green primary for app identity, and semantic color reserved for meaning. The system uses CSS custom properties (`--background`, `--card`, `--primary`, etc.) mapped through Tailwind's `@theme` layer, with separate `:root` and `.dark` declarations for light/dark mode switching.

### Primary
- **Match Green** (#34a85a): The app's identity color. Primary buttons, rings, sidebar accents, and the chart-1 slot. Consistent across light and dark modes.

### Secondary
- **Steel Blue** (#4682b4): Dark-mode secondary color. Chart-2 slot, secondary button variant. In light mode, this role shifts to Cornflower (#6495ed).
- **Cornflower** (#6495ed): Dark-mode accent and chart-3 slot. Doubles as the light-mode secondary. Used for sidebar accent highlights and link emphasis.
- **Cyan Accent** (#66d9ef): Tertiary accent for chart variety and light-mode sidebar highlights. Rarely used as a surface color.

### Tertiary
- **Impact Purple** (#9333ea): Performance emphasis inside RatingChip (C-grade) and data visualizations. Hardcoded in the Tailwind config outside the CSS variable system. Use only for impact-related contexts.

### Neutral
- **Dark Background** (#1a1d23): App canvas in dark mode. A cool blue-black, not pure black.
- **Dark Card** (#242830): Standard card and panel surface. Slightly warmer than the background.
- **Dark Popover** (#2f3436): Dropdown and popover surfaces. Slightly green-shifted.
- **Zinc Surfaces** (#18181b / #27272a / #3f3f46): Dense stat cells, rows, chips, and nested utility surfaces. Used directly as Tailwind `zinc-950`, `zinc-800`, `zinc-700` rather than through CSS variables.
- **Backdrop Deep** (#031018): Full-screen overlay background for the MatchModal. Near-black with a blue cast.
- **Dark Foreground** (#e5e5e5): Primary text on dark backgrounds.
- **Muted Foreground** (#a3a3a3): Secondary labels, descriptions, and low-emphasis values.
- **Border Muted** (#444444): Borders, dividers, and input strokes in dark mode. Also serves as the `--muted` surface token.
- **Light Background** (#f9f9fa): App canvas in light mode. Off-white with a cool tint.
- **Light Foreground** (#333333): Primary text on light backgrounds.

### Semantic
- **Win Green** (green-500 / #22c55e): Victory indicators, win-rate bars, positive deltas.
- **Loss Red** (red-500 / #ef4444): Defeat indicators, loss bars, destructive actions.
- **Chart Forest** (#1a9641): Chart-5 slot. Deeper green for differentiation from Match Green.

### Named Rules

**The Result Color Rule.** Green and red are strictly for wins, losses, success, failure, and combined result bars. Never use them as generic decoration or status indicators unrelated to match outcomes.

**The Sky Action Rule.** Sky blue (#0ea5e9) is reserved for active navigation, active filter toggles, compact mode switches, pagination buttons, and clear/reset actions that directly change the analysis surface. It does not appear in the CSS variable system; it lives as direct Tailwind classes. Keep it rare so active controls remain easy to find. Tab selection inside dense product pages should use the darker zinc selected surface instead of sky.

**The Grade Color Rule.** Each impact grade (S through F) owns a single hue at 30% opacity background with full-saturation text: yellow for S, green for A, blue for B, purple for C, orange for D, red for F. These are the only sanctioned uses of those mid-saturation tones.

## 3. Typography

**Body Font:** Nunito Sans, sans-serif. The workhorse. All UI text, table cells, labels, and controls.
**Display Font:** Poppins, sans-serif. Used for the `font-display` utility: navigation labels, RatingChip text, and the logo wordmark. Compact and geometric.
**Dota Font:** Cantarell, sans-serif. A narrow humanist sans reserved for Dota-specific contexts where a tighter character width helps dense stat columns.
**Mono Font:** JetBrains Mono, monospace. Declared as `--font-mono` but rarely surfaced. Use for match IDs or code if needed.

**Character:** The typography is conversational but precise. Headings are modest, table text is compact, and labels are uppercase only when they help scanning inside dense panels. Nunito Sans provides warmth without sacrificing data density.

### Hierarchy
- **Display** (Poppins, 600, 1.125rem, 1.25): Navigation links, RatingChip labels, logo text. Not used for page headings.
- **Headline** (Nunito Sans, 600, 1.5rem, 1.25): Page titles and major dashboard headings.
- **Title** (Nunito Sans, 600, 1rem, 1.35): Card titles, table group titles, modal headings.
- **Body** (Nunito Sans, 400, 0.875rem, 1.5): Main UI copy, table cell values, descriptions. Cap at 65ch for prose blocks.
- **Label** (Nunito Sans, 500, 0.75rem, 1.2, 0.025em tracking): Filter labels, stat labels, compact metadata. Uppercase tracking applied via `text-xs font-medium uppercase tracking-wide`.

### Named Rules

**The Data Scale Rule.** Avoid hero-scale typography inside product panels. Metrics should be large enough to scan, not so large that they dominate the workflow. The largest in-panel number should rarely exceed 1.5rem.

**The Poppins Boundary Rule.** Poppins is display-only. Never use it for body text, table cells, or form labels. If something reads like data, it uses Nunito Sans.

## 4. Elevation

The system is mostly flat and layered through tonal steps and borders. Shadows exist in the token set (seven levels from `--shadow-2xs` through `--shadow-2xl`) but the dark-mode app relies on surface color progression (`#1a1d23` > `#242830` > `#2f3436`) and thin `border-zinc-800` lines rather than box-shadow.

### Shadow Vocabulary
- **Modal Shadow** (`shadow-2xl shadow-black/60`): The MatchModal combines the heaviest shadow token with a dark tint. Paired with an 8px backdrop blur and rgba overlay.
- **Dropdown Shadow** (`shadow-xl` or `shadow-md`): Select dropdowns, hover cards, and popovers use moderate shadows to separate from the page.
- **Card Shadow** (`shadow-sm`): shadcn/ui Card.Root applies `shadow-sm` by default, but in dark mode this is nearly invisible. The actual separation comes from the `border` + surface color step.

### Named Rules

**The Flat By Default Rule.** Surfaces are flat at rest. Shadow appears only when something floats above the page: modals, popovers, dropdowns. If you are reaching for a shadow on a card, use a border instead.

## 5. Components

### Buttons
- **Shape:** Compact rounded rectangle (rounded-md, roughly 6px). Height 40px for standard, 36px for small, 44px for large, 40px square for icon-only.
- **Primary:** Green background (`bg-primary`), white text, 90% opacity on hover. Used for main CTAs.
- **Secondary:** Steel Blue background (`bg-secondary`), light text, 80% opacity on hover.
- **Ghost:** Transparent background, accent hover (`hover:bg-accent hover:text-accent-foreground`). Used heavily for table sort headers, icon buttons, and local actions.
- **Destructive:** Red background for dangerous actions.
- **Link:** Underline on hover, primary color text. No background.
- **Hover / Focus:** All variants use `transition-colors` and `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. The ring color is Match Green.

### Rating Chips
The RatingChip is the product's signature component. A compact grade indicator with hover-card detail.
- **Shape:** Rounded-md, 32px wide on mobile expanding to 48px on desktop.
- **Color System:** Each grade (S, A, B, C, D, F) gets a background at 30% alpha and full-saturation text of the same hue. S++ adds a pulse animation and ping ring. F- replaces the grade with a bouncing poo emoji.
- **Hover:** Expands a HoverCard with match performance detail, 256px wide, popover surface.
- **Font:** Poppins (font-display), bold.

### Chips / Data Chips
- **Style:** Zinc-900 background, compact padding (6px 10px), rounded-md. Tabular numbers when showing stats.
- **State:** Selected filter chips use action sky or a clear active background. Data chips stay neutral unless they encode result state (win/loss outcome chips use green/red at 20% alpha with colored text and 2px colored border).

### Cards / Containers
- **Corner Style:** Rounded-lg (0.5rem) for most panels via shadcn/ui Card.Root.
- **Background:** `bg-card` (resolves to #242830 dark, #ffffff light).
- **Shadow Strategy:** Flat by default. `shadow-sm` is applied but invisible in dark mode; `border` does the work.
- **Border:** `border-zinc-800` for panels, `border-zinc-900` for dense row separators.
- **Internal Padding:** Card.Header uses 24px (p-6) with no bottom padding; Card.Content often overridden to 8px (p-2) or 0 for full-bleed tables. 12px for dense toolbars, 16px for card content, 24px only for empty states.

### Inputs / Fields
- **Style:** Dark zinc background (`bg-[#09090b]` for custom inputs, `bg-background` for shadcn), muted border (`border-zinc-600` or `border-input`), compact 40px height.
- **Focus:** Border shifts toward sky blue (`focus:border-zinc-500`) or zinc-400 on custom inputs. shadcn inputs use `focus-visible:ring-ring`.
- **MultiSelect:** Custom dropdown with search, `bg-[#09090b]` surface, `border-zinc-600`, checkbox indicators with `border-blue-500 bg-blue-500` active state.
- **SearchBox:** Custom combobox with rounded-lg, grouped results, selected item highlight at `bg-zinc-600`.
- **Error / Disabled:** Disabled controls reduce opacity and keep layout stable. Error surfaces use `border-red-900/60 bg-red-950/30`.

### Navigation
- **Desktop:** Horizontal link bar with `gap-8`. Active route gets `border-b-2 border-b-sky-500` underline plus `bg-gradient-to-t from-sky-950` glow. Inactive links fade to zinc-400 on hover.
- **Mobile:** Condensed bar with hamburger flyout. Active route uses a full sky-500 pill (`rounded-full bg-sky-500`) with dark text (`text-sky-950`). Flyout uses a `fly` transition from off-screen with a 50% black backdrop overlay.
- **Tabs:** shadcn/ui Tabs with `bg-card` list surface, rounded-lg container, and a darker zinc active trigger (`data-[state=active]:bg-zinc-900`). Used for profile page sections (Home, Stats, Matches, Records, Teammates). Save sky for action controls inside the tab content.

### Tables
- **Engine:** TanStack Table (`@tanstack/table-core`) via `createSvelteTable` for sortable, filterable datasets. shadcn/ui Table components for markup.
- **Row Hover:** `hover:bg-zinc-700/20` or `hover:bg-zinc-900/70`.
- **Headers:** Ghost button sort triggers with `text-xs font-medium text-zinc-400`, arrow icons for sort direction.
- **Numeric Cells:** `text-right tabular-nums` alignment. Compact `px-2.5` cell padding.
- **Win/Loss Bar:** A flex pair of `h-2 rounded-full` bars (green-500 wins, red-500 losses) inside a `bg-zinc-900` track.
- **Wrapper:** `rounded-md border border-zinc-800` with `overflow-x-auto` for horizontal scroll on narrow viewports.

### Match Modal
The primary overlay in the app. Custom-built, not shadcn Dialog.
- **Backdrop:** Fixed overlay with `rgba(3, 3, 4, 0.78)` background and `backdrop-filter: blur(8px)`.
- **Panel:** `w-[min(96vw, 1180px)]`, `max-h-[88vh]`, `rounded-md border border-zinc-800 bg-zinc-950`, `shadow-2xl shadow-black/60`.
- **Header:** Flex row with close button (`hover:bg-zinc-900 hover:text-zinc-100`), separated by `border-b border-zinc-800`.
- **Transition:** Svelte `fade` with 200ms duration.

### Match Result Rows
- **Win Row:** `bg-gradient-to-r from-green-950/80` with `hover:bg-green-950/50`.
- **Loss Row:** `bg-gradient-to-r from-red-950/80` with `hover:bg-red-950/50`.
- **Outcome Chip:** Rounded-lg with 20% alpha background, colored text, and 2px colored border. Victory green, Defeat red, Versus purple.

## 6. Do's and Don'ts

### Do:
- **Do** use CSS custom properties (`--background`, `--card`, `--primary`) for all semantic colors. Both light and dark values resolve automatically.
- **Do** keep filters compact and consistent across matches, records, stats, and profile pages. Filters are part of the analysis.
- **Do** use hero images and role icons where they reduce text. Dota context should be visual.
- **Do** keep win/loss bars hoverable and numerically interpretable. Color supports meaning; text and numbers carry it.
- **Do** preserve tab, filter, and modal context when users navigate locally. Tab changes and row clicks should feel local.
- **Do** prefer sortable TanStack data tables for comparable datasets. Tables beat cards for data comparison.
- **Do** use the six-tier rating chip system (S/A/B/C/D/F) consistently for impact. Each grade owns its color.
- **Do** use `tabular-nums` for numeric table columns so digits align vertically.

### Don't:
- **Don't** turn stat groups into oversized repeated cards when a banner or table would scan better. Dense can still be calm.
- **Don't** add decorative gradients, glass panels, or generic hero sections to product screens. This is not a SaaS landing page.
- **Don't** use novelty gamer UI, heavy fantasy ornament, or noisy neon treatments. The product is sharp and practical, not theatrical.
- **Don't** hide essential meaning behind color alone. Text and numeric labels must carry the result independently.
- **Don't** use modal dialogs for simple selection when an inline select or popover is enough. Exhaust inline alternatives first.
- **Don't** let charts replace tables when exact comparison matters. Charts support patterns; tables support precision.
- **Don't** spread green or red outside win/loss/success/failure contexts. The Result Color Rule is absolute.
- **Don't** use Poppins for body text, table cells, or form labels. It is display-only.
- **Don't** add shadows to cards in dark mode. Use border + surface color step instead.
- **Don't** use `#000000` or `#ffffff` as raw values. The darkest surface is #1a1d23; the lightest text is #e5e5e5.
