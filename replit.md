# Overview

This is an Investment Oversight Platform - a full-stack web application evolving into a modular system with three core capabilities:
1. **Portfolio Manager** (current) - Mirror and manage PE/VC portfolio data from Airtable with comprehensive tracking of investments, capital calls, distributions, and fund performance
2. **Risk Monitoring** (planned) - Monitor portfolio concentration, liquidity, and performance risks
3. **Wealth Executive Report** (planned) - Generate executive-level summaries and reports

**Current Status**: The application is in **Phase 1** of a modular architecture transformation. See `modular-architecture.md` for the complete evolution roadmap.

**Guiding Principle**: Start simple, evolve gradually. The platform maintains full functionality while progressively introducing modular boundaries, shared component libraries, and independent module capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# Project Guardrails & Policies

The project follows strict architectural guardrails (see `guardrails.md`) that enforce:

- **Separation of Concerns**: Clear boundaries between data layer, API layer, and UI components
- **Vendor Independence**: UI libraries wrapped in adapters to allow easy swapping of chart/table vendors
- **Airtable as Master**: Local database serves as read-only mirror; Airtable is authoritative
- **Security by Default**: Read-only advisor, validated inputs, parameterized SQL, rate limiting
- **Clean Repository**: No temp/debug files in root; use `dev/` directory for temporary work
- **Modular Viz Blocks**: Self-contained visualization components with stable interfaces

These guardrails must be consulted and enforced during all development work to maintain architectural integrity.

# Architectural Evolution

## Modular Architecture Vision
The platform is evolving toward a three-layer modular architecture:
- **Layer 1 (Shell)**: Thin orchestrator for authentication, navigation, and module loading
- **Layer 2 (Shared UI)**: Versioned component library for consistent visualization across modules
- **Layer 3 (Modules)**: Independent vertical slices (Portfolio, Risk, Wealth) with dedicated frontend, backend, and data

**Key Principles**:
- **Bounded Contexts**: Each module owns its domain end-to-end
- **Shared Kernel**: All modules use a common visualization library
- **Strong Isolation**: Modules can fail independently without cascading failures
- **Runtime Composition**: Modules discovered and loaded at runtime via registry

See `modular-architecture.md` for detailed vision, phased rollout plan, and architectural principles.

## Current Phase: Foundation & Documentation
- Establishing architectural foundation
- Creating folder structure for modular organization
- Inventorying reusable UI components for shared library
- Designing module registry and routing patterns
- All existing functionality remains intact during evolution

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in a Vite development environment
- **UI Library**: Comprehensive shadcn/ui component system with Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system featuring CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following /api/* pattern
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Development**: Hot module replacement with Vite middleware integration

## Data Layer
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Four main entities - investments, capitalCalls, distributions, fundInfo, plus syncStatus tracking
- **Data Synchronization**: Bidirectional sync with Airtable using their REST API
- **Caching Strategy**: Query-level caching through TanStack Query with configurable invalidation

## Authentication & Authorization
- **Credential Management**: Environment-based secrets management through Replit's secret system
- **Setup Gate**: Application boots only after Airtable credentials are provided
- **API Security**: Credential validation before allowing data operations

## External Integrations
- **Airtable Integration**: Multi-table synchronization supporting 4+ tables from a single base
- **OpenAI Integration**: ChatGPT-powered portfolio advisor with rate limiting and conversation context
- **Development Tools**: Replit-specific plugins for runtime error overlay and cartographer

## Key Design Patterns
- **Modular Service Architecture**: Separate services for Airtable, Metrics, and OpenAI operations
- **Type Safety**: End-to-end TypeScript with shared schemas between client and server
- **Error Handling**: Comprehensive error boundaries with user-friendly messaging
- **Responsive Design**: Mobile-first approach with adaptive layouts and touch-friendly interfaces

# External Dependencies

## Core Infrastructure
- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with PostgreSQL adapter and Zod integration
- **Session Store**: PostgreSQL session storage (connect-pg-simple)

## Third-Party Services
- **Airtable API**: Portfolio data synchronization and mirroring
- **OpenAI API**: GPT-powered portfolio advisory and analysis
- **Replit Platform**: Development environment with secrets management

## UI Components & Styling
- **Design System**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icon library
- **Charts**: Placeholder implementation for data visualization

## Development & Build Tools
- **Build System**: Vite for frontend bundling and development server
- **Bundler**: esbuild for server-side bundling in production
- **TypeScript**: Full type checking with path mapping and module resolution
- **Development**: TSX for TypeScript execution and hot reloading