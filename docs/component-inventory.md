# Component Inventory

This document catalogs all UI components in the application and their migration path to the modular architecture.

**Last Updated**: 2025-10-29  
**Phase**: Phase 1 (Foundation & Documentation)

---

## Component Classification

### 🔵 Foundation Components (Keep in `components/ui/`)
These are the base shadcn/ui components that serve as building blocks. They stay where they are.

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| button | `components/ui/button.tsx` | ✅ Keep | Base button variants |
| card | `components/ui/card.tsx` | ✅ Keep | Card container primitives |
| input | `components/ui/input.tsx` | ✅ Keep | Text input field |
| label | `components/ui/label.tsx` | ✅ Keep | Form label |
| select | `components/ui/select.tsx` | ✅ Keep | Dropdown select |
| checkbox | `components/ui/checkbox.tsx` | ✅ Keep | Checkbox control |
| textarea | `components/ui/textarea.tsx` | ✅ Keep | Multi-line input |
| table | `components/ui/table.tsx` | ✅ Keep | Base table primitives |
| tabs | `components/ui/tabs.tsx` | ✅ Keep | Tab navigation |
| dialog | `components/ui/dialog.tsx` | ✅ Keep | Modal dialog |
| popover | `components/ui/popover.tsx` | ✅ Keep | Popover container |
| dropdown-menu | `components/ui/dropdown-menu.tsx` | ✅ Keep | Dropdown menu |
| toast | `components/ui/toast.tsx` | ✅ Keep | Toast notification |
| alert | `components/ui/alert.tsx` | ✅ Keep | Alert message |
| skeleton | `components/ui/skeleton.tsx` | ✅ Keep | Loading skeleton |
| badge | `components/ui/badge.tsx` | ✅ Keep | Badge/pill component |
| separator | `components/ui/separator.tsx` | ✅ Keep | Visual separator |
| scroll-area | `components/ui/scroll-area.tsx` | ✅ Keep | Scrollable area |
| chart | `components/ui/chart.tsx` | ✅ Keep | Base recharts wrapper |

### 🟢 Shared UI Components (Migrate to `shared-ui/`)
These components are reusable across modules and should be moved to the shared library.

#### Charts
| Component | Current Location | Target Location | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| CapitalCallsChart | `components/Dashboard/CapitalCallsChart.tsx` | `shared-ui/charts/BarChart.tsx` | High | 📦 To migrate |
| DistributionsChart | `components/Dashboard/DistributionsChart.tsx` | `shared-ui/charts/ComposedChart.tsx` | High | 📦 To migrate |
| NetCashflowChart | `components/Dashboard/NetCashflowChart.tsx` | `shared-ui/charts/LineChart.tsx` | High | 📦 To migrate |
| NavBreakdownChart | `components/Dashboard/NavBreakdownChart.tsx` | `shared-ui/charts/PieChart.tsx` | Medium | 📦 To migrate |

#### Metrics
| Component | Current Location | Target Location | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| MetricCard | `components/Dashboard/MetricCard.tsx` | `shared-ui/metrics/MetricCard.tsx` | High | 📦 To migrate |

#### Tables
| Component | Current Location | Target Location | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| FundCapitalCallsTable | `components/Dashboard/FundCapitalCallsTable.tsx` | `shared-ui/tables/DataTable.tsx` | Medium | 📦 To migrate |
| PerformanceTable | `components/Dashboard/PerformanceTable.tsx` | `shared-ui/tables/PerformanceTable.tsx` | Medium | 📦 To migrate |
| QuarterlyForecastTable | `components/Dashboard/QuarterlyForecastTable.tsx` | `shared-ui/tables/ForecastTable.tsx` | Low | 📦 To migrate |
| TablesView | `components/TablesView.tsx` | `shared-ui/tables/AdvancedTable.tsx` | Medium | 📦 To migrate |

#### Layout
| Component | Current Location | Target Location | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| DraggableCard | `components/Dashboard/DraggableCard.tsx` | `shared-ui/layout/DraggableCard.tsx` | Low | 📦 To migrate |
| CardLayoutControls | `components/Dashboard/CardLayoutControls.tsx` | `shared-ui/layout/LayoutControls.tsx` | Low | 📦 To migrate |

### 🟡 Module-Specific Components (Move to `modules/portfolio/`)
These components are specific to the Portfolio Manager module.

| Component | Current Location | Target Location | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| DashboardLayoutWrapper | `components/Dashboard/DashboardLayoutWrapper.tsx` | `modules/portfolio/components/DashboardLayout.tsx` | High | 📦 To migrate |
| AdvisorPanel | `components/AdvisorPanel.tsx` | `modules/portfolio/components/AdvisorPanel.tsx` | Medium | 📦 To migrate |
| SyncManagement | `components/SyncManagement.tsx` | `modules/portfolio/components/SyncManagement.tsx` | Medium | 📦 To migrate |
| SetupGate | `components/SetupGate.tsx` | `modules/portfolio/components/SetupGate.tsx` | Medium | 📦 To migrate |

### 🔴 Shell Components (Move to `shell/`)
These components belong to the application shell orchestrator.

