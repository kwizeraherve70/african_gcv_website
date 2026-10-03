# UI patterns

These Team patterns follow the already approved theme and existing admin forms. Recorded 2026-10-01 after implementation review; this is not a redesign of unrelated pages.

## Team editor controls

Files: `front-end/src/app/components/admin/TeamEditorFields.tsx`, `pages/admin/AdminTeam.tsx`, `pages/admin/AdminTeamPersonForm.tsx`.

| Element | Pattern |
| --- | --- |
| Cards | bg-card, border border-border, rounded-2xl, p-5 or p-6 |
| Inputs | bg-background, border-border, rounded-xl, px-3 py-2.5, text-sm |
| Focus | focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple |
| Primary button | bg-brand-purple text-white rounded-xl px-4 py-2.5 text-sm font-semibold; hover:bg-brand-purple-light |
| Secondary button | border-border rounded-xl; hover:bg-accent |
| Supporting text | text-muted-foreground, text-xs or text-sm |
| Selected language | bg-brand-purple/10 text-brand-purple border-brand-purple/30 |
| Error notice | bg-destructive/10 text-destructive rounded-xl px-4 py-3; role=alert |
| Success notice | bg-brand-green/10 text-foreground; role=status |

Labels associate with inputs; photo source choices are radio inputs in a fieldset. Buttons preserve visible focus states. Reordering uses labeled up/down buttons rather than requiring drag gestures. Current photo stays visible while a replacement is prepared.

## Public Team states and portraits

Files: `front-end/src/app/components/team/TeamContentState.tsx`, `TeamPortrait.tsx`, `pages/Team.tsx`.

| Element | Pattern |
| --- | --- |
| Loading | text-sm text-muted-foreground; rounded-2xl bg-brand-surface skeletons with motion-safe:animate-pulse |
| Error panel | my-6 rounded-2xl border border-border bg-card p-6 |
| Retry | rounded-xl bg-brand-purple px-4 py-2 text-sm font-semibold text-white; visible outline |
| Portrait fallback | bg-brand-surface text-muted-foreground, person-specific accessible image label, existing card geometry |
| Directory cards | bg-card border-border rounded-2xl, p-5/p-6, brand-purple roles and muted biography text |

No new theme tokens or foundation component changes were needed.
