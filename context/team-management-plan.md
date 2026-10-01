# Team management implementation plan

Approved 2026-09-30. Implementation in progress; see team-api-contract.md for the agreed wire contract.
Audited commit: fbfe9dd2fdb14ddaf8697da185947e1b10e433b8.

## Outcome

Make `/team` editable from an ADMIN-only Team dashboard: people, photos, roles, biographies, section membership, order, visibility, departments, and page wording. The owner confirmed that matching names, photos and current titles on Home/About must use the same backend records. Longer Home/About biographies remain a separate content feature.

Keep React/Vite/React Router, Express/tsoa, Prisma/PostgreSQL, JWT auth, Cloudinary, Railway and Vercel. Published edits appear on a fresh public API read without another frontend deployment.

## Audit findings

Chrome inspection of the live page and source review confirmed:

| Area | Current content |
| --- | --- |
| GCV Core Team | Hero heading, not a fourth people collection |
| Global Leadership | 2 placements: Doris then Olivier |
| Founders | 8 placements: Doris, Olivier, Emmanuel Traoré, Grace Mwangi, Pierre Mbeki, Marie Lefebvre, James Osei, Fatima Al-Hassan |
| Department Teams | 6 placements: Daniel Nkala, Baikoketsi Modongo, Rakgadi Gontse, Amara Diallo, Chioma Okafor, Kwame Asante |
| Total | 14 unique people, 16 placements, 6 departments |

Departments: Ambassadors, Education, Ecosystem, Finance, Communications, Events. Their pills are currently labels rather than filters.

Critical preservation details:

- Only IDs 1/Olivier and 2/Doris refer to the same people across `teamMembers` and `founders`. IDs 3–8 collide across DIFFERENT people. Use explicit collection/ID-to-person mappings; never merge by numeric ID or photo URL.
- Doris displays Global in Leadership and China/Asia in Founders. Olivier has different descriptions in those sections. Preserve placement-specific content.
- Import the resolved English/French/Kinyarwanda/Swahili leadership text from `about.json`, not only English mock objects. Other existing English-only records use English fallback.
- Two official local portraits are `front-end/src/assets/doris.jpeg` and `olivie.jpeg`; 12 other people use seven distinct Unsplash URLs. Preserve existing remote images without calling them verified official portraits.
- Preserve Doris-first ordering in both sections and `/team#founders` / `/about#olivier-ndatimana` links.

Vercel MCP and GitHub CLI access were verified. Railway CLI is authenticated; no Railway MCP tools were exposed. Vercel deployment dpl_BfsVS5WsMNLR8hXPs9KKFQBiDW3F is READY and Railway deployment 163b1da9-6389-4386-8128-d709544851f3 is SUCCESS, both at the audited commit.

## Proposed data model

| Model | Fields |
| --- | --- |
| TeamPerson | UUID, unique stable slug/import key, name, default country/location, localized current primary/secondary titles, photo source and URL, nullable owned Cloudinary IDs, internal profile link, published/hidden state, version, timestamps |
| TeamPlacement | Person FK, section enum, optional department FK, location override, founder region, order, visibility, localized role/secondary-role overrides and biography |
| TeamDepartment | Stable key, localized name, order, visibility, version/timestamps |
| TeamPageContent | Singleton, localized hero/section/SEO wording, version and directory revision |

Use validated JSON locale objects for this small directory, with English required and field-level fallback from missing FR/RW/SW values. Validate shapes at API boundaries; keep plain text rather than arbitrary HTML. Preserve unedited translations. Reuse shared person titles unless a placement explicitly overrides them. Each displayed role selects the primary title, secondary title, or an explicit custom role. Import Doris/Olivier cards linked to their shared current titles rather than copying title strings; their Founders cards select the shared secondary title. Require complete English fields before publication.

Enforce one placement per person per section initially; department required only for Department Teams. Validate regions, relations and internal profile links. Index section/order and use stable tie-breaks. Hide/restore instead of permanent deletion. Hidden people hide all appearances; hidden placements hide only that card; hidden departments hide their groups.

Use conditional version checks for edits. Any placement change also increments its person version. Reorder validates the complete section list and updates atomically against the directory revision so concurrent edits cannot silently overwrite ordering.

## API and photos

Public GET `/api/team?locale=en` returns one consistent published snapshot with page wording, departments and ordered populated placements. Public GET `/api/team/people/slug/{slug}?locale=en` supplies shared profile fields for Home/About. Admin list/detail/create/update routes live under `/api/admin/team`, including people, departments, page wording and section ordering. Use existing response envelopes, controller/service boundaries, generated tsoa routes, and raw-JWT Authorization convention. All admin reads/writes/uploads require ADMIN on the server.

For a coherent Save action, use a Team-only multipart body: one explicitly JSON-encoded `payload` plus optional single `photo` file. Photo action is KEEP, UPLOAD or URL; reject conflicting sources. Existing `toFormData` uses String(value) and corrupts nested objects, so Team needs its own serialization. Authenticate before the bounded parser; validate metadata/image before Cloudinary upload; commit person, placements and photo metadata in one Prisma transaction. Test generated middleware order.

The editor offers Upload photo / Photo URL with current and replacement previews. Proposed upload limits: one JPEG/PNG/WebP, 5 MB, actual image signature/decodability and dimension checks, bounded text fields and upload request limits. Reuse the configured Cloudinary client/account and a dedicated `KHM/team` folder. Store returned HTTPS URL and server-owned public/asset IDs. Each replacement gets a new ID. See [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference).

