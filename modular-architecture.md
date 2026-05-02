# Modular Investment Oversight Platform - Architecture Vision

## Purpose
This document outlines the **long-term vision** and **incremental evolution path** for transforming the current Portfolio Manager into a modular Investment Oversight platform with three core modules: Portfolio Manager, Risk Monitoring, and Wealth Executive Report.

**Critical Principle**: Start simple, evolve gradually. This is not a big-bang rewrite but a phased transformation that maintains a working application at every step.

---

## Vision Statement

Deliver a modular Investment Oversight platform where each analytics capability (Portfolio, Risk, Wealth Reporting) is independently evolvable and disposable, while a shared visual language ensures a consistent user experience.

---

## Core Architectural Principles

### 1. Bounded Contexts
Each module (Risk, Portfolio, Fees, etc.) owns its domain end-to-end:
- **Data Schema**: Each module defines and owns its database tables
- **Business Logic**: Domain rules live within the module
- **API Endpoints**: Module-specific routes under `/api/<module>/...`
- **UI Components**: Module-specific pages and views

### 2. Strong Isolation (Future State)
Independent deployable units, independent data stores, and failure containment:
- Each module can fail without breaking others
- No shared database tables between modules
- Runtime composition from registered modules
- Independent deployment lifecycle

### 3. Shared Kernel
A versioned, minimal UI/viz library used by all modules and the shell:
- **Shared UI Components**: Charts, tables, cards, forms from shadcn/ui
- **Visualization Library**: Recharts wrappers with consistent theming
- **Design System**: Tailwind CSS configuration with shared color palette
- **Versioned Artifact**: Shared library evolves with semantic versioning

### 4. Runtime Composition (Future State)
The app is assembled at runtime from registered modules:
- **Module Registry**: JSON configuration listing available modules
- **Dynamic Loading**: Shell loads modules based on registry
- **No Compile-Time Links**: Modules don't import from each other

### 5. Contract-First (Future State)
Interactions happen only through stable, versioned contracts:
- **API Contracts**: Well-defined REST endpoints with versioning
- **Event Contracts**: Domain events for async module communication
- **Schema Contracts**: Shared types for cross-module data

---

## Three-Layer Architecture (Target State)

### Layer 1: Shell (Orchestrator)
Thin container that loads modules dynamically:
- **Responsibilities**: Authentication, navigation framework, module loading
- **Does NOT Contain**: Business logic, data operations, or module-specific features
- **Provides**: Layout structure, routing framework, authentication context

### Layer 2: Shared UI Library
Standalone package consumed by all modules:
- **Contains**: Presentation components only (charts, tables, cards, forms)
- **Does NOT Contain**: Business logic or data fetching
- **Version Controlled**: Independent semantic versioning
- **Dependency Direction**: Modules depend on it; it depends on nothing

### Layer 3: Independent Modules
Each module is a vertical slice containing:
- **Frontend Micro-App**: React components and pages
- **Backend Service**: Express routes and API endpoints
- **Dedicated Database**: PostgreSQL tables owned by this module
- **Characteristics**:
  - Physically separate folders
  - Can be deleted without affecting others
  - Communicate only through APIs
  - Import shared UI library as external dependency

---

## Phased Evolution Strategy

### Phase 0: Current State (Complete)
**Status**: Working portfolio analytics application
- Single monolithic dashboard
- Airtable integration with PostgreSQL mirror
- Rich component library (shadcn/ui + recharts)
- AI Advisor panel
- Data tables with filtering/sorting

### Phase 1: Foundation & Documentation (Weeks 1-2)
**Goal**: Establish architectural foundation without breaking changes

**Deliverables**:
1. ✅ Document modular architecture vision (this file)
2. Create folder structure for future modularity:
   ```
   client/src/
   ├── modules/           # Future home for module implementations
   │   ├── portfolio/     # Portfolio Manager module
   │   ├── risk/          # Risk Monitoring module
   │   └── wealth/        # Wealth Executive Report module
   ├── shared-ui/         # Shared visualization components
   │   ├── charts/
   │   ├── tables/
   │   └── metrics/
   └── shell/             # Application shell and navigation
   ```
3. Inventory and catalog reusable UI components
4. Create module registry design (simple JSON config)

**Technical Approach**:
- No code refactoring yet
- Documentation and planning only
- Establish naming conventions and patterns

**Success Criteria**:
- Documentation complete and reviewed
- Folder structure created
- Component catalog exists
- Team alignment on approach

---

### Phase 2: Module Boundaries (Weeks 3-5)
**Goal**: Refactor current app as first module, create basic shell

**Deliverables**:
1. Create basic Shell application:
   - Top-level navigation between modules
   - Module routing structure
   - Shared layout and authentication
2. Refactor current dashboard as "Portfolio Manager" module:
   - Move existing code into `modules/portfolio/`
   - Preserve all current functionality
   - Update imports and routes
3. Implement simple module registry (hardcoded, not dynamic yet):
   ```json
   {
     "modules": [
       {
         "id": "portfolio",
         "name": "Portfolio Manager",
         "route": "/portfolio",
         "icon": "briefcase"
       }
     ]
   }
   ```

**Technical Approach**:
- Use wouter for module routing
- Shared layout component wraps all modules
- Portfolio module routes nested under `/portfolio/*`

**Success Criteria**:
- Portfolio Manager accessible via shell navigation
- All existing features still work
- No functionality lost in refactor
- Clean separation between shell and module code

---

### Phase 3: Shared UI Extraction (Weeks 6-8)
**Goal**: Formalize shared component library

**Deliverables**:
1. Move reusable components to `shared-ui/`:
   - Chart components (LineChart, BarChart, PieChart)
   - Table components with sorting/filtering
   - Metric cards
   - Form components
