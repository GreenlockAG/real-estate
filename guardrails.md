# GUARDRAILS.md

## Purpose

These guardrails enforce clean architecture, modular organization, vendor independence, and secure practices for the Investment Oversight Platform (Portfolio Manager, Risk Monitoring, Wealth Executive Report).

## 1. Core Principles

- **Airtable is master**: the local PostgreSQL database is a read-only mirror for performance and offline access.
- **Modular architecture**: Each capability (Portfolio, Risk, Wealth) is an independent module with clear boundaries.
- **Strict separation of concerns**:
  - Data layer (PostgreSQL with Drizzle ORM)
  - API layer (Express.js RESTful endpoints)
  - UI layer (React modules with shared components)
- **Vendor independence**: UI libraries (tables, charts) are wrapped in adapters with stable APIs, allowing vendor swapping without touching business logic.
- **Sharp root structure**: Root directory contains only essential configs. All module code lives within module boundaries.
- **Clean repository**: Temp/debug files go in dedicated `temp/` folders within modules, never in root.
- **Secure by default**: Read-only advisor, validated inputs, parameterized SQL queries, rate limiting.

## 2. Project File Hygiene

### Modular Folder Structure Rules

**Golden Rule**: Each module is self-contained. All module-specific code, components, and temporary work stays within the module's folder boundaries.

```
✅ GOOD: Self-contained modules
client/src/modules/portfolio/components/AdvisorPanel.tsx
client/src/modules/portfolio/temp/debug-metrics.json
client/src/modules/risk/pages/Dashboard.tsx

❌ BAD: Leaking across boundaries
client/src/components/portfolio/AdvisorPanel.tsx (module-specific in shared)
client/src/risk-debug.json (temp file in shared space)
./debug.log (temp file in root)
```

### Temporary Work Organization

All temporary, scratch, debug, and experimental work must be isolated in dedicated `temp/` folders:

- **Module-level temp**: `client/src/modules/<module-name>/temp/`
  - Experimental components
  - Debug utilities
  - Test data fixtures
  - Temporary scripts specific to that module

- **Server-level temp**: `server/temp/`
  - API debugging scripts
  - Database migration drafts
  - Performance profiling logs

- **Documentation temp**: `docs/temp/`
  - Draft documentation
  - Planning scratchpads
  - Meeting notes

**Rules:**
- ✅ Always create temp work in the appropriate module's `temp/` folder
- ✅ Use descriptive filenames with dates: `temp/metrics-debug-2025-10-29.json`
- ❌ Never commit temp folders to version control (covered by `.gitignore`)
- ❌ Never create temp files in root or shared directories
- 🧹 Clean up `temp/` folders regularly (they should be ephemeral)

### Root Directory Standards

The root directory must remain **sharp and minimal**, containing only:
- Essential configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, etc.)
- Documentation entry points (`README.md`, `replit.md`, `guardrails.md`, etc.)
- Top-level folders (`client/`, `server/`, `shared/`, `docs/`, `attached_assets/`)

**Prohibited in root:**
- ❌ Loose script files (`test.js`, `script.ts`)
- ❌ Debug/log files (`debug.log`, `output.json`)
- ❌ Temporary work files
- ❌ Module-specific code
- ❌ Data files or exports

## 3. Repository Layout

```
.
├── client/                          # Frontend application
│   └── src/
│       ├── modules/                 # Independent feature modules
│       │   ├── portfolio/           # Portfolio Manager module
│       │   │   ├── components/      # Module-specific components
│       │   │   ├── pages/           # Module pages/views
│       │   │   ├── hooks/           # Module-specific hooks
│       │   │   ├── types/           # Module type definitions
│       │   │   ├── api/             # Module API client utilities
│       │   │   ├── temp/            # Temporary/debug work (gitignored)
│       │   │   └── index.ts         # Module exports
│       │   ├── risk/                # Risk Monitoring module
│       │   │   ├── components/
│       │   │   ├── pages/
│       │   │   ├── temp/
│       │   │   └── index.ts
│       │   └── wealth/              # Wealth Executive Report module
│       │       ├── components/
│       │       ├── pages/
│       │       ├── temp/
│       │       └── index.ts
│       ├── shell/                   # Shell orchestrator (navigation, routing)
│       │   ├── Navigation.tsx
│       │   ├── ModuleRouter.tsx
│       │   ├── moduleRegistry.json  # Module configuration
│       │   └── hooks/
│       ├── shared-ui/               # Shared UI component library (Phase 3+)
│       │   └── components/          # Reusable components across modules
│       ├── components/              # Legacy shared components (to be migrated)
│       │   ├── ui/                  # shadcn/ui components
│       │   └── Dashboard/           # Shared dashboard primitives
│       ├── lib/                     # Shared utilities
│       ├── hooks/                   # Shared hooks
│       └── App.tsx                  # Application entry point
│
├── server/                          # Backend application
│   ├── routes.ts                    # API route definitions
│   ├── storage.ts                   # Storage interface (abstraction over DB/memory)
│   ├── services/                    # Business logic services
│   │   ├── airtable.ts              # Airtable integration
│   │   ├── metrics.ts               # Portfolio metrics calculations
│   │   └── openai.ts                # AI advisor service
│   └── temp/                        # Server-side temporary work (gitignored)
│
├── shared/                          # Shared code between client and server
│   └── schema.ts                    # Drizzle ORM schema definitions
│
├── docs/                            # Project documentation
│   ├── component-inventory.md       # UI component catalog
│   ├── modular-architecture.md      # Architecture evolution roadmap
│   └── temp/                        # Draft documentation (gitignored)
│
├── attached_assets/                 # User-provided assets
│
├── guardrails.md                    # This file
├── replit.md                        # Project overview and memory
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── tailwind.config.ts               # Tailwind CSS configuration
└── drizzle.config.ts                # Drizzle ORM configuration
```

