import { ReactNode } from 'react'

import { MinerOverviewIcon } from '../icons/MinerExplorerIcon'
import { PoolsIcon } from '../icons/PoolsIcon'
import { SiteOverviewIcon } from '../icons/SiteOverviewIcon'

import { ROUTE } from '@/constants/routes'

interface NavigationBlockItem {
  icon: ReactNode
  title: string
  description: string
  navText: string
  url: string
}

export const MAX_ALERTS_DISPLAYED = 5

export const navigationBlocks: NavigationBlockItem[] = [
  {
    icon: <PoolsIcon />,
    title: 'Pools',
    description: 'Manage pool configurations',
    navText: 'Configure Pools',
    url: ROUTE.POOL_MANAGER_POOL_ENDPOINTS,
  },
  {
    icon: <SiteOverviewIcon />,
    title: 'Site Overview',
    description: 'View site layout and assign pools at site/unit/miner level',
    navText: 'View Layout',
    url: ROUTE.POOL_MANAGER_SITES_OVERVIEW,
  },
  {
    icon: <MinerOverviewIcon />,
    title: 'Miner Explorer',
    description: 'Search and bulk-assign pools to miners',
    navText: 'Explore Miners',
    url: ROUTE.POOL_MANAGER_MINER_EXPLORER,
  },
] as const

export const alertsNeeded = new Set([
  'pool_connect_failed',
  'all_pools_dead',
  'wrong_miner_pool',
  'wrong_miner_subaccount',
  'wrong_worker_name',
  'ip_worker_name',
])
