import _map from 'lodash/map'

import { Dashboard } from '../Icons/Dashboard'
import { Settings } from '../Icons/Settings'
import { FEATURE_CONFIG_KEYS, MENU_IDS, MENU_LABELS } from '../Sidebar.constants'

import type { SidebarItem } from './singleSiteMenu.config'

import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ROUTE } from '@/constants/routes'

/**
 * Site interface for multi-site navigation
 */
export interface Site {
  id: string
  name: string
  [key: string]: unknown
}

/**
 * Multi-site route path constants
 * These are the base paths used for multi-site navigation
 */
const MULTI_SITE_PATHS = {
  DASHBOARD: '/dashboard',
  REVENUE_AND_COST_BASE: '/revenue-and-cost',
  REVENUE_AND_COST_REVENUE: '/revenue-and-cost/revenue',
  REVENUE_AND_COST_COST: '/revenue-and-cost/cost',
  REVENUE_AND_COST_COST_INPUT: '/revenue-and-cost/cost-input',
  REVENUE_AND_COST_EBITDA: '/revenue-and-cost/ebitda',
  REVENUE_AND_COST_SUBSIDY_FEE: '/revenue-and-cost/subsidy-fee',
  REVENUE_AND_COST_ENERGY_REVENUE: '/revenue-and-cost/energy-revenue',
  REVENUE_AND_COST_ENERGY_COST: '/revenue-and-cost/energy-cost',
  REVENUE_AND_COST_HASH_REVENUE: '/revenue-and-cost/hash-revenue',
  REVENUE_AND_COST_HASH_COST: '/revenue-and-cost/hash-cost',
  SITE_OPERATIONS: '/site-operations',
  SITE_OPERATIONS_HASHRATE: '/site-operations/hashrate',
  SITE_OPERATIONS_EFFICIENCY: '/site-operations/efficiency',
  SITE_OPERATIONS_MINERS: '/site-operations/miners',
  SITE_OPERATIONS_POWER_CONSUMPTION: '/site-operations/power-consumption',
  SITE_REPORTS: '/site-reports',
} as const

/**
 * Route builder helper functions
 */
const buildSiteRoute = (siteId: string, path: string): string => `/sites/${siteId}${path}`

/**
 * Creates the "All Sites" menu section
 */
const createAllSitesMenu = (): SidebarItem => ({
  id: MENU_IDS.MULTI_SITE_ALL_SITES,
  to: ROUTE.HOME,
  icon: Dashboard,
  label: MENU_LABELS.ALL_SITES,
  items: [
    {
      id: MENU_IDS.DASHBOARD,
      to: MULTI_SITE_PATHS.DASHBOARD,
      label: MENU_LABELS.DASHBOARD,
    },
    {
      id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST,
      to: MULTI_SITE_PATHS.REVENUE_AND_COST_REVENUE,
      label: MENU_LABELS.REVENUE_AND_COST,
      items: [
        {
          id: MENU_IDS.MULTI_SITE_REVENUE,
          to: MULTI_SITE_PATHS.REVENUE_AND_COST_REVENUE,
          label: MENU_LABELS.REVENUE,
        },
        {
          id: MENU_IDS.MULTI_SITE_COST,
          to: MULTI_SITE_PATHS.REVENUE_AND_COST_COST,
          label: MENU_LABELS.COST,
        },
        {
          id: MENU_IDS.MULTI_SITE_COST_INPUT,
          to: MULTI_SITE_PATHS.REVENUE_AND_COST_COST_INPUT,
          label: MENU_LABELS.COST_INPUT,
        },
      ],
    },
    {
      id: MENU_IDS.MULTI_SITE_OPERATIONS,
      to: MULTI_SITE_PATHS.SITE_OPERATIONS,
      label: MENU_LABELS.OPERATIONS_REPORTS,
      items: [
        {
          id: MENU_IDS.DASHBOARD,
          to: MULTI_SITE_PATHS.SITE_OPERATIONS,
          label: MENU_LABELS.DASHBOARD,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_HASHRATE,
          to: MULTI_SITE_PATHS.SITE_OPERATIONS_HASHRATE,
          label: MENU_LABELS.HASHRATE,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_EFFICIENCY,
          to: MULTI_SITE_PATHS.SITE_OPERATIONS_EFFICIENCY,
          label: MENU_LABELS.EFFICIENCY,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_MINERS,
          to: MULTI_SITE_PATHS.SITE_OPERATIONS_MINERS,
          label: MENU_LABELS.MINERS,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_POWER_CONSUMPTION,
          to: MULTI_SITE_PATHS.SITE_OPERATIONS_POWER_CONSUMPTION,
          label: MENU_LABELS.POWER_CONSUMPTION,
        },
      ],
    },
    {
      id: MENU_IDS.MULTI_SITE_REPORTS,
      to: MULTI_SITE_PATHS.SITE_REPORTS,
      label: MENU_LABELS.REPORTS,
      featConfigKey: FEATURE_CONFIG_KEYS.REPORTING,
    },
  ],
})