| Component | Current Location | Target Location | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| Dashboard (main app) | `pages/dashboard.tsx` | `shell/App.tsx` | High | 📦 To migrate |
| Navigation (sidebar) | `pages/dashboard.tsx` (embedded) | `shell/Navigation.tsx` | High | 📦 To extract |

---

## Migration Priority Matrix

### Phase 2: Module Boundaries (First Migration)
**Goal**: Refactor current app as Portfolio module

1. **Critical Path** (must migrate):
   - `pages/dashboard.tsx` → Split into `shell/App.tsx` + `modules/portfolio/pages/Dashboard.tsx`
   - Navigation logic → Extract to `shell/Navigation.tsx`
   - `DashboardLayoutWrapper` → `modules/portfolio/components/`

2. **Supporting Files** (should migrate):
   - `SetupGate` → `modules/portfolio/components/`
   - `AdvisorPanel` → `modules/portfolio/components/`
   - `SyncManagement` → `modules/portfolio/components/`
   - `TablesView` → `modules/portfolio/components/`

### Phase 3: Shared UI Extraction (Second Migration)
**Goal**: Formalize shared component library

1. **High Priority** (used across multiple views):
   - `MetricCard` → `shared-ui/metrics/`
   - Chart components → `shared-ui/charts/`

2. **Medium Priority** (may be used by future modules):
   - Table components → `shared-ui/tables/`
   - Layout components → `shared-ui/layout/`

---

## Component Dependencies

### External Dependencies by Component Type

**Charts** (all use recharts):
- CapitalCallsChart: `ComposedChart`, `Bar`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`
- DistributionsChart: `ComposedChart`, `Bar`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- NetCashflowChart: `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- NavBreakdownChart: `PieChart`, `Pie`, `Cell`, `Tooltip`, `Legend`

**Tables** (all use custom Table primitive):
- Base: `components/ui/table.tsx`
- Enhanced with: sorting, filtering, pagination, column visibility

**Layout** (use @dnd-kit):
- DraggableCard: `@dnd-kit/core`, `@dnd-kit/sortable`
- CardLayoutControls: Context API for layout state

---

## Internal Dependencies

### Component Dependency Graph

```
Shell/App
├── Navigation (sidebar with module links)
├── Portfolio Module
│   ├── DashboardLayout
│   │   ├── MetricCard (×4) → shared-ui
│   │   ├── CapitalCallsChart → shared-ui
│   │   ├── DistributionsChart → shared-ui
│   │   ├── NetCashflowChart → shared-ui
│   │   ├── FundCapitalCallsTable → shared-ui
│   │   └── PerformanceTable → shared-ui
│   ├── TablesView
│   │   └── AdvancedTable → shared-ui
│   ├── AdvisorPanel (OpenAI integration)
│   ├── SyncManagement (Airtable sync)
│   └── SetupGate (credentials check)
└── Risk Module (future)
    └── TBD

Shared UI Library
├── charts/ (recharts wrappers)
├── tables/ (data table patterns)
├── metrics/ (KPI cards)
└── layout/ (drag-drop, grids)
```

---

## Breaking Down Large Components

### TablesView.tsx (500+ lines)
**Current**: Monolithic component with table, filters, pagination, column controls

**Target Split**:
```
shared-ui/tables/
├── DataTable.tsx           # Core table with sorting/filtering
├── ColumnControls.tsx      # Column visibility and ordering
├── TableFilters.tsx        # Search and filter controls
├── TablePagination.tsx     # Pagination controls
└── index.ts                # Exports: AdvancedTable (combines all)
```

### Dashboard.tsx (200+ lines)
**Current**: Contains shell + portfolio module logic

**Target Split**:
```
shell/
├── App.tsx                 # Shell orchestrator (50 lines)
└── Navigation.tsx          # Module navigation (80 lines)

modules/portfolio/
└── pages/Dashboard.tsx     # Portfolio dashboard (150 lines)
```

---

## API Surface for Shared Components

### MetricCard
```tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'primary' | 'secondary' | 'warning' | 'success';
  icon?: ReactNode;
  loading?: boolean;
}
```

### Chart Components
```tsx
interface ChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  height?: number;
  loading?: boolean;
  config?: ChartConfig;
}
```

### DataTable
```tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}
```

---

## Migration Checklist Template

For each component being migrated:

- [ ] Create target file in new location
- [ ] Copy component code
- [ ] Update imports (use `@/` alias for new paths)
- [ ] Remove module-specific logic (if moving to shared-ui)
- [ ] Add prop types and documentation
- [ ] Update all consumers to import from new location
- [ ] Test component in isolation
- [ ] Test component in integration
- [ ] Delete old file
- [ ] Update this inventory document

---

## Notes

- **No Breaking Changes**: Migration happens incrementally without breaking existing functionality
- **Import Aliases**: Use TypeScript path aliases to ease migration (`@/shared-ui/*`, `@/modules/*`, `@/shell/*`)
- **Testing Strategy**: Test each component after migration to ensure no regressions
- **Documentation**: Each shared component gets usage examples and prop documentation
