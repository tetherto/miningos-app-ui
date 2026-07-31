# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`miningos-app-ui` is a React dashboard for Bitcoin mining facility management. It consumes REST APIs and WebSocket data from multiple backend worker services (`miningos-wrk-*`).

## Commands

```bash
# Development
npm start                # Dev server at http://localhost:3030 (proxies /api, /auth, /ws to localhost:3000)
npm run start:staging    # Dev server in staging mode
npm start:demo           # Dev with mock data (no backend required)

# Build
npm run build            # Production build (output: build/)
npm run build:staging    # Staging build
npm run build:demo       # Build with mock data

# Quality — run all before opening a PR
npm run fullcheck        # prettier + lint + typecheck + tests
npm run lint             # Zero-warnings policy — any warning is a failure
npm run lint:fix
npm run prettier:fix
npm run typecheck

# Testing
npm test                 # Run all tests once
npm run test:watch
npm run test:coverage    # Thresholds: 80% lines/statements, 79% functions, 75% branches

# Run a single test file
npx vitest run src/path/to/file.test.ts

# Other
npm run check-deps       # Detect circular dependencies
npm run analyze          # Bundle analysis (opens stats.html)
```

## Architecture

### Data Flow
```
Mining Infrastructure (miners, containers, sensors, PDUs)
  → Worker services (miningos-wrk-miner, -container, -sensor, -powermeter, -ext-mempool)
    → API Gateway (/auth/*, /api/*)
      → This UI (React + Redux + RTK Query)
```

### Dual Router System
`App.tsx` selects a router at runtime based on the `isMultiSiteModeEnabled` feature config:
- `singleSiteRouter.tsx` — default; omits cross-site routes like `/dashboard`, `/revenue-and-cost`
- `multiSiteRouter.tsx` — adds `MultiSiteViews/` routes for cross-site analytics

All routes use `React.lazy()` wrapped in `<SuspenseWrapper>` — follow this pattern for any new route.

### State Management
Redux store with 12 slices in `src/app/slices/`: `actionsSidebar, actions, appSidebar, auth, devices, miners, multiSite, notification, pdu, theme, timezone, userInfo`. Persisted slices (via redux-persist): `auth, theme, devices, timezone, multiSite, sidebar, userInfo`.

RTK Query handles all API calls. Endpoint modules live in `src/app/services/api/endpoints/` (actions, auth, btcData, downtime, financial, global, logs, miners, operations, pools, reports, settings, things, users). The base query is in `src/app/services/api/baseQuery.ts` — it uses `p-queue` to throttle concurrent requests, with a separate lower-concurrency queue for the reporting-tools route.

### Feature Control (two separate systems)

1. **Feature flags** — URL query params (`?features=reporting,poolStats`). Per-session, temporary. Check via `useGetFeaturesQuery()` or `useFeatureFlags()` hook.
2. **Feature configs** — Persistent backend configuration. The most critical is `isMultiSiteModeEnabled`, which switches the entire router. Check via `useGetFeatureConfigQuery()` or `useFeatureConfigs()` hook.

These are intentionally separate: flags are developer/demo toggles; configs are environment-level settings.

### Demo Mode
`VITE_USE_MOCKDATA=true` (or `npm run start:demo`) enables demo mode, which suppresses behaviour needing a live backend — exports, alert sounds, error banners — and pins the financial views to a fixed date range. It ships **no fixtures**: `src/mockdata/` held recorded production traffic and was removed, along with the capture script. If demo fixtures are needed, generate them synthetically — never re-record live traffic.

### Real-Time Data
- WebSocket service at `src/app/services/websocket.js`
- Polling intervals defined in `src/constants/pollingIntervalConstants.ts` (`POLLING_5s`, `POLLING_30s`, `POLLING_2m`)
- `useFetchLineChartData()` hook manages chart data polling with refetch cancellation

### Permissions (RBAC)
`useHasTokenPerms()` hook gates UI elements by capability. Permission constants are in `src/constants/permissions.constants.ts`. Components render `null` when the user lacks a required permission. `<GateKeeper config={{ perm: '...' }}>` is the declarative component-level gate.

## Key Conventions

### TypeScript
Strict mode is enabled (`noImplicitAny`, `noImplicitReturns`, `strict: true`). Path aliases: `@/*` → `src/*`. Prefer `type` over `interface` for object shapes; use `interface` only for extendable contracts. Full conventions are documented in `docs/TypeScript-Conventions.md`.

### Imports
- Use path alias `@/` for all internal imports: `import { Foo } from '@/Components/Foo/Foo'`
- Import Ant Design components individually for tree-shaking: `import Button from 'antd/es/button'`

### Code Style
- Prettier: print width 100, single quotes, no semicolons, trailing commas
- ESLint: zero warnings — every warning is treated as an error
- `console.*` is banned everywhere except `src/app/services/logger.ts`; use the logger service instead

### Testing
Tests live alongside source files (`.test.ts` / `.spec.ts`). Vitest runs in jsdom with `TZ=UTC`. Global mocks set up in `src/setupTests/mocks/` (antd, DOM, react). Coverage excludes `Components/`, `Views/`, `MultiSiteViews/`, `router/`, `styles/`, `contexts/`, and `types/` — only utilities, hooks, and services are measured.

## Content security

This repo is going public. `.github/workflows/ci.yml` runs a blocking `🔒 Content Scan`
that rejects terms which must not be published (real site names, geography,
hardware-partner names, internal codenames/hostnames, production credentials).

- The denylist is **hashed**, not plaintext: `.github/security/denylist.sha256`. Never
  add a term in the clear anywhere in this repo, including CI config, comments and PR
  descriptions.
- The scanner reports `file:line` and a category, never the matched text — CI logs are
  public.
- Run it locally: `node .github/scripts/scan-content.mjs`
- After touching the scanner: `node --test .github/scripts/scan-content.test.mjs`
- There are no exemptions today. If a term truly cannot be removed, add a dated row to
  `.github/security/exemptions.tsv` (`hash-exemption.mjs`) rather than deleting the term
  from the denylist — exemptions expire and then fail the build; a denylist edit is silent.

## Documentation

- `docs/FEATURES_ARCHITECTURE.md` — maps major features to their source files
- `docs/TypeScript-Conventions.md` — detailed TS style guide (875 lines)
- `docs/ENVIRONMENT_SETUP.md` — local setup instructions
- `docs/README_ContainerSettings.md` — container API threshold configuration
