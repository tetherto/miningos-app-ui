import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _meanBy from 'lodash/meanBy'
import _sumBy from 'lodash/sumBy'
import { useState } from 'react'

import { getPeriodKey, getPeriodType } from '../common/financial.helpers'
import { useFinancialDateRange } from '../common/useFinancialDateRange'

import type {
  EnergyBalanceTab,
  EnergyCostMetrics,
  EnergyRevenueMetrics,
} from './EnergyBalance.types'

import { useGetFinanceEnergyBalanceQuery } from '@/app/services/api'
import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY } from '@/constants/units'
import type { EnergyBalanceLogEntry, FinancePeriod } from '@/types'

type RevenueDisplayMode = typeof CURRENCY.USD_LABEL | typeof CURRENCY.BTC_LABEL

const AVAILABLE_POWER_MW = 22.5
const BTC_SATS = 100_000_000
const SATS_THRESHOLD = 100_000

const toFinancePeriod = (period?: string): FinancePeriod => {
  if (period === PERIOD.WEEKLY) return 'weekly'
  if (period === PERIOD.YEARLY) return 'yearly'
  if (period === PERIOD.DAILY) return 'daily'
  return 'monthly'
}

const barLabelFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'
  return formatNumber(value)
}
const usdBarLabelFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'
  return formatNumber(value, { maximumFractionDigits: 0 })
}
const usdBarLabelFormatterWithDecimals = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'
  return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
const rateLabelFormatter = (value: number) =>
  formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
const btcBarLabelFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'
  return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 6 })
}

interface PeriodRow {
  ts: number
  period: string
  sitePowerMW: number
  consumptionMWh: number
  revenueBTC: number
  revenueUSD: number
  energyRevenueUSD_MW: number
  energyRevenueBTC_MW: number
  totalCostsUSD: number
  energyCostsUSD: number
  operationalCostsUSD: number
  curtailmentRate: number
  operationalIssuesRate: number
}

