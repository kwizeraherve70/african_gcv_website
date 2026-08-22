# Architecture Context

## Repo Layout

This is a **monorepo root**, not the frontend app itself.

- `front-end/` — the Vite + React app (everything that used to live at
  repo root: `src/`, `index.html`, `package.json`,
  `package-lock.json`, `vite.config.ts`, `postcss.config.mjs`,
  `default_shadcn_theme.css`, `pnpm-workspace.yaml`, `node_modules/`,
  `dist/`). Run `npm install` / `npm run dev` / `npm run build` from
  inside `front-end/`, not from repo root.
- `backend/` — **not yet created.** Once the Express/Prisma backend
  (see "Backend Decision" below) is added, it goes here as a sibling
  to `front-end/`, not nested inside it.
- `context/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitignore`,
  `.claude/` — stay at the repo root, since they describe the whole
  project (frontend + planned backend), not just the frontend app.
  Claude Code auto-loads root `CLAUDE.md` as project instructions, so
  it must not move into a subfolder.

All path references elsewhere in these context docs (e.g.
`front-end/src/app/data/mockData.ts`) already reflect this layout.

## Backend Integration Plan — audited 2026-08-16, adaptation starting

The existing backend (originally "khm-be" / Kigali Hot Market — a
Rwanda e-commerce + real-estate-agent marketplace) has been placed in
`backend/` and audited against this project's requirements. It is
**not a scaffold — it's a real, migrated, previously-deployed API**
(17 Prisma migrations, CORS locked to a live Vercel frontend, a
running payment-sync cron job). Findings below are grounded in the
actual code, not assumption.

### Stack compatibility — mostly a match

| Piece | Existing backend | Decision | Verdict |
| --- | --- | --- | --- |
| API framework | Express 4 + **tsoa** (decorator-based controllers, auto-generates routes + OpenAPI/Swagger spec into `build/`) | Express.js | Compatible — tsoa generates Express routes, doesn't replace them. tsoa wasn't part of the original decision but is being kept; it's a productivity layer, not a conflict. |
| ORM / DB | Prisma 5 + PostgreSQL, 17 real migrations already applied | PostgreSQL + Prisma | **Exact match.** No migration needed. |
| Static assets | `multer-storage-cloudinary` already wired (`src/utils/cloudinary.ts`, `upload.any()` middleware pattern used across controllers) | Cloudinary | **Exact match, already working.** Reuse as-is. |
| Auth | JWT (Bearer token) + bcrypt, via tsoa's `@Security("jwt")` + `src/utils/authentication.ts` | ~~better-auth~~ | **Decision reversed 2026-08-16:** keep the existing JWT/bcrypt system rather than migrate to better-auth. It's already wired into every controller; swapping frameworks would burn a large fraction of the 4-day budget for no functional gain. The earlier "Auth Decision" section below is superseded by this. |
| Guest checkout | `Order` model has **no `userId` field at all** — the `Delivery` record captures customer name/email/phone/address directly, and `OrderController.createOrder` has no `@Security` guard | Guest checkout required (`project-overview.md` Goal 2) | **Already matches, no schema change needed.** This backend was never built assuming an authenticated buyer. |

### Real gaps found (not assumptions — read from the code)

1. **No authorization on mutations, anywhere.** `ProductController`,
   `blogController`, `OrderController` etc. have zero `@Security`
   decorators on create/update/delete. tsoa's `expressAuthentication`
   (`src/utils/authentication.ts`) only verifies the JWT is valid —
   it never checks `role`. This directly violates Invariant 3 below
   ("auth and ownership checks enforced at every mutation boundary")
   and must be fixed before this is a real admin-gated backend, not
   just before frontend integration. **Mechanism done 2026-08-16,
   applied to Product + News 2026-08-16 (Day 2):**
   `expressAuthentication` checks tsoa's `scopes` param against the
   user's roles and 403s on mismatch. `ProductController`
   create/update/delete now require `@Security("jwt", ["ADMIN",
   "MERCHANT"])` with ownership enforced in `ProductService`
   (`assertCanMutate`); the new `NewsController` mutations require
   `@Security("jwt", ["ADMIN"])`. **Still open:** `blogController` and
   `OrderController` remain unguarded — `blogController` was never in
   scope for this 4-day plan (no `Blog`→News migration happened; News
   is a parallel model), and `OrderController` is intentionally
   unguarded for guest checkout (see row above) though its `updateOrder`/
   `deleteOrder` mutations still have no admin gate — worth revisiting
   in hardening (Day 4) if order status changes need to be admin-only.
