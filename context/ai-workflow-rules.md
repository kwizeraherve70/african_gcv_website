# Development Workflow

## Approach

Build this project incrementally using a spec-driven workflow. Context
files define what to build, how to build it, and what the current
state of progress is. Always implement against these specs — do not
infer or invent behavior from scratch.

`project-overview.md` and `architecture-context.md` describe the
**target product** — where this build is going, including pieces
(backend, real auth, real payments) that do not exist yet.
`progress-tracker.md` is the only file that describes what's actually
been built so far. Before starting any unit of work, check the
tracker to confirm whether the thing you're about to build on top of
actually exists yet, or is still target-state.

## Scoping Rules

- Work on one feature unit or subsystem at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation
  step.

## When To Split Work

Split an implementation step if it combines:

- UI changes and backend/data-layer changes (especially relevant while
  the mock-data-to-real-API migration is in progress).
- Currency/conversion logic changes and unrelated UI changes.
- Multiple unrelated pages or routes.
- Behavior that is not clearly defined in the context files.

If a change cannot be verified end to end quickly, the scope is too
broad — split it.

## Handling Missing Requirements

- Do not invent product behavior that is not defined in the context
  files. This applies especially to anything touching the "[DECISION
  NEEDED]" items in `architecture-context.md` and the "Open Product
  Questions" in `project-overview.md` — do not pick a backend stack,
  a payment mechanism, or a Pi-settlement approach on your own and
  start building against it.
- If a requirement is ambiguous, resolve it in the relevant context
  file before implementing.
- If a requirement is missing, add it as an open question in
  `progress-tracker.md` before continuing, rather than guessing and
  moving on.

## Integrating Pre-Existing External Code

This applies when bringing in a codebase authored outside this
project (e.g. an existing backend from another project) rather than
building a subsystem from scratch — see `architecture-context.md`
"Backend Integration Plan" for the current live case.

- Audit stack compatibility against what's already decided in
  `architecture-context.md` before adapting or wiring up a single
  file. Do not assume the external code matches this project's stack
  (Express/PostgreSQL/Prisma/better-auth/Cloudinary) — verify it.
- If the external code conflicts with an already-recorded decision
  (different ORM, different auth library, different asset storage),
  that's a fork requiring an explicit choice — migrate the external
  code to match, or record the decision as reopened. Do not let two
  competing implementations of the same concern (e.g. two auth
  systems, two ORMs) coexist silently.
- Bring it in and verify incrementally, one subsystem at a time (per
  "Scoping Rules" above), not as a single large merge of the whole
  external codebase.
- Update `architecture-context.md` and `progress-tracker.md` as each
  subsystem's compatibility is actually assessed — do not leave the
  plan section stale once real audit work happens.

## Handling the Mock-Data-to-Backend Transition

- Do not extend `mockData.ts` with new fields for features that are
  meant to become backend-driven — this is a one-way migration, and
  every addition to mock data increases the size of that migration
  later.
- When a feature's real backend dependency doesn't exist yet, prefer
  building the UI against a typed interface that mirrors the intended
  API contract, so the swap from mock to real data is a data-source
  change, not a rewrite.
- Once a backend decision is made and recorded in
  `architecture-context.md`, treat "replace this mock-data section
  with real API calls" as its own tracked unit of work per entity
  (e.g. products, then news, then events) — not one large rewrite.

## Protected Foundation Components

Do not modify generated third-party foundation components unless
explicitly instructed.

This includes:

- `front-end/src/app/components/ui/*` (shadcn-style Radix wrappers)
- third-party library internals

These should remain default and reusable. Project-specific styling,
layout changes, and feature logic must be implemented in app-level
components instead of modifying foundation components.

Only modify these files when a task explicitly requires it.

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries (especially resolving a
  `[DECISION NEEDED]` item)
- Storage model decisions
- Code conventions or standards
- Feature scope
- UI tokens, once real values are confirmed from `theme.css`

Progress state must reflect the actual state of the implementation,
not the intended state.

## Before Moving To The Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture-context.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. Any `[FILL IN FROM REPO]` or `[DECISION NEEDED]` marker touched by
   this unit of work has been resolved and updated in place, not left
   stale.
