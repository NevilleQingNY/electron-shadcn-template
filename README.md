# Electron + shadcn Template

A clean, production-ready Electron project template with a modern React stack.

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Electron 39 |
| **UI** | React 19 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui (base-nova style, Base UI) |
| **State** | Zustand 5 |
| **Database** | SQLite (better-sqlite3) |
| **ORM** | Drizzle ORM |
| **Validation** | Zod 4 |
| **Routing** | React Router 7 (HashRouter) |
| **Font** | Geist Sans |
| **Icons** | Lucide React |
| **Toast** | Sonner |
| **Theme** | next-themes (light/dark/system) |
| **Linting** | Biome |
| **Testing** | Vitest (runs in Electron) |
| **Build** | electron-vite + electron-builder |

## Project Structure

```
src/
├── main/                # Electron main process
│   ├── database/        # SQLite + Drizzle (connection, repositories, utils)
│   ├── ipc/             # IPC handlers (one file per entity)
│   └── windows/         # Window creation
├── preload/             # contextBridge API (window.api)
├── renderer/            # React app
│   ├── components/
│   │   ├── ui/          # shadcn components (auto-generated, do not edit)
│   │   ├── layout/      # Sidebar, Header, RootLayout, ThemeProvider
│   │   └── common/      # Reusable components (theme-toggle, resize-handle)
│   ├── features/        # Feature modules (components + hooks + stores)
│   ├── routes/          # Page components (thin shells)
│   ├── hooks/           # Shared hooks
│   ├── stores/          # Cross-feature Zustand stores
│   └── lib/             # Utilities (cn helper)
├── shared/
│   ├── schema/          # Drizzle table definitions (single source of truth)
│   └── validators.ts    # Zod schemas derived from Drizzle
└── lib/electron-app/    # Electron release utilities
```

## What's Included

- **Layout shell** — Sidebar + Header + main content area, all empty and ready to fill
- **macOS titlebar** — Hidden inset style with traffic light positioning
- **Sidebar resize** — Draggable width with localStorage persistence
- **Dark/light/system theme** — Toggle in sidebar footer
- **Database layer** — SQLite with WAL mode, auto-migrations on startup
- **Example entity (Item)** — Full end-to-end pattern: Schema → Validator → Repository → IPC → Preload API
- **25 shadcn components** — Pre-installed and configured
- **Path aliases** — `renderer/`, `shared/`, `lib/`, `~/`
- **CLAUDE.md** — AI coding assistant instructions with architecture patterns and naming conventions

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# After changing schema
pnpm db:generate    # Generate migrations
pnpm db:reset       # Reset database
# Then restart dev
```

## Architecture Pattern

```
Repository (main process)    ← Data access (CRUD, SQLite)
    ↓ IPC
Hook (useXxx)                ← Business logic (API calls + side effects)
    ↓ Returns data + methods
Component                    ← Pure UI (renders + calls methods)
```

## Adding a New Entity

1. Create schema in `src/shared/schema/your-entity.ts`
2. Export from `src/shared/schema/index.ts`
3. Add Zod validators in `src/shared/validators.ts`
4. Create repository in `src/main/database/repositories/`
5. Create IPC handler in `src/main/ipc/`
6. Register handler in `src/main/index.ts`
7. Add API methods in `src/preload/index.ts`
8. Run `pnpm db:generate` → `pnpm db:reset` → restart dev

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development |
| `pnpm build` | Build for production |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | Biome lint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:reset` | Reset local database |