2. **Role enum doesn't match this project's roles.** Existing:
   `ADMIN | AGENT | CLIENT` (real-estate-agent shaped). Needed:
   `visitor(implicit) | member | merchant | admin`. `CLIENT` →
   `MEMBER`, `AGENT` → `MERCHANT` is the natural rename (an "agent"
   who manages their own listings is conceptually a merchant here).
   **Done 2026-08-16:** `Role` enum in `schema.prisma` and the mirrored
   `roles` TS enum (`src/utils/roles.ts`) both renamed; all code
   references (`userService.ts`, `AgentService.ts`,
   `StatisticService.ts`) updated to match. Migration
   `20260816162129_rename_role_enum_add_merchant_ownership` uses
   `ALTER TYPE ... RENAME VALUE` (not Prisma's default drop/recreate
   diff) specifically so existing `AGENT`/`CLIENT` rows on the real,
   previously-deployed database relabel in place instead of failing a
   cast — verified end-to-end against a local Postgres container
   (`docker compose -f backend/docker-compose.dev.yaml up -d db`) with
   all 17 pre-existing migrations applied first.
3. **No product ownership.** `Product` has no `merchantId`/owner
   field, so "merchants can only manage their own listings" (Invariant
   in "Auth and Role Model") can't be enforced yet — needs a new FK.
   **Done 2026-08-16:** `Product.merchantId` added (nullable — admin-
   created/seeded products have no owning merchant; only merchant-
   created listings set it), FK to `User`, same migration as above.
   Ownership is now enforced too (Day 2, same day): `ProductService`
   forces `merchantId` to the requesting merchant's own id on create
   (ignoring any client-sent value) and checks it on update/delete via
   `assertCanMutate` — admins bypass the check, merchants get a 403 on
   another merchant's product.
