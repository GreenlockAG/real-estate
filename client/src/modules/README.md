# Modules

This directory contains the independent analytics modules of the Investment Oversight Platform.

## Module Structure

Each module follows the same organizational pattern:

```
<module-name>/
├── pages/              # Module-specific pages/views
├── components/         # Module-specific components (not shared)
├── api/                # API client functions for this module's endpoints
├── hooks/              # Module-specific custom hooks
├── types/              # Module-specific TypeScript types
└── index.ts            # Public exports from the module
```

## Current Modules

### 1. Portfolio Manager (`portfolio/`)
**Status**: In Migration (from existing dashboard)
**Owner**: Core Team
**Description**: Manages PE/VC portfolio data mirrored from Airtable, including investments, capital calls, distributions, and fund performance tracking.

**Features**:
- Portfolio dashboard with customizable card layout
- Capital calls and distributions tracking
- Fund performance metrics (TVPI, DPI, RVPI, IRR)
- Data tables with filtering and sorting
- AI-powered portfolio advisor

### 2. Risk Monitoring (`risk/`)
**Status**: Planned for Phase 4
**Owner**: TBD
**Description**: Monitors portfolio risks including concentration, liquidity, and performance risks.

**Planned Features**:
- Portfolio concentration risk analysis
- Liquidity risk monitoring (capital call coverage)
- Performance risk alerts (underperforming funds)
- Risk threshold configuration
- Risk event tracking

### 3. Wealth Executive Report (`wealth/`)
**Status**: Planned for Phase 5
**Owner**: TBD
**Description**: Generates executive-level summaries and reports aggregating data from Portfolio and Risk modules.

**Planned Features**:
- Executive summary dashboard
- Consolidated portfolio snapshot
- Performance summaries (returns, IRR, multiples)
- Risk summary with top alerts
- Asset allocation breakdown
- Printable/exportable report format

## Module Independence Rules

1. **No Cross-Module Imports**: Modules NEVER import from each other directly
2. **API-Based Communication**: Cross-module data access via backend API calls only
3. **Shared UI Only**: Modules may only import from `shared-ui/` for visualization components
4. **Self-Contained**: Each module should be removable without breaking others

## Adding a New Module

1. Create a new directory under `modules/<module-name>/`
2. Follow the standard module structure (see above)
3. Register the module in `shell/moduleRegistry.json`
4. Add backend routes under `server/routes/<module-name>.ts`
5. Add database schema in `shared/schema.ts` with module-prefixed table names
6. Import only from `shared-ui/`, never from other modules

## Development Guidelines

- **Bounded Context**: Each module owns its domain logic, data, and UI
- **Shared Kernel**: Use `shared-ui/` for all visualization components
- **Clear Contracts**: Define clear API contracts for any cross-module communication
- **Independent Testing**: Each module should be testable in isolation
