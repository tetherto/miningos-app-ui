# miningos-app-ui --- Mining OS App UI

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Feature Flags](#feature-flags)
4. [Feature Configs](#feature-configs)
5. [Mempool Data Integration via API](mempool-data-integration-via-api)
6. [Development Setup](#development-setup)
7. [Sentry Error Tracking](#sentry-error-tracking)
8. [Logger Service](#logger-service)
9. [Testing](#testing)
10. [Code Quality](#code-quality)
11. [Architecture Documentation](#architecture-documentation)
12. [Project Structure](#project-structure)
13. [Key Technologies](#key-technologies)
14. [Environment Variables](#environment-variables)
15. [Security](#security)

## Overview

**miningos-app-ui** is a comprehensive React-based dashboard for monitoring and managing Bitcoin mining operations. It serves as the primary user interface for MiningOS, consuming data from multiple specialized Node.js workers to provide real-time visibility and control over mining facilities, by consuming data from various backend workers through REST APIs.

## Architecture

This application is a **data consumer and control interface** in a distributed mining management system:

```
┌─────────────────────────────────────────────────────────────┐
│                  MiningOS Infrastructure                    │
│  (Miners, Containers, Sensors, Power Meters, etc.)          │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────────┐
    │   MiningOS Worker Layer     │
    │  (Node.js RPC Workers)      │
    ├─────────────────────────────┤
    │ • miningos-wrk-ext-mempool  │ ← Bitcoin network data
    │ • miningos-wrk-sensor       │ ← Temperature sensors
    │ • miningos-wrk-container    │ ← Mining containers
    │ • miningos-wrk-miner        │ ← Individual miners
    │ • miningos-wrk-powermeter   │ ← Power consumption
    └────────────┬────────────────┘
                 │
         ┌───────┴────────┐
         │  API Gateway   │
         │  (/auth/*)     │
         └───────┬────────┘
                 │
    ┌────────────┴──────────────┐
    │   miningos-app-ui         │
    │  (React + Redux + RTK)    │
    └───────────────────────────┘
```

### Related Projects

#### Parent/Sibling Workers

- **miningos-tpl-wrk-thing** - Base template for all device workers, provides core RPC infrastructure, thing management, and data collection patterns
- **miningos-wrk-ext-mempool** - Bitcoin network statistics worker (this README documents its integration)
- **miningos-wrk-sensor** - Temperature sensor data collection
- **miningos-wrk-container** - Mining container management (Bitdeer, MicroBT, Antspace)
- **miningos-wrk-miner** - Individual miner control and monitoring
- **miningos-wrk-powermeter** - Power consumption tracking

#### Shared Libraries

- **miningos-lib-stats** - Statistics aggregation and calculation utilities
- **miningos-lib-utils** - Common utility functions
- **hp-svc-facs-net** - Hyperswarm RPC networking layer
- **hp-svc-facs-store** - Hyperbee distributed storage layer

### API Gateway

- Base path: `${VITE_API_BASE_URL}auth` (typically `/auth/*` in production)

### Routing — single-site and multi-site

`App.tsx` picks one of two routers at runtime from the `isMultiSiteModeEnabled`
[feature config](#feature-configs):

- `src/router/singleSiteRouter.tsx` — the default. One facility; no cross-site routes.
- `src/router/multiSiteRouter.tsx` — adds the `src/MultiSiteViews/` tree (`/dashboard`,
  `/revenue-and-cost`, per-site routes under `/sites/:siteId`).

Each router is instantiated once and cached, not rebuilt per render — a browser router
owns its navigation state, and handing `RouterProvider` a fresh instance breaks
`useNavigate`. Every route is `React.lazy` behind a `<SuspenseWrapper>`; follow that
pattern when adding one.

## Feature Flags

Feature flags are release-specific controls used to enable or disable features dynamically without deploying new code. They allow teams to gradually roll out new features and test them in production before making them widely available.

- **Purpose**: Hide unstable or experimental features until they are ready
- **Usage**: Enabled manually by passing feature names as comma-separated values in the URL query parameters (e.g., `?features=featureA,featureB`)
- **Scope**: Limited to the current release and can be toggled on/off as needed

### Enabling Features

To enable features, use the `features` parameter in your URL.

#### Example

Enable both `reporting` and `poolStats`:

```
http://localhost:3030/?features=reporting,poolStats
```

#### Current Feature Flags

The authoritative list is the `FeatureFlags` interface in `src/types/api.d.ts`. Flags the
code actually reads:

- `userManagement` - User administration interface
- `inventory` - Inventory management system
- `alertsHistoricalLogEnabled` - Historical alert analysis
- `isDevelopment` - Development-only affordances

The type carries an index signature, so the backend may send others; anything not listed
above is not consulted by this app.

## Feature Configs

Feature configs are environment-specific settings that determine the behavior of a feature based on the deployment environment (e.g., development, staging, production sites).

- **Purpose**: Control feature availability or configuration based on the environment
- **Usage**: Configured in backend configuration files (dashboard-app-node repo)
- **Scope**: Persistent across releases and varies by environment

#### Current Feature Configs

- `isOneMinItvEnabled` - Enable 1-minute polling intervals
- `totalTransformerConsumptionHeader` - Show transformer consumption in header
- `poolStats` - Display mining pool statistics
- `totalSystemConsumptionHeader` - Show total system consumption in header
- `isStaticIpAssignment` - Use static IP assignment mode
- `comments` - Enable device commenting system
- `powerModeTimeline` - Display power mode timeline chart
- `totalSystemConsumptionChart` - Show system consumption chart on dashboard
- `showMinerConsumptionDashboard` - Display miner-level consumption data
- `powerAvailable` - Show available power metrics
- `reporting` - **[Default: false]** Enable the entire Reports section in the sidebar, including all Operations Reports (Dashboard, Hashrate, Energy, Efficiency, Miners) and Financial Reports (Revenue Summary, Cost Summary, EBITDA, Subsidy Fee, Hash Balance, Energy Balance, Cost Input). When disabled, the Reports menu item and all its sub-items are hidden from navigation
- `settings` - Enable settings management
- `containerCharts` - **[Default: false]** Display container analytics line charts at `/operations/mining/container-charts`. When disabled, hides the menu item and shows "Feature not enabled" message if accessed directly
- `isMultiSiteModeEnabled` - **[Default: false]** Enable multi-site mode with cross-site reporting and analytics. When `false` or `undefined`, the app runs in single-site mode with standard navigation. Multi-site routes (`/dashboard`, `/revenue-and-cost`, `/site-operations`, `/site-reports`) are completely excluded and the multi-site router is not loaded

### Backend Configuration Example

To configure feature configs in the backend (dashboard-app-node repo), set them in your environment-specific config file:

```json
{
  "featureConfig": {
    "reporting": false,
    "settings": true,
    "comments": false,
    "containerCharts": false,
    "isMultiSiteModeEnabled": false,
    "poolStats": true,
    "powerModeTimeline": true
  }
}
```

**Important**: Features default to `false` when not explicitly set. To enable a feature, you must explicitly set it to `true` in the backend configuration.

## Mempool Data Integration via API

The application consumes real-time Bitcoin network statistics from the **miningos-wrk-ext-mempool** worker to support mining profitability calculations and operational decisions.

### Data Source

**Worker**: `miningos-wrk-ext-mempool`  
**API Endpoint**: `/auth/ext-data?type=mempool` TODO: verify
**Update Frequency**: Every 30 minutes (configurable)  
**Data Storage**: Hyperbee distributed database with 180-day retention for hashrate history

### Available Metrics

The mempool worker provides the following data structure:

```typescript
interface MempoolData {
  // Bitcoin Price
  currentPrice: number // Current BTC price in USD
  priceChange24Hrs: number // 24-hour price change percentage

  // Network Status
  blockHeight: number // Current Bitcoin block height
  currentHashrate: number // Current network hashrate (H/s)
  currentDifficulty: number // Current mining difficulty

  // Difficulty Adjustment
  adjustments: {
    progressToDifficulty: number // Progress to next difficulty adjustment (%)
    nextAdjustmentTs: number // Timestamp of next adjustment
    nextAdjustmentExp: number // Expected difficulty change (%)
    prevAdjustment: number // Previous adjustment (%)
    avgBlockTime: number // Average block time (minutes)
  }

  // Block Rewards (averaged over time periods)
  blockRewardAvgs: {
    '24h': number // 24-hour average reward (BTC)
    '3d': number // 3-day average reward (BTC)
    '1w': number // 1-week average reward (BTC)
    '1m': number // 1-month average reward (BTC)
    '3m': number // 3-month average reward (BTC)
    '6m': number // 6-month average reward (BTC)
    '1y': number // 1-year average reward (BTC)
    '2y': number // 2-year average reward (BTC)
    '3y': number // 3-year average reward (BTC)
  }

  // Transaction Fees
  transactionFees: {
    fastest: number // Sat/vB for fastest confirmation
    halfHour: number // Sat/vB for ~30min confirmation
    hour: number // Sat/vB for ~1hr confirmation
  }
}
```

**Note**: The worker also stores historical hashrate data in Hyperbee with tags `'stat-30m'`, `'stat-3h'`, and `'stat-1D'`, but this historical data is not currently exposed through the UI's API query interface.

### Usage in Application

#### Basic Query

```javascript
import { useGetExtDataQuery } from '@/app/services/api'

const { data: mempoolData } = useGetExtDataQuery({ type: 'mempool' })

// Access data (returns array of data objects)
const bitcoinData = mempoolData?.[0]?.[0]

// Extract specific metrics
const btcPrice = bitcoinData?.currentPrice
const difficulty = bitcoinData?.currentDifficulty
const networkHashrate = bitcoinData?.currentHashrate
const blockRewards = bitcoinData?.blockRewardAvgs
const txFees = bitcoinData?.transactionFees
```

### Components Using Mempool Data

The following components and features consume mempool worker data:

- **Bitcoin Network Data Report** (`/reporting/bitcoin-network-data`) - Comprehensive view displaying:
  - Current BTC price and 24-hour price change
  - Block height and network hashrate
  - Difficulty adjustment metrics and progress gauge
  - Block reward averages (displays 24h, 1w, 1m periods)
  - Transaction fee recommendations (fastest, 30min, 1hr)

- **Weekly Forecast** (`/reporting/weekly-forecast`) - Uses network data for predictive analytics and profitability forecasting

- **Revenue Calculations** - Block reward averages and transaction fees are used in profitability calculations through hooks like `useRevenueNextHour`

- **Mine/Stop-Mine Decision Engine** - Network conditions (indirectly via revenue calculations) inform operational decisions displayed in the Dashboard

### Data Flow

```
┌─────────────────────┐
│  mempool.space API  │
│  (Public Bitcoin    │
│   Network Data)     │
└──────────┬──────────┘
           │ Poll every 30min
           │
┌──────────▼─────────────────────────────────────────────┐
│  miningos-wrk-ext-mempool                              │
│  • Fetches prices, hashrate, difficulty, fees          │
│  • Calculates rolling averages                         │
│  • Stores in Hyperbee (180-day retention)              │
│  • Exposes via RPC: getWrkExtData()                    │
└──────────┬─────────────────────────────────────────────┘
           │ RPC Communication
           │
┌──────────▼───────────┐
│   API Gateway        │
│   /auth/ext-data     │
└──────────┬───────────┘
           │ HTTP REST
           │
┌──────────▼───────────────────────────────────────────────┐
│  miningos-app-ui                                         │
│  • RTK Query: useGetExtDataQuery({ type: 'mempool' })    │
│  • Redux store caching                                   │
│  • Bitcoin Network Data Report component                 │
│  • Revenue calculation hooks                             │
└──────────────────────────────────────────────────────────┘
```

### Implementation Details

**File Locations**:

- Worker: `miningos-wrk-ext-mempool/workers/rack.mempool.ext.wrk.js`
- API Integration: `miningos-wrk-ext-mempool/workers/lib/mempool.api.js`
- UI Hook: `src/app/services/api.js` (RTK Query endpoint)

**Backend Capabilities**:
The mempool worker provides all 9 time periods for block reward averages (`'24h'`, `'3d'`, `'1w'`, `'1m'`, `'3m'`, `'6m'`, `'1y'`, `'2y'`, `'3y'`), though the UI currently displays only the first three periods in the Bitcoin Network Data Report.

**Polling Intervals**:

- Real-time data fetch: Every 30 minutes (configurable via `conf.mempool.dataFetchIntervalMs`)
- Historical data fetch: Every 12 hours (configurable via `conf.mempool.historicalDataFetchIntervalMs`)

## Development Setup

### Prerequisites

- Node.js >= 24
- npm >= 11

`engineStrict` is enabled, so these are a hard gate — `npm install` refuses to run on an
older Node. The repo ships an `.nvmrc`, so `nvm use` picks the right version up.

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

Application will be available at `http://localhost:3030`

### Demo Mode

```bash
# Start in demo mode
npm run start:demo

# Build for demo/offline deployment
npm run build:demo

# Preview demo build
npm run preview:demo
```

Demo mode (`VITE_USE_MOCKDATA=true`) suppresses behaviour that needs a live backend —
exports, alert sounds, error banners — and pins the financial views to a fixed date
range.

> **It ships no fixtures.** The recorded API responses that used to live in
> `src/mockdata/` were captured from production and have been removed, and the XHR
> interceptor that produced them was already gone. Demo mode currently renders empty.
> Restoring it needs synthetic fixtures generated from scratch — do not re-record live
> traffic. See [Security](#security).

### Building for Production

```bash
npm run build
```

## Sentry Error Tracking

To enable Sentry error tracking, create a `.sentryclirc` file from the example:

```bash
npm run sentry:create-config
```

Add your Sentry auth token to the configuration file.

Uploading source maps (`npm run sentry:sourcemaps`) additionally needs the organisation
and project, which `sentry-cli` reads from the environment:

```bash
export SENTRY_ORG=<org-slug>
export SENTRY_PROJECT=<project-slug>
```

In CI, set these as secrets. They are intentionally not hardcoded in `package.json`.

## Logger Service

The logger service is a centralized logging system that collects and stores logs from various components of the application.

To enable development mode logging:

```javascript
localStorage.setItem('features', JSON.stringify({ isDevelopment: true }))
```

In production, logs are automatically sent to Sentry.

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code with Prettier
npm run prettier:fix
```

## Architecture Documentation

For detailed information about the application architecture, features, and component organization, see:

- **[FEATURES_ARCHITECTURE.md](docs/FEATURES_ARCHITECTURE.md)** - Comprehensive feature documentation, state management, and file organization
- **[README_ContainerSettings.md](docs/README_ContainerSettings.md)** - Container settings API and threshold configuration guide

## Project Structure

```
src/
├── app/                          # Redux store and API services
│   ├── services/                 # RTK Query API definitions
│   │   ├── api.js               # Main API service
│   │   ├── websocket.js         # WebSocket service
│   │   └── logger.js            # Logging service
│   ├── slices/                  # Redux state slices
│   └── utils/                   # State management utilities
├── Components/                   # Reusable UI components (77+)
├── Views/                       # Page-level components (23+)
├── MultiSiteViews/              # Multi-site specific views
├── hooks/                       # Custom React hooks (70+)
├── constants/                   # Application constants
├── router/                      # Routing configuration
└── Theme/                       # Styling and theming
```

## Key Technologies

- **React 19** - UI framework
- **Redux Toolkit** - State management
- **RTK Query** - API integration and caching
- **Ant Design** - UI component library
- **styled-components** - CSS-in-JS styling
- **Chart.js** - Data visualization
- **React Router** - Client-side routing

## Environment Variables

### Core Configuration

```bash
VITE_API_BASE_URL=http://localhost:8080/  # API gateway URL
```
### Demo Mode Flag

#### `VITE_USE_MOCKDATA`

Enables demo mode. See [Demo Mode](#demo-mode) — it suppresses behaviour that needs a
live backend and pins the financial views to a fixed date range. It no longer loads
fixtures; the recorded responses it used to read were captured from production and have
been removed.

```bash
VITE_USE_MOCKDATA=true npm start
```

#### Using the flag in code

```typescript
import { isDemoMode } from '@/app/services/api.utils'

// Disable features in demo mode
<Button disabled={isDemoMode}>Export Data</Button>
```

`isUseMockdataEnabled` is exported from the same module and is currently an alias of
`isDemoMode`.

## Security

This repository is intended to be public. A CI job (`🔒 Content Scan` in
`.github/workflows/ci.yml`) blocks a list of terms that must not be published: real site
names, geography, hardware-partner names, internal codenames and hostnames, and
production-derived credentials.

The term list is **not stored here in plaintext** — publishing it would publish exactly
what it protects. `.github/security/denylist.sha256` holds SHA-256 digests only, and the
scanner reports `file:line` plus a category, never the matched text, because CI logs are
as public as the code.

```bash
# Scan the working tree the way CI does
node .github/scripts/scan-content.mjs

# Verify the scanner still detects what it should
node --test .github/scripts/scan-content.test.mjs
```

Run the self-test after touching the scanner. It exists because an earlier prototype used
`git grep -E '\b…'`, which matches nothing — POSIX ERE has no `\b` — and reported a
clean tree that was not clean. A check that fails open is worse than no check.

There are currently **no exemptions** — the scan passes on the tree as-is. The mechanism
exists for the case where a term genuinely cannot be removed: add a row to
`.github/security/exemptions.tsv` via `.github/scripts/hash-exemption.mjs`. Every row
carries a mandatory expiry and the scan **fails** once it passes, so an exemption is a
deadline, not a way to switch the check off. Prefer that over adding a term to the
denylist, which would disable it everywhere.

### Reporting

Do not open a public issue for a suspected leak or vulnerability. Contact the
maintainers privately.

### Do not commit recorded API traffic

If demo fixtures are ever restored, generate them synthetically. Recorded production
responses have leaked real site names, pool credentials and payout addresses here before.
