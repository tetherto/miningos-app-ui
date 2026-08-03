import { getMonth } from 'date-fns/getMonth'
import { getYear } from 'date-fns/getYear'
import { subYears } from 'date-fns/subYears'
import _map from 'lodash/map'
import _mean from 'lodash/mean'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import { useState } from 'react'

import type { DateRange } from '../RevenueSummary.types'

import { useGetFinanceRevenueSummaryQuery, useGetSiteQuery } from '@/app/services/api'
import { getRangeTimestamps } from '@/app/utils/dateUtils'
import { formatPowerConsumption, getHashrateUnit } from '@/app/utils/deviceUtils'
import { BTC_SATS, MS_PER_HOUR } from '@/app/utils/electricityUtils'
import { formatNumber } from '@/app/utils/format'
import { PERIOD, type PeriodValue } from '@/constants/ranges'
import { useNominalConfigValues } from '@/hooks/useNominalConfigValues'
import useTimezone from '@/hooks/useTimezone'
import {
  convertToChartFormat,
  transformRevenueDataForChart,
} from '@/MultiSiteViews/RevenueAndCost/revenueDataHelpers'
import { rangeOfMonth, rangeOfYear } from '@/MultiSiteViews/SharedComponents/Header/helper'
import type { DateRange as TimeframeDateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'
import type { FinancePeriod, RevenueSummaryLogEntry, UnknownRecord } from '@/types'

const toFinancePeriod = (period?: string): FinancePeriod => {
  if (period === PERIOD.MONTHLY) return 'monthly'
  if (period === PERIOD.YEARLY) return 'yearly'
  return 'daily'
}

const toChartPeriod = (period: FinancePeriod): string => {
  if (period === 'monthly') return PERIOD.MONTHLY
  if (period === 'yearly') return PERIOD.YEARLY
  return PERIOD.DAILY
}

export const useRevenueSummaryData = () => {
  const { timezone } = useTimezone()

  const getDefaultDateRange = (): DateRange | null => {
    const now = new Date()
    const [start, end] = rangeOfMonth(getYear(now), getMonth(now))
    const [startDate, endDate] = getRangeTimestamps([start, end], timezone, true)
    if (!startDate || !endDate) return null
    return { start: startDate.getTime(), end: endDate.getTime(), period: PERIOD.DAILY }
  }

  const getLastYearDateRange = (): DateRange | null => {
    const [start, end] = rangeOfYear(getYear(subYears(new Date(), 1)))
    const [startDate, endDate] = getRangeTimestamps([start, end], timezone, true)
    if (!startDate || !endDate) return null
    return { start: startDate.getTime(), end: endDate.getTime(), period: PERIOD.MONTHLY }
  }

  const [dateRange, setDateRange] = useState<DateRange | null>(getDefaultDateRange())

  const handleRangeChange = (
    dates: [Date, Date],
    options?: { year?: number; month?: number; period?: string },
  ) => {
    const [startDate, endDate] = getRangeTimestamps(dates, timezone)
    if (!startDate || !endDate) return
    setDateRange({
      start: startDate.getTime(),
      end: endDate.getTime(),
      period: (options?.period as PeriodValue | undefined) ?? PERIOD.DAILY,
    })
  }

  const handleReset = () => setDateRange(getLastYearDateRange())

  const hasValidDateRange = Boolean(dateRange?.start && dateRange?.end)
  const period = toFinancePeriod(dateRange?.period)

  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery({})
  const siteName = ((siteData as UnknownRecord)?.site as string) || 'SITE'

  const { data: revenueSummary, isLoading: isRevenueLoading } = useGetFinanceRevenueSummaryQuery(
    { start: dateRange?.start ?? 0, end: dateRange?.end ?? 0, period },
    { skip: !hasValidDateRange, refetchOnMountOrArgChange: true },
  )

  const { nominalHashrateMHS, isLoading: isNominalConfigValuesLoading } = useNominalConfigValues()

  const isLoading = isSiteLoading || isRevenueLoading || isNominalConfigValuesLoading

  const log: RevenueSummaryLogEntry[] = revenueSummary?.log ?? []
  const summary = revenueSummary?.summary

  const chartPeriod = toChartPeriod(period)
  const legacyLog = _map(log, (entry) => ({
    ts: entry.ts,
    period: chartPeriod,
    totalRevenueBTC: entry.revenueBTC,
    totalFeesBTC: entry.feesBTC,
    revenueUSD: entry.revenueUSD,
    totalFeesUSD: entry.feesUSD,
    totalCostsUSD: entry.totalCostsUSD,
    region: siteName,
  }))

  const sortedLegacyLog = _sortBy(legacyLog, 'ts')

  const revenueData = {
    regions: [{ region: siteName, log: sortedLegacyLog }],
  }

  const siteList = siteName ? [{ id: siteName, name: siteName }] : []

  const revenueChartData = hasValidDateRange
    ? (convertToChartFormat(transformRevenueDataForChart(revenueData), siteList, {
        caseInsensitiveMatching: true,
      }) as Array<{ timeKey: string; period: string; timestamp: number; [key: string]: unknown }>)
    : []

  const { start, end } = dateRange ?? {}
  const hoursInPeriod = start && end ? (end - start) / MS_PER_HOUR : 0

  const avgPowerW =
    hoursInPeriod > 0 && summary ? (summary.totalConsumptionMWh * 1e6) / hoursInPeriod : 0
  const avgHashrateMHS = log.length ? _mean(_map(log, 'hashrateMhs')) : 0

  const avgHashRevenueUSDPerPHsPerDay = _reduce(
    log,
    (acc, entry) => {
      if (
        entry.hashRevenueUSDPerPHsPerDay !== null &&
        entry.hashRevenueUSDPerPHsPerDay !== undefined
      ) {
        acc.sum += entry.hashRevenueUSDPerPHsPerDay
        acc.count += 1
      }
      return acc
    },
    { sum: 0, count: 0 },
  )

  const avgHashRevenuePerPHsPerDay =
    avgHashRevenueUSDPerPHsPerDay.count > 0
      ? avgHashRevenueUSDPerPHsPerDay.sum / avgHashRevenueUSDPerPHsPerDay.count
      : 0

  const avgEnergyRevenuePerMWh = summary?.avgRevenuePerMWh ?? 0
  const totalBTC = summary?.totalRevenueBTC ?? 0
  const totalMWh = summary?.totalConsumptionMWh ?? 0
  const currentBtcPrice = summary?.currentBtcPrice ?? 0

  const avgEnergyRevenueSatsPerMWh = totalMWh > 0 ? (totalBTC / totalMWh) * BTC_SATS : 0
  const avgHashRevenueSatsPerPHS =
    avgHashRevenuePerPHsPerDay > 0 && currentBtcPrice > 0
      ? (avgHashRevenuePerPHsPerDay / currentBtcPrice) * BTC_SATS
      : 0

  const hashrateCapacityFactors =
    nominalHashrateMHS > 0 ? (avgHashrateMHS / nominalHashrateMHS) * 100 : 0
  const energyCurtailmentRate = (summary?.avgCurtailmentRate ?? 0) * 100

  const powerConsumptionUnit = formatPowerConsumption(avgPowerW)
  const hashrateUnit = getHashrateUnit(avgHashrateMHS, 3)

  const metrics = {
    totalBitcoin: formatNumber(totalBTC, { maximumFractionDigits: 8 }),
    avgEnergyRevenueAtProdDate: formatNumber(avgEnergyRevenuePerMWh, { maximumFractionDigits: 2 }),
    avgEnergyRevenueAtProdDateSats: formatNumber(avgEnergyRevenueSatsPerMWh, {
      maximumFractionDigits: 0,
    }),
    avgHashRevenueAtProdDate: formatNumber(avgHashRevenuePerPHsPerDay, {
      maximumFractionDigits: 2,
    }),
    avgHashRevenueAtProdDateSats: formatNumber(avgHashRevenueSatsPerPHS, {
      maximumFractionDigits: 0,
    }),
    avgPowerConsumption: formatNumber(powerConsumptionUnit.value || 0, {
      maximumFractionDigits: 3,
    }),
    avgPowerConsumptionUnit: powerConsumptionUnit.unit || '',
    avgHashrate: formatNumber(hashrateUnit.value || 0, { maximumFractionDigits: 3 }),
    avgHashrateUnit: hashrateUnit.unit || '',
    energyCurtailmentRate: formatNumber(energyCurtailmentRate, { maximumFractionDigits: 2 }),
    hashrateCapacityFactors: formatNumber(hashrateCapacityFactors, { maximumFractionDigits: 2 }),
  }

  return {
    isLoading,
    dateRange: dateRange as TimeframeDateRange | undefined,
    handleRangeChange,
    handleReset,
    revenueData,
    metrics,
    revenueChartData,
    siteList,
    // Raw values retained for potential downstream consumers
    avgPowerConsumption: avgPowerW,
    avgHashrate: avgHashrateMHS,
    avgEnergyRevenueAtProdDate: avgEnergyRevenuePerMWh,
    avgHashRevenueAtProdDate: avgHashRevenuePerPHsPerDay,
    avgEnergyRevenueAtProdDateSats: avgEnergyRevenueSatsPerMWh,
    avgHashRevenueAtProdDateSats: avgHashRevenueSatsPerPHS,
    curtailmentRate: summary?.avgCurtailmentRate ?? 0,
    hashrateCapacityFactors,
  }
}
