import { format } from 'date-fns/format'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import _toLower from 'lodash/toLower'
import _toUpper from 'lodash/toUpper'
import _values from 'lodash/values'

import { getHashrateUnit } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { UNITS } from '@/constants/units'
import { Metric, RevenueData, RevenueLogEntry } from '@/types'

interface Site {
  id?: string
  name?: string
}

interface RevenueRegion {
  region: string
  log?: RevenueLogEntry[]
}

interface RevenueLogWithPeriod {
  ts: number
  period: string
  totalRevenueBTC?: number
  [key: string]: unknown
}

export const transformRevenueDataForChart = (revenueData: RevenueData): RevenueLogEntry[] => {
  if (!revenueData?.regions || !_isArray(revenueData.regions)) return []

  const regionKeys: Record<string, string> = {}
  _forEach(revenueData.regions, (region: RevenueRegion) => {
    regionKeys[region.region] = region.region
  })

  const aggregatedData: Record<string, RevenueLogEntry> = {}

  _forEach(revenueData.regions || [], (region: RevenueRegion) => {
    if (!region.log || !_isArray(region.log)) return

    _forEach(region.log as RevenueLogWithPeriod[], (entry: RevenueLogWithPeriod) => {
      if (!entry.ts || !entry.period) return

      const date = new Date(entry.ts)
      if (isNaN(date.getTime())) return

      let timeValue: number | Date
      let timestampFormatTemplate: string

      if (entry.period === PERIOD.MONTHLY) {
        timeValue = new Date(entry.ts)
        timeValue.setDate(1)
        timestampFormatTemplate = 'MM-dd'
      } else {
        timeValue = entry.ts
        timestampFormatTemplate = 'yyyy-MM-dd'
      }

      const timeKey = format(timeValue, timestampFormatTemplate)

      if (!aggregatedData[timeKey]) {
        aggregatedData[timeKey] = {
          timeKey,
          period: entry.period,
          timestamp: entry.ts,
        }
        _forEach(regionKeys, (regionCode: string) => {
          aggregatedData[timeKey][regionCode] = 0
        })
      }

      const revenue = entry.totalRevenueBTC || 0
      aggregatedData[timeKey][region.region] =
        (aggregatedData[timeKey][region.region] as number) + revenue
    })
  })

  return _sortBy(_values(aggregatedData), ({ timestamp }) => timestamp)
}

export const convertToChartFormat = (
  data: RevenueLogEntry[],
  siteList: (string | Site)[],
  options?: { caseInsensitiveMatching?: boolean },
) => {
  if (!data || !_isArray(data)) return []

  const useCaseInsensitive = options?.caseInsensitiveMatching ?? false

  const regionMapping: Record<string, string> = {}
  _forEach(siteList, (site: string | Site) => {
    const regionCode = _isString(site) ? _toUpper(site) : _toUpper(site.id || '')
    regionMapping[regionCode] = _toLower(regionCode)
  })

  // Get all actual region keys from the data (for case-insensitive matching)
  const actualRegionKeys = useCaseInsensitive
    ? (() => {
        const dataKeys = data.length > 0 ? _keys(data[0]) : []
        return _filter(dataKeys, (key) => !['timeKey', 'period', 'timestamp'].includes(key))
      })()
    : []

  const result = _map(data, (timeData: RevenueLogEntry) => {
    const chartData: UnknownRecord = {
      timeKey: timeData.timeKey,
      period: timeData.period,
      timestamp: timeData.timestamp,
    }

    // Map each region code from siteList to the actual data keys
    _forEach(regionMapping, (chartKey: string, regionCode: string) => {
      if (useCaseInsensitive) {
        // Find the actual key in the data that matches this region code (case-insensitive)
        const actualKey = _find(actualRegionKeys, (key) => _toUpper(key) === _toUpper(regionCode))

        if (actualKey) {
          chartData[chartKey] = (timeData[actualKey] as number) || 0
        } else {
          chartData[chartKey] = 0
        }
      } else {
        // Original case-sensitive behavior (backward compatible)
        chartData[chartKey] = (timeData[regionCode] as number) || 0
      }
    })

    return chartData
  })

  return result
}

