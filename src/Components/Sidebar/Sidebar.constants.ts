/**
 * Sidebar Menu Item IDs
 * Used to uniquely identify menu items in the sidebar navigation
 */
export const MENU_IDS = {
  // Single-Site Menu IDs
  DASHBOARD: 'dashboard',
  OPERATIONS: 'operations',
  OPERATIONS_ENERGY: 'energy',
  OPERATIONS_MINING: 'mining',
  OPERATIONS_MINING_SITE_OVERVIEW: 'site-overview',
  OPERATIONS_MINING_EXPLORER: 'explorer',
  OPERATIONS_MINING_CONTAINER_CHARTS: 'container-charts',
  ALERTS: 'alerts',
  REPORTS: 'reports',
  REPORTS_OPERATIONS: 'operations-reports',
  REPORTS_OPERATIONS_DASHBOARD: 'dashboard',
  REPORTS_OPERATIONS_HASHRATE: 'hashrate',
  REPORTS_OPERATIONS_ENERGY: 'energy',
  REPORTS_OPERATIONS_EFFICIENCY: 'efficiency',
  REPORTS_OPERATIONS_MINERS: 'miners',
  REPORTS_FINANCIAL: 'financial-reports',
  REPORTS_FINANCIAL_REVENUE_SUMMARY: 'revenue-summary',
  REPORTS_FINANCIAL_COST_SUMMARY: 'cost-summary',
  REPORTS_FINANCIAL_EBITDA: 'ebitda',
  REPORTS_FINANCIAL_SUBSIDY_FEE: 'subsidy-fee',
  REPORTS_FINANCIAL_HASH_BALANCE: 'hash-balance',
  REPORTS_FINANCIAL_ENERGY_BALANCE: 'energy-balance',
  REPORTS_FINANCIAL_COST_INPUT: 'cost-input',
  COMMENTS: 'comments',
  INVENTORY: 'inventory',
  INVENTORY_DASHBOARD: 'dashboard',
  INVENTORY_MINERS: 'miners',
  INVENTORY_SPARE_PARTS: 'spare-parts',
  INVENTORY_REPAIRS: 'repairs',
  INVENTORY_MOVEMENTS: 'movements',
  POOL_MANAGER: 'poolManger',
  POOL_MANAGER_DASHBOARD: 'dashboard',
  POOL_MANAGER_ENDPOINTS: 'endpoints',
  POOL_MANAGER_EXPLORER: 'explorer',
  POOL_MANAGER_SITES: 'sites',
  SETTINGS: 'settings',
  SETTINGS_DASHBOARD: 'dashboard',
  SETTINGS_USER_MANAGEMENT: 'userManagement',
  // Multi-Site Menu IDs
  MULTI_SITE_ALL_SITES: 'all-sites',
  MULTI_SITE_REVENUE_AND_COST: 'revenue-and-cost',
  MULTI_SITE_REVENUE: 'revenue',
  MULTI_SITE_COST: 'cost',
  MULTI_SITE_COST_INPUT: 'cost-input',
  MULTI_SITE_OPERATIONS: 'operations',
  MULTI_SITE_OPERATIONS_HASHRATE: 'hashrate',
  MULTI_SITE_OPERATIONS_EFFICIENCY: 'Efficiency',
  MULTI_SITE_OPERATIONS_MINERS: 'miners',
  MULTI_SITE_OPERATIONS_WORKERS: 'workers',
  MULTI_SITE_OPERATIONS_POWER_CONSUMPTION: 'power-consumption',
  MULTI_SITE_REPORTS: 'reports',
  MULTI_SITE_SETTINGS: 'settings',
  MULTI_SITE_SETTINGS_USERS: 'users',
  MULTI_SITE_REVENUE_AND_COST_EBITDA: 'ebitda',
  MULTI_SITE_REVENUE_AND_COST_SUBSIDY_FEE: 'Efficiency',
  MULTI_SITE_REVENUE_AND_COST_ENERGY_REVENUE: 'energy-revenue',
  MULTI_SITE_REVENUE_AND_COST_ENERGY_COST: 'energy-cost',
  MULTI_SITE_REVENUE_AND_COST_HASH_REVENUE: 'hash-revenue',
  MULTI_SITE_REVENUE_AND_COST_HASH_COST: 'hash-cost',
} as const

