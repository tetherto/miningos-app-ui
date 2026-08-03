import type { ComponentType } from 'react'

import { CommentIcon } from '../../Icons/CommentIcon'
import { Alerts } from '../Icons/Alerts'
import { CabinetWidgetIcon } from '../Icons/CabinetWidgetIcon'
import { ContainerWidgets } from '../Icons/ContainerWidgets'
import { Dashboard } from '../Icons/Dashboard'
import { Explorer } from '../Icons/Explorer'
import { Financials } from '../Icons/Financials'
import { Inventory } from '../Icons/Inventory'
import { Operations } from '../Icons/Operations'
import { PoolManagerIcon } from '../Icons/PoolManager'
import { Reporting } from '../Icons/Reporting'
import { Settings } from '../Icons/Settings'
import { FEATURE_CONFIG_KEYS, FEATURE_FLAG_KEYS, MENU_IDS, MENU_LABELS } from '../Sidebar.constants'

import { isUseMockdataEnabled } from '@/app/services/api.utils'
import { CROSS_THING_TYPES } from '@/constants/devices'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '@/constants/permissions.constants'
import { ROUTE } from '@/constants/routes'

/**
 * Sidebar Item Type Definition
 */
export interface SidebarItem {
  id: string
  to: string
  label: string
  icon?: ComponentType<{ isActive: boolean }>
  disabled?: boolean
  authPermKey?: {
    cap?: string
    perm?: string
    write?: boolean
  }
  featConfigKey?: string
  featFlagKey?: string
  items?: SidebarItem[]
}

/**
 * Single-Site Sidebar Menu Configuration
 * Main navigation menu for single-site mode
 */
