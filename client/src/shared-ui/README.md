# Shared UI Library

This directory contains reusable visualization and UI components used across all modules. This is the **Shared Kernel** of the modular architecture.

## Purpose

The Shared UI library provides:
- **Consistent Design Language**: All modules look and feel cohesive
- **Vendor Independence**: Abstraction layer over third-party libraries (recharts, shadcn/ui)
- **Reusability**: Write once, use everywhere
- **Maintainability**: Single source of truth for UI patterns

## Structure

```
shared-ui/
├── charts/             # Chart components (line, bar, pie, area, etc.)
├── tables/             # Table components with sorting, filtering, pagination
├── metrics/            # Metric card and KPI display components
├── forms/              # Form components (inputs, selects, etc.)
├── layout/             # Layout components (cards, grids, etc.)
└── index.ts            # Barrel export of all shared components
```

## Component Categories

### Charts (`charts/`)
Wrapper components around recharts providing consistent theming and APIs:
- `LineChart` - Time series and trend visualization
- `BarChart` - Categorical comparisons
- `PieChart` - Proportional breakdowns
- `AreaChart` - Cumulative trends
- `ComposedChart` - Multi-series combinations

**Usage Pattern**:
```tsx
import { LineChart } from '@/shared-ui/charts';

<LineChart
  data={timeSeriesData}
  xKey="date"
  yKeys={['capital_calls', 'distributions']}
  height={300}
/>
```

### Tables (`tables/`)
Advanced data table components with common features:
- Sorting (client and server-side)
- Filtering (column-specific filters)
- Pagination
- Column visibility toggling
- Row selection
- Export capabilities

**Usage Pattern**:
```tsx
import { DataTable } from '@/shared-ui/tables';

<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  paginated
/>
```

### Metrics (`metrics/`)
Components for displaying KPIs and key metrics:
- `MetricCard` - Single metric with trend indicator
- `MetricGrid` - Grid layout of multiple metrics
- `GaugeChart` - Progress or percentage visualization
- `StatCard` - Statistical summary cards

**Usage Pattern**:
```tsx
import { MetricCard } from '@/shared-ui/metrics';

<MetricCard
  title="Total Committed"
  value="$125.5M"
  change="+12.3%"
  trend="up"
/>
```

### Forms (`forms/`)
Form components extending shadcn/ui with domain-specific logic:
- Input wrappers with validation
- Select dropdowns with async data loading
- Date pickers and range selectors
- Form layouts and field groups

## Design Principles

### 1. Component API Consistency
All components follow a consistent API pattern:
- Props use camelCase
- Boolean props default to `false`
- Optional customization via `className` prop
- Flexible data formats accepted

### 2. Vendor Abstraction
Components abstract away third-party library details:
- Internal implementation can change without affecting consumers
- Consistent naming across different underlying libraries
- Stable public API even if vendor library changes

### 3. Theming Support
All components respect the global theme:
- CSS variables for colors (`--primary`, `--secondary`, etc.)
- Dark mode support via `.dark` class
- Consistent spacing and typography

### 4. Accessibility
Components are built with accessibility in mind:
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML

## Versioning Strategy

**Current Phase**: Internal library (no versioning yet)

**Future (Phase 6)**: Extract as npm package with semantic versioning
- Major version: Breaking API changes
- Minor version: New features, backward compatible
- Patch version: Bug fixes

## Migration from Current Components

Components will be gradually migrated from:
- `client/src/components/ui/` (shadcn base components - kept as foundation)
- `client/src/components/Dashboard/` (domain components - to be split)

**Migration Priority**:
1. Chart components (most reusable)
2. Metric cards (used across all modules)
3. Table components (complex, high value)
4. Form components (as needed)

## Usage Guidelines for Module Developers

### DO ✅
- Import shared components from `@/shared-ui/*`
- Use components as designed without modification
- Submit requests for new shared components via team discussion
- Customize via provided props and `className`

### DON'T ❌
- Copy shared components into your module
- Modify shared components for module-specific needs
- Create module-specific variants of shared components
- Bypass the shared UI for common patterns

## Contributing

To add a new shared component:

1. **Assess Reusability**: Is this needed by 2+ modules?
2. **Design API**: Make it flexible but opinionated
3. **Implement**: Follow existing patterns and conventions
4. **Document**: Add usage examples and prop documentation
5. **Review**: Get team approval before merging

## Current Inventory

### Existing Components (to be organized)
From `client/src/components/ui/`:
- ✅ card, button, input, label, select, checkbox, textarea (base UI)
- ✅ table, tabs, dialog, popover, dropdown-menu (structural)
- ✅ chart (recharts wrapper)
- ✅ toast, alert, skeleton (feedback)

From `client/src/components/Dashboard/`:
- 📦 MetricCard → `shared-ui/metrics/MetricCard.tsx`
- 📦 CapitalCallsChart → `shared-ui/charts/BarChart.tsx`
- 📦 DistributionsChart → `shared-ui/charts/ComposedChart.tsx`
- 📦 NetCashflowChart → `shared-ui/charts/LineChart.tsx`

Legend:
- ✅ Already in good place (keep in `components/ui/`)
- 📦 Needs migration to `shared-ui/`
