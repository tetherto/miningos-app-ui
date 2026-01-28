import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _sum from 'lodash/sum'
import _values from 'lodash/values'
import { useMemo } from 'react'

import { MinerModeKey, MinerTypePowerModesMap } from '../EnergyReport.constants'

import { useEnergyReportData } from './useEnergyReportData'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'
import {
  formatPowerConsumption as formatPowerConsumptionUtil,
  UnknownRecord,
} from '@/app/utils/deviceUtils'
import { formatUnit } from '@/app/utils/format'
import { getByTagsQuery } from '@/app/utils/queryUtils'
import {
  COMPLETE_MINER_TYPES,
  CompleteMinerTypeValue,
  MINER_TYPE_NAME_MAP,
} from '@/constants/deviceConstants'
import { MinerTailLogItem } from '@/Views/ContainerWidgets/ContainerWidget.util'

interface DateRange {
  start: number
  end: number
}

interface ContainerItem {
  containerId?: string
  info?: { container?: string; nominalMinerCapacity?: number }
  [key: string]: unknown
}

export interface ContainerWithMinersCount extends ContainerItem {
  minersCount: number
}

export interface PowerModeDataItem {
  minerType: string
  count: number
  power: string
  [key: string]: string | number
}

interface UseEnergyReportSiteViewReturn {
  powerConsumptionData: ReturnType<typeof useEnergyReportData>
  powerModeData: PowerModeDataItem[]
  containers: ContainerWithMinersCount[]
  tailLogData: MinerTailLogItem[]
  isLoading: boolean
  refetchSnapshotData: () => void
}

export const getMinersTypePowerModeChartData = (
  type: CompleteMinerTypeValue,
  tailLogItem: unknown,
) => {
  if (_isEmpty(tailLogItem)) {
    return {}
  }

  const typedTailLogItem = tailLogItem as Record<string, { [key: string]: UnknownRecord }>
  const data = _reduce(
    _keys(MinerTypePowerModesMap),
    (accum, key) => {
      const modeKey = MinerTypePowerModesMap[key as MinerModeKey]

      if (typeof modeKey === 'string') {
        return {
          ...accum,
          [modeKey]: typedTailLogItem[key]?.[type] || 0,
        }
      }
      return accum
    },
    {},
  )

  return {
    ...data,
    total: _sum(_values(data)),
  }
}

/**
 * Custom hook to fetch and process all data for the Energy Report Site View
 * @param dateRange - Date range object with start and end timestamps
 * @returns Processed data and loading states for the Energy Report Site View
 */
export const useEnergyReportSiteView = (dateRange: DateRange): UseEnergyReportSiteViewReturn => {
  // Fetch power consumption data for the chart
  const powerConsumptionData = useEnergyReportData(dateRange)

  // Fetch latest snapshot data (independent of date picker)
  const {
    data: tailLogData,
    isLoading: isMinerTailLogLoading,
    refetch: refetchTailLog,
  } = useGetTailLogQuery({
    key: 'stat-5m',
    type: 'miner',
    tag: 't-miner',
    limit: 1,
    // No start/end params = fetch latest snapshot
  })

  const {
    data: containersData,
    isLoading: isContainersLoading,
    refetch: refetchContainers,
  } = useGetListThingsQuery({
    query: getByTagsQuery(['t-container']),
    status: 1,
    limit: 1000,
    sort: JSON.stringify({ 'info.container': 1 }),
    fields: JSON.stringify({
      info: 1,
      id: 1,
      type: 1,
      'last.snap.stats.power_w': 1,
    }),
  })

  // Process power mode data by miner type
  const powerModeData = useMemo(
    () =>
      _map(_values(COMPLETE_MINER_TYPES), (type) => {
        const tailLogItem = _head(tailLogData)
        const statusData = getMinersTypePowerModeChartData(type, tailLogItem)

        return {
          minerType: MINER_TYPE_NAME_MAP[type] ?? type,
          count: _get(tailLogItem, ['type_cnt', type], 0), // Unique miner count by type
          power: formatUnit(
            formatPowerConsumptionUtil(_get(tailLogItem, ['power_w_type_group_sum_aggr', type], 0)),
          ),
          ...statusData,
        }
      }),
    [tailLogData],
  )

  // Extract miners online hash table from tail log
  const minersOnlineWebappHashTable: Record<string, number> = useMemo(
    () =>
      (
        _head(tailLogData) as {
          hashrate_mhs_5m_active_container_group_cnt?: Record<string, number>
        }
      )?.hashrate_mhs_5m_active_container_group_cnt ?? {},
    [tailLogData],
  )

  // Process containers with miner counts
  const containers: ContainerWithMinersCount[] = useMemo(
    () =>
      _map(_head(containersData) as unknown[], (container: ContainerItem) => ({
        ...container,
        minersCount:
          minersOnlineWebappHashTable[container.containerId || container.info?.container || ''] ||
          0,
      })) as unknown as ContainerWithMinersCount[],
    [containersData, minersOnlineWebappHashTable],
  )

  const isLoading = isMinerTailLogLoading || isContainersLoading

  const refetchSnapshotData = () => {
    refetchTailLog()
    refetchContainers()
  }

  return {
    powerConsumptionData,
    powerModeData,
    containers,
    tailLogData: tailLogData ?? [],
    isLoading,
    refetchSnapshotData,
  }
}
