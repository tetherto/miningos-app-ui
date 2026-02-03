# CLAUDE.md - AI Assistant Guide for MiningOS App UI

This document provides essential information for AI assistants working on the MiningOS App UI codebase.

## Project Overview

**MiningOS App UI** is a React-based web dashboard for monitoring and managing Bitcoin mining operations. Despite the repository name suggesting "mobile-app-ui," this is a **full-featured web application** (SPA) that serves as the primary control interface for MiningOS infrastructure.

**Core Purpose**: Data consumer and control interface that aggregates data from multiple specialized Node.js workers via REST APIs to provide real-time visibility and control over mining facilities.

## Quick Start

```bash
# Install dependencies (requires Node.js >= 20, npm >= 10)
npm install

# Development server (localhost:3030)
npm start

# Run tests
npm test

# Lint and format
npm run lint:fix
npm run prettier:fix

# Type check
npm run typecheck

# Demo mode (no backend required)
npm run start:demo
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| State Management | Redux Toolkit + RTK Query |
| Build Tool | Vite 6 |
| Language | TypeScript 5.9 |
| UI Components | Ant Design 5 |
| Styling | styled-components 6 |
| Charts | Chart.js, react-chartjs-2, lightweight-charts |
| Forms | Formik + Yup |
| Routing | React Router DOM 6 |
| Testing | Vitest + Testing Library |
| Linting | ESLint 9 + Prettier |

## Project Structure

```
src/
├── app/                    # Redux store and API layer
│   ├── services/           # RTK Query API definitions (~150 endpoints)
│   │   ├── api.ts         # Main API service
│   │   ├── api.utils.ts   # Mock data utilities
│   │   └── logger.ts      # Centralized logging
│   ├── slices/            # Redux state slices (13 total)
│   └── utils/             # Utility functions (20+ files)
├── Components/            # Reusable UI components (77+ directories)
├── Views/                 # Page-level components (23+ directories)
├── MultiSiteViews/        # Multi-site specific views
├── hooks/                 # Custom React hooks (85+)
├── constants/             # Application constants
├── router/                # Routing configuration
│   ├── singleSiteRouter.tsx
│   └── multiSiteRouter.tsx
├── Theme/                 # Global styling
│   ├── GlobalStyle.ts
│   ├── DarkTheme.ts
│   └── AntdConfig.ts
├── types/                 # TypeScript type definitions
└── mockdata/              # Mock API responses for demo mode
```

## Code Conventions

### TypeScript

Follow conventions in `docs/TypeScript-Conventions.md`:

- Use `interface` for React props, data models, and API responses
- Use `type` for unions, intersections, mapped types, and function types
- Naming: `ButtonProps`, `GetDevicesResponse`, `CreateUserRequest`, `ThemeState`
- Avoid `any` - use `unknown` with type guards or `UnknownRecord` from `@/app/utils/deviceUtils/types`

```typescript
// Component props
interface CardProps {
  title: string
  onClick?: () => void
}

// API response
interface GetDevicesResponse {
  devices: Device[]
  total: number
}

// Union type
type DeviceStatus = 'online' | 'offline' | 'error'
```

### Component Structure

```
Components/ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.styles.ts # Styled components
├── ComponentName.types.ts  # Type definitions (if complex)
└── index.ts               # Barrel export
```

### Import Patterns

```typescript
// Use path aliases
import { Component } from '@/Components/Component'
import { useHook } from '@/hooks/useHook'
import { api } from '@/app/services/api'

// Ant Design - use direct ES imports for tree-shaking
import Button from 'antd/es/button'
import Modal from 'antd/es/modal'

// Date-fns - use direct imports
import { format, parseISO } from 'date-fns'
```

### Styling

- Use `styled-components` for component-specific styles
- Global colors in `src/Theme/GlobalColors.ts`
- Theme configuration in `src/Theme/AntdConfig.ts`

```typescript
import styled from 'styled-components'

const Container = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
`
```

## State Management

### Redux Store Structure

```typescript
{
  theme: ThemeState,           // Dark/light mode
  timezone: TimezoneState,     // User timezone preference
  auth: AuthState,             // Authentication & token
  devices: DevicesState,       // Selected devices & filters
  miners: MinersState,         // Miner-specific state
  multiSite: MultiSiteState,   // Multi-site configuration
  actions: ActionsState,       // Pending device actions
  notifications: NotificationState,
  [api]: RTKQueryState,        // RTK Query cache
}
```

### RTK Query API Pattern

```typescript
// Query hook usage
const { data, isLoading, error } = useGetDevicesQuery({ siteId })

// Mutation hook usage
const [updateDevice] = useUpdateDeviceMutation()
await updateDevice({ id, ...updates })
```

