---
name: Pi Global GCV Alliance
description: Institutional trade-alliance site and car-dealership marketplace, priced in USD and payable in Pi.
colors:
  brand-purple: "#5b21b6"
  brand-purple-light: "#7c3aed"
  brand-gold: "#fbbf24"
  brand-green: "#10b981"
  brand-ink: "#1f2937"
  brand-surface: "#f3f4f6"
  destructive: "#d4183d"
  muted-foreground: "#6b7280"
typography:
  heading:
    fontFamily: "Poppins, Inter, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  card-padding: "1.5rem"
  form-gap: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-purple}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand-purple-light}"
  button-cta:
    backgroundColor: "{colors.brand-gold}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.xl}"
    padding: "8px 20px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.xl}"
---

# Design System: Pi Global GCV Alliance

## Overview

An institutional-commercial hybrid: half trade-alliance NGO site, half
car-dealership storefront, under one visual identity. The purple/gold
pairing carries both halves — purple is authority and trust
(institutional content, primary actions), gold is the singular call to
action (join, buy, confirm). Cards lift on hover across the whole
site; that's the one recurring motion signature, not decoration added
per-page.

This system was extracted from the implemented code (`theme.css` +
observed component patterns across `Shop.tsx`, `Checkout.tsx`,
`Login.tsx`, `Navbar.tsx`), not invented — there was no prior
`DESIGN.md`, but the visual identity was already coherent and
consistently applied. Write new UI to match what's here rather than
introducing parallel patterns.

**Key Characteristics:**
- Purple (`--brand-purple`) is the workhorse — primary buttons, links,
  focus rings, active nav states.
- Gold (`--brand-gold`) is reserved for the single highest-priority
  action on a page (join/register CTAs, "Learn More" in promo panels)
  — never a secondary action.
- Generous rounding (`rounded-xl`/`rounded-2xl`) everywhere; nothing
  sharp-cornered except pills (`rounded-full`), which are always
  fully round.
- Cards lift on hover (`hover:-translate-y-0.5` to `-1`, paired with a
  shadow increase) as the one standing motion signature.

## Colors

Purple-led with a single gold accent; everything else is neutral gray
scaled off `--brand-ink`.

### Primary
- **Brand Purple** (`#5b21b6`): primary buttons, active nav links,
  focus rings (`ring-brand-purple/25`), headings that need emphasis,
  price/Pi-conversion text.
- **Brand Purple Light** (`#7c3aed`): hover state for brand-purple
  buttons and gradients (`from-brand-purple to-brand-purple-light`).

### Secondary
- **Brand Gold** (`#fbbf24`): the one color reserved for the single
  highest-priority CTA on a page — never used for more than one
  element at a time.

### Tertiary
- **Brand Green** (`#10b981`): success/in-stock/confirmed states only
  (order confirmation checkmark, "In Stock" label).

### Neutral
- **Brand Ink** (`#1f2937`): body text, headings, foreground on gold.
- **Brand Surface** (`#f3f4f6`): muted backgrounds, secondary
  buttons, promo-panel-adjacent fill.
- **Muted Foreground** (`#6b7280`): secondary/de-emphasized text
  (timestamps, helper copy, placeholder-adjacent labels).
- **Border** (`rgba(31, 41, 55, 0.1)`): all card/input borders — a
  faint tint of ink, not pure gray.
- **Destructive** (`#d4183d`): reserved for errors and destructive
  actions (delete confirmations) — introduced by Day 4's admin CRUD,
  use consistently rather than reaching for ad hoc reds.

### Named Rules
**The One Gold Rule.** Brand gold appears on exactly one element per
screen — the single action the page wants most. A page with two gold
buttons has picked two priorities, which is the same as picking none.

## Typography

**Heading Font:** Poppins (with Inter, system-ui fallback)
**Body Font:** System UI stack (no custom body font loaded)

**Character:** Headings are a distinct, slightly rounded geometric
sans (Poppins) at 600 weight; body text uses the system stack for
performance and legibility. The pairing reads as confident-but-plain —
personality lives in color and card treatment, not in typeface choice.

### Hierarchy
- **h1** (600, `text-2xl` base / scales up to `text-4xl`–`5xl` on hero
  sections, 1.5 line-height): page titles, hero headlines.
- **h2** (600, `text-xl` base): section headings.
- **h3** (600, `text-lg` base): card/subsection headings.
- **h4** (600, `text-base`): minor headings.
- **Label** (500 weight, `text-base`): form labels, small UI text —
  always medium weight, never bold, to stay quieter than headings.
- **Body** (400 weight, `text-base`, `--muted-foreground` for
  secondary copy): paragraph text; `.prose`/`.prose-lg` for long-form
  article/description content (max-width `65ch`).

