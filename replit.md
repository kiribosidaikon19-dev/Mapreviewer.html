# Overview

A location-based review application built with React and Express. Users can view locations on an interactive map, add new locations, and leave reviews with ratings. The application features a full-stack TypeScript architecture with PostgreSQL for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Maps**: Leaflet with react-leaflet for interactive mapping using OpenStreetMap tiles
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js HTTP server created from Express app
- **API Design**: RESTful endpoints under `/api` prefix
- **Session Management**: Express sessions with MemoryStore (configurable for PostgreSQL via connect-pg-simple)
- **Authentication**: Simple username-based session auth (with Replit Auth integration available in `server/replit_integrations/auth`)

## Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Migrations**: Drizzle Kit with migrations output to `./migrations`
- **Tables**:
  - `users`: User accounts with UUID primary keys
  - `locations`: Geographic points with name, description, coordinates
  - `reviews`: User reviews with 1-5 ratings linked to locations

## Shared Code
- **Location**: `shared/` directory contains code used by both frontend and backend
- **Schema**: Drizzle table definitions and Zod validation schemas
- **Routes**: API route definitions with type-safe request/response schemas in `shared/routes.ts`

## Build System
- **Development**: Vite dev server with HMR, proxying API requests to Express
- **Production**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: esbuild bundles server to `dist/index.cjs`
- **Type Checking**: TypeScript with path aliases (`@/` for client, `@shared/` for shared code)

# External Dependencies

## Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building
- **connect-pg-simple**: Session storage in PostgreSQL (optional, currently using MemoryStore)

## Mapping
- **OpenStreetMap**: Tile provider for map display (no API key required)
- **Leaflet**: Core mapping library with react-leaflet bindings

## UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant styling
- **date-fns**: Date formatting with Japanese locale support

## Authentication (Optional)
- **Replit Auth**: OpenID Connect integration available in `server/replit_integrations/auth`
- **Passport.js**: Authentication middleware (for Replit Auth flow)

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret for session signing (required for production)
- `NODE_ENV`: Development or production mode