const useEnergyBalance = () => {
  const { dateRange, handleRangeChange } = useFinancialDateRange()
  const periodType = getPeriodType(dateRange)
  const period = toFinancePeriod(dateRange?.period)
  const [activeTab, setActiveTab] = useState<EnergyBalanceTab>('revenue')
  const [revenueDisplayMode, setRevenueDisplayMode] = useState<RevenueDisplayMode>(
    CURRENCY.USD_LABEL,
  )
  const [costDisplayMode, setCostDisplayMode] = useState<RevenueDisplayMode>(CURRENCY.USD_LABEL)

  const { data, isLoading, error } = useGetFinanceEnergyBalanceQuery(
    { start: dateRange?.start ?? 0, end: dateRange?.end ?? 0, period },
    { skip: !dateRange?.start || !dateRange?.end, refetchOnMountOrArgChange: true },
  )

  const errors = error ? ['Energy Balance data failed'] : []
  const log: EnergyBalanceLogEntry[] = data?.log ?? []
  const summary = data?.summary
  const currentBTCPrice = 0

  const rows: PeriodRow[] = _map(log, (entry) => {
    const sitePowerMW = (entry.powerW || 0) / 1e6
    const energyCostsUSD = entry.energyCostUSD || 0
    const totalCostsUSD = entry.totalCostUSD || 0
    const operationalCostsUSD = Math.max(totalCostsUSD - energyCostsUSD, 0)
    const energyRevenueUSD_MW = entry.energyRevenuePerMWh ?? 0
    const energyRevenueBTC_MW =
      entry.consumptionMWh > 0 ? entry.revenueBTC / entry.consumptionMWh : 0

    return {
      ts: entry.ts,
      period: getPeriodKey(entry.ts, periodType),
      sitePowerMW,
      consumptionMWh: entry.consumptionMWh || 0,
      revenueBTC: entry.revenueBTC || 0,
      revenueUSD: entry.revenueUSD || 0,
      energyRevenueUSD_MW,
      energyRevenueBTC_MW,
      totalCostsUSD,
      energyCostsUSD,
      operationalCostsUSD,
      curtailmentRate: entry.curtailmentRate ?? 0,
      operationalIssuesRate: entry.operationalIssuesRate ?? 0,
    }
  })

  const hasData = rows.length > 0

  const revenueMetrics: EnergyRevenueMetrics | null = hasData
    ? {
        curtailmentRate: (summary?.avgCurtailmentRate ?? 0) * 100,
        operationalIssuesRate: (summary?.avgOperationalIssuesRate ?? 0) * 100,
      }
    : null

  const costMetrics: EnergyCostMetrics | null = hasData
    ? (() => {
        const avgPowerConsumption = _meanBy(rows, 'sitePowerMW') || 0
        const totalEnergyCosts = _sumBy(rows, 'energyCostsUSD') || 0
        const totalOperationalCosts = _sumBy(rows, 'operationalCostsUSD') || 0
        const totalRevenue = _sumBy(rows, 'revenueUSD') || 0
        const totalPower = _sumBy(rows, 'sitePowerMW') || 1
        return {
          avgPowerConsumption,
          avgEnergyCost: totalEnergyCosts / totalPower,
          avgAllInCost: (totalEnergyCosts + totalOperationalCosts) / totalPower,
          avgPowerAvailability: AVAILABLE_POWER_MW,
          avgOperationsCost: totalOperationalCosts / totalPower,
          avgEnergyRevenue: totalRevenue / totalPower,
        }
      })()
    : null

  const labels = _map(rows, 'period')

  const revenueValuesUSD = _map(rows, 'energyRevenueUSD_MW')
  const revenueValuesBTC = _map(rows, 'energyRevenueBTC_MW')

  const energyRevenueChartData = {
    labels,
    series: [
      {
        label:
          revenueDisplayMode === CURRENCY.USD_LABEL
            ? 'Revenue (USD/MWh)'
            : `Revenue (${CURRENCY.BTC_LABEL}/MWh)`,
        values: revenueDisplayMode === CURRENCY.USD_LABEL ? revenueValuesUSD : revenueValuesBTC,
        color: CHART_COLORS.red,
        datalabels: {
          formatter:
            revenueDisplayMode === CURRENCY.USD_LABEL
              ? usdBarLabelFormatterWithDecimals
              : btcBarLabelFormatter,
        },
      },
    ],
  }

  const downtimeChartData = {
    labels,
    series: [
      {
        label: 'Curtailment',
        values: _map(rows, 'curtailmentRate'),
        color: CHART_COLORS.purple,
        stack: 'stack1',
        datalabels: { formatter: rateLabelFormatter },
      },
      {
        label: 'Op. Issues',
        values: _map(rows, 'operationalIssuesRate'),
        color: CHART_COLORS.blue,
        stack: 'stack1',
        datalabels: { formatter: rateLabelFormatter },
      },
    ],
  }

  const powerPoints = _map(rows, (r) => ({ ts: r.ts, value: r.sitePowerMW }))
  const powerChartData = {
    series: [{ label: 'Power Consumption', points: powerPoints, color: CHART_COLORS.orange }],
    constants: [
      {
        label: 'Power Availability',
        value: AVAILABLE_POWER_MW,
        color: CHART_COLORS.green,
        style: { borderDash: [5, 5] },
      },
    ],
  }

  const powerChartDataCostTab = {
    series: [{ label: 'Power Consumption', points: powerPoints, color: CHART_COLORS.blue }],
    constants: [
      {
        label: 'Power Availability',
        value: AVAILABLE_POWER_MW,
        color: CHART_COLORS.red,
        style: { borderDash: [5, 5] },
      },
    ],
  }

  // Energy Cost chart (revenue vs all-in cost)
  const allInCostValuesUSD = _map(rows, (r) =>
    r.sitePowerMW > 0 ? r.totalCostsUSD / r.sitePowerMW : 0,
  )
  const revenueValuesSats = _map(rows, (r) => r.energyRevenueBTC_MW * BTC_SATS)
  const allInCostValuesSats = _map(rows, (r) => {
    if (r.sitePowerMW <= 0 || r.revenueBTC <= 0) return 0
    const derivedPriceUSD = r.revenueUSD / r.revenueBTC
    const costPerMW = r.totalCostsUSD / r.sitePowerMW
    return (costPerMW / derivedPriceUSD) * BTC_SATS
  })

  const buildEnergyCostChart = () => {
    if (costDisplayMode === CURRENCY.USD_LABEL) {
      return {
        labels,
        series: [
          {
            label: 'All-In Cost',
            values: allInCostValuesUSD,
            color: CHART_COLORS.orange,
            datalabels: { formatter: usdBarLabelFormatter },
          },
          {
            label: 'Revenue',
            values: revenueValuesUSD,
            color: CHART_COLORS.SKY_BLUE,
            datalabels: { formatter: usdBarLabelFormatter },
          },
        ],
        btcUnit: null as string | null,
      }
    }

    const maxSatsValue = Math.max(0, ...revenueValuesSats, ...allInCostValuesSats)
    const useBTC = maxSatsValue >= SATS_THRESHOLD
    const revenueValuesOut = useBTC
      ? _map(revenueValuesSats, (v) => v / BTC_SATS)
      : revenueValuesSats
    const costValuesOut = useBTC
      ? _map(allInCostValuesSats, (v) => v / BTC_SATS)
      : allInCostValuesSats
    const formatter = useBTC ? btcBarLabelFormatter : barLabelFormatter

    return {
      labels,
      series: [
        {
          label: 'All-In Cost',
          values: costValuesOut,
          color: CHART_COLORS.orange,
          datalabels: { formatter },
        },
        {
          label: 'Revenue',
          values: revenueValuesOut,
          color: CHART_COLORS.SKY_BLUE,
          datalabels: { formatter },
        },
      ],
      btcUnit: useBTC ? CURRENCY.BTC_LABEL : CURRENCY.SATS,
    }
  }

  const energyCostChartData = buildEnergyCostChart()

  return {
    aggregatedData: rows,
    revenueMetrics,
    costMetrics,
    energyRevenueChartData,
    downtimeChartData,
    powerChartData,
    powerChartDataCostTab,
    energyCostChartData,
    hasData,
    isLoading,
    handleRangeChange,
    dateRange,
    periodType,
    errors,
    currentBTCPrice,
    activeTab,
    revenueDisplayMode,
    costDisplayMode,
    setRevenueDisplayMode,
    setCostDisplayMode,
    setActiveTab,
  }
}

export default useEnergyBalance