### Persisted State

These slices persist to localStorage: `auth`, `theme`, `devices`, `timezone`, `multiSite`, `sidebar`, `userInfo`

## Testing

- **Framework**: Vitest 3.0.8 with jsdom environment
- **Test Files**: Colocated `*.test.ts` or `*.spec.ts` files
- **Setup**: `src/setupTests.ts` with Testing Library matchers

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

Run tests:
```bash
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

## Feature Control System

### Feature Flags (URL-based, temporary)

Enable via URL: `?features=reporting,poolStats`

```typescript
const { data: featureFlags } = useGetFeaturesQuery()
if (featureFlags?.reporting) { /* ... */ }
```

### Feature Configs (Backend-driven, permanent)

```typescript
const { data: featureConfig } = useGetFeatureConfigQuery()
if (featureConfig?.containerCharts) { /* ... */ }
```

Key configs: `reporting`, `settings`, `comments`, `containerCharts`, `isMultiSiteModeEnabled`, `poolStats`

## Key Files Reference

| Purpose | File |
|---------|------|
| Redux store | `src/app/store.ts` |
| API endpoints | `src/app/services/api.ts` |
| Single-site routes | `src/router/singleSiteRouter.tsx` |
| Multi-site routes | `src/router/multiSiteRouter.tsx` |
| Auth slice | `src/app/slices/authSlice.ts` |
| Device state | `src/app/slices/devicesSlice.ts` |
| Permissions | `src/constants/permissions.constants.ts` |
| Theme config | `src/Theme/AntdConfig.ts` |
| Test setup | `src/setupTests.ts` |
| Vite config | `vite.config.js` |
| TypeScript config | `tsconfig.json` |

## Environment Variables

All must be prefixed with `VITE_`:

```bash
VITE_API_BASE_URL=http://localhost:8080/   # API gateway URL
VITE_USE_MOCKDATA=false                    # Enable mock data mode
VITE_SAVE_MOCKDATA=false                   # Enable mock data capture
PORT=3030                                  # Dev server port
```

## Common Patterns

### Lazy Loading Routes

All views use `React.lazy()` with `SuspenseWrapper`:

```typescript
const Dashboard = lazy(() => import('@/Views/Dashboard/Dashboard'))

<SuspenseWrapper>
  <Dashboard />
</SuspenseWrapper>
```

### Permission Gating

```typescript
import { GateKeeper } from '@/Components/Settings/GateKeeper'
import { AUTH_PERMISSIONS, AUTH_LEVELS } from '@/constants/permissions.constants'

<GateKeeper config={{ perm: `${AUTH_PERMISSIONS.REPORTING}:${AUTH_LEVELS.READ}` }}>
  <ProtectedComponent />
</GateKeeper>
```

### Custom Hooks

Located in `src/hooks/` with `use` prefix:

```typescript
const stats = useHeaderStats()
const { filters, setFilters } = useListViewFilters()
const isMultiSite = useMultiSiteMode()
```

## Things to Avoid

1. **Do NOT use `antd` direct imports** - Use `antd/es/*` for tree-shaking
2. **Do NOT use `date-fns` barrel imports** - Import specific functions
3. **Do NOT use `any` type** - Use `unknown` or proper typing
4. **Do NOT create nested ternaries** - Use early returns or variables
5. **Do NOT skip reading files before editing** - Always read first
6. **Do NOT use `git push --force`** - Use safe push strategies
7. **Do NOT install `@types/*` for libraries with built-in types** (Chart.js, styled-components, React Router)

## Build Commands

```bash
npm start              # Dev server
npm run start:staging  # Staging mode
npm run start:demo     # Demo mode with mock data

npm run build          # Production build
npm run build:staging  # Staging build
npm run build:demo     # Demo/offline build

npm run lint           # Check for lint issues
npm run lint:fix       # Auto-fix lint issues
npm run prettier:fix   # Format code

npm run typecheck      # TypeScript type checking
npm run check-deps     # Check for circular dependencies
npm run analyze        # Bundle size analysis
```

## Additional Documentation

- **Features & Architecture**: `docs/FEATURES_ARCHITECTURE.md`
- **TypeScript Conventions**: `docs/TypeScript-Conventions.md`
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **Main README**: `README.md`

## Commit Guidelines

When committing:
1. Run `npm run lint:fix && npm run prettier:fix` before committing
2. Run `npm test` to ensure tests pass
3. Use conventional commit messages (e.g., "feat:", "fix:", "refactor:")
4. Do not commit `.env` files with sensitive data
5. Do not commit mock data that contains real user information