## 4. Module Boundaries

Each module in `client/src/modules/` must be self-contained:

**Allowed imports:**
- ✅ `@/components/ui/*` (shadcn/ui primitives)
- ✅ `@/shared-ui/components/*` (shared component library - Phase 3+)
- ✅ `@/lib/*` (shared utilities)
- ✅ `@/hooks/*` (shared hooks)
- ✅ `@shared/schema` (database types)
- ✅ Internal module imports (e.g., `./components/AdvisorPanel`)

**Prohibited imports:**
- ❌ Cross-module imports (e.g., Portfolio importing from Risk)
- ❌ Direct access to other modules' internals
- ❌ Circular dependencies

**Module Communication:**
- Modules communicate through the Shell orchestrator
- Shared data accessed via backend APIs, not direct imports
- Use module registry (`shell/moduleRegistry.json`) for feature flags

## 5. Vendor Independence (UI Adapters)

### Table Adapter API
```tsx
<DataTable
  columns={[{ key, title, dataIndex, sortable?, filterable? }]}
  data={[{ key, ...fields }]}
  pageSize={20}
  onPageChange?(pageNumber)
  loading={boolean}
  emptyText="No data"
/>
```

### Chart Adapter API
```tsx
<LineChart
  series={[{ name, data: [[timestamp, value], ...] }]}
  xAxisType="time" | "category"
  yAxisType="value" | "log"
  options?={{ legend, tooltip, grid }}
  height={360}
/>

<PieChart
  data={[{ name, value, color? }]}
  options?={{ legend, tooltip }}
  height={360}
/>
```

### Adapter Implementation
Chart and table vendors (Recharts, AG Grid, etc.) are wrapped in thin adapters that expose stable prop interfaces. To swap vendors:
1. Update adapter implementation files only
2. Business logic and module code remain unchanged
3. Configuration can toggle between vendors via feature flags

## 6. Security Rules

- **AI Advisor** (`/api/advisor/ask`) is read-only; no code execution.
- **Input validation**: All API inputs validated with Zod schemas before processing.
- **Parameterized SQL**: Use Drizzle ORM parameterized queries, never string concatenation.
- **Rate limiting**: Advisor and expensive endpoints have request limits.
- **Authentication**: Session-based auth with secure cookies (when implemented).
- **CORS & headers**: Proper security headers configured.
- **Secrets management**: Use environment variables, never commit credentials.

## 7. Data Layer Rules

- **Airtable is authoritative**: Local PostgreSQL is read-only mirror.
- **Sync workflow**: 
  1. Fetch from Airtable API
  2. Transform and validate data
  3. Update local PostgreSQL mirror
  4. Serve from local DB for performance
- **Schema changes**: 
  - Update `shared/schema.ts` first
  - Run `npm run db:push` to sync schema
  - Never manually write SQL migrations
- **Storage abstraction**: Use `server/storage.ts` interface for all CRUD operations

## 8. Testing & Quality

- **Data-testid attributes**: Every interactive element and meaningful data display must have `data-testid` for testing.
- **Format**: `{action}-{target}` for interactive, `{type}-{content}` for display
- **Dynamic elements**: Append unique ID like `card-risk-${index}`
- **LSP checks**: Run LSP diagnostics after significant refactors (>100 lines)

## 9. Development Workflow

### File Organization Checklist
Before committing changes:
- [ ] All module code is within module boundaries
- [ ] No temp/debug files in root or shared directories
- [ ] Temp work is in appropriate `temp/` folders
- [ ] Root directory contains only essential configs
- [ ] `.gitignore` excludes all `temp/` folders

### Common Violations to Avoid
```
❌ Creating debug files in root
./test-output.json
./script.js

✅ Use module temp folders
client/src/modules/portfolio/temp/test-output.json
server/temp/debug-script.ts

❌ Module-specific code in shared locations
client/src/components/portfolio/SpecificFeature.tsx

✅ Keep module code within module boundaries
client/src/modules/portfolio/components/SpecificFeature.tsx

❌ Loose scripts and experiments
./try-this.ts
./backup-old-version.tsx

✅ Use temp folders with descriptive names
client/src/modules/risk/temp/concentration-experiment-2025-10-29.ts
```

## 10. Health & Status

`/api/healthz` endpoint reports:
- `secrets_ok` - Airtable credentials configured
- `db_ok` - PostgreSQL connection status
- `tables` - List of mirrored Airtable tables
- Last sync timestamp for each table

UI displays connection status and sync freshness in module headers.

## ✅ Acceptance Criteria

- **Sharp root**: Only essential configs in root directory
- **Module isolation**: Each module is self-contained with no cross-dependencies
- **Clean temp work**: All temporary files in designated `temp/` folders, gitignored
- **Vendor swappability**: UI libraries wrapped in adapters with stable APIs
- **Security defaults**: Read-only advisor, validated inputs, parameterized queries
- **Airtable sync**: Data flows from Airtable → PostgreSQL → UI
- **Type safety**: End-to-end TypeScript with shared schemas
- **Modular evolution**: Easy to add new modules (Portfolio → Risk → Wealth → ...)
