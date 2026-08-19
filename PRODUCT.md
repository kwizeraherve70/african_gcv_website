# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitor/guest buyer:** browses public content and the GCV Market,
  checks out and buys without registering. This is the primary path —
  buying must never require an account.
- **Member (registered, optional):** everything a guest gets, plus
  persistent order history and any member-only perks. Registration is
  a value-add, never a purchase gate.
- **Merchant:** logs in to create and manage their own product
  listings, and views/updates orders containing their products.
- **Admin:** manages users, market listings, news, events, and the
  merchant directory from a dedicated Admin Portal.

## Product Purpose

Pi Global GCV Alliance is a marketplace-and-membership platform for a
trade alliance operating across Africa, Europe, Asia, and the USA. It
is both a commercial marketplace (currently a car-dealership catalog —
Sedans/SUVs/Sports Cars/Luxury) and the alliance's institutional site,
publishing news, events, and information about its founders,
ambassadors, core team, and industry alliance members. Success means a
visitor can browse and buy without an account, a merchant can
self-manage listings, and an admin can run inventory/content/user
operations from a dedicated portal.

## Positioning

Products and services are priced in USD but payable in "Pi" at a
fixed, alliance-published conversion rate (GCV = 314,159) — explicitly
community-proposed, not an official Pi Network exchange rate. This
dual-pricing-with-a-fixed-target mechanic, combined with mandatory
guest checkout and a merchant self-service model, is what distinguishes
this from a generic storefront.

## Operating Context

- One app serving both the public marketplace and the institutional
  site: About Us, Core Team, Founders, Ambassadors, Industry Alliance,
  News & Media, GCV Market, Contact.
- GCV Market is a car-dealership catalog (confirmed permanent
  direction, 2026-08-16) — not the originally-scoped generic
  multi-category marketplace.
- A real backend exists (Express + tsoa + Prisma/PostgreSQL,
  JWT/bcrypt auth — see `architecture-context.md`). Days 1–3 of the
  backend-integration plan are done: auth/roles, product/news backend
  + role checks, and frontend wiring (Shop, product detail, news,
  login/register, guest checkout) are live against the real API.
- This work (Day 4): the Admin Portal — inventory control
  (upload/delete products), news content posting, and auth/role-
  boundary hardening. No admin UI exists yet; this is a new surface.

## Capabilities and Constraints

- Four roles only: guest/visitor, member, merchant, admin. No tiers
  beyond these (advanced enterprise permission tiers are explicitly
  out of scope).
- Guest checkout must never require registration or login — a hard
  invariant, not a default that can be relaxed later.
- Multi-language: English, French, Kinyarwanda, Swahili. English is
  fully wired; the others are a planned fast-follow, not yet
  implemented — don't assume they're live.
- **Explicitly undecided — do not build against a specific answer**
  (tracked in `progress-tracker.md` "Open Questions"):
  - Whether "Pi" is Pi Network's real cryptocurrency or an internal
    points/loyalty unit — determines whether payment needs real crypto
    integration or a simulated/internal ledger.
  - Whether a real payment processor is in scope for the first
    release, or checkout is simulated/manually confirmed.
  - Who governs the GCV = 314,159 rate and how often it can change.
  - Real launch content volume (founders/ambassadors/alliance
    members/products) — affects whether admin CRUD tooling is a
    launch requirement or content can be seeded directly.

## Brand Commitments

- Name: "Pi Global GCV Alliance." Logo mark: a gold circle with a "π"
  glyph.
- The GCV target (1 π ≈ $314,159) must always be presented as
  community-proposed, not an official Pi Network rate — a standing
  brand/legal commitment already carried through product cards, cart,
  and checkout copy (`front-end/src/app/lib/pi.ts`, `GCV_DISCLAIMER`).
- An established visual system already exists (brand-purple/gold/green
  tokens, Tailwind v4 theme — see `context/ui-context.md`). Day 4's
  admin surface inherits this; it is refinement territory, not a new
  visual world.

## Evidence on Hand

- Real founder content already in the codebase (name, role, bio,
  photo) — e.g. Olivier Ndatimana, Founding Director, on the Home
  page. Not placeholder copy.
- Real image assets in use (mission/olivie/doris), not stock
  placeholders.
- No admin-portal visual precedent exists yet — Day 4 is a new surface
  (Operate mode) with no incumbent admin UI to preserve, though it
  inherits the public site's established tokens/theme.

## Product Principles

1. Buying is never gated behind an account — guest checkout is a hard
   invariant, not a convenience default.
2. Pricing is always dual (USD + Pi-at-GCV-target), and the GCV
   disclaimer travels with every price, everywhere it's shown.
3. Role boundaries are strict and enforced server-side, not just
   hidden in the UI — member/merchant/admin/guest each see and can do
   only what their role permits.
4. The commercial marketplace and the institutional/alliance content
   share one coherent site identity, not two disconnected experiences.
5. Ship against confirmed product decisions; explicitly flag and defer
   anything still open (payment mechanism, Pi's real-world nature)
   rather than quietly deciding it while building.
