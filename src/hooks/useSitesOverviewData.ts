import _head from 'lodash/head'
import _map from 'lodash/map'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'
import { megaToTera } from '@/app/utils/deviceUtils'
import { formatValueUnit } from '@/app/utils/format'
import { convertUnits, UNIT_LABELS } from '@/app/utils/numberUtils'
import { CONTAINER_STATUS, ContainerStatus } from '@/app/utils/statusUtils'
import { SITE_OVERVIEW_STATUSES } from '@/Components/PoolManager/PoolManager.constants'
import { STAT_REALTIME } from '@/constants/tailLogStatKeys.constants'
import { UNITS } from '@/constants/units'
import {
  getContainerMinersChartData,
  MinerTailLogItem,
} from '@/Views/ContainerWidgets/ContainerWidget.util'

export interface ContainerUnit {
  id?: string
  type?: string
  info?: {
    container?: string
    nominalMinerCapacity?: string
  }
  miners?: {
    total: number
    disconnected: number
    actualMiners: number
  }
  last?: {
    snap?: {
      stats?: {
        status?: ContainerStatus
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  stats?: {
    status?: ContainerStatus
  }
  [key: string]: unknown
}

export interface ProcessedContainerUnit extends ContainerUnit {
  hashrate: string
  status: typeof SITE_OVERVIEW_STATUSES.MINING | typeof SITE_OVERVIEW_STATUSES.OFFLINE
}

export interface UseSitesOverviewDataResult {
  units: ProcessedContainerUnit[]
  isLoading: boolean
}

/**
 * Custom hook to fetch and process all data for Sites Overview
 * Extracts all data fetching and processing logic from the component
 *
 * @returns {UseSitesOverviewDataResult} Processed units data and loading status
 */
export const useSitesOverviewData = (): UseSitesOverviewDataResult => {
  // Fetch containers data
  const { data: unitsData, isLoading: isUnitsDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({ tags: { $in: ['t-container'] } }),
    status: 1,
    fields: JSON.stringify({
      id: 1,
      type: 1,
      info: 1,
      'last.snap.stats.status': 1,
    }),
  })

  // Fetch miner tail log data
  const { data: minerTailLogData, isLoading: isMinerTailLogLoading } = useGetTailLogQuery({
    key: STAT_REALTIME,
    type: 'miner',
    tag: 't-miner',
    limit: 1,
  })

  // Process units data
  const unitsDataArray = Array.isArray(unitsData) ? unitsData : []
  const tailLogArray = (_head(minerTailLogData) as MinerTailLogItem[] | undefined) || []
  const tailLogItem = _head(tailLogArray) ?? ({} as MinerTailLogItem)

  const rawUnits = _map(
    _head(unitsDataArray) as ContainerUnit[] | undefined,
    (unit: ContainerUnit) => ({
      ...unit,
      miners: getContainerMinersChartData(
        unit.info?.container ?? '',
        tailLogItem,
        Number(unit?.info?.nominalMinerCapacity) || 0,
      ),
    }),
  )

  // Calculate hash rate for each unit
  const getHashRate = (unit: ContainerUnit): string => {
    const model = unit.info?.container
    const hashRate =
      (tailLogItem as { hashrate_mhs_1m_group_sum_aggr?: Record<string, number> })
        ?.hashrate_mhs_1m_group_sum_aggr?.[model ?? ''] ?? 0
    const hashRatePhs = convertUnits(megaToTera(hashRate), UNIT_LABELS.TERA, UNIT_LABELS.PETA)
    return formatValueUnit(hashRatePhs, UNITS.HASHRATE_PH_S)
  }

  // Process units with hash rate and status
  const units: ProcessedContainerUnit[] = _map(rawUnits, (unit: ContainerUnit) => ({
    ...unit,
    hashrate: getHashRate(unit),
    status:
      unit.last?.snap?.stats?.status === CONTAINER_STATUS.RUNNING
        ? SITE_OVERVIEW_STATUSES.MINING
        : SITE_OVERVIEW_STATUSES.OFFLINE,
  }))

  const isLoading = isMinerTailLogLoading || isUnitsDataLoading

  return {
    units,
    isLoading,
  }
}
