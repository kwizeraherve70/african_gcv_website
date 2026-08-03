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
| Backend API        | **[DECISION NEEDED]**           | See "Backend Decision" below — not yet chosen                |
| Database           | **[DECISION NEEDED]**           | Products, users, orders, merchants, content                  |
| Auth               | **[DECISION NEEDED]**           | Member/merchant/admin roles                                  |
| Payment / Pi logic | **[DECISION NEEDED — depends on open product questions in project-overview.md]** | USD-to-Pi conversion and checkout |
| Hosting            | **[DECISION NEEDED]**           | Frontend + backend deployment target                         |

### Backend Decision — open, not yet made

The frontend stack (React + Vite + React Router) is fixed and given.
The backend is **not** specified anywhere in the source material for
this project and must not be invented and treated as settled. Do not
let an agent silently pick a backend stack (e.g. defaulting to a
Node/Express/Postgres setup) and start building against it as if it
were decided — log the decision as needed in `progress-tracker.md`
under Open Questions, get it confirmed, then update this file with the
real answer before backend implementation begins.

Reasonable candidates to evaluate (not a decision):
- A lightweight Node/Express or Fastify API + PostgreSQL, deployed
  alongside the Vite frontend.
- A managed BaaS (e.g. Supabase) to minimize backend build time given
  the short timeline — trades some control for speed.

Whichever is chosen, it must integrate cleanly with the existing
React Router v7 frontend without requiring a framework migration
(i.e., do not migrate to Next.js to get server features — this
project's frontend framework is fixed).

## System Boundaries (target)

- `src/app/data/` — **current**: static mock data. **target**: this
  directory is replaced by real API calls; do not add new mock data
  for features intended to be backend-driven going forward.
- `src/app/api/` or equivalent — **not yet created**. Once the backend
  decision is made, this is where frontend API client functions live
  (fetch wrappers, typed request/response contracts).
- `src/app/context/CartContext.tsx` — remains the client-side cart
  state; on checkout it hands off to a real order-creation API call
  once the backend exists, rather than resolving purely client-side.
- `src/app/components/` — UI composition only, no business logic.
- `src/app/pages/` (or equivalent route-level components) — route-level
  composition, page structure.

## Storage Model (target)

- Product, user, order, merchant, and content records belong in the
  chosen relational database once selected.
- Static assets (images) — decide storage approach (bundled vs. CDN/
  object storage) when merchant-uploaded product images become a
  requirement; not needed while content is admin-seeded.
- Do not store large binary content (images, PDFs) directly in the
  database once one exists.

## Auth and Role Model (target)

- Roles: visitor (unauthenticated), member, merchant, admin.
- Only authenticated members can check out.
- Only merchants can manage their own product listings — not other
  merchants' listings.
- Only admins can access the Admin Portal routes.
- Route protection must be enforced both client-side (route guards)
  and server-side (API authorization checks) once a backend exists —
  client-side checks alone are not sufficient for anything that
  mutates data.

## Currency / Pi Conversion Model (target — pending open questions)

- **GCV fixed rate direction — resolved 2026-08-02**: **1 USD = 314159 π**
  (Pi is the small-denomination unit). Confirmed from the approved
  design mockup, whose displayed conversions match this direction
  exactly (e.g. $150.00 × 314159 = 47,123,850 π). `src/app/lib/pi.ts`
  implements `toPi(usd) = usd * GCV_USD`. The earlier implementation
  had this inverted (modeled a since-abandoned "1 Pi ≈ $314,159"
  narrative) — that direction is no longer used anywhere in the app.
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
   stack is confirmed and recorded in this file.
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