/**
 * Creates a menu section for a specific site
 */
const createSiteMenu = (site: Site): SidebarItem => ({
  id: site.id,
  to: buildSiteRoute(site.id, ''),
  icon: Dashboard,
  label: site.name,
  items: [
    {
      id: MENU_IDS.DASHBOARD,
      to: buildSiteRoute(site.id, MULTI_SITE_PATHS.DASHBOARD),
      label: MENU_LABELS.DASHBOARD,
    },
    {
      id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST,
      to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_EBITDA),
      label: MENU_LABELS.REVENUE_AND_COST,
      items: [
        {
          id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST_EBITDA,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_EBITDA),
          label: MENU_LABELS.EBITDA,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_EFFICIENCY,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_SUBSIDY_FEE),
          label: MENU_LABELS.SUBSIDY_FEE_SHORT,
        },
        {
          id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST_ENERGY_REVENUE,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_ENERGY_REVENUE),
          label: MENU_LABELS.ENERGY_REVENUE,
        },
        {
          id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST_ENERGY_COST,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_ENERGY_COST),
          label: MENU_LABELS.ENERGY_COST,
        },
        {
          id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST_HASH_REVENUE,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_HASH_REVENUE),
          label: MENU_LABELS.HASH_REVENUE,
        },
        {
          id: MENU_IDS.MULTI_SITE_REVENUE_AND_COST_HASH_COST,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_HASH_COST),
          label: MENU_LABELS.HASH_COST,
        },
        {
          id: MENU_IDS.MULTI_SITE_COST_INPUT,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.REVENUE_AND_COST_COST_INPUT),
          label: MENU_LABELS.COST_INPUT,
        },
      ],
    },
    {
      id: MENU_IDS.MULTI_SITE_OPERATIONS,
      to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_OPERATIONS),
      label: MENU_LABELS.OPERATIONS_REPORTS,
      items: [
        {
          id: MENU_IDS.DASHBOARD,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_OPERATIONS),
          label: MENU_LABELS.DASHBOARD,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_HASHRATE,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_OPERATIONS_HASHRATE),
          label: MENU_LABELS.HASHRATE,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_EFFICIENCY,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_OPERATIONS_EFFICIENCY),
          label: MENU_LABELS.EFFICIENCY,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_WORKERS,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_OPERATIONS_MINERS),
          label: MENU_LABELS.WORKERS,
        },
        {
          id: MENU_IDS.MULTI_SITE_OPERATIONS_POWER_CONSUMPTION,
          to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_OPERATIONS_POWER_CONSUMPTION),
          label: MENU_LABELS.POWER_CONSUMPTION,
        },
      ],
    },
    {
      id: MENU_IDS.MULTI_SITE_REPORTS,
      to: buildSiteRoute(site.id, MULTI_SITE_PATHS.SITE_REPORTS),
      label: MENU_LABELS.REPORTS,
      featConfigKey: FEATURE_CONFIG_KEYS.REPORTING,
    },
  ],
})

/**
 * Creates the settings menu for multi-site mode
 */
const createMultiSiteSettingsMenu = (): SidebarItem => ({
  id: MENU_IDS.SETTINGS,
  to: ROUTE.SETTINGS,
  icon: Settings,
  label: MENU_LABELS.SETTINGS,
  authPermKey: {
    perm: `${AUTH_PERMISSIONS.USERS}:${AUTH_LEVELS.READ}`,
  },
  items: [
    {
      id: MENU_IDS.MULTI_SITE_SETTINGS_USERS,
      to: ROUTE.SETTINGS,
      label: MENU_LABELS.USER_MANAGEMENT,
    },
  ],
})

/**
 * Generates the complete multi-site navigation list
 * @param siteList - Array of sites to generate navigation for
 * @returns Array of sidebar items for multi-site navigation
 */
export const getMultiSiteNavigationList = (siteList: Site[]): SidebarItem[] => {
  const allSitesMenu = createAllSitesMenu()
  const siteMenus = _map(siteList, createSiteMenu)
  const settingsMenu = createMultiSiteSettingsMenu()

  return [allSitesMenu, ...siteMenus, settingsMenu]
}
