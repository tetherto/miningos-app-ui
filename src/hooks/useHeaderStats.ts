import _head from 'lodash/head'
import _reduce from 'lodash/reduce'
import { useEffect, useState } from 'react'

import {
  useGetExtDataQuery,
  useGetGlobalConfigQuery,
  useGetListThingsQuery,
  useGetMultiTailLogQuery,
  useGetTailLogQuery,
} from '../app/services/api'
import { useGetFeatureConfigQuery } from '../app/services/api'
import { getAlertsString } from '../app/utils/alertUtils'
import { formatPowerConsumption, getDeviceDataByType } from '../app/utils/deviceUtils'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'
import { TIME } from '../constants'
import { POLLING_2m, POLLING_5s } from '../constants/pollingIntervalConstants'
import { STAT_5_MINUTES, STAT_REALTIME } from '../constants/tailLogStatKeys.constants'

import type {
  Alert,
  ConsumptionState,
  Device,
  GlobalConfig,
  MinerpoolExtDataEntry,
  MinerpoolExtDataStats,
  TailLogEntry,
} from './hooks.types'
import { useSmartPolling } from './useSmartPolling'
import useSubtractedTime from './useSubtractedTime'
import useTimezone from './useTimezone'
import { useTotalTransformerPMConsumption } from './useTotalTransformerPMConsumption'

