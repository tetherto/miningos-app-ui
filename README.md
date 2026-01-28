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
13. [Key Technologies](key-technologies)
14. [Environment Variables](#environment-variables)

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

- `userManagement` - User administration interface
- `energyProvision` - Energy provisioning controls
- `admeStatsEnabled` - Advanced mining efficiency statistics
- `minersOverview` - Comprehensive miner fleet view
- `inventory` - Inventory management system
- `alertsHistoricalLogEnabled` - Historical alert analysis
- `spotPriceSettings` - Spot price configuration
- `weeklyForecast` - Predictive analytics dashboard
- `oceanLuck` - Mining luck indicator

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

- Node.js >= 20
- npm >= 10

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

Run the application using mock data (no backend required):

```bash
# Start in demo mode with mock data
npm run start:demo

# Capture mock data while using the app
npm run start:demo-capture

# Build for demo/offline deployment
npm run build:demo

# Preview demo build
npm run preview:demo
```

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

### Mock Data System

The application includes a mock data system for development and testing purposes, allowing you to capture and replay API responses without requiring a live backend.

#### `VITE_SAVE_MOCKDATA`

Enables capturing of all XHR request arguments and their corresponding responses. When enabled, all API interactions are stored in `window.__mockdata` for later use.

**_Setup_**

1. Start the application normally (`npm run start`) and login
2. Stop the application. This would save the credentials in your browser which will be later used by the demo capture

**Quick Start:**

```bash
# 1. Start capture mode
npm run start:demo-capture

# 2. Navigate through the app (click pages you want to capture)
#    - Visit all containers, tabs, reports, etc.
#    - Avoid full page refreshes (clears captured data)

# 3. Open browser DevTools console (F12) and copy the data:
copy(window.__mockdata)

# 4. Create a new file called mockdata-raw.json in the project root
#    and paste the copied JSON data into it

# 5. Run the sanitization script (uses mockdata-raw.json by default):
npm run sanitize-mockdata

# 6. Test with mock data:
npm run start:demo
```

**What happens automatically:**

- ✅ Sanitizes sensitive data (tokens, emails, JWT)
- ✅ Splits data by feature into organized files:
  - `src/mockdata/base.json` - Feature config, user info
  - `src/mockdata/containers.json` - Container data
  - `src/mockdata/financial.json` - Financial reports
  - `src/mockdata/operations.json` - Mining operations
  - `src/mockdata/other.json` - Everything else
- ✅ Merges with existing files (keeps old data, adds/updates new)
- ✅ Auto-generates `src/mockdata/index.ts` to merge all files

**Advanced Options:**

```bash
# Use custom input file
npm run sanitize-mockdata my-capture.json

# Save to single file instead of splitting (legacy)
npm run sanitize-mockdata -- --no-split

# Save to specific split file
npm run sanitize-mockdata -- --split containers
```

**Incremental Updates:**

When you fix a bug and only need to update specific pages:

```bash
# 1. Start capture mode
npm run start:demo-capture

# 2. Visit ONLY the pages you fixed (e.g., Energy Balance)

# 3. Copy and save to mockdata-raw.json
copy(window.__mockdata)

# 4. Run sanitization (merges automatically, keeps all old data)
npm run sanitize-mockdata
```

**How Auto-Split Works:**

The script automatically categorizes data by URL patterns:

- `base.json` - Feature config, user, auth
- `containers.json` - Any key with "container"
- `financial.json` - Keys with "financial", "revenue", "cost", "energy"
- `operations.json` - Keys with "operations", "mining", "miner"
- `alerts.json` - Keys with "alert"
- `inventory.json` - Keys with "inventory"
- `pools.json` - Keys with "pool"
- `comments.json` - Keys with "comment"
- `settings.json` - Keys with "setting"
- `other.json` - Everything else

**Troubleshooting:**

- **"No data" on a page in demo mode**: The page wasn't visited during capture. Visit it with `npm run start:demo-capture` and run sanitization again.
- **Data seems old after merge**: The merge keeps old data for keys you didn't update. Visit the specific page again to update its data.
- **Want to start fresh**: Delete `src/mockdata/` folder and do a full capture.
- **If the demo or demo capture mode infinitely loops**: Follow the setup steps again before running the demo or demo capture again

**Security Note:**

The sanitization script automatically removes:

- **API tokens**: `pub:api:TOKEN-123-roles:*` → `pub:api:SANITIZED_TOKEN-123-roles:*`
- **Email addresses** → `mail@example.com`
- **JWT Bearer tokens** → `Bearer SANITIZED_JWT_TOKEN`
- **API keys** → `SANITIZED_API_KEY`
- **Location/Site names**: `Test-1`, `Test-2`, etc. → `Site A`, `Country A`
- **IP addresses**: `10.0.1.5` → `192.168.1.1`
- **MAC addresses**: `00:1A:2B:3C:4D:5E` → `00:00:00:00:00:00`
- **Phone numbers** (in phone/tel/mobile fields) → `+1-555-0100`

⚠️ Always review sanitized files before committing to ensure no sensitive data remains.

#### `VITE_USE_MOCKDATA`

Enables the application to use mock data from `src/mockdata.ts` instead of making real XHR requests to the backend.

**Usage:**

```bash
VITE_USE_MOCKDATA=true npm start
```

This is useful for:

- Frontend development without backend dependencies
- Consistent testing scenarios
- Demo environments
- Offline development

#### Using Mock Data Flags in Code

Import the constants from `api.utils`:

```typescript
import { isUseMockdataEnabled, isSaveMockdataEnabled, isDemoMode } from '@/app/services/api.utils'

// Disable features in demo mode
<Button disabled={isDemoMode}>Export Data</Button>

// Check specific flags
if (isUseMockdataEnabled) {
  // Using mock data
}
```
