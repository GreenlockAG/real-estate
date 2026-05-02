# Shell - Application Orchestrator

The Shell is the thin container that orchestrates the entire application. It handles authentication, navigation, and module loading while containing minimal business logic.

## Responsibilities

### 1. Module Discovery & Loading
- Read module registry configuration
- Dynamically load and mount modules at runtime
- Handle module unavailability gracefully

### 2. Navigation & Routing
- Top-level navigation between modules
- Route management and forwarding
- Breadcrumb and location awareness

### 3. Authentication & Session
- User authentication flow
- Session management
- Authorization context for modules

### 4. Global Layout
- Application chrome (header, sidebar, footer)
- Module container/wrapper
- Global loading states
- Error boundaries

### 5. Cross-Module Services
- Shared authentication state
- Global notifications/toasts
- Theme management (light/dark mode)
- User preferences

## Shell Structure

```
shell/
├── App.tsx                    # Main shell component
├── Navigation.tsx             # Top-level navigation component
├── ModuleRouter.tsx           # Routes requests to modules
├── moduleRegistry.json        # Module configuration
├── Layout.tsx                 # Global layout wrapper
├── AuthProvider.tsx           # Authentication context
└── hooks/
    ├── useModules.ts          # Access module registry
    └── useNavigation.ts       # Navigation utilities
```

## Module Registry

The `moduleRegistry.json` file defines all available modules:

```json
{
  "modules": [
    {
      "id": "portfolio",
      "name": "Portfolio Manager",
      "description": "Track and analyze PE/VC portfolio investments",
      "route": "/portfolio",
      "icon": "briefcase",
      "enabled": true,
      "order": 1
    },
    {
      "id": "risk",
      "name": "Risk Monitoring",
      "description": "Monitor portfolio concentration and performance risks",
      "route": "/risk",
      "icon": "alert-triangle",
      "enabled": false,
      "order": 2
    },
    {
      "id": "wealth",
      "name": "Wealth Executive Report",
      "description": "Executive summaries and consolidated reports",
      "route": "/wealth",
      "icon": "file-text",
      "enabled": false,
      "order": 3
    }
  ]
}
```

## Navigation Pattern

### Current Phase (Simple)
- Static navigation links in sidebar
- Basic wouter routing
- Hardcoded module routes

### Future Phase (Dynamic)
- Registry-driven navigation
- Module availability checks
- Health-based module status indicators
- Feature flags for module enablement

## Layout Hierarchy

```
Shell Layout
├── Header
│   ├── Logo
│   ├── Module Navigation (tabs/links)
│   └── User Menu
├── Sidebar (optional)
│   ├── Module List
│   └── Quick Actions
└── Main Content Area
    └── Module Container
        └── <Active Module Renders Here>
```

## Design Principles

### 1. Minimal Logic
The shell should be as thin as possible:
- ❌ No business logic
- ❌ No data fetching (except auth)
- ❌ No domain-specific code
- ✅ Only orchestration and structure

### 2. Module Independence
Modules should not be aware of the shell:
- Modules receive routing context
- Modules handle their own state
- Shell provides minimal props/context

### 3. Graceful Degradation
Handle missing or failing modules gracefully:
- Show disabled state for unavailable modules
- Display error boundaries for crashed modules
- Allow other modules to continue functioning

### 4. Progressive Enhancement
Start simple, add complexity as needed:
- **Phase 2**: Basic routing and layout
- **Phase 3**: Registry-driven navigation
- **Phase 4**: Health checks and status
- **Phase 6**: Dynamic module loading

## Current Status

**Phase**: Phase 1 (Planning)
**Next Steps**:
1. Create basic shell layout component
2. Implement module routing structure
3. Set up navigation component
4. Create initial module registry

**Migration Note**: The current `client/src/pages/dashboard.tsx` will be refactored into the Portfolio module, and its navigation logic will move to the Shell.