export const createBTCMetrics = (revenueData: RevenueData, siteList: (string | Site)[]) => {
  const transformedBTCMetrics: Record<string, Metric> = {}
  let totalBTC = 0

  if (revenueData?.regions && _isArray(revenueData.regions)) {
    _forEach(revenueData.regions, (region: RevenueRegion) => {
      if (region.log && _isArray(region.log)) {
        _forEach(region.log as RevenueLogWithPeriod[], (entry: RevenueLogWithPeriod) => {
          totalBTC += entry.totalRevenueBTC || 0
        })
      }
    })
  }

  transformedBTCMetrics.totalBtc = {
    label: 'Total Bitcoin',
    unit: 'BTC',
    value: totalBTC,
  }

  _forEach(siteList, (site: string | Site) => {
    const regionCode = _toUpper(_isString(site) ? site : site.id || '')
    const regionData = _find(
      revenueData?.regions,
      ({ region }: RevenueRegion) => region === regionCode,
    )

    let regionBTC = 0
    if (regionData?.log && _isArray(regionData.log)) {
      _forEach(regionData.log as RevenueLogWithPeriod[], (entry: RevenueLogWithPeriod) => {
        regionBTC += entry.totalRevenueBTC || 0
      })
    }

    transformedBTCMetrics[`${_toLower(regionCode)}Btc`] = {
      label: _isString(site) ? regionCode : site.name || regionCode,
      unit: 'BTC',
      value: regionBTC,
    }
  })

  return transformedBTCMetrics
}

export const createRevenueMetrics = (
  revenueData: RevenueData,
  downtimeData: { log?: { [key: string]: unknown }[] },
  hashrateData: { data?: { summary: { avg: { [key: string]: unknown } }; [key: string]: unknown } },
) => {
  const hashrateUnitData = getHashrateUnit(
    (revenueData?.data?.summary?.avg?.hashrateMHS as number) || 0,
  )
  const curtailmentRate = downtimeData?.log?.[0]?.curtailmentRate || 0
  const actualHashrate = (hashrateData?.data?.summary?.avg?.hashrate as number) || 0
  const nominalHashrate = (hashrateData?.data?.nominalHashrate as number) || 0
  const hashrateCapacityFactor = nominalHashrate > 0 ? (actualHashrate / nominalHashrate) * 100 : 0

  return {
    avgEnergyRevenue: {
      label: 'Avg Energy Revenue - At Prod. Date Price',
      unit: `$/${UNITS.ENERGY_MWH}`,
      value: revenueData?.data?.summary?.avg?.energyRevenueUSD_MW || 0,
    },
    avgEnergyRevenueBtc: {
      label: 'Avg Energy Revenue - In Bitcoin Terms',
      unit: `Sats/${UNITS.ENERGY_MWH}`,
      value: revenueData?.data?.summary?.avg?.energyRevenueBTC_MW || 0,
    },
    avgPowerConsumption: {
      label: 'Avg Power Consumption',
      unit: UNITS.ENERGY_MWH,
      value: revenueData?.data?.summary?.avg?.sitePowerW || 0,
    },
    energyCurtailmentRate: {
      label: 'Energy Curtailment Rate',
      unit: UNITS.PERCENT,
      value: curtailmentRate,
    },
    avgHashRevenue: {
      label: 'Avg Hash Revenue - At Prod. Date Price',
      unit: `$/${UNITS.HASHRATE_PH_S}/day`,
      value: revenueData?.data?.summary?.avg?.hashRevenueUSD || 0,
    },
    avgHashRevenueBtc: {
      label: 'Avg Hash Revenue - In Bitcoin Terms',
      unit: `Sats/${UNITS.HASHRATE_PH_S}/day`,
      value: revenueData?.data?.summary?.avg?.hashRevenueBTC || 0,
    },
    avgHashrate: {
      label: 'Avg Hashrate',
      unit: hashrateUnitData.unit,
      value: hashrateUnitData.value,
    },
    hashrateCapacityFactors: {
      label: 'Hashrate Capacity Factors',
      unit: UNITS.PERCENT,
      value: hashrateCapacityFactor,
    },
  }
}

export const createSubsidyFeesData = (revenueData: RevenueData) => {
  if (!revenueData?.regions || !_isArray(revenueData.regions)) {
    return {
      unit: 'BTC',
      label: null,
      value: null,
      dataset: {
        Subsidy: { value: 0, color: COLOR.INDIGO },
        Fees: { value: 0, color: COLOR.POOL },
      },
    }
  }

  let totalSubsidy = 0
  let totalFees = 0

  _forEach(revenueData.regions || [], (region: RevenueRegion) => {
    if (region.log && _isArray(region.log)) {
      _forEach(
        region.log as (RevenueLogWithPeriod & { totalFeesBTC?: number })[],
        (entry: RevenueLogWithPeriod & { totalFeesBTC?: number }) => {
          const totalRevenue = entry.totalRevenueBTC || 0
          const fees = entry.totalFeesBTC || 0
          const subsidy = totalRevenue - fees

          totalSubsidy += subsidy
          totalFees += fees
        },
      )
    }
  })

  return {
    unit: 'BTC',
    label: null,
    value: null,
    dataset: {
      Subsidy: { value: totalSubsidy, color: COLOR.INDIGO },
      Fees: { value: totalFees, color: COLOR.POOL },
    },
  }
}