4. **No `News` model.** Closest existing analog is `Blog`
   (title/thumbnail/teaser/description/category — same shape as what
   `project-overview.md`'s News & Media needs), but it has no
   `country` field (the frontend already has a 12-country News hub —
   see `progress-tracker.md`) and its controller has zero auth
   checks. **Done 2026-08-16 (Day 2):** added as a parallel `News`
   model rather than extending `Blog` — see the `schema.prisma`
   comment on `News` for the reasoning (Blog's like-toggle/`featured`
   concepts don't transfer, and News needs several fields Blog lacks
   regardless of approach). `Blog`/`Likes`/`blogController` are
   untouched.
5. **`ProductCategory` enum is a general retail catalog**
   (`WOMENS_FASHION`, `ELECTRONICS`, `VEHICLES_SHOPPING`, etc.), not
   the frontend's current car-dealership categories
   (`Sedans`/`SUVs`/`Sports Cars`/`Luxury`) or the original
   books/courses/merch scope. **Done 2026-08-16:** car dealership
   confirmed as the permanent catalog direction (see
   `progress-tracker.md` Open Questions, now resolved); enum replaced
   with `SEDANS | SUVS | SPORTS_CARS | LUXURY`. This is a hard domain
   swap, not a value rename — any existing `Product` row on the old
   retail enum values will fail the migration's cast, which is
   intended (there's no meaningful WOMENS_FASHION→car mapping) but
   means this must not be run against a database with real retail
   product data still in place without re-seeding first.
6. **`PaymentMethod` has no "Pi" option** (`CARD`, `CASH_ON_DELIVERY`,
   `MOBILE_MONEY`, `AIRTEL_MONEY`, `BANK_TRANSFER`,
   `MTN_MOBILE_MONEY`). **Resolved 2026-08-22 for the `CARD` path:**
   the backend's real payment rail is now **Stripe**, not Paypack —
   `paypack-js` and the Paypack cash-in/cash-out REST calls were fully
   removed from `PaymentService.ts`, replaced with a Stripe-hosted
   Checkout Session (`POST /api/payment/checkout-session`) and a
   webhook (`POST /api/payment/webhook`, mounted in `index.ts` ahead
   of the global `json()` parser since Stripe signature verification
   needs the raw request body) that marks the `Payment` row
   SUCCEEDED/FAILED and flips `Order.status` to `CONFIRMED`. This
   replaces the old poll-based reconciliation (`node-cron` job
   calling `syncAllPaymentsWithTransactions` every minute) — Stripe
   pushes events instead, so there's no cron job anymore.
   `Checkout.tsx`'s "Credit / Debit Card" option now calls this and
   redirects the browser to Stripe; "Mobile Money" and "Pay with Pi"
   remain **unwired display-only options**, unchanged — Stripe has no
   Rwandan mobile-money support and doesn't touch Pi Network at all,
   so this only resolves the `CARD` half of gap 6. The still-open
   "does Pi mean real crypto or an internal unit" question in
   `project-overview.md` is untouched by this change.
7. **Repo hygiene:** `backend/` arrived with its own nested `.git`
   (separate history/remote). **Resolved 2026-08-16:** flattened into
   this repo (`backend/.git` removed) rather than kept as a git
   submodule — simpler for a single small team on a 4-day build.
8. **Three gaps only surfaced once Day 3 actually tried to wire the
   frontend against this backend — all resolved 2026-08-17:**
   - `Product` had no `slug` field at all, despite the frontend
     already routing product detail pages by slug. Added
     `Product.slug` (unique, auto-generated server-side from `name`,
     stable across renames), `GET /api/product/slug/{slug}`. Migration
     `20260817124500_add_product_slug`.
   - CORS (`index.ts`) only allowed the Vite *preview* port (`4173`)
     and old khm-be Vercel domains — the actual dev server (`5173`)
     was blocked. Added `http://localhost:5173`. **Production
     frontend origin is still unknown** — add it to the CORS list
     before this backend is deployed for real use, or every request
     from the deployed frontend will be silently rejected by the
     browser.
   - `PaymentService.ts` called `PaypackJs.config(...)` at module load
     time, which threw if `clientId`/`clientSecret` were unset —
     crashing the whole server on boot regardless of whether any
     payment feature was touched. **Fixed 2026-08-22** as part of the
     Paypack→Stripe swap (see gap 6 above): the Stripe SDK client is
     now constructed lazily on first use (`getStripe()` in
     `PaymentService.ts`), not at module scope, so the service can be
     imported — and the server can boot — with `STRIPE_SECRET_KEY`
     unset; it only throws when a payment feature is actually
     exercised without it configured.

### What's directly reusable, unchanged

Cloudinary upload pipeline, Prisma/Postgres setup, JWT/bcrypt auth
core, email (`nodemailer`), the Product/Order/Payment/Delivery schema
shape (field-level renames aside), and the tsoa
controller→service→Prisma pattern to follow for new endpoints
(including News).

See `progress-tracker.md` for the day-by-day integration plan.

## Current Implementation State (read this first)

**As of Day 4 (2026-08-17), this is no longer accurate for
everything** — see `progress-tracker.md` "In Progress" for exactly
which pages are live. Summary: `Shop.tsx`, `ProductDetail.tsx`,
`News.tsx` (articles only), `NewsDetail.tsx`, `NewsCountries.tsx`,
`Home.tsx`'s featured sections, login/register, guest checkout, and
the `/admin/*` product+news CRUD dashboard all call the real backend
now, through `front-end/src/app/api/`. Still mock-only:
`announcements`/`pressReleases` on `News.tsx` (no backend model exists
for them), and every other content type not yet touched by the 4-day
plan (Team, Founders, Ambassadors, Events, Downloads, etc.) — those
remain static until their own wiring pass. Don't assume "still
mock-only" applies to products or news articles anymore; don't assume
it *doesn't* apply to everything else either — check per page.
`PRODUCT.md` and `DESIGN.md` now exist at the repo root (written Day 4
via the `impeccable` skill, from this project's own `context/*.md`
docs and `theme.css` — see the Day 4 progress-tracker entry) and are
the visual/product-truth reference for any future UI work through that
tool.

A **real backend now exists** in `backend/` (Express + tsoa +
Prisma/PostgreSQL, adapted from an existing e-commerce API — see
"Backend Integration Plan" above) and is now wired to the frontend for
the entities listed above, including the admin CRUD surface. All four
days of the backend-integration plan are done. What's still open:
merchant-facing "manage your own listings" UI (backend already
supports it — see "Next Up" in `progress-tracker.md`), and the
Pi-payment gap, which was explicitly deferred, not resolved, on Day 4.
Check `progress-tracker.md` for the actual current status before
building against any endpoint not yet
mentioned there.

## Current Stack (implemented today)

| Layer          | Technology                                | Role                                             |
| -------------- | ------------------------------------------ | ------------------------------------------------- |
| Framework      | React 18 + TypeScript                     | Client-rendered SPA                               |
| Build tool     | Vite                                       | Dev server and bundler                            |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`)     | Utility-first styling, no separate config file    |
| Theme tokens   | `front-end/src/styles/theme.css`                    | CSS custom properties consumed by Tailwind        |
| Routing        | React Router v7                           | Client-side routing                               |
| Global state   | `CartContext.tsx`, `AuthContext.tsx` (both `useState`-based) | Cart (in-memory only) and auth session (JWT + user, persisted to `localStorage` — see "Frontend auth token storage" below) |
| UI primitives  | Radix-based shadcn-style wrappers in `front-end/src/app/components/ui/` | Available, but pages currently use plain HTML + Tailwind instead |
| Data           | `front-end/src/app/data/mockData.ts` (products/news partially superseded — see "Current Implementation State") | Static mock objects; products and news now flow through `front-end/src/app/api/` against the real backend instead |

**Note on `components/ui/`:** these wrappers exist but are not
currently used by page-level code. Before writing new UI, check
whether an existing page already solved the same pattern with plain
elements — match the codebase's actual current convention rather than
introducing `components/ui/` usage inconsistently. If a decision is
made to migrate pages onto `components/ui/`, that's an explicit,
tracked unit of work — not something to do incidentally while
building an unrelated feature.

**No static type-checking exists in `front-end/`** — there is no
`tsconfig.json` and no `typescript` package anywhere in
`front-end/package.json` (checked directly, not assumed). `.ts`/`.tsx`
is a syntax convention only; Vite's esbuild strips types without
checking them, and `npm run build` will happily ship a file with a
type error as long as it's syntactically valid JS after stripping.
`vite build` (catches syntax/import errors) and an actual browser run
are the only verification available — there is no `tsc --noEmit` to
run.

**Frontend auth token storage:** `AuthContext.tsx` persists the real
JWT returned by `POST /api/auth/signin`/`signup` to
`localStorage` (key `gcv_auth_session`), sent back as a raw
`Authorization` header value on authenticated requests — **not**
prefixed with "Bearer ", because `expressAuthentication`
(`backend/src/utils/authentication.ts`) passes the header straight to
`jwt.verify` with no prefix-stripping. This is ordinary SPA JWT
storage against a real backend, distinct from `four-day-plan.md`'s
superseded plan, which simulated an entire fake session with no
backend at all — don't conflate the two when reading history.

**React Router v7 + side effects in render, a gotcha for future
route-guard work:** `navigate()` calls from `useNavigate()` are
wrapped in `startTransition` by the router. A component can therefore
render against a transient/stale context snapshot in the instant a
transition starts, one tick before a context provider higher in the
tree has propagated its latest state. `Checkout.tsx` hit this for real
(see `progress-tracker.md` Day 3) — an empty-cart redirect fired
`navigate()` directly in the render body, on a stale `items` snapshot
of a cart that was genuinely non-empty a moment later. The fix is
two-fold and both parts matter: move the redirect into a `useEffect`
(never call `navigate()` synchronously in a render body — it's a side
effect), *and* debounce it briefly (this one used 150ms) rather than
acting on the very first effect run, since the first render after a
transition can still be that stale snapshot. **Confirmed and applied
2026-08-17:** `front-end/src/app/components/ProtectedRoute.tsx` (Day
4's role-gated route guard, used by `/admin/*`) uses this exact
debounced-`useEffect` pattern from the start — verified in the browser
that a guest hitting `/admin` lands on `/login` and a logged-in
non-admin lands on `/` without a redirect flicker or bounce.

## Target Stack (to be built)

| Layer             | Technology                     | Role                                                        |
| ------------------ | ------------------------------- | ------------------------------------------------------------ |
| Backend API        | Express.js (Node.js)            | REST API layer, decoupled from the Vite frontend              |
| Database           | PostgreSQL + Prisma ORM         | Products, users, orders, merchants, content                  |
| Static assets      | Cloudinary                      | Product/merchant images and other uploaded media              |
| Auth               | JWT (Bearer) + bcrypt, tsoa-integrated | Member/merchant/admin roles — existing system, being adapted, not better-auth |
| Payment (card)     | **Stripe** (resolved 2026-08-22) | Real-money checkout via Stripe-hosted Checkout Sessions + webhook |
| Pi logic           | **[DECISION NEEDED — depends on open product questions in project-overview.md]** | USD-to-Pi conversion and "Pay with Pi" settlement — Stripe doesn't touch this |
| Hosting            | **[DECISION NEEDED]**           | Frontend + backend deployment target                         |

### Backend Decision — resolved 2026-08-15

The frontend stack (React + Vite + React Router) is fixed and given.
The backend stack is now decided:

- **API layer:** Express.js (Node.js), deployed separately from the
  Vite frontend build. Frontend calls it over HTTP via
  `front-end/src/app/api/` client functions once that layer is built.
- **Database:** PostgreSQL, accessed through Prisma as the ORM/schema
  layer (Prisma schema is the source of truth for the relational
  model — products, users, orders, merchants, content).
- **Static assets:** Cloudinary for images (product photos, merchant
  uploads, etc.) rather than storing binaries in Postgres or bundling
  them in the frontend repo.

This must integrate cleanly with the existing React Router v7
frontend without requiring a framework migration (i.e., do not
migrate to Next.js to get server features — this project's frontend
framework is fixed).

### Auth Decision — resolved 2026-08-16, **reversed 2026-08-16**

**Superseded.** This originally said better-auth. Once the existing
backend was audited (see "Backend Integration Plan" above), it turned
out to already have a working JWT (Bearer token) + bcrypt auth system
wired into every tsoa controller via `@Security("jwt")` and
`src/utils/authentication.ts`. Migrating that to better-auth would
touch every protected route for no functional benefit, and the
project has a 4-day budget — so the decision is now to **keep and
adapt the existing JWT/bcrypt system** instead.

- **Sessions:** Bearer JWT in the `Authorization` header (not
  cookie-based, not better-auth). Frontend stores the token
  client-side (e.g. memory + refresh-on-load, or localStorage —
  finalize during Day 1 auth work; avoid storing it in a way that
  survives XSS unnecessarily) and sends it on every authenticated
  request.
- A single `User` model with a `role` field, existing today as
  `UserRoles`/`Role` enum, **renamed 2026-08-16**:
  `ADMIN | MERCHANT | MEMBER` (`AGENT` → `MERCHANT`, `CLIENT` →
  `MEMBER`); unauthenticated requests are the implicit `visitor` role,
  same as before.
- Password hashing (`bcrypt`) and JWT issuing/verification
  (`jsonwebtoken`) are already implemented — reuse as-is.
- **Real gap, mechanism fixed 2026-08-16, not yet applied anywhere:**
  `expressAuthentication` now checks the route's required role scopes
  (via tsoa's `@Security("jwt", ["ADMIN"])` third argument) and 403s
  if the user's roles don't match — but **no controller has been
  updated to actually pass scopes yet**, so every product/blog
  mutation endpoint is still wide open in practice. Wiring this into
  `ProductController` (admin + owning merchant) and the News
  controller is Day 2 — see "Backend Integration Plan" gap #1 and the
  4-day plan in `progress-tracker.md`.
- If a genuine need for cookie-based sessions or better-auth-specific
  features shows up later, that's a fast-follow, not part of this
  4-day pass — do not reopen this mid-build.

Hosting target remains open — see row above.

## System Boundaries (target)

- `front-end/src/app/data/` — **current**: static mock data. **target**: this
  directory is replaced by real API calls; do not add new mock data
  for features intended to be backend-driven going forward.
- `front-end/src/app/api/` or equivalent — **not yet created**. This is where
  frontend API client functions will live (fetch wrappers, typed
  request/response contracts) calling the Express API.
- `front-end/src/app/context/CartContext.tsx` — remains the client-side cart
  state; on checkout it hands off to a real order-creation API call
  once the backend exists, rather than resolving purely client-side.
- `front-end/src/app/components/` — UI composition only, no business logic.
- `front-end/src/app/pages/` (or equivalent route-level components) — route-level
  composition, page structure.

## Storage Model (target)

- Product, user, order, merchant, and content records belong in
  PostgreSQL, modeled via Prisma schema (`backend/prisma/schema.prisma` will be the
  source of truth for the relational model).
- `Order.userId` must be **nullable** — guest checkout (see "Auth and
  Role Model") means an order can exist with no associated `User`
  row. Guest orders capture contact/shipping details directly on the
  order record instead of via a user relation.
- Static assets (images — product photos, merchant uploads, etc.) are
  stored in Cloudinary, not bundled in the frontend repo and not
  stored as binaries in Postgres. The database stores Cloudinary
  URLs/public IDs, not the asset bytes.
- Do not store large binary content (images, PDFs) directly in the
  database.

## Auth and Role Model (target)

- Implementation: existing JWT (Bearer) + bcrypt system, adapted —
  see "Auth Decision" above (better-auth was reversed 2026-08-16).
- Roles: visitor/guest, member, merchant, admin — stored as a `role`
  enum on a single `User` model (existing `Role` enum, being renamed
  from `ADMIN | AGENT | CLIENT`). Guests don't have a `User` row at
  all.
- **Checkout does not require authentication (confirmed 2026-08-16,
  `project-overview.md` Goal 2)** — any visitor can complete a
  purchase as a guest. Registering as a member is optional and adds
  persistent order history / saved details / perks, but is never a
  purchase gate. Order-creation API must accept guest checkout
  (no session) as a first-class path, not just an authenticated one.
- Only merchants can manage their own product listings — not other
  merchants' listings.
- Only admins can access the Admin Portal routes, including inventory
  control (product upload/delete) and news posting.
- Route protection must be enforced both client-side (route guards)
  and server-side (API authorization checks) once a backend exists —
  client-side checks alone are not sufficient for anything that
  mutates data. This applies to merchant/admin mutation routes; guest
  checkout is intentionally an unauthenticated mutation path and
  should instead be protected by other means (e.g. rate limiting,
  validation) rather than an auth check.

## Currency / Pi Conversion Model (target — pending open questions)

- **GCV fixed rate direction — unresolved, has flipped twice.** Current
  code (`front-end/src/app/lib/pi.ts`, as of the 2026-08-07 "full demo" commit):
  `toPi(usd) = usd / GCV_USD`, i.e. **1 π ≈ $314,159 USD** (Pi is the
  large-denomination unit — a $89,999 product converts to ≈0.29 π).
  This is the *opposite* of the direction this file previously
  documented as "resolved 2026-08-02" (`usd * GCV_USD`, Pi as the
  small unit), which itself reversed an even earlier direction. Do not
  treat the current code as a deliberate, confirmed decision — it has
  now changed twice without an explicit recorded product decision.
  `pi.ts` also carries a `GCV_DISCLAIMER` constant ("GCV is a
  community-proposed target, not an official Pi Network rate or an
  exchange-verified price") not previously documented here. Get an
  explicit direction decision from the product owner before building
  anything (checkout totals, admin pricing tools) that assumes one
  direction is final — see `progress-tracker.md` Open Questions.
- Conversion must be computed from a single shared constant/config
  value, not hardcoded in multiple components.
- Product prices are authored in USD; Pi price is always derived, not
  independently entered, to avoid the two figures drifting apart.
- Do not implement real Pi Network wallet/settlement integration until
  the open product question in `project-overview.md` ("does Pi mean
  Pi Network's cryptocurrency or an internal unit") is explicitly
  resolved and recorded here.

## Invariants

1. No feature is built against an assumed backend stack before that
   stack is confirmed and recorded in this file. (Backend API,
   database, static-asset storage, and auth are now confirmed —
   Express.js, PostgreSQL + Prisma, Cloudinary, better-auth. Hosting
   remains open.)
2. `mockData.ts` is not extended with new fields for features that are
   intended to become backend-driven — extending it deepens the
   eventual migration cost.
3. Auth and ownership checks (once a backend exists) are enforced at
   every mutation boundary, not just in the UI.
4. The USD-to-Pi conversion rate is read from one shared source of
   truth, never duplicated as a literal in multiple files.
5. `components/ui/` (shadcn/Radix wrappers) are not modified directly;
   project-specific styling goes in app-level components.
6. This file is updated whenever a "[DECISION NEEDED]" item above is
   resolved — do not leave it stale once a real choice is made.
7. All relational schema changes go through Prisma migrations, not
   hand-written SQL or manual DB edits — `backend/prisma/schema.prisma`
   must stay the single source of truth for the data model.
8. Uploaded/static assets (images) are stored in Cloudinary and
   referenced by URL/public ID from Postgres — never stored as binary
   data in the database or committed into the frontend repo.