export const SIDEBAR_MENU_ITEMS: SidebarItem[] = [
  {
    id: MENU_IDS.DASHBOARD,
    to: ROUTE.HOME,
    icon: Dashboard,
    label: MENU_LABELS.MAIN_DASHBOARD,
  },
  {
    id: MENU_IDS.OPERATIONS,
    to: ROUTE.OPERATIONS,
    icon: Explorer,
    label: MENU_LABELS.OPERATIONS,
    items: [
      {
        id: MENU_IDS.OPERATIONS_ENERGY,
        to: ROUTE.OPERATIONS_ENERGY,
        icon: CabinetWidgetIcon,
        label: MENU_LABELS.ENERGY,
        featConfigKey: FEATURE_CONFIG_KEYS.LV_CABINET_WIDGETS,
        disabled: isUseMockdataEnabled,
        authPermKey: {
          perm: `${AUTH_PERMISSIONS.CABINETS}:${AUTH_LEVELS.READ}`,
        },
      },
      {
        id: MENU_IDS.OPERATIONS_MINING,
        to: ROUTE.OPERATIONS_MINING,
        icon: ContainerWidgets,
        label: MENU_LABELS.MINING,
        authPermKey: {
          perm: `${AUTH_PERMISSIONS.CONTAINER}:${AUTH_LEVELS.READ}`,
        },
        items: [
          {
            id: MENU_IDS.OPERATIONS_MINING_SITE_OVERVIEW,
            to: ROUTE.OPERATIONS_MINING_SITE_OVERVIEW,
            label: MENU_LABELS.SITE_OVERVIEW,
          },
          {
            id: MENU_IDS.OPERATIONS_MINING_EXPLORER,
            to: `${ROUTE.OPERATIONS_MINING_EXPLORER}?tab=${CROSS_THING_TYPES.CONTAINER}`,
            label: MENU_LABELS.EXPLORER,
            authPermKey: {
              perm: `${AUTH_PERMISSIONS.EXPLORER}:${AUTH_LEVELS.READ}`,
            },
          },
          {
            id: MENU_IDS.OPERATIONS_MINING_CONTAINER_CHARTS,
            to: ROUTE.OPERATIONS_MINING_CONTAINER_CHARTS,
            label: MENU_LABELS.CONTAINER_CHARTS,
            featConfigKey: FEATURE_CONFIG_KEYS.CONTAINER_CHARTS,
            disabled: isUseMockdataEnabled,
          },
        ],
      },
    ],
  },
  {
    id: MENU_IDS.ALERTS,
    to: ROUTE.ALERTS,
    icon: Alerts,
    label: MENU_LABELS.ALERTS,
    authPermKey: {
      perm: `${AUTH_PERMISSIONS.ALERTS}:${AUTH_LEVELS.READ}`,
    },
  },
  {
    id: MENU_IDS.REPORTS,
    to: ROUTE.REPORTS,
    icon: Reporting,
    label: MENU_LABELS.REPORTS,
    featConfigKey: FEATURE_CONFIG_KEYS.REPORTING,
    authPermKey: {
      perm: `${AUTH_PERMISSIONS.REPORTING}:${AUTH_LEVELS.READ}`,
    },
    items: [
      {
        id: MENU_IDS.REPORTS_OPERATIONS,
        to: ROUTE.REPORTS_OPERATIONS,
        icon: Operations,
        label: MENU_LABELS.OPERATIONS_REPORTS,
        items: [
          {
            id: MENU_IDS.REPORTS_OPERATIONS_DASHBOARD,
            to: ROUTE.REPORTS_OPERATIONS_DASHBOARD,
            label: MENU_LABELS.DASHBOARD,
          },
          {
            id: MENU_IDS.REPORTS_OPERATIONS_HASHRATE,
            to: ROUTE.REPORTS_OPERATIONS_HASHRATE,
            label: MENU_LABELS.HASHRATE,
            featFlagKey: FEATURE_FLAG_KEYS.HASHRATE_REPORT,
          },
          {
            id: MENU_IDS.REPORTS_OPERATIONS_ENERGY,
            to: ROUTE.REPORTS_OPERATIONS_ENERGY,
            label: MENU_LABELS.ENERGY,
            featFlagKey: FEATURE_FLAG_KEYS.SITE_ENERGY_ENABLED,
          },
          {
            id: MENU_IDS.REPORTS_OPERATIONS_EFFICIENCY,
            to: ROUTE.REPORTS_OPERATIONS_EFFICIENCY,
            label: MENU_LABELS.EFFICIENCY,
            featFlagKey: FEATURE_FLAG_KEYS.SITE_OPERATIONS_ENABLED,
          },
          {
            id: MENU_IDS.REPORTS_OPERATIONS_MINERS,
            to: ROUTE.REPORTS_OPERATIONS_MINERS,
            label: MENU_LABELS.MINERS,
            featFlagKey: FEATURE_FLAG_KEYS.SITE_OPERATIONS_ENABLED,
          },
        ],
      },
      {
        id: MENU_IDS.REPORTS_FINANCIAL,
        to: ROUTE.REPORTS_FINANCIAL,
        icon: Financials,
        label: MENU_LABELS.FINANCIAL_REPORTS,
        items: [
          {
            id: MENU_IDS.REPORTS_FINANCIAL_REVENUE_SUMMARY,
            to: ROUTE.REPORTS_FINANCIAL_REVENUE_SUMMARY,
            label: MENU_LABELS.REVENUE_SUMMARY,
          },
          {
            id: MENU_IDS.REPORTS_FINANCIAL_COST_SUMMARY,
            to: ROUTE.REPORTS_FINANCIAL_COST_SUMMARY,
            label: MENU_LABELS.COST_SUMMARY,
          },
          {
            id: MENU_IDS.REPORTS_FINANCIAL_EBITDA,
            to: ROUTE.REPORTS_FINANCIAL_EBITDA,
            label: MENU_LABELS.EBITDA,
          },
          {
            id: MENU_IDS.REPORTS_FINANCIAL_SUBSIDY_FEE,
            to: ROUTE.REPORTS_FINANCIAL_SUBSIDY_FEE,
            label: MENU_LABELS.SUBSIDY_FEE,
          },
          {
            id: MENU_IDS.REPORTS_FINANCIAL_HASH_BALANCE,
            to: ROUTE.REPORTS_FINANCIAL_HASH_BALANCE,
            label: MENU_LABELS.HASH_BALANCE,
          },
          {
            id: MENU_IDS.REPORTS_FINANCIAL_ENERGY_BALANCE,
            to: ROUTE.REPORTS_FINANCIAL_ENERGY_BALANCE,
            label: MENU_LABELS.ENERGY_BALANCE,
          },
          {
            id: MENU_IDS.REPORTS_FINANCIAL_COST_INPUT,
            to: ROUTE.REPORTS_FINANCIAL_COST_INPUT,
            label: MENU_LABELS.COST_INPUT,
          },
        ],
      },
    ],
  },
  {
    id: MENU_IDS.COMMENTS,
    to: ROUTE.COMMENTS,
    icon: CommentIcon,
    label: MENU_LABELS.COMMENTS,
    featConfigKey: FEATURE_CONFIG_KEYS.COMMENTS,
    disabled: isUseMockdataEnabled,
    authPermKey: {
      perm: `${AUTH_PERMISSIONS.COMMENTS}:${AUTH_LEVELS.READ}`,
    },
  },
  {
    id: MENU_IDS.INVENTORY,
    to: ROUTE.INVENTORY_DASHBOARD,
    icon: Inventory,
    label: MENU_LABELS.INVENTORY,
    featFlagKey: FEATURE_FLAG_KEYS.INVENTORY,
    authPermKey: {
      perm: `${AUTH_PERMISSIONS.INVENTORY}:${AUTH_LEVELS.READ}`,
    },
    items: [
      {
        id: MENU_IDS.INVENTORY_DASHBOARD,
        to: ROUTE.INVENTORY_DASHBOARD,
        label: MENU_LABELS.DASHBOARD,
      },
      {
        id: MENU_IDS.INVENTORY_MINERS,
        to: ROUTE.INVENTORY_MINERS,
        label: MENU_LABELS.MINERS,
      },
      {
        id: MENU_IDS.INVENTORY_SPARE_PARTS,
        to: ROUTE.INVENTORY_SPARE_PARTS,
        label: MENU_LABELS.SPARE_PARTS,
      },
      {
        id: MENU_IDS.INVENTORY_REPAIRS,
        to: ROUTE.INVENTORY_REPAIRS,
        label: MENU_LABELS.REPAIR_HISTORY,
      },
      {
        id: MENU_IDS.INVENTORY_MOVEMENTS,
        to: ROUTE.INVENTORY_MOVEMENTS,
        label: MENU_LABELS.HISTORICAL_MOVEMENTS,
      },
    ],
  },
  {
    id: MENU_IDS.POOL_MANAGER,
    to: ROUTE.POOL_MANAGER_DASHBOARD,
    icon: PoolManagerIcon,
    label: MENU_LABELS.POOL_MANAGER,
    items: [
      {
        id: MENU_IDS.POOL_MANAGER_DASHBOARD,
        to: ROUTE.POOL_MANAGER_DASHBOARD,
        label: MENU_LABELS.DASHBOARD,
      },
      {
        id: MENU_IDS.POOL_MANAGER_ENDPOINTS,
        to: ROUTE.POOL_MANAGER_POOL_ENDPOINTS,
        label: MENU_LABELS.POOL_ENDPOINTS,
      },
      {
        id: MENU_IDS.POOL_MANAGER_EXPLORER,
        to: ROUTE.POOL_MANAGER_MINER_EXPLORER,
        label: MENU_LABELS.MINER_EXPLORER,
      },
      {
        id: MENU_IDS.POOL_MANAGER_SITES,
        to: ROUTE.POOL_MANAGER_SITES_OVERVIEW,
        label: MENU_LABELS.SITES_OVERVIEW,
      },
    ],
  },
  {
    id: MENU_IDS.SETTINGS,
    to: ROUTE.SETTINGS_DASHBOARD,
    icon: Settings,
    label: MENU_LABELS.SETTINGS,
    featConfigKey: FEATURE_CONFIG_KEYS.SETTINGS,
    authPermKey: {
      perm: `${AUTH_PERMISSIONS.SETTINGS}:${AUTH_LEVELS.READ}`,
    },
    items: [
      {
        id: MENU_IDS.SETTINGS_DASHBOARD,
        to: ROUTE.SETTINGS_DASHBOARD,
        label: MENU_LABELS.DASHBOARD,
        disabled: isUseMockdataEnabled,
      },
    ],
  },
]
