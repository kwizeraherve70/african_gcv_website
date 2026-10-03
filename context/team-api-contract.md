# Team contract — implementation agreed 2026-09-30

The canonical frontend wire interfaces are `front-end/src/app/types/team.ts`; backend mirrors them in its own Team DTO module (do not import frontend code from backend). All responses use existing `{statusCode,message,data}` envelopes. Public content can be read anonymously; all admin endpoints require ADMIN. Error responses have a message and appropriate HTTP status.

- GET /api/team?locale=en -> PublicTeamSnapshot (unsupported locale falls back to en).
- GET /api/team/people/slug/{slug}?locale=en -> PublicTeamPerson; hidden/unknown =404.
- GET /api/admin/team -> AdminTeamSnapshot (includes hidden records, all locales).
- GET /api/admin/team/people/{id} -> AdminTeamPerson.
- POST /api/admin/team/people, PUT /api/admin/team/people/{id} -> AdminTeamPerson. TeamPersonInput encoded as single multipart `payload` JSON string plus optional single `photo`. No automatic extra content-type header. Create omits version; updates require version. Slug immutable after creation. The complete placements list replaces that person's placements. Empty optional localized fields use `{en:''}`.
- POST /api/admin/team/departments, PUT /api/admin/team/departments/{id} -> AdminTeamDepartment. JSON {key,name,sortOrder,visible,version?}; key immutable, update requires version.
- PUT /api/admin/team/sections/{section}/order -> AdminTeamSnapshot. JSON {ids:string[],directoryVersion:number}; ids are ALL placements in this section (including hidden) exactly once.
- PUT /api/admin/team/departments/order -> AdminTeamSnapshot. JSON {ids:string[],directoryVersion:number}; all department IDs exactly once. Register literal route before /{id}.
- PUT /api/admin/team/page -> AdminTeamPage. JSON {copy:TeamPageCopy,version:number}.

Four Prisma models named TeamPerson, TeamPlacement, TeamDepartment, TeamPageContent. Field names match wire types. TeamPageContent singleton `id='team'`, `copy` JSON, `version` int and `directoryVersion` int. TeamPerson additionally retains private nullable cloudinaryPublicId/cloudinaryAssetId plus timestamps; never expose owned IDs publicly. TeamPlacement additionally has personId FK. UUIDs for other IDs; JSON columns for LocalizedText. Public role sources resolve PRIMARY/SECONDARY from person fields, CUSTOM from placement, NONE to ''. Founder Doris/Olivier titleSource=SECONDARY, no duplicated canonical titles. Shared slugs `doris-yin` and `olivier-ndatimana`.

All mutations bump directoryVersion; person/placement mutations bump person version. Reorder bumps versions of affected people. Page copy save checks its own version. Public reads consistent. Transactions include expected-version checks. TeamPerson published requires a photo, primary English title and full name; visible placements on published person require English bio and selected title content. Department English name and required page copy fields enforced. Photo create KEEP may save hidden draft only. KEEP/URL reject any file; UPLOAD requires file and rejects URL. Multipart metadata/file limitations and actual-image checks apply before Cloudinary upload. Preserve all locale fields; empty non-English fallback to English.

Root owns shared frontend types/API wrapper, routes/navigation, docs, importer and integration tests. Backend agent owns backend models/controller/service/media validation/migration and tests. Admin agent owns new Team admin pages/components. Public agent owns Team/Home/About integration and hooks plus import manifest extraction (coordinate with root). No agent pushes, deploys, runs production seeds or changes live data independently.
