# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Frontend-only prototype exists. No backend, no API, no database, no
  real auth. All data is mocked in `src/app/data/mockData.ts`.
- Rebrand/redesign pass (2026-08-02) completed: site rebranded from
  "Africa GCV" to **Pi Global GCV Alliance** (purple/gold identity,
  marketplace-first narrative).
- Since then, three more commits (2026-08-07 → 2026-08-14) reshaped
  the demo content and nav further — see "Completed" below. Notably,
  the GCV Market catalog was swapped from books/courses/merch to a
  **car dealership demo** (Sedans/SUVs/Sports Cars/Luxury), which is
  a divergence from `project-overview.md`'s documented product scope
  — see "Open Questions."

## Current Goal

- No active implementation in progress. Progress tracker had gone
  stale/was emptied; this update brings it back in sync with the
  actual commit history (2026-08-02 → 2026-08-14).
- Next real feature work is still Merchant Dashboard + Admin
  Dashboard (deferred from the rebrand pass). Auth/role decision is
  now resolved (better-auth, see below) — no longer a blocker for
  starting that work.

## Completed

- Frontend prototype: public content pages, marketplace UI, cart
  (client-side only via `CartContext.tsx`), styled with Tailwind v4 +
  theme tokens.
- **Rebrand to Pi Global GCV Alliance** (2026-08-02) — see prior
  session notes below for full detail. Established brand tokens,
  reworded all public pages to the marketplace/trade-alliance
  narrative, redesigned GCV Market, Cart, Checkout, Product pages.
