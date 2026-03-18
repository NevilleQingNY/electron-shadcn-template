# CLAUDE.md

## Commands

```bash
pnpm dev             # Start dev server (run manually, never auto-run)
pnpm build           # Build app
pnpm lint            # Biome check
pnpm lint:fix        # Biome auto-fix
pnpm typecheck       # TypeScript type check
pnpm test            # Run tests
pnpm test:watch      # Watch mode
pnpm db:generate     # Generate Drizzle migrations (run after schema changes)
pnpm db:reset        # Reset database (delete DB + build cache, restart dev after)
```

## Rules

### Development Flow

- TDD: write tests -> write data layer (Repository + IPC) -> connect frontend
- Debug by confirming root cause before changing code
- Run `pnpm typecheck` after modifying imports or deleting files
- After schema changes: `pnpm db:generate` (generate migration) -> `pnpm db:reset` (delete DB) -> restart dev

### UI Rules

- **Only use shadcn components** - never use raw `<button>`, `<input>`, etc.
- **Only use Tailwind CSS** - no `style={}` inline styles, no custom CSS
- **Minimal design** - no extra borders, shadows, or decorations; use shadcn defaults
- **Never modify `ui/` directory** - shadcn components are auto-generated
- Install new components: `pnpm dlx shadcn@latest add <name>`, then remove `"use client"`
- shadcn style: **base-nova** (Base UI, not Radix)

### Code Rules

- No barrel file imports - import from specific file paths
- Schema: only add confirmed fields, no speculative design
- UI text in English, concise wording
- Product design decisions go in `schema/index.ts` top comments

### Naming Conventions

- **Verb+Noun, no bare verbs** - `loadTasks`, `openDatePicker`, `handleToggleComplete`
- **Boolean values: `is/has/should` prefix** - `isPinned`, `isEditMode`, `hasPinnedItems`
- **Temp variables use entity names** - `fetchedTask`, `newName`; no `data`/`value`/`result`; no single-letter vars
- **Actions hook returns `handle<Verb><Noun>`** - `handleToggleComplete`, `handleRename`
- **Detail hook returns bare verb** - `rename`, `deleteProject` (context is clear from `detail.rename()`)
- **Callback props** - events: `on<Event>` (`onMutated`), actions: `handle<Action>` (`handleRename`)
- **Store methods** - `load<Entity>`, `open<Dialog>`, `confirm`/`prompt`
- **Draft state: `draft` prefix** - `draftName`, `draftDescription`
- **Route hook destructure uses entity name** - `const taskDetail = useTaskDetail(id!)`

## Architecture

Electron + React 19 + TypeScript + Tailwind v4 + shadcn/ui (base-nova)

### Process Structure

```
src/
├── main/              # Main process (entry, database, windows)
├── preload/           # Preload (contextBridge API)
├── renderer/          # Renderer process
│   ├── features/      # Feature modules (components + hooks + stores colocated)
│   ├── components/
│   │   ├── ui/        # shadcn components (auto-generated, do not edit)
│   │   ├── layout/    # Global layout, providers
│   │   ├── common/    # Reusable business components
│   │   └── modals/    # Global modals (confirm, prompt, date-picker)
│   ├── routes/        # Pages (thin shells, compose features)
│   ├── hooks/         # Shared hooks
│   ├── stores/        # Cross-feature stores
│   └── lib/           # Utilities
├── shared/
│   ├── schema/        # Drizzle table definitions (single source of truth)
│   └── validators.ts  # Zod schemas + input types
└── lib/electron-app/  # Electron utilities
```

### Feature Organization

- **Features are flat** - no nested subdirectories, filenames are self-describing
- **No cross-feature imports** - compose in `routes/` layer
- **Start in feature, extract to common when truly reused**
- **Store named `store.ts`** - internal `./store`, external `renderer/features/<name>/store`
- **`routes/` is thin shell** - only composes features, no business logic

### Data Flow

- Types: `schema.ts` -> `$inferSelect/$inferInsert` -> `validators.ts` -> `z.infer`
- Renderer calls main process via `window.api.xxx()`

#### Three-Layer Architecture (Repository -> Hook -> Component)

```
Repository (main process)    <- Data access layer (CRUD)
    ↓ IPC
Hook (useTasks etc.)         <- Business logic (API calls + side effects)
    ↓ Returns data and methods
Component                    <- Pure UI (renders + calls methods)
```

#### Component Design Patterns

| Layer | Pattern | Example |
|-------|---------|---------|
| Visual primitive | Pure Display (zero state, props-driven) | Checkbox, StatusRing |
| Business entity | Self-Contained + Headless Hook | ItemRow + `useItemActions(item, onMutated)` |
| Detail view | Fat Hook + Thin Component | ItemDetail + `useItemDetail` |
| Page | Orchestrator (compose features, pass `onMutated`) | HomePage |

**Headless Actions Hook Pattern**:
- Hook takes `(entity, onMutated?)` -> returns all interaction handlers
- Internally handles: modal orchestration -> API call -> side effects -> `onMutated?.()`
- Component consumes hook, parent only passes `data` + `onMutated={reload}`

#### State Management (Zustand)

| Data Scenario | Approach | Refresh Strategy |
|---------------|----------|------------------|
| Single page data | Page-level hook (`useState`) | `setState` within page |
| Cross-component shared | Zustand store + `load<Entity>()` | After mutation, call `store.load<Entity>()` |
| Global UI state (modals) | Zustand store | Direct `set` |

- **No TanStack Query** - local SQLite has no latency, no need for cache/retry/stale
- **Data sync rule: reload the store for whatever table the backend modified**

### Path Aliases

`renderer/` -> `src/renderer`, `shared/` -> `src/shared`, `lib/` -> `src/lib`, `~/` -> project root

### Documentation

```
docs/
└── guides/    # Reusable engineering guides (component patterns, etc.)
```

## Design Context

### Users
People with scattered attention who need a frictionless place to dump thoughts and tasks daily. They open the app at the start of their day, jot things down, drag them where they feel right, and move on. They don't want to manage — they want to do.

### Brand Personality
**Elegant, Calm, Effortless** — Quiet confidence. Like a well-made notebook — says nothing, invites everything. The user should feel relief and clarity, not anxiety about unfinished items.

### Aesthetic Direction
- **Visual tone**: Refined minimalism with warmth. Things 3-level polish — every pixel intentional, nothing decorative for decoration's sake.
- **Reference**: Things 3 (spacing, restraint, subtle depth, premium feel)
- **Anti-references**: Jira/Asana (overwhelming complexity), Todoist (rigid list structure). Never feel like a "productivity tool" — feel like a piece of paper.
- **Theme**: Light + dark. Grayscale foundation with subtle warm accents (amber/sand) for interactive elements.
- **Typography**: Geist Sans. Use weight and size for hierarchy, not color or decoration.
- **Spacing**: Generous. White space is a feature.
- **Motion**: Subtle, purposeful. Cards feel physical — smooth drags, gentle snaps. No bouncy or flashy.

### Design Principles
1. **Invisible interface** — Chrome recedes, content dominates. If you can remove it without losing function, remove it.
2. **Warmth through restraint** — Warm accents sparingly (amber active states, sand hovers). Never saturated, never competing with content.
3. **Physical metaphor** — Cards are real objects on a desk with weight, movement, and space. The whiteboard is a surface, not a list.
4. **Respect for time** — Each day is finite. Bounded canvas, not infinite scroll.
5. **Premium in the details** — Micro-interactions define the brand: how cards appear, settle after drag, how checkboxes feel.
