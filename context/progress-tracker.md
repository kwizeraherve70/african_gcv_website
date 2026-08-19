# Progress Tracker

Update this file whenever the current phase, active feature, or
implementation state changes.

## Current Phase

- Frontend-only prototype exists. No backend, no API, no database, no
  real auth. All data is mocked in `front-end/src/app/data/mockData.ts`.
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

- **Backend integration — audited 2026-08-16, adaptation not started.**
  `backend/` now contains the existing "khm-be" (Kigali Hot Market)
  API — real Express + tsoa + Prisma/PostgreSQL backend, 17 applied
  migrations, Cloudinary already wired. Full audit findings in
  `architecture-context.md` "Backend Integration Plan." Two decisions
  made during the audit:
  - **Auth reversed:** keep the existing JWT (Bearer) + bcrypt system
    instead of migrating to better-auth (see `architecture-context.md`
    "Auth Decision" — better-auth is now superseded).
  - **Nested `.git` flattened:** `backend/.git` was removed so the
    backend's files are tracked as ordinary files in this repo,
    rather than becoming a submodule gitlink.
  4-day adaptation plan (confirmed with user 2026-08-16):
  - **Day 1 — Auth & roles: done 2026-08-16.** `Role` enum renamed
    (`AGENT`→`MERCHANT`, `CLIENT`→`MEMBER`) in both
    `prisma/schema.prisma` and `src/utils/roles.ts`, all code
    references updated (`userService.ts`, `AgentService.ts`,
    `StatisticService.ts`), verified with a clean `tsc --noEmit` and
    full `npm run build`. `expressAuthentication`
    (`src/utils/authentication.ts`) now checks tsoa's `@Security("jwt",
    scopes)` scopes against the user's roles and 403s on mismatch —
    the missing role-check mechanism now exists, but **is not yet
    applied to any controller** (that's Day 2, see below — don't
    assume mutation endpoints are actually gated yet). Guest checkout
    reconfirmed unchanged: `OrderController.createOrder` still has no
    `@Security` guard, `Order`/`CreateOrderDto` still have no `userId`.
    `Product.merchantId` (nullable, FK to `User`) added. Schema changes
    shipped as migration
    `20260816162129_rename_role_enum_add_merchant_ownership`, using
    `ALTER TYPE ... RENAME VALUE` (not Prisma's default drop/recreate
    diff) so existing `AGENT`/`CLIENT` rows on the real, previously-
    deployed database relabel safely instead of failing a cast —
    verified against a local Postgres container (`docker compose -f
    backend/docker-compose.dev.yaml up -d db`) with all 17 pre-existing
    migrations applied first, then this one, then confirmed zero schema
    drift via `prisma migrate diff`. `backend/.env` created locally for
    this (gitignored, dev-only secret) — **not present for other
    contributors**, they'll need their own from `.env.example` plus a
    running Postgres to run migrations. No controller/route was
    modified beyond the role-check mechanism itself — Day 1 scope was
    respected, ownership *enforcement* is still Day 2's job.
  - **Day 2 — Product/catalog + News: done 2026-08-16.**
    `ProductCategory` reconciled to `SEDANS | SUVS | SPORTS_CARS |
    LUXURY` (car dealership confirmed permanent — see Open Questions).
    Migration `20260816170000_car_dealership_product_category` is a
    hard domain swap (not a rename): any existing row on the old
    general-retail enum values will fail the cast and needs
    re-seeding, which is expected since this is a different product
    line than the original khm-be retail catalog. Role checks landed
    on `ProductController`: `@Security("jwt", ["ADMIN", "MERCHANT"])`
    on create/update/delete, plus ownership enforcement in
    `ProductService` (`assertCanMutate` — admins manage any product,
    merchants only their own via `merchantId`; a merchant's `POST`
    always forces `merchantId` to their own id regardless of what they
    send, admins may set it explicitly or leave it unowned). `News`
    built as a **parallel model**, not an extension of `Blog` (see the
    schema.prisma comment on `News` for why — `Blog`'s like-toggle/
    `featured` concepts don't map to News, and News needs
    slug/author/publishedAt/readTime/country that `Blog` lacks either
    way, so extending would've meant more code, not less). New
    `NewsCategory` enum, `NewsController`/`NewsService` following the
    existing tsoa controller→service→Prisma pattern; reads
    (`GET /api/news`, `/api/news/slug/{slug}`, `/api/news/{id}`) are
    public, mutations are `@Security("jwt", ["ADMIN"])`.
    Migration `20260816170500_add_news_model`.
    **Caught and fixed during this pass:** the first draft of both new
    enums used `@map("Sports Cars")`-style mapping on the assumption
    that Prisma Client would expose the mapped display string over the
    API — it doesn't; `@map` only renames the *stored* DB value, the
    JS/TS client always speaks the schema identifier (`SPORTS_CARS`).
    Caught by inspecting the generated `node_modules/.prisma/client/index.d.ts`
    before shipping, not left for Day 3 to discover as a runtime 400.
    Both enums now use plain identifiers, matching every other enum in
    this schema — a frontend-side display-string mapping (`SEDANS` ↔
    `'Sedans'`, etc.) is Day 3's job when the API client is built, not
    faked in the backend. Both migrations were corrected in place
    (schema + `.sql` files) rather than stacked with a third corrective
    migration, since neither had been applied anywhere but this
    session's disposable local Postgres container. Verified via
    `prisma migrate reset --force` (all 20 migrations from scratch,
    zero drift after) plus a clean `tsc --noEmit` and full `npm run
    build`, and by inspecting the generated OpenAPI spec
    (`build/swagger.json`) to confirm the security scopes landed on
    the right routes. Stray tsc output (this repo compiles in-place
    into `src/*.js`, and only `build/` — not `src/**/*.js` — is
    gitignored) was cleaned up after each verification build so it
    doesn't get swept into a future commit of the still-untracked
    `backend/` directory.
  - **Day 3 — Frontend wiring: done 2026-08-17.** Two backend gaps
    surfaced only once real wiring was attempted (exactly the kind of
    thing this pass is for) and were fixed before the frontend work
    proceeded, not worked around:
    - `Product` had no `slug` field at all, even though the frontend
      already routes product detail by slug
      (`front-end/src/app/routes.tsx`). Added `Product.slug` (unique,
      auto-generated from `name` server-side via a new
      `slugify`/`uniqueSlug` helper in `DBHelpers.ts`, stable once
      assigned — renaming a product never changes its slug, so shared
      links don't break). New `GET /api/product/slug/{slug}` route.
      Migration `20260817124500_add_product_slug` backfills any
      existing rows defensively (name-derived slug + id suffix) before
      locking `NOT NULL UNIQUE`, same diligence as the Day 1 role
      rename, even though this project's own dev DB was empty.
    - CORS only allowed `localhost:4173` (Vite preview) and old
      khm-be Vercel domains — the actual dev server on `:5173` was
      blocked. Added `http://localhost:5173`; production frontend
      origin still unknown, noted inline in `index.ts`.
    - Also found and fixed at the same time: `PaymentService.ts` runs
      `PaypackJs.config(...)` at module load, which throws if
      `clientId`/`clientSecret` are unset — crashing the entire server
      on boot, unrelated to whether payment features are used. Payment
      integration is explicitly out of scope (open product question),
      so this wasn't "fixed" by wiring real payment config — it was
      unblocked by setting harmless placeholder values in the local,
      gitignored `.env` so the module doesn't throw. No shared code
      touched.
    Built `front-end/src/app/api/{client,products,news,auth,orders}.ts`
    — `client.ts` is a thin `fetch` wrapper matching the backend's
    `IResponse`/`IPaged` envelope and its raw-token `Authorization`
    header convention (no "Bearer " prefix — `expressAuthentication`
    passes the header straight to `jwt.verify`). `products.ts` and
    `news.ts` adapt the backend's wire shape to the frontend's
    existing `Product`/`NewsArticle` interfaces in `mockData.ts` rather
    than changing every consuming page's types — the mock-to-backend
    transition is a data-source swap, not a UI rewrite, per
    `ai-workflow-rules.md`. Notable adapter detail: the backend stores
    `price` as *pre-discount* and applies `discountPercentage` at
    checkout (`OrderService.calculateTotalForItems`), the opposite of
    the frontend's `price`/`compareAtPrice` pair — resolved once in
    `products.ts`, not per-page.
    Wired: `Shop.tsx`, `ProductDetail.tsx` (products, live by slug);
    `News.tsx` (articles tab only — `announcements`/`pressReleases`
    stay mock-only, no backend model for them), `NewsDetail.tsx`,
    `NewsCountries.tsx`; `Home.tsx`'s featured products/news and its
    live `products.length` stat (the separate hardcoded `STATS` vanity
    array was left alone — always static by design, not a bug).
    Built `AuthContext.tsx` (persists the real JWT + user to
    `localStorage` — this is normal SPA token storage against a real
    backend, not the old superseded plan's fake `localStorage`-only
    auth simulation), `Login.tsx`, `Register.tsx`, routes, and a
    Navbar account menu (login/register when signed out, avatar+name
    dropdown with logout when signed in), replacing the old links that
    both pointed at `/contact`. Wired guest checkout: `Checkout.tsx`
    now calls `POST /api/order` then `POST /api/delivery` for real,
    added a required Province field the delivery contract needs but
    the form never had, and `OrderConfirmation.tsx` shows the real
    backend-generated order number via router state instead of a fake
    client-generated one.
    **Real bug caught and fixed via actual browser testing, not just
    static checks:** `Checkout.tsx`'s empty-cart guard
    (`if (items.length === 0) { navigate('/cart'); return null; }`)
    called `navigate()` directly in the render body — a pre-existing
    anti-pattern (not introduced this pass) that's normally harmless
    but is a real bug under React Router v7, which wraps `navigate()`
    in `startTransition`: clicking "Proceed to Checkout" could render
    `Checkout` against a transient/stale `items` snapshot one tick
    before `CartContext` propagated, bouncing straight back to `/cart`
    even with a non-empty cart. Reproduced reliably via Playwright
    (headless `google-chrome`, no `chromium-cli`/bundled Playwright
    browser available in this sandbox, so driven directly — see below)
    with tight click timing, never reproduced with extra delay between
    steps, confirming the mechanism. Fixed by moving the redirect into
    a debounced `useEffect` (150ms) instead of the render body —
    verified with 3 consecutive full end-to-end runs after the fix,
    all reaching real order confirmation.
    Verification: `npm run build` (no `tsconfig.json`/`typescript`
    dependency exists anywhere in `front-end/` — this project has zero
    static type-checking, esbuild just strips types unchecked, so
    `vite build` was the only static check available); then an actual
    browser run — no `chromium-cli`, and `npx playwright install`
    needs either `--with-deps` (needs `sudo`, unavailable here) or a
    slow/failing download of its bundled browser, so launched
    Playwright pointed at the system's pre-installed
    `/usr/bin/google-chrome` instead. Full golden path exercised for
    real against the live backend: browse Shop (real products from the
    API) → product detail by slug → add to cart → checkout through
    Shipping/Payment/Review → Place Order (real `Order` + `Delivery`
    rows created) → confirmation page with a real order number →
    register a new account → Navbar reflects the logged-in user → News
    page shows a real article from the API. Screenshots confirmed
    correct rendering at each step, not just non-crashing.
  - **Day 4 — Admin dashboard + hardening: done 2026-08-17.**
    Before building, installed the `impeccable` design-linting tool
    (user's request) and ran its `init`/`document` flow: wrote
    `PRODUCT.md` and `DESIGN.md` at the repo root from the existing
    `context/*.md` docs and `theme.css` tokens rather than a fresh
    interview — this project's docs already answered everything the
    interview would ask, so re-asking would have been pure ceremony.
    Both files are now real project artifacts other sessions can read
    (see `architecture-context.md` if either needs a refresh note).
    Built the actual admin UI: `ProtectedRoute` (role-gated route
    guard — reuses the debounced-`useEffect` redirect pattern from the
    Checkout fix, since `<Navigate>`/render-body redirects hit the
    identical React Router transition race), `AdminLayout` (sidebar
    shell), `AdminDashboard` (live product/news counts), and full
    product/news CRUD (`AdminProducts`/`AdminProductForm`,
    `AdminNews`/`AdminNewsForm`) — all gated to `ADMIN` only at
    `/admin/*` (merchant-facing "manage your own listings" UI is
    still the deferred fast-follow noted below, unchanged from the
    original plan). Extended `api/products.ts`/`api/news.ts` with
    create/update/delete against the Day 2 endpoints, working with the
    backend's raw shape directly (not the display-adapted `Product`/
    `NewsArticle` types) since editing needs real fields, not a
    derived sale price. Images are a plain URL field, not a file
    upload — Cloudinary has no real credentials in this dev
    environment (see Day 3's placeholder-`.env` note), so file upload
    isn't exercised; the DTOs already support it if/when real
    credentials exist.
    Sanitized both `dangerouslySetInnerHTML` sites
    (`ProductDetail.tsx`, `NewsDetail.tsx`) plus the two mock-sourced
    ones in `News.tsx` (announcements/press releases) with a shared
    `lib/sanitize.ts` (DOMPurify, tag allowlist matching what the
    admin forms actually support) — this was flagged as a real XSS
    risk once admin CRUD could author that HTML, not before.
    **Payment/Pi gap: explicitly deferred, not resolved** — per
    `ai-workflow-rules.md`, not picking a payment mechanism or Pi's
    real-vs-internal nature unilaterally. Checkout's "payment method"
    step remains display-only (unchanged since Day 3); no
    `PaymentController`/Paypack code was touched. This stays open
    until the product questions in "Open Questions" are answered.
    **Role boundaries tested end to end in the browser, not just
    assumed from the `@Security` decorators:** guest hitting `/admin`
    → redirected to `/login`; a freshly-registered MEMBER hitting
    `/admin` → redirected to `/` (blocked); the ADMIN test account →
    full dashboard access, created/edited/deleted a product and a news
    article, confirmed the created product appeared live on the
    public `/shop`. (MERCHANT wasn't given a separate test account —
    `ProtectedRoute`'s check is `roles.includes('ADMIN')`, role-agnostic
    beyond that, so a MERCHANT hits the identical code path already
    proven against MEMBER. Noted rather than asserted as untested.)
    **Real bug caught by the actual browser run, not by `vite build`:**
    the new "Admin Portal" Navbar link used the `LayoutDashboard` icon
    without importing it — a `ReferenceError` at runtime that esbuild's
    unchecked type-stripping can't catch (this project still has no
    `tsconfig.json`/`typescript` dependency at all, see Day 3). Fixed
    before the flow was re-verified.
    `impeccable`'s deterministic detector (`node
    .claude/skills/impeccable/scripts/detect.mjs`) ran automatically
    after every UI file write via its post-edit hook and returned zero
    findings on all new admin code; it also flagged 3 pre-existing
    font-size findings in `Navbar.tsx` unrelated to this session's
    edits (a `text-[15px]` logo wordmark, `text-[10px]` tagline and
    cart-badge numerals) — left standing and disclosed rather than
    fixed, since touching unrelated pre-existing code wasn't this
    task's job. Mobile viewport (390px) checked for both the products
    table and the create-product form: no horizontal overflow, sidebar
    nav collapses to a horizontal pill row correctly.

## Next Up

- ~~Admin Dashboard~~ — done 2026-08-17, see the "In Progress" Day 4
  entry above.
- **Merchant Dashboard — still pending, the fast-follow noted since
  Day 1.** The backend already supports it (merchant ownership +
  role checks landed Day 2, and `ProductController` already accepts
  `MERCHANT` alongside `ADMIN`), and the admin CRUD forms built Day 4
  (`AdminProductForm` etc.) are close to what a merchant's own "My
  Products" view would need — likely more reuse than a from-scratch
  build, scoped to products the logged-in merchant owns
  (`merchantId === user.id`) instead of all products. Not started.
  **Note:** `four-day-plan.md`'s old "Day 1–4" plan for this
  (confirmed 2026-07-31, localStorage-simulated auth, no real backend)
  is superseded — see that file's own status note. Don't resume it
  as-is.
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

- ~~Was the GCV Market catalog intentionally pivoted from
  books/courses/merchandise to a car dealership demo, or was this a
  placeholder/demo swap?~~ — **resolved 2026-08-16:** car dealership
  confirmed as the permanent direction, asked explicitly before Day 2
  backend work depended on the answer. `project-overview.md` updated
  to stop hedging on it. The frontend's mock catalog itself was never
  reverted (it was already car-dealership-shaped since 2026-08-07) —
  this decision just makes that permanent rather than provisional.
- Does "Pi" mean Pi Network's cryptocurrency, or an internal
  points/loyalty unit? This determines whether checkout needs real
  crypto integration or a simulated/internal ledger.
- Who sets and updates the GCV rate, and how often does it change?
  (Value itself, 314159, is unchanged; conversion *direction* has now
  flipped twice.)
- **GCV conversion direction — confirmed current code, not confirmed
  as a product decision (2026-08-15):** `front-end/src/app/lib/pi.ts` currently
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
- 2026-08-16 (later still): user has an existing complete e-commerce
  backend they want to adapt/extend for this project (reusing what
  fits the chosen Express/Postgres/Prisma stack, adding a News
  model/CRUD for the admin dashboard). Before placing it in the repo,
  user asked to restructure the repo into a monorepo: everything that
  was the Vite app moved into a new `front-end/` folder, with
  `context/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitignore`, and
  `.claude/` staying at the repo root (confirmed via question — user
  picked the recommended option over moving everything). Executed via
  `git mv` (history preserved) for tracked files and plain `mv` for
  `node_modules/`/`dist/` (gitignored); verified `.gitignore` patterns
  still match at the new depth and that `npm run build` succeeds from
  inside `front-end/` post-move — no config changes were needed since
  `vite.config.ts`/`index.html`/`package.json` all use paths relative
  to their own location. Also found and fixed a pre-existing gap:
  4 `dist/` files were still tracked in git despite the 2026-08-12
  `.gitignore` addition (that cleanup was incomplete) — untracked them
  with `git rm --cached` rather than moving them into `front-end/`.
  All `src/...` path references across every `context/*.md` file were
  bulk-updated to `front-end/src/...` to match, and a new "Repo
  Layout" section was added at the top of `architecture-context.md`
  documenting the monorepo structure and where the eventual
  `backend/` folder goes (sibling to `front-end/`, not nested in it).
  The existing backend itself has not been placed in the repo yet or
  evaluated for stack compatibility — that's the next step once the
  user provides its location.
- 2026-08-16 (later still): before actually placing/adapting the
  existing backend, user asked to first record the plan in
  `AGENTS.md` and the context docs, so the process is documented
  ahead of the work rather than improvised once the code lands. Fixed
  a stale line in `AGENTS.md` (still said "no server framework yet");
  added "Backend Integration Plan" to `architecture-context.md`
  (placement, audit-before-merging steps, reuse-vs-rebuild per
  subsystem, the net-new News CRUD requirement, incremental
  integration); added "Integrating Pre-Existing External Code" to
  `ai-workflow-rules.md` as a general rule (distinct from the
  greenfield-build scoping rules already there); added an "In
  Progress" entry here. No code changed in this pass — docs only.
- 2026-08-16 (even later still): user placed the existing backend into
  `backend/` and asked for an audit plus a 4-day integration plan.
  Read the actual code (not just file listing) — `package.json`,
  `prisma/schema.prisma`, `src/index.ts`, `src/utils/authentication.ts`,
  `src/controllers/{Product,blog,User,Order}Controller.ts`,
  `src/middlewares/company.middlewares.ts`, `.env.example` — to ground
  findings in what's actually there. Confirmed two decisions with the
  user before finalizing the plan (both matched the recommended
  option): keep the existing JWT/bcrypt auth instead of migrating to
  better-auth (reverses the 2026-08-16 auth decision — see
  `architecture-context.md`), and flatten `backend/`'s nested `.git`
  into this repo instead of setting it up as a submodule (executed:
  `rm -rf backend/.git`). Wrote the full audit (stack match table,
  6 real gaps found by reading the code, what's directly reusable)
  and the day-by-day plan into `architecture-context.md` "Backend
  Integration Plan" and this file's "In Progress" entry. Also added a
  superseded-status note to `four-day-plan.md` so it isn't confused
  with this new, unrelated 4-day plan. No backend code has been
  modified yet — audit and planning only.
- 2026-08-16 (later still): user asked to execute "the four-day plan."
  Two same-named plans existed (the old, explicitly-superseded
  localStorage-auth one in `four-day-plan.md`, and the current backend-
  integration one above) — asked the user which one; confirmed the
  backend-integration plan. Executed Day 1 (Auth & roles): renamed the
  `Role` enum, extended `expressAuthentication` with role-scope
  checking, added `Product.merchantId`, reconfirmed guest checkout —
  see the "In Progress" entry above for full detail. Verified against
  a disposable local Postgres container rather than editing the schema
  blind, and used `ALTER TYPE ... RENAME VALUE` instead of trusting
  Prisma's default migration diff (which would have used a cast that
  breaks on any row still holding the old `AGENT`/`CLIENT` values —
  a real risk given this is a previously-deployed database, not a
  fresh one). Deliberately stopped at Day 1's boundary: did not wire
  the new role-check mechanism into `ProductController` even though it
  would have been easy to do from here, since that's explicitly Day
  2's task in the confirmed plan.
- 2026-08-16 (later still): user asked to execute Day 2 (Product/
  catalog + News). The catalog-pivot question blocked reconciling
  `ProductCategory` — asked the user, confirmed car dealership is the
  permanent direction (not a demo swap to revert). Completed all three
  Day 2 items: `ProductCategory` enum replaced, role checks + ownership
  enforcement wired into `ProductController`, `News` model/CRUD built
  as a parallel model to `Blog`. Caught a real mistake mid-pass before
  it shipped: initially used `@map("Sports Cars")`-style enum mapping
  assuming it would make the API accept the frontend's display strings
  directly — inspecting the generated Prisma Client's `.d.ts` showed
  `@map` only affects the stored DB value, not the wire format, so
  switched both new enums to plain identifiers and corrected the two
  migration files in place (safe since neither had been applied
  anywhere but this session's own disposable local Postgres). See the
  "In Progress" entry above for full technical detail.
