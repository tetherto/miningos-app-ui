# MiningOS Mining Operations UI - Features & Architecture

This document provides a comprehensive overview of all major features, their implementation, and the files involved in the mining operations dashboard.

## Table of Contents

- [Core Features](#core-features)
- [Feature Control System](#feature-control-system)
- [State Management](#state-management)
- [File Organization](#file-organization)

## Core Features

### 1. Dashboard & Monitoring System

**Purpose**: Central command center for mining operations with real-time metrics and alerts

**Key Components**:

- Real-time hashrate and power consumption visualization
- Active incidents monitoring and alerting
- Revenue/cost forecasting for operational decisions
- Mine/stop-mine recommendation engine
- Pool statistics integration
- Power mode timeline tracking

**Implementation Files**:

```
src/Views/Dashboard/
├── Dashboard.js                    # Main dashboard orchestrator
├── MinerPools.js                   # Pool statistics component
└── Dashboard.styles.js             # Styled components

src/Components/Dashboard/
├── HashRateLineChart/              # Real-time hashrate visualization
├── ConsumptionLineChart/           # Power consumption charts
├── ActiveIncidentsCard/            # Live incident monitoring
├── GabbaniTotalSystemConsumptionChart/  # System-wide consumption
└── PowerModeTimelineChart/         # Power mode tracking

src/hooks/
├── useHeaderStats.js               # Dashboard statistics aggregation
└── useFetchLineChartData.js        # Real-time chart data polling
```

**State Management**:

- Feature flags: `powerModeTimeline`, `totalSystemConsumptionChart`, `exportHistKpiDashboard`
- Polling intervals: `POLLING_2m` for real-time updates
- Permission gates: Revenue reporting requires specific auth levels

---

### 2. Device Explorer & Management

**Purpose**: Interactive device browser with advanced selection, filtering, and bulk operation capabilities

**Key Components**:

- Multi-device selection with persistent state
- Real-time device status monitoring
- Advanced filtering by type, status, container, location
- Device details panel with live metrics and controls
- Support for miners, containers, LV cabinets

**Implementation Files**:

```
src/Views/Explorer/
├── Explorer.js                     # Main explorer orchestrator
├── ExplorerLayout.js               # Layout wrapper with routing
└── Explorer.styles.js              # Responsive layout styles

src/Components/Explorer/
├── List/
│   ├── ListView.js                 # Device list with filtering
│   ├── DeviceRow.js                # Individual device representation
│   └── ListView.const.js           # Tab and filter constants
├── DetailsView/
│   ├── DetailsView.js              # Selected devices details panel
│   └── SelectedDeviceCard.js       # Individual device details
└── LvCabinetDetailsView/           # LV cabinet specific details

src/hooks/
├── useListViewFilters.js           # Complex filtering logic
├── useFetchListThingsPaginatedData.js  # Paginated device data
└── useMultiSiteMode.js             # Multi-site detection
```

**State Management**:

```javascript
// Redux slice: devicesSlice.js
{
  selectedDevices: [],              // Currently selected miners
  selectedContainers: {},           // Selected containers by ID
  selectedLvCabinets: {},           # Selected LV cabinets by ID
  filterTags: [],                   // Applied filters
  selectedDevicesTags: {}           // Device-specific tag filters
}
```

---

### 3. Container Management System

**Purpose**: Container monitoring with widget-based interface and analytics

**Key Components**:

- Container status widgets with real-time telemetry
- Temperature, power, and efficiency monitoring
- Container selection and performance comparison
- LV cabinet management and monitoring
- Container-specific analytics and trend analysis

**Implementation Files**:

```
src/Views/ContainerWidgets/
├── ContainerWidgets.js             # Widget dashboard
├── ContainerWidgetCard.js          # Individual container widget
├── ContainerWidgetsLayout.js       # Navigation wrapper
└── ContainerWidgets.styles.js      # Widget styling

src/Views/ContainersChart/
├── ContainerCharts.js              # Container analytics dashboard
└── ContainerChartsBuilder/         # Chart configuration components

src/Views/Cabinet/
├── Cabinet.js                      # Individual cabinet view
└── Cabinet.styles.js               # Cabinet-specific styling

src/Views/LVCabinetWidgets/
├── LVCabinetWidgets.js             # LV cabinet dashboard
└── LVCabinetWidgetsLayout.js       # LV cabinet navigation

src/Components/Container/
├── ContainerCard/                  # Container status display
├── ContainerSelector/              # Container selection UI
└── ContainerStats/                 # Container metrics components
```

**Features**:

- Real-time container telemetry polling (5-second intervals)
- Container selection with escape key support
- Temperature and power threshold monitoring
- Historical performance tracking

---

### 4. Inventory Management

**Purpose**: Comprehensive inventory tracking for mining equipment, parts, and logistics

**Key Components**:

- Multi-category inventory (miners, spare parts, containers, dry coolers)
- Historical movement tracking and audit trails
- Shipping and packaging management
- Repair status tracking
- Inventory analytics and reporting

**Implementation Files**:

```
src/Views/Inventory/
├── InventoryLayout.js              # Main navigation layout
├── Dashboard.js                    # Inventory overview dashboard
├── Miners/
│   └── Miners.js                   # Miner inventory management
├── SpareParts/
│   └── SpareParts.js               # Parts inventory tracking
├── Containers/
│   └── Containers.js               # Container inventory
├── DryCooler/
│   └── DryCooler.js                # Cooling equipment tracking
├── HistoricalMovements/
│   └── HistoricalMovements.js      # Movement audit trail
├── Shipping/
│   └── Shipping.js                 # Shipping management
└── Repairs/
    └── Repairs.js                  # Repair status management
```

**Routing Structure**:

```
/inventory/
├── dashboard                       # Overview and statistics
├── miners                         # Miner inventory
├── spare-parts                     # Parts management
├── container                       # Container tracking
├── dry-coolers                     # Cooling equipment
├── shipping                        # Shipping operations
├── repairs                         # Repair tracking
├── movements                       # All movement history
└── movements/:deviceId             # Device-specific movements
```

---

### 5. Reporting & Analytics Suite

**Purpose**: Comprehensive reporting tools with specialized analytics for different operational aspects

**Key Components**:

- Multi-dimensional KPI reporting
- Real-time and historical analytics
- Energy and financial reporting
- Performance benchmarking
- Predictive analytics and forecasting

**Implementation Files**:

```
src/Views/ReportingTool/
├── ReportingToolLayout.js          # Permission-gated layout
├── Dashboard.js                    # Reporting hub
├── EnergyReport/                   # Power consumption
```

**Specialized Reports**:

#### Hashrate Report

- Real-time hashrate monitoring
- Historical trend analysis
- Pool-specific performance metrics

#### Energy Report

- Power consumption analytics
- Energy cost optimization
- Grid integration metrics

#### Container KPI

- Container-level performance tracking
- Efficiency comparisons
- Thermal management analytics

#### Site Operations

- Cross-functional operational metrics
- Downtime analysis
- Maintenance scheduling insights

**Permission System**:

```javascript
// All reporting requires permission check
const reportingReadPermission = `${AUTH_PERMISSIONS.REPORTING}:${AUTH_LEVELS.READ}`
```

---

### 6. Multi-Site Management

**Purpose**: Centralized management and analytics for multiple mining sites

**Key Components**:

- Cross-site dashboard aggregation
- Unified financial analytics
- Inter-site performance comparison
- Resource allocation optimization

**Implementation Files**:

```
src/router/multiSiteRouter.js       # Multi-site routing configuration

src/MultiSiteViews/
├── Dashboard/                      # Multi-site dashboard
│   ├── Dashboard.js                # Main multi-site view
│   ├── RevenuePerMonth.js          # Monthly revenue tracking
│   ├── BtcProduction.js            # Bitcoin production analytics
│   ├── Hashrate.js                 # Cross-site hashrate
│   ├── MonthlyAvgDowntime.js       # Downtime analytics
│   └── CostInput/                  # Cost input management
├── RevenueAndCost/                 # Financial analytics
│   ├── Ebitda.js                   # EBITDA tracking
│   ├── Revenue.js                  # Revenue analysis
│   ├── Cost.js                     # Cost management
│   ├── SubsidyFee.js              # Subsidy tracking
│   ├── EnergyRevenue.js           # Energy revenue optimization
│   ├── EnergyCost.js              # Energy cost analysis
│   ├── HashRevenue.js             # Hash revenue tracking
│   └── HashCost.js                # Hash cost analysis
├── Reports/                        # Multi-site reporting
└── SharedComponents/               # Reusable multi-site components

src/app/slices/multiSiteSlice.js    # Multi-site state management
```

**Features**:

- Site comparison analytics
- Consolidated financial reporting
- Resource optimization across sites
- Performance benchmarking

---

### 7. Alerts & Monitoring System

**Purpose**: Real-time alerting with comprehensive historical tracking and analysis

**Key Components**:

- Real-time alert monitoring and notifications
- Alert severity classification and filtering
- Historical alert analysis and trends
- Device-specific alert drilling and investigation
- Alert statistics integration in dashboard

**Implementation Files**:

```
src/Views/Alerts/
├── Alerts.js                       # Main alerts orchestrator
├── AlertsLayout.js                 # Navigation wrapper
├── CurrentAlerts/
│   └── CurrentAlerts.js            # Real-time alert monitoring
├── HistoricalAlerts/
│   └── HistoricalAlerts.js         # Historical alert analysis
└── Alerts.styles.js                # Alert styling

src/Components/Farms/FarmCard/StatBox/
└── AlertsBox.js                    # Dashboard alert widget

src/hooks/
├── useAlerts.js                    # Alert data management
└── useAlertFiltering.js            # Alert filtering logic
```

**Alert Categories**:

- Critical system alerts
- Performance threshold violations
- Equipment malfunction notifications
- Environmental condition alerts
- Network connectivity issues

**Features**:

- Real-time alert streaming
- Severity-based filtering (`SEVERITY_KEY`)
- Device correlation and navigation
- Historical trend analysis
- Alert acknowledgment and resolution tracking

---

### 8. Comments & Communication System

**Purpose**: Device-specific commenting and team communication with audit trails

**Key Components**:

- Device-specific commenting system
- Real-time comment updates and notifications
- Comment history and audit trails
- Search and filtering capabilities
- Integration with device management workflows

**Implementation Files**:

```
src/Views/Comments/
├── Comments.js                     # Main comments interface
├── CommentsLayout.js               # Navigation wrapper
├── SingleDeviceCommentsHistoryView.js # Device-specific history
└── Comments.styles.js              # Comment styling

src/Components/Comments/
├── CommentCard/                    # Individual comment display
├── CommentForm/                    # Comment creation interface
├── CommentThread/                  # Threaded discussions
└── CommentFilters/                 # Comment filtering UI

src/Components/CommentsModal/
├── CommentsModal.js                # Modal comment interface
└── CommentsModal.styles.js         # Modal styling

src/Components/CommentsPopover/
├── CommentsPopover.js              # Quick comment access
└── CommentsPopover.styles.js       # Popover styling
```

**Features**:

- Device-specific comment threads
- Real-time comment synchronization
- Comment search and filtering
- User mention and notification system
- Integration with device explorer

**Routing**:

```
/comments/                          # All comments view
/comments/:id                       # Device-specific comments
```

---

### 9. User Management & Settings

**Purpose**: User authentication, authorization, and system configuration management

**Key Components**:

- User authentication and session management
- Role-based access control (RBAC)
- Feature flag and configuration management
- System-wide settings and preferences
- Security and permission management

**Implementation Files**:

```
src/Views/Settings/
├── Settings.js                     # Main settings dashboard
├── UserManagement.js               # User administration
└── Settings.styles.js              # Settings styling

src/Views/SignIn/
├── SignIn.js                       # Authentication interface
└── SignIn.const.js                 # Auth constants and error codes

src/Views/SignOut/
└── SignOut.js                      # Session termination

src/Components/Settings/
├── FeatureFlagsSettings/           # Feature flag management
├── UserManagement/                 # User admin components
└── GateKeeper/                     # Permission enforcement

src/hooks/
├── usePermissions.js               # Permission checking hooks
├── useAuthToken.js                 # Token management
└── useTokenPolling.js              # Token refresh logic

src/app/slices/
├── authSlice.js                    # Authentication state
└── themeSlice.js                   # UI theme management

src/constants/
└── permissions.constants.js        # Permission definitions
```

**Authentication System**:

- JWT token-based authentication
- Automatic token refresh
- Session timeout handling
- Multi-level permission system

**Permission Levels**:

```javascript
AUTH_LEVELS: {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin'
}

AUTH_PERMISSIONS: {
  REVENUE: 'revenue',
  REPORTING: 'reporting',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_CONFIG: 'system_config'
}
```

---

### 10. Mining Operations Features

**Purpose**: Specialized tools for mining operation optimization and management

**Key Components**:

- Comprehensive miner performance monitoring
- Production data tracking and analytics
- Farm-level management and coordination
- Intelligent mine/stop-mine decision support
- Pool integration and statistics

**Implementation Files**:

```
src/Views/MinersOverview/
├── MinersOverview.js               # Miner fleet overview
├── MinersOverviewLayout.js         # Navigation wrapper
└── MinersOverview.styles.js        # Miner styling

src/Views/Farms/
├── Farms.js                        # Farm management interface
├── Thing.js                        # Individual device management
├── Things.js                       # Device collections
└── Farms.styles.js                 # Farm styling

src/Components/Farms/
├── FarmCard/                       # Farm status displays
├── FarmSelector/                   # Farm selection UI
├── MinerCard/                      # Individual miner widgets
└── ProductionMetrics/              # Production analytics components

src/hooks/
├── useMinerPerformance.js          # Miner performance management
└── usePoolStatistics.js            # Mining pool integration
```

**Production Tracking**:

- Bitcoin production monitoring
- Hashrate efficiency tracking
- Pool performance analysis
- Revenue attribution

---

## Feature Control System

The application implements a sophisticated two-tier feature control system for flexible deployment and testing:

### 1. Feature Flags (Temporary, URL-based)

**Purpose**: Dynamic feature enablement for testing and gradual rollouts

**Usage**: `?features=featureA,featureB,featureC`

**Implementation**:

```javascript
// Access via useGetFeaturesQuery()
const { data: featureFlags } = useGetFeaturesQuery()
```

**Current Feature Flags**:

```javascript
{
  userManagement: boolean,
  energyProvision: boolean,
  admeStatsEnabled: boolean,
  minersOverview: boolean,
  inventory: boolean,
  alertsHistoricalLogEnabled: boolean
}
```

### 2. Feature Configs (Permanent, Environment-based)

**Purpose**: Environment-specific feature configuration for different deployment environments

**Implementation**:

```javascript
// Access via useGetFeatureConfigQuery()
const { data: featureConfig } = useGetFeatureConfigQuery()
```

**Current Feature Configs**:

```javascript
{
  isOneMinItvEnabled: boolean,
  totalTransformerConsumptionHeader: boolean,
  poolStats: boolean,
  totalSystemConsumptionHeader: boolean,
  isStaticIpAssignment: boolean,
  comments: boolean,
  powerModeTimeline: boolean,
  totalSystemConsumptionChart: boolean,
  showMinerConsumptionDashboard: boolean,
  reporting: boolean,
  settings: boolean,
  containerCharts: boolean
}
```

### Feature Gating Patterns

**Layout-level Gating**:

```javascript
// ReportingToolLayout.js
const isReportingEnabled = featureConfig?.reporting
if (!isReportingEnabled) return null
```

**Component-level Gating**:

```javascript
// Dashboard.js
{
  featureFlags?.alertsHistoricalLogEnabled && (
    <HistoricalAlertsWrapper>
      <HistoricalAlerts />
    </HistoricalAlertsWrapper>
  )
}
```

**Permission-based Gating**:

```javascript
// Settings.js
<GateKeeper config={{ perm: reportingReadPermission }}>
  <ProtectedComponent />
</GateKeeper>
```

---

## State Management Architecture

### Redux Store Structure

**Main Store Configuration**: `src/app/store.js`

```javascript
// Combined reducers with persistence
const rootReducer = combineReducers({
  api: api.reducer,
  actionsSidebar: actionsSidebarSlice.reducer,
  actions: actionsSlice.reducer,
  sidebar: sidebarSlice.reducer,
  auth: authSlice.reducer,
  devices: devicesSlice.reducer,
  miners: minersSlice.reducer,
  multiSite: multiSiteSlice.reducer,
  notification: notificationSlice.reducer,
  pdu: pduSlice.reducer,
  theme: themeSlice.reducer,
  timezone: timezoneSlice.reducer,
})
```

### Key Redux Slices

#### 1. devicesSlice.js

**Purpose**: Device selection and filtering state management

```javascript
{
  selectedDevices: [],              // Currently selected miners
  selectedSockets: {},              // Selected device sockets
  filterTags: [],                   // Applied device filters
  selectedDevicesTags: {},          // Device-specific tags
  selectedContainers: {},           // Selected containers by ID
  selectedLvCabinets: {}            // Selected LV cabinets by ID
}
```

**Key Actions**:

- `setSelectedDevices` - Update miner selections
- `selectContainer` / `removeSelectedContainer` - Container management
- `selectLVCabinet` / `removeSelectedLVCabinet` - LV cabinet management
- `setFilterTags` - Update device filters

#### 2. authSlice.js

**Purpose**: Authentication and user session state

```javascript
{
  user: {},                         // Current user information
  token: '',                        // JWT authentication token
  permissions: [],                  // User permission set
  isAuthenticated: boolean          // Authentication status
}
```

#### 3. multiSiteSlice.js

**Purpose**: Multi-site operation coordination

```javascript
{
  selectedSites: [],                // Currently selected sites
  siteData: {},                     // Site-specific data cache
  crossSiteFilters: {}              // Cross-site filtering state
}
```

### API Integration with RTK Query

**Main API Slice**: `src/app/services/api.js`

**Key Query Endpoints**:

```javascript
{
  getSite: builder.query(),
  getFeatures: builder.query(),
  getFeatureConfig: builder.query(),
  getListThings: builder.query(),
  getTailLog: builder.query(),
  getGlobalConfig: builder.query()
}
```

**Polling Configuration**:

- Real-time data: 5-second intervals (`POLLING_5s`)
- Dashboard metrics: 2-minute intervals (`POLLING_2m`)
- Background updates: 30-second intervals (`POLLING_30s`)

### Data Flow Patterns

**1. Real-time Data Updates**:

```
WebSocket/Polling → RTK Query → Component State → UI Update
```

**2. User Interactions**:

```
UI Action → Redux Dispatch → State Update → Component Re-render
```

**3. Feature Gating**:

```
API Config → Feature Query → Conditional Rendering
```

---

## File Organization

### Directory Structure Overview

```
src/
├── Components/                     # Reusable UI components (77+ components)
│   ├── Dashboard/                  # Dashboard-specific components
│   ├── Explorer/                   # Device explorer components
│   ├── Container/                  # Container management components
│   ├── Farms/                      # Farm and device components
│   ├── Charts/                     # Chart and visualization components
│   ├── Settings/                   # Settings and configuration components
│   └── Shared/                     # Common shared components
├── Views/                          # Page-level components (23 main views)
│   ├── Dashboard/                  # Main dashboard view
│   ├── Explorer/                   # Device explorer pages
│   ├── Inventory/                  # Inventory management pages
│   ├── ReportingTool/              # Analytics and reporting pages
│   ├── Alerts/                     # Alert monitoring pages
│   ├── Settings/                   # Configuration pages
│   └── Layout/                     # Application layout components
├── MultiSiteViews/                 # Multi-site specific views
│   ├── Dashboard/                  # Multi-site dashboard
│   ├── RevenueAndCost/             # Financial analytics
│   └── SharedComponents/           # Multi-site shared components
├── app/                            # Redux store and state management
│   ├── services/                   # API definitions and RTK Query
│   ├── slices/                     # Redux state slices
│   ├── utils/                      # State management utilities
│   └── store.js                    # Main store configuration
├── hooks/                          # Custom React hooks (70+ hooks)
│   ├── usePermissions.js           # Permission management
│   ├── useFetchLineChartData.js    # Chart data polling
│   ├── useListViewFilters.js       # Filtering logic
│   └── useMultiSiteMode.js         # Multi-site detection
├── constants/                      # Application constants
│   ├── permissions.constants.js    # Permission definitions
│   ├── devices.js                  # Device type constants
│   ├── alerts.js                   # Alert configuration
│   └── pollingIntervalConstants.js # Polling intervals
├── router/                         # Routing configuration
│   ├── singleSiteRouter.js         # Single-site routes
│   └── multiSiteRouter.js          # Multi-site routes
├── Theme/                          # Styling and theming
│   ├── DarkTheme.ts                # Dark theme configuration
│   ├── AntdConfig.ts               # Custom Ant Design theme and configuration
│   ├── GlobalColors.ts             # Centralized color palette for consistent UI styling
│   └── GlobalStyle.ts              # Global CSS styles
└── styles/                         # Additional styling utilities
```

### Component Organization Patterns

**Feature-based Grouping**: Components are organized by feature area rather than technical function

**Co-location**: Related components, styles, and tests are kept together

**Example - Explorer Feature**:

```
Components/Explorer/
├── List/
│   ├── ListView.js
│   ├── ListView.styles.js
│   ├── ListView.test.js
│   └── ListView.const.js
├── DetailsView/
│   ├── DetailsView.js
│   └── DetailsView.styles.js
└── LvCabinetDetailsView/
    ├── LvCabinetDetailsView.js
    └── LvCabinetDetailsView.styles.js
```

### Import Patterns and Aliases

**Absolute Imports**: Uses `@/` alias for `src/` directory

```javascript
import { Component } from '@/Components/Component'
import { useHook } from '@/hooks/useHook'
import { API } from '@/app/services/api'
```

**Lazy Loading**: All Views use React.lazy() with SuspenseWrapper

```javascript
const Dashboard = lazy(() => import('@/Views/Dashboard/Dashboard'))
```

**Ant Design Imports**: Individual component imports for tree shaking

```javascript
import Button from 'antd/es/button'
import Modal from 'antd/es/modal'
```

This architecture supports a complex, feature-rich mining operations dashboard with clear separation of concerns, sophisticated state management, and flexible feature control systems.
