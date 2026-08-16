# Pi Global GCV Alliance

## Overview

Pi Global GCV Alliance is a marketplace-and-membership platform for a
trade alliance operating across Africa, Europe, Asia, and the USA.
Products and services are priced in USD but are payable in "Pi" currency
at a fixed conversion rate (GCV = 314159). The platform also functions
as the alliance's institutional site — publishing news, events, and
information about its founders, ambassadors, core team, and industry
alliance members.

## Current Implementation State

**As of this writing, this is a frontend-only prototype.** There is no
backend, no API layer, and no database. All product, news, team, and
event data lives as static mock objects in `src/app/data/mockData.ts`.
Nothing below describes what exists today — see `progress-tracker.md`
for the actual current state. This document, and `architecture-context.md`,
describe the **target product** this prototype is being built toward.

**Note on the current demo catalog:** as of the 2026-08-07 "full demo"
commit, the mock `GCV Market` product catalog is a car dealership
(`Sedans`/`SUVs`/`Sports Cars`/`Luxury` — Tesla, Porsche, Range Rover,
etc.), not the generic multi-category "products and services"
marketplace this document describes. Whether that's the intended
long-term catalog direction or a one-off demo swap is an open decision
— see `progress-tracker.md` Open Questions. Don't treat the current
catalog content as confirmation of scope described here.

## Goals

1. Let visitors browse a public marketplace of products and services,
   and news/media content, without requiring an account.
2. Let any visitor purchase products at checkout — priced in USD,
   payable in Pi at the fixed GCV conversion rate — **without
   requiring registration or login.** Registering as a member is
   optional, not a purchase gate (see "Membership & Auth" below for
   what it's for).
3. Let merchants list and manage their own products.
4. Give the alliance a content platform for news, events, and
   organizational information (founders, ambassadors, core team,
   industry alliance members) segmented by region.
5. Give administrators a portal to manage inventory (product
   upload/delete, listings) and to post news content, alongside users,
   market listings, and events.
6. Present a consistent, credible institutional identity alongside the
   commercial marketplace.

## Core User Flow

### Visitor (buyer — no account required)
1. Lands on the home page (mission, latest news, upcoming events,
   featured market items).
2. Browses About Us, Core Team, Founders, Ambassadors, Industry
   Alliance sections, and News & Media.
3. Browses the GCV Market (products, services, companies, merchants).
4. Adds products to cart (cart total shown in both USD and Pi, using
   the fixed GCV rate).
5. **Checks out and buys as a guest — no registration or login
   required.**
6. Optionally registers to become a member (see below) for order
   history and other member-only perks; this is never required to
   complete a purchase.

### Member (registered, optional)
1. Registers / logs in.
2. Gets everything a guest gets, plus: persistent order history,
   saved checkout details, and any alliance-member-only perks/content
   defined later.
3. Registration is a value-add, not a purchase gate — see Goal 2.

### Merchant
1. Logs in to a merchant view.
2. Creates and manages product listings.
3. Views and updates orders for their products.

### Admin
1. Logs in to the Admin Portal.
2. Manages users, market listings, news, events, and merchant
   directory entries.

## Features

### Public Content
- Home: hero, mission/vision, latest news, upcoming events, featured
  market items, membership call-to-action, contact info.
- About Us: story, vision, mission, objectives, core values.
- GCV Core Team: global leadership, department structure.
- GCV Founders: regional listing (Africa, Europe, Asia, USA).
- GCV Ambassadors: regional listing (Africa, Europe, Asia, USA).
- GCV Industry Alliance: regional listing, merchant directory,
  business partners.
- GCV Events: upcoming, previous, conferences, photo/video gallery.
- News & Media: news, announcements, press releases, publications.
- Downloads: reports, forms, certificates, official documents.
- Contact Us: contact form, office address, social links, map.

### Marketplace (GCV Market)
- Product, service, and company listings.
- Merchant directory and profiles.
- Category browsing and search.
- Product detail pages.
- Cart with USD/Pi dual display at the fixed GCV rate.
- **Guest checkout — any visitor can complete a purchase without
  registering or logging in.**
- Order history for registered members (not available to guests,
  since there's no account to attach history to).

### Membership & Auth
- Registration and login for members and merchants — **optional for
  members** (buying never requires an account); required for
  merchants and admins.
- Role-based access: visitor/guest buyer, member, merchant, admin.

### Admin Portal
- Secure login, separate from public auth if warranted.
- Dashboard overview.
- Inventory control: upload and delete products directly from the
  dashboard.
- Post news content (GCV Africa news and other regional news).
- Content management (news, events, downloads).
- User management.
- Market management (products, categories, merchants).
- Event management.

### Platform-Wide Requirements
- Responsive design (mobile, tablet, desktop).
- SEO-friendly.
- Fast loading.
- Multi-language: English, French, Kinyarwanda, Swahili.
- WhatsApp chat entry point.
- Email notifications for key events (order placed, account created).
- Google Maps embed on Contact page.

## Scope

### In Scope (target build)
- Public content pages (About, Team, Founders, Ambassadors, Industry
  Alliance, Events, News, Downloads, Contact).
- Marketplace with real product data, search, and categories.
- Guest checkout — order placement without registration or login.
- Optional member registration/login for order history and perks.
- Merchant product management.
- Admin portal for content/inventory management (upload/delete
  products, post news) and market management.
- USD-to-Pi conversion at the fixed GCV rate, applied consistently
  across product display, cart, and checkout.
- Multi-language support for at least the four listed languages.

### Out of Scope (not part of this build)
- Real cryptocurrency settlement or custody of actual Pi Network
  assets. **Open question — see below.**
- Payment gateway integration beyond what "paying in Pi" is defined
  to mean. **Open question — see below.**
- Native mobile apps.
- Advanced enterprise permission tiers beyond
  visitor / member / merchant / admin.

## Open Product Questions

These need answers before backend and payment work can be scoped
accurately. Do not let implementation proceed past a mock/simulated
payment flow until these are resolved — track resolution in
`progress-tracker.md`.

1. Does "Pi" refer to Pi Network's cryptocurrency, or an internal
   points/loyalty unit the alliance controls and names "Pi"? This
   determines whether payment is a real crypto integration or an
   internal ledger.
2. Who sets and updates the GCV = 314159 rate, and how often?
3. Is there a real payment processor in scope for this build, or is
   "checkout" a simulated/manual-confirmation flow for the first
   release?
4. What is the actual content volume expected at launch (how many
   founders, ambassadors, alliance members, products) — this affects
   whether admin CRUD tooling is a launch requirement or can be
   seeded manually.

## Success Criteria

1. A visitor can browse all public content sections without an account.
2. A visitor can browse the market and complete a checkout flow with
   USD/Pi pricing displayed correctly — **without registering or
   logging in.**
3. A visitor can optionally register as a member to get order history
   and other member perks.
4. A merchant can create and manage their own product listings.
5. An admin can manage inventory (upload/delete products), post news,
   and manage users, market listings, and events from the admin
   portal.
6. All public-facing content is available in the four supported
   languages.
7. The site is responsive and passes basic SEO checks (meta tags,
   semantic structure).
