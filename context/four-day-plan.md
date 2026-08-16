# 4-Day Plan — Full Frontend Build

**Status (2026-08-15): not executed.** This plan was confirmed
2026-07-31, before the 2026-08-02 rebrand. Checked against the current
repo: none of Day 1–4 shipped — no `AuthContext`/`Login.tsx`/
`Register.tsx`/`ProtectedRoute`, no `localStorage` usage anywhere in
`src/app/`, no `react-i18next` in `package.json`, no `DOMPurify`
sanitization on `dangerouslySetInnerHTML` (still present unsanitized
in `ProductDetail.tsx` and `NewsDetail.tsx`), and Day 1's specific hex
palette (`#0066FF` / `#6B46C1` / `#38A169` / etc.) was never applied —
the repo instead adopted a different purple/gold token set via the
2026-08-02 rebrand (see `ui-context.md`), and some raw hex values
still remain in `Home.tsx` (SVG gradient stops, WhatsApp green)
alongside it. Actual work since 2026-07-31 diverged onto the rebrand
and the 2026-08-07 car-catalog pivot instead — see
`progress-tracker.md` for what actually happened. Treat everything
below as an unexecuted historical plan, not a description of current
or upcoming work, unless/until someone explicitly picks it back up.

---

Scope: complete the frontend-only build per `project-overview.md`'s
"In Scope" list, within 4 days. No backend exists and none is being
invented here — the `architecture-context.md` "Backend Decision"
remains open. Auth, Merchant management, and Admin management are
simulated via `localStorage` as an explicit, temporary frontend layer,
distinct from that unresolved backend decision.

## Scope decisions (confirmed 2026-07-31)

- **Auth / Merchant / Admin depth:** Full simulated CRUD. Register/login
  persists a fake session + role to `localStorage`. Merchants can
  create/edit/delete their own products (persisted as a `localStorage`
  overlay on top of `mockData`). Admin manages users/content/market the
  same way. Built against a typed interface that mirrors the intended
  real API contract, so swapping in a real backend later is a
  data-source change, not a UI rewrite.
- **i18n:** Framework + English complete. `react-i18next` wired
  properly with all strings extracted into translation keys and a
  working language switcher. French, Kinyarwanda, and Swahili ship as
  stubbed files (copied from English) with real translation tracked as
  a fast-follow in `progress-tracker.md` — not attempted in this pass.

## Pre-existing issues folded into this plan

From the `/review` pass done before this plan was written:

- Raw hex values used throughout `Home.tsx`, `Shop.tsx`,
  `ProductDetail.tsx` instead of theme tokens — violates
  `code-standards.md` styling rule.
- `ui-context.md` still has unresolved `[FILL IN FROM REPO]` markers
  (typography, border-radius scale, layout patterns) despite the
  pages that depend on those decisions already being built.
- `Home.tsx`'s Featured Products Pi-price line uses
  `text-muted-foreground/70` where `Shop.tsx` / `ProductDetail.tsx`
  use `text-[#0066FF]/70` for the same element — inconsistent.
- `progress-tracker.md`'s "Completed" section understates what's
  actually built (omits Team/Founders/Ambassadors/IndustryAlliance/
  Merchants/Events/Downloads, all of which exist).
- `ProductDetail.tsx` renders `product.description` via
  `dangerouslySetInnerHTML` — harmless while data is static, but a
  real XSS risk once Merchant/Admin CRUD lets that field be edited.

---

## Day 1 — Design-system fixes + Auth foundation

- Add real brand tokens to `src/styles/theme.css`:
  `--color-accent-blue #0066FF`, `-purple #6B46C1`, `-green #38A169`,
  `-orange #FFA500`, `-gold #f4af47`, `-magenta #8a348e`,
  `-red #E53E3E`.
- Resolve `ui-context.md`'s `[FILL IN FROM REPO]` markers: typography,
  border-radius scale (`rounded-xl` default / `rounded-2xl` cards /
  `rounded-full` pills), layout patterns.
- Migrate hex → tokens in `Home.tsx`, `Shop.tsx`, `ProductDetail.tsx`.
- Fix the `Home.tsx` Pi-price color inconsistency.
- Build `AuthContext` (localStorage-persisted session:
  `{id, name, email, role}`), `Login.tsx`, `Register.tsx`, a
  `ProtectedRoute` wrapper, and a Navbar account menu (login/register
  when signed out, avatar + role when signed in).
- Update `progress-tracker.md` to reflect actual completed state, and
  record the localStorage-simulation approach in
  `architecture-context.md` as an explicit interim note (distinct from
  the real backend decision).

## Day 2 — Member account + Merchant dashboard

- Member: `Account.tsx` / `OrderHistory.tsx` — checkout writes an order
  into `localStorage` instead of just navigating to a static
  confirmation screen.
- Merchant: dashboard shell + "My Products" (create/edit/delete,
  persisted as a `localStorage` overlay on `mockData.products`,
  filtered by a new `merchantId` field) + "My Orders" (orders
  containing their products).
- Add `merchantId` to the `Product` interface — required for the
  in-scope "merchants manage their own listings" feature; not
  speculative, so it doesn't conflict with the "don't extend mockData
  for backend-driven features" invariant.

## Day 3 — Admin Portal

- Admin dashboard (stat overview).
- User management (role changes, activate/deactivate — seeded +
  localStorage users).
- Market management (same CRUD as Merchant, scoped to any
  product/merchant).
- Content management (news, events, downloads — list/create/edit/
  delete, localStorage-backed).
- All admin routes gated by `ProtectedRoute` role check.

## Day 4 — i18n + full consistency sweep + verification

- Install `react-i18next`; extract strings into keys across all pages;
  wire a language switcher into the Navbar. English fully wired;
  French/Kinyarwanda/Swahili stubbed (copied from English) with real
  translation logged as a follow-up in `progress-tracker.md`.
  **Risk:** full string extraction across ~19 pages in one day is the
  tightest part of this plan. Fallback if it slips: fully wire
  Navbar/Footer/Home/Shop/Contact/Auth only, defer and log the rest.
- Finish the hex → token sweep on remaining pages (Team, Founders,
  Ambassadors, IndustryAlliance, Events, Downloads, Contact, News,
  Cart, Checkout).
- Sanitize `dangerouslySetInnerHTML` (ProductDetail, NewsDetail, press
  releases) with DOMPurify, since that content becomes editable via
  Merchant/Admin CRUD as of Days 2–3.
- Run the dev server and click through golden paths: visitor → register
  → login → member checkout → order history; merchant → create product
  → verify it appears in Shop; admin → manage a user and a news item.
  Check for console errors.
- Final `progress-tracker.md` update.