URL mode stores a public HTTPS direct-image link, including existing URLs, without copying it to Cloudinary. Allow CDN query strings and extensionless images. Reject unsafe schemes, embedded credentials and private/localhost literal destinations. Preview in the browser; do not add an unrestricted backend URL fetch. Public cards need an accessible broken-image fallback.

Failure handling: Cloudinary and PostgreSQL do not share a transaction; this is a compensated save. Retain previous data/photo on upload or confirmed database failure. Clean a new owned upload after a confirmed failed commit. If the commit outcome is uncertain, retain the asset and reconcile database references before any deletion. Keep previous owned images for rollback; use an explicit audited maintenance command for later unreferenced-asset cleanup, not an in-process timer. Never delete externally supplied URLs or infer ownership from a Cloudinary hostname. Archive keeps its photo. Cancel performs no upload.

## Admin and public UI

Add Team navigation, a people list/editor, four locale tabs, section assignments, accessible Move up/down controls, department management and page wording editor. Reuse existing admin form patterns and theme tokens. Compose a Team photo chooser without changing Products/News behavior. Preserve edits on errors; show missing translations and explicit title overrides. New people may be saved hidden; publishing/editing does not need an extra approval workflow.

Add typed `api/team.ts`, runtime response validation and locale-aware fetching. Remove Team mock imports, special numeric-ID title overrides and hardcoded department keys. Fetch shared name/photo/current-title fields for Home/About too. Keep layout/icons/interface labels in React/i18next. Longer narratives remain outside this editor. Hide the matching Home/About profile block when its person is unpublished, while distinguishing an API outage from an intentionally hidden profile.

Provide loading, empty, retryable error and broken-image states. Never silently restore static people on API failure. Refetch after saves and navigation/refresh; avoid long-lived CDN caches initially. Ignore stale language responses. Scroll to hash anchors after asynchronous content renders.

## Migration and rollout

1. Freeze payload/response contracts and create a reviewed manifest: 14 people, 16 placements, 6 departments, resolved translations, all biographies and original image sources.
2. Add only new Prisma tables; regenerate routes/client and build. Test migration/API against an isolated database.
3. Create a dedicated `seed:team` importer whose dry-run performs no uploads or writes, with stable source keys and insert-only reruns. Never overwrite admin edits or invoke the general seed, which also changes accounts and demo products.
4. Upload the two original JPEGs once into Cloudinary, retaining a retry manifest. Preserve external URLs. Never store Vite hashed build paths as permanent DB URLs. Keep original assets through rollback.
5. Deploy additive backend/schema on Railway; verify migration success and deployment SUCCESS. Run the dedicated import and verify all content before switching the public frontend. Use the repository-pinned Prisma `migrate deploy`, not a newer major-version workflow.
6. Test a Vercel preview against an isolated backend/database. Existing production CORS excludes preview domains; allow only the chosen test origin on the test backend.
7. Deploy frontend, verify Vercel READY and production alias, then check admin-to-public changes using a temporary test record and preserve real leaders. Record evidence and deployment IDs on GitHub.
8. Keep prior frontend deployment, original assets and a DB backup/export for rollback. Additive tables can remain during rollback; avoid destructive down-migrations.

`backend/start.sh` currently lacks fail-fast behavior after migrations. Make migration failure stop startup and verify actual Railway start/build settings before release. Reconcile touched stale context notes during implementation.

## Parallel implementation

| Worker | Responsibility |
| --- | --- |
| Backend agent | Models/migration, API, authorization, validated media save, service/API tests |
| Admin agent | People/department/page forms, locale tabs, upload/URL chooser, ordering |
| Public/data agent | Preservation manifest, public API integration, locale mapping, Home/About shared fields |
| Lead | Contract ownership, importer integration/execution, shared routes/docs, review, releases and verification |

Use three workers plus the lead. Freeze contracts first, then work concurrently in separate files. Backend owns schema/media utility; lead coordinates shared API/routing changes. Reuse freed agents for independent migration/media and browser review. Release backend → import/verify → frontend sequentially.

## Acceptance checks

- Exact import parity; repeat import neither duplicates records nor overwrites edits.
- Shared names/photos/current titles update all placements and matching Home/About fields; placement-specific content stays independent.
- Both image modes persist through refresh; file uploads reach Cloudinary and existing official portraits use durable URLs.
- Invalid/mixed sources, unauthorized uploads, stale saves, oversized files, upload/DB failures and cleanup failures behave correctly.
- Public API excludes hidden records; ADMIN succeeds and anonymous/MEMBER/MERCHANT mutations fail.
- Four-language round-trips/fallback, independent ordering, departments and page wording work without frontend redeployment.
- Direct links, anchors, mobile layouts, error states and existing Products/News uploads remain correct.
- Backend build/generated routes, frontend build and focused integration/browser tests pass. Vite build is not a TypeScript-check claim; frontend currently has no configured checker.

## Main implementation references

`front-end/src/app/pages/Team.tsx:26` (record overrides), `:44` (anchor scrolling); `data/mockData.ts:380`; four `i18n/locales/*/about.json` files; `pages/About.tsx:183`; `pages/Home.tsx:345`; `components/admin/ImageUploadField.tsx:9`; `api/client.ts:58`; `pages/admin/AdminLayout.tsx:5`; `routes.tsx:58`; `backend/src/controllers/NewsController.ts:55`; `backend/src/utils/cloudinary.ts:12`; `backend/prisma/schema.prisma`; `backend/prisma/seeds/index.ts`; `backend/start.sh:16`.
