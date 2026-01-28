import { List } from 'lodash'
import _head from 'lodash/head'
import type React from 'react'
import type { NavigateFunction } from 'react-router-dom'

import { useGetTailLogQuery } from '@/app/services/api'
import type { Alert } from '@/app/utils/alertUtils'
import { isAntspaceHydro, isAntspaceImmersion } from '@/app/utils/containerUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { LogData } from '@/Components/LogsCard/LogComponent'
import { POLLING_5s } from '@/constants/pollingIntervalConstants'
import { STAT_REALTIME } from '@/constants/tailLogStatKeys.constants'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import {
  getAlarms,
  getContainerFormatedAlerts,
  getAlertTimelineItems,
  getAntspacePowerBoxData,
  getAntspaceImmersionPowerBoxData,
  getElectricPowerBoxData,
} from '@/Views/Container/Tabs/HomeTab/HomeTab.util'
import { MinerTailLogItem } from '@/Views/ContainerWidgets/ContainerWidget.util'

interface UseHomeTabMinerDataParams {
  data?: Device
  getFormattedDate: (date: Date) => string
  navigate: NavigateFunction
}

interface UseHomeTabMinerDataReturn {
  minerTailLogItem: MinerTailLogItem | undefined
  alarmsDataItems: Array<{
    item: LogData
    children: React.JSX.Element
    dot: React.JSX.Element
  }>
  totalSockets: number | string | undefined
  getPowerBoxData: (data: UnknownRecord) => UnknownRecord
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Custom hook for fetching and processing miner tail log data and alarms for HomeTab
 * Fetches real-time miner statistics including offline, not mining, power modes,
 * hashrate, and temperature data, and processes alarm/event timeline items
 *
 * @param params - Object containing container data, date formatter, and navigate function
 * @returns Object containing processed miner tail log item, alarm timeline items, loading state, error state
 */
export const useHomeTabMinerData = ({
  data,
  getFormattedDate,
  navigate,
}: UseHomeTabMinerDataParams): UseHomeTabMinerDataReturn => {
  const smartPolling5s = useSmartPolling(POLLING_5s)

  const {
    data: minerTailLogData,
    isLoading,
    isError,
    error,
  } = useGetTailLogQuery(
    {
      key: STAT_REALTIME,
      type: 'miner',
      tag: 't-miner',
      limit: 1,
      aggrFields: JSON.stringify({
        offline_cnt: 1,
        not_mining_cnt: 1,
        power_mode_low_cnt: 1,
        power_mode_normal_cnt: 1,
        power_mode_high_cnt: 1,
        hashrate_mhs_1m_group_sum_aggr: 1,
        temperature_c_group_max_aggr: 1,
        temperature_c_group_avg_aggr: 1,
      }),
      fields: JSON.stringify({
        offline_cnt: 1,
        not_mining_cnt: 1,
        power_mode_low_cnt: 1,
        power_mode_normal_cnt: 1,
        power_mode_high_cnt: 1,
        hashrate_mhs_1m_group_sum: 1,
        temperature_c_group_max: 1,
        temperature_c_group_avg: 1,
      }),
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  const minerTailLogItem = _head(minerTailLogData as List<unknown>) as MinerTailLogItem | undefined

  // Process alarm data
  const alarmsData = getAlarms(data, undefined, getFormattedDate)
  const formatedAlerts = getContainerFormatedAlerts(
    (alarmsData || []) as Alert[],
    data as Device,
    getFormattedDate,
  )
  const alarmsDataItems = getAlertTimelineItems(formatedAlerts as unknown as LogData[], navigate)

  // Derive total sockets from container data
  const totalSockets: number | string | undefined =
    (data?.info?.nominalMinerCapacity as number | string | undefined) ?? undefined

  // Power box data getter function
  const getPowerBoxData = (containerData: UnknownRecord): UnknownRecord => {
    if (isAntspaceHydro(containerData?.type as string)) {
      return getAntspacePowerBoxData(containerData) as unknown as UnknownRecord
    }

    if (isAntspaceImmersion(containerData?.type as string)) {
      return getAntspaceImmersionPowerBoxData(containerData) as unknown as UnknownRecord
    }

    return getElectricPowerBoxData(containerData) as unknown as UnknownRecord
  }

  return {
    minerTailLogItem,
    alarmsDataItems,
    totalSockets,
    getPowerBoxData,
    isLoading,
    isError,
    error,
  }
}