export const useHeaderStats = () => {
  const smartPolling2m = useSmartPolling(POLLING_2m)
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const time = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)
  const { getFormattedDate } = useTimezone()

  const [consumption, setConsumption] = useState<ConsumptionState>({
    formattedConsumption: { value: 0, unit: '', realValue: 0 },
    consumptionAlert: '',
    rawConsumptionW: 0,
  })
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined)
  const totalSystemConsumptionHeader = (featureConfig as UnknownRecord)
    ?.totalSystemConsumptionHeader
  const totalTransformerConsumptionHeader = (featureConfig as UnknownRecord)
    ?.totalTransformerConsumptionHeader

  const [minersAmount, setMinersAmount] = useState({
    total: 0,
    totalContainerCapacity: 0,
    onlineOrMinorErrors: 0,
    offlineOrSleep: 0,
    majorErrors: 0,
  })

  // Fetch site power meter data
  const listThingsQuery = JSON.stringify({ 'info.pos': { $eq: 'site' } })

  const { data: devicesData, isLoading: isDevicesDataLoading } = useGetListThingsQuery(
    {
      status: 1,
      fields: JSON.stringify({
        id: 1,
        'last.snap.stats.power_w': 1,
        tags: 1,
      }),
      query: listThingsQuery,
      overwriteCache: true,
      limit: 100,
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  // Fetch minerpool data from ext-data endpoint
  const { data: minerpoolExtData } = useGetExtDataQuery(
    { type: 'minerpool', query: JSON.stringify({ key: 'stats' }) },
    { pollingInterval: smartPolling2m },
  )

  // Aggregate pool stats from all pools (f2pool, ocean, etc.)
  const minerpoolEntry = _head(_head(minerpoolExtData as MinerpoolExtDataEntry[][]))
  const poolStats = minerpoolEntry?.stats ?? []

  const { poolMinersOn, poolMinersTotal, poolHashrate } = _reduce(
    poolStats,
    (
      acc: { poolMinersOn: number; poolMinersTotal: number; poolHashrate: number },
      pool: MinerpoolExtDataStats,
    ) => ({
      poolMinersOn: acc.poolMinersOn + (pool.active_workers_count ?? 0),
      poolMinersTotal: acc.poolMinersTotal + (pool.worker_count ?? 0),
      poolHashrate: acc.poolHashrate + (pool.hashrate ?? 0),
    }),
    { poolMinersOn: 0, poolMinersTotal: 0, poolHashrate: 0 },
  )

  const powerMeterData = getDeviceDataByType(_head(devicesData as Device[][]) ?? [], 't-powermeter')
  const sitePowerData =
    powerMeterData.length > 0
      ? powerMeterData
      : getDeviceDataByType(_head(devicesData as Device[][]) ?? [], 't-container')

  const powerDataEntry = _head(sitePowerData) as
    | {
        last?: {
          alerts?: unknown[]
          snap?: { stats?: { power_w?: number } }
          [key: string]: unknown
        }
        [key: string]: unknown
      }
    | undefined

  const isSystemConsumptionLoading = false
  const systemConsumption = 0

  const { isPowerConsumptionLoading, totalPowerConsumptionW } = useTotalTransformerPMConsumption({
    skip: !totalTransformerConsumptionHeader,
  })

  const { data: globalConfig, isLoading: isLoadingNominalValues } = useGetGlobalConfigQuery(
    {} as UnknownRecord,
  )

  const nominalMinersValue = isLoadingNominalValues
    ? null
    : _head(globalConfig as GlobalConfig[])?.nominalSiteMinerCapacity
  const nominalHashrateValue = isLoadingNominalValues
    ? null
    : _head(globalConfig as GlobalConfig[])?.nominalSiteHashrate_MHS

  const { data: containerTail, isLoading: isContainerTailLoading } = useGetTailLogQuery({
    key: STAT_5_MINUTES,
    type: 'container',
    tag: 't-container',
    limit: 1,
    fields: JSON.stringify({
      container_nominal_miner_capacity_sum: 1,
    }),
    aggrFields: JSON.stringify({
      container_nominal_miner_capacity_sum_aggr: 1,
    }),
  })

  const { data, isLoading } = useGetMultiTailLogQuery(
    {
      keys: JSON.stringify([
        { key: STAT_REALTIME, type: 'miner', tag: 't-miner' },
        {
          key: STAT_REALTIME,
          type: 'powermeter',
          tag: 't-powermeter',
        },
        {
          key: STAT_REALTIME,
          type: 'container',
          tag: 't-container',
        },
      ]),
      limit: 1,
      start: time,
      aggrFields: JSON.stringify({
        hashrate_mhs_1m_sum_aggr: 1,
        hashrate_mhs_1m_cnt_aggr: 1,
        hashrate_mhs_1m_cnt_active_aggr: 1,
        alerts_aggr: 1,
        container_nominal_miner_capacity_sum_aggr: 1,
        offline_or_sleeping_miners_amount_aggr: 1,
        online_or_minor_error_miners_amount_aggr: 1,
        not_mining_miners_amount_aggr: 1,
        site_power_w: 1,
      }),
      fields: JSON.stringify({
        hashrate_mhs_1m_sum: 1,
        hashrate_mhs_1m_cnt: 1,
        hashrate_mhs_1m_cnt_active: 1,
        alerts_aggr: 1,
        container_nominal_miner_capacity_sum: 1,
        offline_or_sleeping_miners_cnt: 1,
        online_or_minor_error_miners_cnt: 1,
        not_mining_miners_cnt: 1,
        site_power_w: 1,
      }),
    },
    {
      pollingInterval: smartPolling5s,
    },
  )
  const log = _head(data as unknown[][])
  const minerLogData = log?.[0] as TailLogEntry[] | undefined
  const powermeterLogData = log?.[1] as TailLogEntry[] | undefined
  const containerLogData = log?.[2] as TailLogEntry[] | undefined
  const minerEntry = _head(minerLogData)
  const powerMeterLogEntry = _head(powermeterLogData)
  const containerEntry = _head(containerLogData)
  const containerNominalEntry = _head(containerTail as TailLogEntry[])

  useEffect(() => {
    if (minerEntry) {
      setMinersAmount({
        onlineOrMinorErrors: minerEntry?.online_or_minor_error_miners_amount_aggr ?? 0,
        offlineOrSleep: minerEntry?.offline_or_sleeping_miners_amount_aggr ?? 0,
        majorErrors: minerEntry?.not_mining_miners_amount_aggr ?? 0,
        total: minerEntry?.hashrate_mhs_1m_cnt_aggr ?? 0,
        totalContainerCapacity:
          containerNominalEntry?.container_nominal_miner_capacity_sum_aggr ?? 0,
      })
    }
  }, [
    containerEntry,
    minerLogData,
    isLoading,
    minerEntry?.hashrate_mhs_1m_cnt_aggr,
    minerEntry?.hashrate_mhs_1m_cnt_active_aggr,
    containerNominalEntry,
  ])

  useEffect(() => {
    if (totalSystemConsumptionHeader) {
      setConsumption({
        consumptionAlert: '',
        formattedConsumption: formatPowerConsumption(systemConsumption as number),
        rawConsumptionW: systemConsumption as number,
        isLoading: isSystemConsumptionLoading,
      })
      return
    }
    if (totalTransformerConsumptionHeader) {
      setConsumption({
        consumptionAlert: '',
        formattedConsumption: formatPowerConsumption(totalPowerConsumptionW as number),
        rawConsumptionW: totalPowerConsumptionW as number,
        isLoading: isPowerConsumptionLoading,
      })
      return
    }
    setConsumption({
      consumptionAlert: getAlertsString(
        (powerDataEntry?.last?.alerts ?? []) as Alert[],
        getFormattedDate,
      ),
      formattedConsumption: formatPowerConsumption(
        (powerDataEntry?.last?.snap?.stats?.power_w ?? 0) as number,
      ),
      rawConsumptionW: (powerDataEntry?.last?.snap?.stats?.power_w ?? 0) as number,
      isLoading: isDevicesDataLoading,
    })
  }, [
    powerDataEntry,
    totalSystemConsumptionHeader,
    isSystemConsumptionLoading,
    isDevicesDataLoading,
    systemConsumption,
    getFormattedDate,
    totalTransformerConsumptionHeader,
    totalPowerConsumptionW,
    isPowerConsumptionLoading,
  ])

  return {
    minerEntry,
    powerMeterLogEntry,
    containerEntry,
    isLoading: isLoading || isContainerTailLoading,
    minersAmount,
    consumption,
    isDevicesDataLoading,
    powerDataEntry,
    poolMinersOn,
    poolMinersTotal,
    poolHashrate,
    nominalValues: {
      nominalMinersValue,
      nominalHashrateValue,
    },
  }
}