/**
 * Sidebar Menu Labels
 * User-facing text labels for menu items
 */
export const MENU_LABELS = {
  // Single-Site Labels
  MAIN_DASHBOARD: 'Main Dashboard',
  OPERATIONS: 'Operations Centre',
  ENERGY: 'Energy',
  MINING: 'Mining',
  SITE_OVERVIEW: 'Site Overview',
  CONTAINER_CHARTS: 'Line Charts',
  EXPLORER: 'Explorer',
  ALERTS: 'Alerts',
  REPORTS: 'Reports',
  OPERATIONS_REPORTS: 'Operations',
  DASHBOARD: 'Dashboard',
  HASHRATE: 'Hashrate',
  EFFICIENCY: 'Efficiency',
  MINERS: 'Miners',
  FINANCIAL_REPORTS: 'Financials',
  REVENUE_SUMMARY: 'Revenue Summary',
  COST_SUMMARY: 'Cost Summary',
  EBITDA: 'EBITDA',
  SUBSIDY_FEE: 'Subsidy / Fee',
  HASH_BALANCE: 'Hash Balance',
  ENERGY_BALANCE: 'Energy Balance',
  COMMENTS: 'Comments',
  INVENTORY: 'Inventory',
  SPARE_PARTS: 'Spare Parts',
  REPAIR_HISTORY: 'Repair History',
  HISTORICAL_MOVEMENTS: 'Historical Movements',
  POOL_MANAGER: 'Pool Manager',
  POOL_ENDPOINTS: 'Pool Endpoints',
  MINER_EXPLORER: 'Miner Explorer',
  SITES_OVERVIEW: 'Sites Overview',
  SETTINGS: 'Settings',
  USER_MANAGEMENT: 'User Management',
  // Multi-Site Labels
  ALL_SITES: 'All Sites',
  REVENUE_AND_COST: 'Revenue and Cost',
  REVENUE: 'Revenue',
  COST: 'Cost',
  COST_INPUT: 'Cost Input',
  WORKERS: 'Workers',
  POWER_CONSUMPTION: 'Power Consumption',
  SUBSIDY_FEE_SHORT: 'Subsidy Fee',
  ENERGY_REVENUE: 'Energy Revenue',
  ENERGY_COST: 'Energy Cost',
  HASH_REVENUE: 'Hash Revenue',
  HASH_COST: 'Hash Cost',
} as const

/**
 * Feature Flag Keys
 * Keys used to check if features are enabled via feature flags
 */
export const FEATURE_FLAG_KEYS = {
  INVENTORY: 'inventory',
  HASHRATE_REPORT: 'hashrateReport',
  SITE_OPERATIONS_ENABLED: 'siteOperationsEnabled',
  SITE_ENERGY_ENABLED: 'siteEnergyEnabled',
  USER_MANAGEMENT: 'userManagement',
} as const

/**
 * Feature Config Keys
 * Keys used to check feature configuration settings
 */
export const FEATURE_CONFIG_KEYS = {
  REPORTING: 'reporting',
  COMMENTS: 'comments',
  SETTINGS: 'settings',
  LV_CABINET_WIDGETS: 'lvCabinetWidgets',
  CONTAINER_CHARTS: 'containerCharts',
} as const

// Type exports
export type MenuId = (typeof MENU_IDS)[keyof typeof MENU_IDS]
export type MenuLabel = (typeof MENU_LABELS)[keyof typeof MENU_LABELS]
export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS]
export type FeatureConfigKey = (typeof FEATURE_CONFIG_KEYS)[keyof typeof FEATURE_CONFIG_KEYS]
