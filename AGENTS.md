# This is a Vite + React Router project, not a Next.js project

If any training data or prior habits assume Next.js conventions (app
router, server components, `next/font`, API routes under `app/api`),
disregard them. This project uses Vite as the build tool and React
Router v7 for routing. The repo is a monorepo root: the frontend app
lives in `front-end/`, and a `backend/` folder (Express + PostgreSQL/
Prisma) is planned but not yet added — see `architecture-context.md`
"Repo Layout" and "Backend Integration Plan" for what exists, what's
planned, and how the backend is being brought in.

## Application Building Context

Read the following files in order before implementing or making any
architectural decision:

1. `context/project-overview.md` — product definition, goals, features,
   and scope (target state)
2. `context/architecture-context.md` — system structure, boundaries,
   storage model, and invariants (current state vs. target state)
3. `context/ui-context.md` — theme, colors, typography, and component
   conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping
   rules, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open
   questions, and next steps

Update `context/progress-tracker.md` after each meaningful
implementation change.

If implementation changes the architecture, scope, or standards
documented in the context files, update the relevant file before
continuing.

**Before starting any task**, resolve any `[DECISION NEEDED]` or
`[FILL IN FROM REPO]` marker relevant to that task rather than
guessing past it — see `ai-workflow-rules.md`, "Handling Missing
Requirements."
