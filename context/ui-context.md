# UI Context

## Brand

**Pi Global GCV Alliance** — purple/gold identity, adopted from the
approved design mockup (2026-08-02). Replaces the earlier "Africa GCV"
blue/navy identity previously implemented in this repo.

## Theme

Tailwind v4, using the `@tailwindcss/vite` plugin — there is no
`tailwind.config.js`. Theme tokens are defined as CSS custom
properties in `front-end/src/styles/theme.css` and exposed to Tailwind via v4's
`@theme` directive. Components must reference these tokens through
their Tailwind utility names — no raw hex values, no default Tailwind
palette classes (e.g. no `zinc-*`, `slate-*`) unless a token doesn't
yet exist for that use case (in which case, add the token to
`theme.css` first, don't hardcode around it).

Brand tokens (new, additive — defined in `:root` and mapped in
`@theme inline`):

| Role              | CSS Variable            | Value     | Tailwind utility               |
| ----------------- | ------------------------ | --------- | -------------------------------- |
| Primary purple    | `--brand-purple`         | `#5b21b6` | `bg-brand-purple` / `text-brand-purple` |
| Secondary purple  | `--brand-purple-light`   | `#7c3aed` | `bg-brand-purple-light`          |
| Gold accent       | `--brand-gold`           | `#fbbf24` | `bg-brand-gold` / `text-brand-gold` |
| Success green     | `--brand-green`          | `#10b981` | `bg-brand-green`                 |
| WhatsApp identity | `--brand-whatsapp`       | `#25d366` | `bg-brand-whatsapp` / `text-brand-whatsapp` |
| Dark ink          | `--brand-ink`            | `#1f2937` | `text-brand-ink`                 |
| Light surface     | `--brand-surface`        | `#f3f4f6` | `bg-brand-surface`               |

shadcn-compatible tokens (mapped onto the brand palette so
`components/ui/*` inherit the brand without being edited directly):

| Role             | CSS Variable        | Value                              |
| ----------------- | -------------------- | ------------------------------------ |
| Page background   | `--background`       | `#ffffff`                           |
| Surface           | `--card`             | `#ffffff`                           |
| Elevated surface  | `--secondary`, `--muted`, `--accent` | `var(--brand-surface)` (`#f3f4f6`) |
| Default border    | `--border`           | `rgba(31, 41, 55, 0.1)`             |
| Primary text      | `--foreground`, `--card-foreground` | `var(--brand-ink)` (`#1f2937`) |
| Secondary text    | `--secondary-foreground` | `var(--brand-ink)`              |
| Muted text        | `--muted-foreground` | `#6b7280`                           |
| Brand / accent    | `--primary`          | `var(--brand-purple)` (`#5b21b6`)   |
| Ring / focus      | `--ring`             | `var(--brand-purple-light)`         |
| Error             | `--destructive`      | `#d4183d`                           |
| Success           | n/a (use `bg-brand-green` directly) | `#10b981`             |
| Warning / gold CTA | n/a (use `bg-brand-gold` directly) | `#fbbf24`             |

Use `bg-primary` / `text-primary` for purple brand elements going
through shadcn components, and `bg-brand-gold` / `bg-brand-green`
directly for gold CTAs and success states (no shadcn slot exists for
those two).

## Typography

- **Inter** — body/UI font, loaded via `@import` in `front-end/src/styles/fonts.css`
  (Google Fonts). Exposed as the default `font-sans` (unchanged from
  before).
- **Poppins** (weights 500/600/700/800) — heading font, added in
  `front-end/src/styles/fonts.css`, exposed as `--font-heading` in `theme.css`
  and applied to `h1`–`h4` via `@layer base`. Use the `font-heading`
  Tailwind utility for any other element that should read as a
  heading (e.g. a `<div>` styled as a section title).

## Border Radius

Existing scale in `theme.css` is kept: `--radius: 0.625rem` (10px)
base, with `--radius-sm/md/lg/xl` derived from it. This reads close
enough to the mockup's ~12–16px card radius — no new scale introduced.

## Layout Patterns

- **Hero sections**: full-width gradient (`brand-purple` → `brand-purple-light`),
  white text, gold primary CTA + white/outline secondary CTA.
- **Marketplace grid** (`GCV Market` / `Shop.tsx`): left sidebar category
  list + top search/sort bar driving a single card grid, replacing the
  earlier top-tab-bar pattern.
- **Cards**: white surface, `border-border`, rounded via the existing
  radius scale, hover lift (`hover:-translate-y-0.5` + shadow) —
  unchanged pattern from before, just recolored.
- **Cart summary**: sticky right-hand panel with per-item stepper rows,
  subtotal, dual USD/π display, gold primary action button.

## Component Library

- shadcn-style Radix wrappers live in `front-end/src/app/components/ui/` and are
  available but **not currently used** by page-level code — pages are
  built with plain HTML + Tailwind classes today.
- Do not modify files in `components/ui/` directly (see
  `code-standards.md` — Protected Foundation Components). If a
  component needs project-specific behavior, wrap or compose it from
  an app-level component instead.
- If/when a decision is made to adopt `components/ui/` in page code,
  record that decision here and treat the migration as its own
  tracked unit of work, not something folded into unrelated feature
  work.

## Icons

`lucide-react` (confirmed in `package.json`) — used throughout via
named imports, e.g. `import { ShoppingCart } from 'lucide-react'`.

## Multi-language / i18n

Static UI and editorial copy use `i18next` and `react-i18next`, configured
in `front-end/src/app/i18n/index.ts`. English, French, Kinyarwanda, and
Swahili resources live under `front-end/src/app/i18n/locales/`; keep new
keys aligned across all four languages. Database-backed products and
news remain in their source language. Kinyarwanda and Swahili copy is a
first-pass translation pending native-speaker review.

## Leadership profiles

The homepage spotlight provides a short introduction and links to the
full About profile using a named anchor with `scroll-mt-28`, allowing
for the sticky navigation. Use paragraphs for supplied biography text,
not blockquotes unless the text is an actual attributed quotation.

Profile sections reuse `bg-card`, `border border-border`, `rounded-2xl`,
`p-6 md:p-8`, and `text-muted-foreground leading-relaxed`. A background
panel uses `bg-brand-surface`; values use `bg-brand-purple/10
text-brand-purple rounded-full`. Static biography panels have no hover
lift. Keep GCV leadership, Pi community participation, and business
roles in distinct, labeled sections.