- **"full demo" pass** (2026-08-07, commit `a810cea6`):
  - GCV Market catalog replaced: `Product.category` changed from
    `'Books' | 'Digital Resources' | 'Merchandise' | 'Courses'` to
    `'Sedans' | 'SUVs' | 'Sports Cars' | 'Luxury'`. All mock products
    are now vehicles (Tesla Model S, Porsche 911, Range Rover Sport,
    Ford Mustang GT, etc.) sold through named "GCV Merchant"
    dealerships, priced directly in π rather than USD-with-conversion.
    `Shop.tsx` simplified accordingly (396 lines touched, mostly
    removing the old category/layout logic).
  - `pi.ts` reworked: `toPi()` now converts USD → π (divides by
    `GCV_USD`) instead of the previous USD → π-count multiply; a
    `GCV_DISCLAIMER` constant was added ("GCV is a community-proposed
    target, not an official Pi Network rate or an exchange-verified
    price") for use anywhere a GCV price is shown. **Note:** this is
    a different conversion direction than what the 2026-08-02 session
    settled on ("1 USD = 314159 π") — re-verify which direction is
    intended before touching pricing code again.
  - News & Media restructured into a country hub: new
    `GCV_AFRICA_COUNTRIES` list (12 countries) and `NewsCountries.tsx`
    page at `/news`; the article list view moved to `/news/all` and
    `/news/country/:country`; `NewsArticle` gained an optional
    `country` field.
  - Standalone `Founders.tsx` page and `/founders` route removed;
    founders content merged into `Team.tsx` under an `id="founders"`
    anchor section instead.
  - `About.tsx`, `Checkout.tsx`, `Team.tsx`, `Footer.tsx`,
    `Navbar.tsx` updated to match (copy and minor structural changes).
- **Nav update** (2026-08-12, commit `a6180eb4`): added direct
  "Founders" (`/team#founders`) and "GCV Alliance" links to the
  Navbar; minor `Team.tsx` tweaks. Also removed previously-committed
  `dist/` build output from git and added it to `.gitignore` (build
  artifacts should no longer be committed going forward).
- **Nav simplification** (2026-08-14, commit `2d778a72`): "Core Team"
  and "Founders" moved out of the "About Us" dropdown into flat
  top-level navbar links. `Navbar.tsx`'s `NAV_GROUPS` is now a flat
  list (`Home`, `About Us`, `Core Team`, `Founders`, `GCV Alliance`,
  `GCV Market`, `News & Media`, `Contact Us`) — the dropdown-group
  rendering code (`DropdownMenu`) is still present but currently
  unused since no `NAV_GROUPS` entry has `children` anymore.

## In Progress

- None.

## Next Up

- Merchant Dashboard + Admin Dashboard (needs the auth/role decision
  resolved first — see `architecture-context.md`). **Note:** the
  `four-day-plan.md` "Day 1–4" build for this was confirmed
  2026-07-31 but never executed — no `AuthContext`, no `localStorage`
  session/role simulation, no i18n library, no `DOMPurify` sanitization
  exist in the repo. That plan is now marked stale in-file; don't
  resume it as-is without re-confirming it's still the intended
  approach (it predates the rebrand and the car-catalog pivot).
- ~~Resolve the backend stack decision~~ — done 2026-08-15: Express.js
  + PostgreSQL/Prisma + Cloudinary (see `architecture-context.md`).
- ~~Resolve the auth strategy decision~~ — done 2026-08-16:
  better-auth + Prisma adapter, cookie-based sessions, single `User`
  model with a `role` enum (see `architecture-context.md`). Hosting
  target is still open.
- Decide whether the car-dealership catalog pivot (2026-08-07) is the
  intended long-term product direction, or a one-off demo swap that
  should be reverted/reconciled with `project-overview.md`'s original
  physical-goods marketplace scope — see "Open Questions."
- Get an explicit decision on the GCV conversion direction — see
  "Open Questions." Current code is confirmed (2026-08-15) but not
  confirmed as intentional.
- i18n implementation — language selector in the Navbar is still
  visual-only (EN/FR/RW/SW), no actual translation wiring.
- `DropdownMenu` component in `Navbar.tsx` is now dead code (no
  `NAV_GROUPS` entry has `children`) — remove it or repurpose it next
  time the nav is touched.
- `README.md` (repo root, not in `context/`) still calls the project
  "Africa GCV Website Prototype" and links the old Figma file — never
  updated for the 2026-08-02 rebrand. Out of scope for this pass
  (context-folder reconciliation only) but worth a one-line fix
  whenever someone's next in that file.

## Open Questions

- **New (2026-08-07):** Was the GCV Market catalog intentionally
  pivoted from books/courses/merchandise to a car dealership demo, or
  was this a placeholder/demo swap that needs to be reverted before
  the next real content pass? `project-overview.md` still documents
  the original physical-goods-marketplace scope — needs reconciling
  either way.
- Does "Pi" mean Pi Network's cryptocurrency, or an internal
  points/loyalty unit? This determines whether checkout needs real
  crypto integration or a simulated/internal ledger.
- Who sets and updates the GCV rate, and how often does it change?
  (Value itself, 314159, is unchanged; conversion *direction* has now
  flipped twice.)
- **GCV conversion direction — confirmed current code, not confirmed
  as a product decision (2026-08-15):** `src/app/lib/pi.ts` currently
  implements `toPi(usd) = usd / GCV_USD`, i.e. **1 π ≈ $314,159 USD**
  (Pi is the large unit — a $89,999 product is ≈0.29 π). This is the
  *opposite* of the "1 USD = 314159 π" direction `architecture-context.md`
  previously documented as "resolved 2026-08-02," which has now been
  corrected in that file to describe the current code accurately
  rather than assert a settled decision. Direction has changed twice
  without an explicit recorded product decision — get one before
  building anything (checkout totals, admin pricing tools, financial
  copy) that assumes either direction is final.
- Is there a real payment processor in scope for the first release, or
  is checkout simulated/manually confirmed initially?
- What is the realistic launch content volume (founders, ambassadors,
  alliance members, products)? Affects whether admin CRUD tooling is
  a launch requirement or content can be seeded directly.
- Given the known project constraints (short build timeline, fixed
  budget), which features from `project-overview.md`'s "In Scope"
  list are true launch-blockers versus deferrable to a fast-follow —
  this needs an explicit MVP cut, not an assumption that everything
  in scope ships in the first release.

## Architecture Decisions

- Frontend stack (fixed): React 18 + TS, Vite, Tailwind v4, React
  Router v7, `CartContext` for cart state.
- **Backend stack (decided 2026-08-15):** Express.js API + PostgreSQL
  via Prisma ORM + Cloudinary for static/uploaded assets. See
  `architecture-context.md` "Backend Decision."
- **Auth (decided 2026-08-16):** better-auth (self-hosted, Prisma
  adapter, cookie-based sessions) with Passport.js +
  `express-session` documented as the fallback if better-auth proves
  too limiting during implementation. Single `User` model, `role`
  enum for member/merchant/admin. See `architecture-context.md`
  "Auth Decision." Hosting target is still open.
- Build output (`dist/`) should not be committed to git — it was
  removed from tracking on 2026-08-12 and added to `.gitignore`.

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
- 2026-08-07 → 2026-08-14: Three commits landed directly (not through
  an assistant session with context-file updates) that changed product
  catalog content, News structure, and nav layout — see "Completed."
  `project-overview.md` and `architecture-context.md` were **not**
  updated alongside these changes, so they're now out of sync with
  the actual product catalog (cars vs. books/courses/merch) and nav
  structure (flat vs. dropdown groups). Flagging per the AGENTS.md
  "keep docs in sync" rule rather than silently rewriting those docs —
  needs an explicit decision on which direction (car catalog vs.
  original scope) is correct before those files are edited.
- 2026-08-15: `progress-tracker.md` had been emptied (all content
  deleted, file left blank) with no corresponding commit — likely an
  accidental edit. Reconstructed from git history (`git log`, `git
  show` on the four commits since the last known-good tracker state)
  rather than from memory, since the tracker itself was the only
  record lost.
- 2026-08-15 (same day, later): user asked to build a `graphify`
  knowledge graph of the repo (code + `context/*.md` + images) and
  reconcile the context docs against it. The graph independently
  rediscovered the same drift flagged above (catalog pivot, conversion
  direction) plus one the manual reconstruction had missed: the
  conversion-direction claim in `architecture-context.md` was stated
  as a resolved fact but was factually wrong against current
  `pi.ts` code. Resolved by editing docs to match code (per explicit
  user instruction — prior sessions had deliberately left this
  unresolved pending a product decision, per the AGENTS.md
  "docs-in-sync" rule; the user's direct request here supersedes that
  caution for this pass):
  - `architecture-context.md`: conversion-direction section rewritten
    to state the current code's actual behavior and mark it
    unconfirmed-as-decision rather than falsely "resolved."
  - `four-day-plan.md`: added a status note — plan was never executed;
    actual work diverged onto the rebrand/catalog pivot instead.
  - `project-overview.md`: added a note grounding the "target"
    marketplace description against the current car-catalog demo.
  - `code-standards.md`: added a known-violation note for remaining
    raw hex values in `Home.tsx`.
  - `ui-context.md` and `ai-workflow-rules.md`: checked against the
    repo, found accurate as-is — no changes needed.
  - `graphify-out/` (graph.json, GRAPH_REPORT.md, graph.html, cache/)
    is build output, like `dist/` — added to `.gitignore` in this
    session rather than committed. Regenerate with `/graphify .`
    rather than expecting it to persist across clones.
- 2026-08-15 (later): user made the backend stack decision explicitly
  — Express.js, PostgreSQL + Prisma, Cloudinary for static assets.
  Updated `architecture-context.md` (Target Stack table, Backend
  Decision section, System Boundaries, Storage Model, Invariants) and
  this file to record it as resolved rather than open. Auth strategy
  and hosting target remain undecided.
- 2026-08-16: user asked for an auth recommendation. Suggested
  better-auth (self-hosted, Prisma adapter, cookie sessions — fits
  the already-chosen Express/Postgres/Prisma stack without adding a
  BaaS dependency) with Passport.js + express-session as the
  documented fallback; user confirmed. Updated
  `architecture-context.md` (Target Stack table, new "Auth Decision"
  section, Auth and Role Model, Invariants) and this file to record
  it as resolved.
- 2026-08-16 (later): user clarified product scope — checkout does
  **not** require registration (guest checkout for any visitor), and
  the Admin Portal specifically includes inventory control (product
  upload/delete) and posting news. This directly contradicted the
  standing "only authenticated members can check out" line in
  `architecture-context.md`'s Auth and Role Model — asked the user
  whether the member role still serves a purpose or should be removed
  entirely; user asked for a recommendation. Recommended keeping an
  optional member role (order history, perks) since the product is
  branded a "membership" platform; user accepted. Updated
  `project-overview.md` (Goals, Core User Flow, Features, Scope,
  Success Criteria) and `architecture-context.md` (Auth and Role
  Model — checkout no longer gated on auth; Storage Model —
  `Order.userId` must be nullable for guest orders) accordingly.