## Layout

Container pattern: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for full
pages, `max-w-4xl`/`max-w-md` for narrower content (article body,
auth forms). Section vertical rhythm is `py-10`–`py-16`. Grids use
Tailwind's responsive column classes directly
(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/4`), no custom grid
system. Sidebars (Shop filter panel) use `lg:sticky lg:top-20
lg:self-start`.

## Elevation & Depth

Flat at rest, lifted on interaction. Cards carry `border border-border`
at rest (no shadow) and gain `shadow-xl` plus a `-translate-y-0.5` to
`-1` lift on hover. Buttons use a tinted shadow matching their own
color (`shadow-lg shadow-brand-purple/20`) rather than a neutral
drop-shadow — the shadow color always echoes the element's own hue.

### Named Rules
**The Tinted Shadow Rule.** A shadow's color always echoes the
element casting it (`shadow-brand-purple/20` under a purple button,
`shadow-green-500/30` under a green success icon) — never a flat
neutral `shadow-black/10` on a colored element.

## Shapes

Generous, consistent rounding: `rounded-xl` (14px) is the default for
buttons, inputs, and small cards; `rounded-2xl` for larger content
cards and panels; `rounded-full` exclusively for pills (category
filters, status badges, avatars). Nothing in the system uses a sharp
(0px) or barely-rounded (2-4px) corner — that scale isn't part of this
system's vocabulary.

## Components

### Buttons
- **Shape:** `rounded-xl` (14px), border-radius consistent across all
  variants.
- **Primary:** `bg-brand-purple text-white`, `px-6 py-3.5` (larger
  CTAs) or `px-4 py-2` (compact/nav), `shadow-lg shadow-brand-purple/20`.
- **CTA/Gold:** `bg-brand-gold text-brand-ink font-bold` — reserved
  per the One Gold Rule.
- **Hover/Focus:** primary hovers to `brand-purple-light` and lifts
  `-translate-y-0.5`; focus uses `ring-2 ring-brand-purple/25`.
- **Secondary/Ghost:** `border border-border` with `hover:bg-accent`,
  no fill at rest.
- **Disabled:** `disabled:opacity-50` to `60`,
  `disabled:cursor-not-allowed`, no hover transform.

### Cards / Containers
- **Corner Style:** `rounded-2xl` for content cards, `rounded-xl` for
  smaller elements.
- **Background:** `bg-card` (white / `--card` token).
- **Shadow Strategy:** flat at rest, `hover:shadow-xl` +
  `hover:-translate-y-1` on interactive cards (product/article cards);
  static cards (forms, summaries) skip the hover lift entirely.
- **Border:** `border border-border` always present, even alongside a
  hover shadow.
- **Internal Padding:** `p-4`–`p-6` for cards, `p-6 md:p-8` for larger
  form panels.

### Inputs / Fields
- **Style:** `rounded-xl border border-border bg-background`,
  `px-4 py-3`.
- **Focus:** `ring-2 ring-brand-purple/25` + `border-brand-purple`,
  applied together, never border-only.
- **Error:** not yet established in the codebase — Day 4's admin
  forms are the first to need it; follow the destructive color
  (`#d4183d`) and match the existing focus-ring pattern
  (`ring-2 ring-destructive/25 border-destructive`) rather than
  inventing a new treatment.

### Navigation
- Sticky top nav (`sticky top-0 z-50`), background shifts to
  `bg-background/95 backdrop-blur-md` + shadow once scrolled past 8px.
  Active link: `text-brand-purple bg-brand-purple/10 rounded-lg`.
  Inactive: `text-foreground/70 hover:text-foreground hover:bg-accent`.

### Pills / Badges
- **Style:** `rounded-full`, small horizontal padding
  (`px-2.5 py-1` typical), `bg-brand-purple/10 text-brand-purple` for
  category tags, `bg-accent text-foreground` for neutral/count badges.

## Do's and Don'ts

### Do:
- **Do** keep brand gold to exactly one element per screen (The One
  Gold Rule).
- **Do** match a shadow's tint to the color of the element it sits
  under (The Tinted Shadow Rule).
- **Do** use `rounded-xl`/`rounded-2xl` for every new card, button,
  and input — this system has no sharp-corner variant.
- **Do** pair every focus state with both a ring and a border-color
  change, not one or the other.

### Don't:
- **Don't** introduce a second accent color alongside purple/gold —
  green and destructive-red are reserved for their specific
  semantic roles (success, danger), not general decoration.
- **Don't** add a shadow-only hover state without the accompanying
  `-translate-y` lift, or a lift without a shadow — they travel
  together everywhere in the codebase.
- **Don't** use bold weight for labels/small UI text; this system
  reserves bold for headings and uses medium (500) for labels.
