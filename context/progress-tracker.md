# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Frontend-only prototype exists. No backend, no API, no database, no
  real auth. All data is mocked in `src/app/data/mockData.ts`.
- Rebrand/redesign pass (2026-08-02) completed: site rebranded from
  "Africa GCV" to **Pi Global GCV Alliance**, matching an approved
  design mockup (purple/gold identity, marketplace-first narrative).
  See "Completed" below for what shipped.

## Current Goal

- Merchant Dashboard + Admin Dashboard (deferred from the rebrand pass
  — see "Next Up"). Before starting: resolve the auth/role
  `[DECISION NEEDED]` in `architecture-context.md`.

## Completed

- Frontend prototype: public content pages, marketplace UI, cart
  (client-side only via `CartContext.tsx`), styled with Tailwind v4 +
  theme tokens.
- **Rebrand to Pi Global GCV Alliance** (2026-08-02):
  - New brand tokens in `theme.css` (`brand-purple`, `brand-purple-light`,
    `brand-gold`, `brand-green`, `brand-ink`, `brand-surface`), Poppins
    heading font added alongside Inter body font.
  - GCV conversion direction resolved: **1 USD = 314159 π** (was
    backwards before — see `architecture-context.md`). `src/app/lib/pi.ts`
    fixed accordingly.
  - Navbar, Footer, Layout announcement banner rebuilt for the new
    brand and nav structure.
  - Home page rebuilt: new hero, feature strip, featured market grid,
    stats band, founder spotlight, mission/vision — all reworded from
    the old "Pi-mining pioneer movement" narrative to the marketplace/
    trade-alliance narrative that matches `project-overview.md`.
  - GCV Market (`Shop.tsx`) redesigned: sidebar category navigation
    replacing the old top-tab layout, "Pay in Pi" promo card, "Why Pay
    in Pi" section.
  - Product cards, `ProductDetail.tsx`, `Cart.tsx` (redesigned as a
    Cart Summary panel), `Checkout.tsx`, `OrderConfirmation.tsx`
    recolored and copy-fixed. Added optional `merchantName` field to
    the `Product` type in `mockData.ts` (backfilled on all 6 products)
    for the "By {merchant}" byline shown on market cards.
  - `About.tsx` and `Founders.tsx` reworded from the Pi-mining/African-
    pioneer narrative to the alliance/marketplace narrative; `Contact.tsx`
    FAQ content updated to match (dropped the "how do I mine Pi" FAQ).
  - Remaining public pages (Ambassadors, Downloads, EventDetail, Events,
    IndustryAlliance, Merchants, News, NewsDetail, NotFound, Team):
    mechanical recolor pass from old hex brand colors to the new tokens
    — structure/content otherwise unchanged.

## In Progress

- None.

## Next Up

- Merchant Dashboard + Admin Dashboard (shown in the design mockup but
  intentionally out of scope for the rebrand pass — needs the auth/role
  decision resolved first).
- Resolve the backend stack decision (`architecture-context.md` —
  "Backend Decision" section).
- Resolve the remaining Pi currency open questions — the conversion
  *direction* is now resolved, but "does Pi mean real Pi Network
  cryptocurrency or an internal ledger unit" and "is there a real
  payment processor" are still open (`project-overview.md` — "Open
  Product Questions").
- i18n implementation — language selector in the Navbar is currently
  visual-only (EN/FR/RW/SW), no actual translation wiring.
- Consider whether the mock product catalog (currently books/courses/
  merch — a holdover from the old education-focused narrative) should
  be expanded with more physical-goods categories (the design mockup
  shows things like produce, apparel, electronics) — flagged, not
  decided; would need real content, not invented placeholder products.

## Open Questions

- Does "Pi" mean Pi Network's cryptocurrency, or an internal
  points/loyalty unit? This determines whether checkout needs real
  crypto integration or a simulated/internal ledger.
- Who sets and updates the GCV = 314159 rate, and how often does it
  change?
- Is there a real payment processor in scope for the first release, or
  is checkout simulated/manually confirmed initially?
- What backend stack will be used? Not yet decided — see
  `architecture-context.md`.
- What is the realistic launch content volume (founders, ambassadors,
  alliance members, products)? Affects whether admin CRUD tooling is
  a launch requirement or content can be seeded directly.
- Given the known project constraints (short build timeline, fixed
  budget), which features from `project-overview.md`'s "In Scope"
  list are true launch-blockers versus deferrable to a fast-follow —
  this needs an explicit MVP cut, not an assumption that everything
  in scope ships in the first release.

## Architecture Decisions

- None finalized yet beyond the fixed frontend stack (React 18 + TS,
  Vite, Tailwind v4, React Router v7, `CartContext` for cart state).

## Session Notes

- Context folder established by adapting a reference pattern (Ghost
  AI project) to this project's actual stack and product. Several
  UI-context values are placeholders pending real values from
  `theme.css` — do not treat them as real until filled in.
- 2026-08-02: User supplied a design mockup for "Pi Global GCV
  Alliance" and confirmed (via explicit questions, not assumed): (1)
  full rebrand from "Africa GCV", (2) rewrite site copy to the
  marketplace/trade-alliance narrative instead of the old Pi-mining/
  pioneer-movement narrative, (3) scope this pass to the public site
  only — Merchant/Admin dashboards deferred. `ui-context.md` and
  `architecture-context.md` were updated in the same session per the
  "keep docs in sync" workflow rule.
