# Architecture Context

## Current Implementation State (read this first)

This is currently a **frontend-only prototype**. There is no backend,
no API layer, no database, and no real authentication. All data
(products, news, team, events, merchants) lives as static objects in
`src/app/data/mockData.ts`. The target architecture below describes
where this project is going, not what exists today. Do not assume any
API route, database, or auth provider mentioned below is already
implemented — check `progress-tracker.md` for actual status before
building against it.

## Current Stack (implemented today)

| Layer          | Technology                                | Role                                             |
| -------------- | ------------------------------------------ | ------------------------------------------------- |
| Framework      | React 18 + TypeScript                     | Client-rendered SPA                               |
| Build tool     | Vite                                       | Dev server and bundler                            |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`)     | Utility-first styling, no separate config file    |
| Theme tokens   | `src/styles/theme.css`                    | CSS custom properties consumed by Tailwind        |
| Routing        | React Router v7                           | Client-side routing                               |
| Global state   | `CartContext.tsx` (`useState`-based)      | Only global state in the app — the cart           |
| UI primitives  | Radix-based shadcn-style wrappers in `src/app/components/ui/` | Available, but pages currently use plain HTML + Tailwind instead |
| Data           | `src/app/data/mockData.ts`                | Static mock objects for all content types         |

**Note on `components/ui/`:** these wrappers exist but are not
currently used by page-level code. Before writing new UI, check
whether an existing page already solved the same pattern with plain
elements — match the codebase's actual current convention rather than
introducing `components/ui/` usage inconsistently. If a decision is
made to migrate pages onto `components/ui/`, that's an explicit,
tracked unit of work — not something to do incidentally while
building an unrelated feature.

## Target Stack (to be built)

| Layer             | Technology                     | Role                                                        |
| ------------------ | ------------------------------- | ------------------------------------------------------------ |
| Backend API        | Express.js (Node.js)            | REST API layer, decoupled from the Vite frontend              |
| Database           | PostgreSQL + Prisma ORM         | Products, users, orders, merchants, content                  |
| Static assets      | Cloudinary                      | Product/merchant images and other uploaded media              |
| Auth               | better-auth (Prisma adapter)    | Member/merchant/admin roles, cookie-based sessions            |
| Payment / Pi logic | **[DECISION NEEDED — depends on open product questions in project-overview.md]** | USD-to-Pi conversion and checkout |
| Hosting            | **[DECISION NEEDED]**           | Frontend + backend deployment target                         |

### Backend Decision — resolved 2026-08-15

The frontend stack (React + Vite + React Router) is fixed and given.
The backend stack is now decided:

- **API layer:** Express.js (Node.js), deployed separately from the
  Vite frontend build. Frontend calls it over HTTP via
  `src/app/api/` client functions once that layer is built.
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

### Auth Decision — resolved 2026-08-16

**better-auth**, self-hosted alongside the Express API, using its
official Prisma adapter against the same PostgreSQL database — not a
third-party BaaS auth provider, consistent with the self-hosted
Express/Postgres/Prisma backend decision above.

- Cookie-based sessions (not JWT-in-localStorage), stored via the
  Prisma adapter in Postgres — avoids XSS-exposed token storage in
  the SPA.
- A single `User` model with a `role` enum (`MEMBER`, `MERCHANT`,
  `ADMIN`; unauthenticated requests are the implicit `visitor` role)
  rather than separate tables per role — matches the "Admin Portal,
  secure login, separate from public auth if warranted" note in
  `project-overview.md` by gating on role, not on a physically
  separate auth system.
- Password hashing and session handling are library-managed, not
  hand-rolled.
- **Fallback if better-auth proves too immature/limiting during
  implementation:** Passport.js (local strategy) + `express-session`
  with a Postgres-backed session store. More boilerplate, but more
  battle-tested. Switch by updating this section, not silently.

Hosting target remains open — see row above.

## System Boundaries (target)

- `src/app/data/` — **current**: static mock data. **target**: this
  directory is replaced by real API calls; do not add new mock data
  for features intended to be backend-driven going forward.
- `src/app/api/` or equivalent — **not yet created**. This is where
  frontend API client functions will live (fetch wrappers, typed
  request/response contracts) calling the Express API.
- `src/app/context/CartContext.tsx` — remains the client-side cart
  state; on checkout it hands off to a real order-creation API call
  once the backend exists, rather than resolving purely client-side.
- `src/app/components/` — UI composition only, no business logic.
- `src/app/pages/` (or equivalent route-level components) — route-level
  composition, page structure.

## Storage Model (target)

- Product, user, order, merchant, and content records belong in
  PostgreSQL, modeled via Prisma schema (`schema.prisma` is the
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

- Implementation: better-auth + Prisma adapter — see "Auth Decision"
  above for detail and the Passport.js/express-session fallback.
- Roles: visitor/guest, member, merchant, admin — stored as a `role`
  enum on a single `User` model, not separate tables. Guests don't
  have a `User` row at all.
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
  code (`src/app/lib/pi.ts`, as of the 2026-08-07 "full demo" commit):
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
   hand-written SQL or manual DB edits — `schema.prisma` must stay the
   single source of truth for the data model.
8. Uploaded/static assets (images) are stored in Cloudinary and
   referenced by URL/public ID from Postgres — never stored as binary
   data in the database or committed into the frontend repo.