2. Create consistent component APIs
3. Document shared component usage
4. Update Portfolio Manager to import from shared-ui

**Technical Approach**:
- Use barrel exports from `shared-ui/index.ts`
- Maintain backward compatibility
- Add component documentation/examples

**Success Criteria**:
- Portfolio Manager uses shared-ui components
- Component APIs are clean and documented
- No duplication between shell and module

---

### Phase 4: Second Module - Risk Monitoring (Weeks 9-12)
**Goal**: Prove multi-module architecture with second module

**Deliverables**:
1. Define Risk Monitoring data schema:
   - Risk metrics table
   - Risk thresholds table
   - Risk events/alerts table
2. Implement Risk Monitoring backend:
   - API routes under `/api/risk/*`
   - Risk calculation services
   - Data persistence
3. Build Risk Monitoring UI:
   - Risk dashboard page
   - Risk metrics visualization
   - Alert/threshold configuration
4. Integrate into shell navigation

**Risk Monitoring Features (MVP)**:
- Portfolio concentration risk (single fund exposure)
- Liquidity risk (capital call coverage)
- Performance risk (underperforming funds)
- Risk alerts and thresholds

**Technical Approach**:
- Create `modules/risk/` with same structure as portfolio
- Use shared-ui components for consistency
- Independent API routes and database tables

**Success Criteria**:
- Risk module accessible via shell
- Basic risk metrics displayed
- Uses shared UI components
- Portfolio module unaffected by risk module

---

### Phase 5: Third Module - Wealth Executive Report (Weeks 13-16)
**Goal**: Complete the three-module vision

**Deliverables**:
1. Define Wealth Report data schema:
   - Consolidated holdings snapshot
   - Performance summaries
   - Executive KPIs
2. Implement Wealth Report backend:
   - API routes under `/api/wealth/*`
   - Aggregation services pulling from portfolio and risk modules
   - Report generation logic
3. Build Wealth Report UI:
   - Executive summary dashboard
   - Printable report layout
   - PDF export capability
4. Integrate into shell navigation

**Wealth Report Features (MVP)**:
- Portfolio overview snapshot
- Performance summary (returns, IRR, multiples)
- Risk summary (top risks, alerts)
- Asset allocation breakdown
- Top/bottom performers

**Technical Approach**:
- Create `modules/wealth/` following established patterns
- May call Portfolio and Risk APIs for data aggregation
- Focus on executive-level summary views

**Success Criteria**:
- Wealth module accessible via shell
- Aggregates data from other modules
- Printable/exportable format
- All three modules coexist harmoniously

---

### Phase 6: Advanced Isolation (Future - Months 4-6)
**Goal**: True microservices architecture with full isolation

**Deliverables**:
1. Extract shared UI as actual npm package:
   - Publish to private registry or GitHub packages
   - Semantic versioning
   - Independent release cycle
2. Separate databases per module:
   - Portfolio DB, Risk DB, Wealth DB
   - Cross-module queries via APIs only
3. API versioning and contracts:
   - `/api/v1/portfolio/*`, `/api/v1/risk/*`
   - Backward compatibility strategy
   - Contract testing
4. Independent deployment capability:
   - Each module deployable separately
   - Feature flags for module availability
   - Health checks per module

**Technical Approach**:
- Docker containers per module (if needed)
- API gateway pattern for routing
- Event bus for async communication
- Database per service pattern

**Success Criteria**:
- Modules deployable independently
- Shared UI is versioned npm package
- API contracts enforced via tests
- Module failures don't cascade

---

## Mental Model

Think of it like a **shopping mall**:

- **Shell** = The mall structure (hallways, directory, parking)
- **Shared UI** = Building standards (doors, lighting, signage style)
- **Modules** = Individual stores (completely independent businesses)
- **Databases** = Each store's private inventory system

Tearing down one store doesn't affect the mall or other stores. Adding a new store follows the same integration pattern. The mall provides the infrastructure, but stores own their operations.

---

## Dependency Direction Rules

```
Shell → Modules (discovers and routes to them)
Modules → Shared UI (imports components)
Shared UI → Nothing (pure presentation)
Modules ⇄ Modules (only via API calls, never direct imports)
```

**Key Constraints**:
- Shell NEVER imports module internals
- Modules NEVER import from each other directly
- Shared UI NEVER imports business logic
- All cross-module communication via APIs or events

---

## Module Communication Patterns

### Frontend-to-Frontend
- **Current**: None (through shell routing only)
- **Future**: Shared state via shell context if needed

### Backend-to-Backend
- **Phase 1-5**: Direct API calls between modules (same Express app)
- **Phase 6**: REST APIs with versioning, or event messaging

### Data Sharing
- **Phase 1-5**: Shared PostgreSQL database, different table prefixes
- **Phase 6**: Separate databases, cross-module reads via APIs or replicated read models

---

## Success Metrics

### Module Independence
- ✅ Can add a module without modifying others
- ✅ Can remove a module without breaking others
- ✅ Can upgrade a module without forcing others to upgrade

### Developer Experience
- ✅ Clear module boundaries and ownership
- ✅ Consistent patterns across modules
- ✅ Easy onboarding for new developers

### User Experience
- ✅ Consistent visual design across modules
- ✅ Seamless navigation between modules
- ✅ Module failures gracefully handled

### Technical Quality
- ✅ Reduced coupling between modules
- ✅ Increased cohesion within modules
- ✅ Testable module boundaries

---

## Current Status

- **Phase**: Phase 1 (Foundation & Documentation)
- **Next Milestone**: Create folder structure and component inventory
- **Target Date**: End of Week 2

---

## References

- See `replit.md` for current system architecture
- See `guardrails.md` for core architectural principles
- See attached architectural vision documents for full microservices vision
