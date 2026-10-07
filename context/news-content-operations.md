# News and announcements import

The owner requested migration of eight existing articles and three announcements
from `mockData.ts`. The snapshot in `backend/prisma/seeds/news-content.json`
preserves their text, HTML, dates, slugs, image URLs, categories, countries,
authors, view counts, and priorities. This migrates the supplied content; it
does not independently verify or rewrite historical claims.

Articles use the existing News API and admin editor. Announcements use the new
Announcement model and public `GET /api/announcements`. No announcement admin
editor is introduced. Press releases and country navigation metadata remain
unchanged. Neither imported entity has a frontend static fallback.

Deploy the backend first. Its startup applies the additive migration
`20261005200000_add_announcements`. From `backend/`, with the intended
environment's `DATABASE_URL`, run:

```sh
npm run seed:news -- --dry-run
npm run seed:news
npm run seed:news -- --dry-run
```

Use this dedicated importer, not the general account/catalog seed. It is
transactional and insert-only. Stable IDs prevent duplicates even after an
imported article's slug changes. Existing article slugs are also skipped.
Existing admin edits, counters and content are preserved. Dry run writes
nothing and requires the schema migration first. This is not a startup hook:
manually rerunning the importer after deleting an imported item restores it.

Deploy the frontend after importing. Check `/news/all`, its announcements tab,
country filters, original article URLs and Home's latest-news cards. HTML
continues through the existing sanitizer.

Local tests require a disposable localhost database named `gcv_news_test`.
Apply migrations and run `npm run test:news`. Tests cover source parity,
zero-write dry run, rerun preservation, public routes and authorization.

Rollback application code if necessary while retaining the additive table and
imported content. Do not reset the production database to roll back this change.
