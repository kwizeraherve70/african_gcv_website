# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input (form input, eventually API
  responses) at system boundaries before trusting it.
- Use `interface` for object contracts (matches existing mock data
  typing conventions — check `mockData.ts` for the current shape
  before introducing a parallel type for the same entity).

## React / Vite

- Function components with hooks; no class components.
- `CartContext.tsx` is the only global state in the app today — do not
  introduce a second global state mechanism (e.g. a state management
  library) without recording that decision in `architecture-context.md`
  first. If a feature seems to need broader shared state, treat that
  as a signal to discuss scope, not a reason to quietly add a new
  pattern.
- Keep components colocated with the route/page they serve unless
  they're genuinely reused across multiple pages.
- Side effects (data fetching, once a backend exists) belong in
  hooks or loader functions, not scattered inline in render logic.

## Routing (React Router v7)

- Route definitions live in one place — do not scatter route path
  strings as literals across multiple files; reference a shared
  route constants module if one exists, or create one before adding
  more than a couple of routes that need to link to each other.
- Route-level components handle page composition; business logic
  belongs in hooks or shared modules, not inline in the route
  component.

## Styling

- Use CSS custom property tokens defined in `front-end/src/styles/theme.css`,
  referenced through their Tailwind utility names — no raw hex values,
  no default Tailwind palette classes.
- If a needed token doesn't exist yet, add it to `theme.css` first
  rather than hardcoding around it.
- Follow the border radius scale once defined in `ui-context.md`.
- **Known current violation:** `Home.tsx` still has raw hex values —
  `#FBBF24`/`#7C3AED`/`#5B21B6` in an inline SVG gradient (these do
  match `--brand-gold`/`--brand-purple-light`/`--brand-purple` and
  should be swapped for the tokens or CSS variables), and `#25D366`
  for the WhatsApp brand green, which has no token yet. Fix opportunistically
  when next touching `Home.tsx`; not urgent enough to warrant a
  standalone pass on its own.

## Data Layer

- **Current state:** all data comes from `front-end/src/app/data/mockData.ts`.
  Match the existing shape of an entity there before adding fields —
  check for the type before assuming one doesn't exist.
- **Target state:** once a backend exists, new features should be
  built against real API calls, not new additions to `mockData.ts`.
  See `architecture-context.md` for the backend decision status.
- Do not silently mix mock data and real API data for the same entity
  type within one feature — pick one per entity and note the
  transition point in `progress-tracker.md`.

## File Organization

- `front-end/src/app/components/` — UI composition only; no business logic.
- `front-end/src/app/components/ui/` — protected shadcn/Radix wrappers; do not
  modify directly (see `ai-workflow-rules.md`).
- `front-end/src/app/context/` — global state (currently just `CartContext.tsx`).
- `front-end/src/app/data/` — mock data today; will be phased out as real data
  sources come online.
- `front-end/src/styles/` — `theme.css` and any other global styling.
- Name files after the responsibility they contain, not the
  technology (e.g. `ProductCard.tsx`, not `Card.tsx`, if it's
  product-specific).

## Currency Handling

- The USD-to-Pi conversion rate (GCV = 314159) must be read from a
  single shared constant, not duplicated as a literal across
  components. If this constant doesn't exist yet, create it in a
  shared module (e.g. `front-end/src/app/lib/currency.ts`) the first time
  conversion logic is needed, rather than inlining the number.
- Always display currency values with an explicit unit label (USD or
  Pi) — never an unlabeled number.
