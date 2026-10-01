# Team directory operations

## Editing content

Sign in as an ADMIN and open `/admin/team`. People controls names, shared current titles, portraits, visibility and section-specific biographies. Ordering controls cards in each section. Departments and Page wording manage their own four-language content. Empty French, Kinyarwanda or Swahili fields use English fallback. Home/About share the saved names, photos and current titles; their longer narratives remain separate.

Use **Upload photo** for JPEG, PNG or WebP files up to 5 MB, or **Photo URL** for a public HTTPS image. Files are decoded and validated before uploading to Cloudinary. A saved replacement appears on fresh page reads. Existing images remain available for rollback; hiding a person also hides their matching Home/About profile. Version conflicts retain the editor draft and require review against fresh content.

## Initial content import

Run from `backend/` in a complete checkout, with the intended environment's `DATABASE_URL` and existing Cloudinary configuration. The importer reads the two original portraits from `front-end/src/assets`, so the backend-only deployment image is not sufficient for this one-time operation.

```sh
npm ci
npm run build
npm run seed:team -- --dry-run
# After the additive migration is deployed and a database backup is verified:
npm run seed:team -- --apply --media-cache /private/path/team-media-receipts.json
```

Dry-run validates 14 people, 16 placements and six departments without database writes or uploads. Apply inserts missing stable slugs and department keys; repeated imports preserve saved edits. The singleton page content is imported only at its initial version. Media receipts make interrupted portrait imports repeatable. Keep receipts and credentials outside version control.

## Validation and release order

Run `npm run test:team` in `backend/`. HTTP integration tests require a disposable localhost PostgreSQL database whose name contains `gcv_team_test`; see `tests/team.integration.ts` for its environment contract. Never point integration tests or the general seed at production.

1. Verify a production database backup and the prior frontend deployment.
2. Publish the backend and observe Railway SUCCESS for the exact commit. Startup runs the pinned Prisma migration command and stops if it fails.
3. Apply the dedicated Team import. Verify counts, Doris-first ordering, all four locales and both official portrait URLs before switching the frontend.
4. Verify the Vercel preview with the isolated test API. Browser automation may forward preview API requests to the local disposable API; document that forwarding rather than claiming a separately hosted staging backend.
5. Publish the frontend, observe Vercel READY and verify its production alias. Check Team/Home/About and admin editing with a temporary record, then hide that record. Preserve original leaders.

The isolated release checks cover auth roles, import parity/reruns, stale writes, photo validation, real Cloudinary uploads, locale fallback, ordering, hide/restore, error states and desktop/mobile layouts. Vite build is not a standalone TypeScript-check claim. Existing framework build warnings and unrelated layout issues remain outside this feature.

## Rollback and media retention

Restore the previous frontend deployment if necessary; the additive Team tables can remain. Retain original source portraits and the pre-migration backup. Do not run destructive down-migrations or restore a full database over newer orders without a separately reviewed recovery plan.

Failed saves delete a new owned upload only when rollback is confirmed. An uncertain commit or failed cleanup logs the owned public ID for reconciliation; check that ID against database references before any later removal. Previous uploaded photos are deliberately retained. There is no automatic orphan cleanup in this release. Any future cleanup must be an explicit reviewed operation, scoped to server-owned IDs and reconciled against current references and retained rollback data. External URLs are never deletion candidates.
