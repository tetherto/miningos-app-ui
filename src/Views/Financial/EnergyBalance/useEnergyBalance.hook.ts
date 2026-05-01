import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import { useState } from 'react'

import { getPeriodKey, getPeriodType } from '../common/financial.helpers'
import { PeriodType } from '../common/financial.types'
import { useFinancialDateRange } from '../common/useFinancialDateRange'

import type {
  EnergyBalanceTab,
  EnergyCostMetrics,
  EnergyRevenueMetrics,
} from './EnergyBalance.types'

import { useGetFinanceEnergyBalanceQuery } from '@/app/services/api'
import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import type { EnergyBalanceLogEntry, FinancePeriod } from '@/types'

type RevenueDisplayMode = typeof CURRENCY.USD_LABEL | typeof CURRENCY.BTC_LABEL

const AVAILABLE_POWER_MW = 22.5
const BTC_SATS = 100_000_000
const SATS_THRESHOLD = 100_000

const PERIOD_TYPE_TO_BE: Record<PeriodType, FinancePeriod> = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
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

const useEnergyBalance = () => {
  const { dateRange, handleRangeChange } = useFinancialDateRange()
  const periodType = getPeriodType(dateRange)
  const [activeTab, setActiveTab] = useState<EnergyBalanceTab>('revenue')
  const [revenueDisplayMode, setRevenueDisplayMode] = useState<RevenueDisplayMode>(
    CURRENCY.USD_LABEL,
  )
  const [costDisplayMode, setCostDisplayMode] = useState<RevenueDisplayMode>(CURRENCY.USD_LABEL)

  const { data, isLoading, error } = useGetFinanceEnergyBalanceQuery(
    {
      start: dateRange?.start ?? 0,
      end: dateRange?.end ?? 0,
      period: PERIOD_TYPE_TO_BE[periodType],
    },
    { skip: !dateRange?.start || !dateRange?.end, refetchOnMountOrArgChange: true },
  )

  const errors = error ? ['Energy Balance data failed'] : []
  const log: EnergyBalanceLogEntry[] = data?.log ?? []
  const summary = data?.summary
  const hasData = log.length > 0

  const revenueMetrics: EnergyRevenueMetrics | null = hasData
    ? {
        curtailmentRate: (summary?.avgCurtailmentRate ?? 0) * 100,
        operationalIssuesRate: (summary?.avgOperationalIssuesRate ?? 0) * 100,
      }
    : null

  const costMetrics: EnergyCostMetrics | null = hasData
    ? {
        avgPowerConsumption: summary?.avgPowerConsumption ?? 0,
        avgEnergyCost: summary?.avgEnergyCostPerMWh ?? 0,
        avgAllInCost: summary?.avgCostPerMWh ?? 0,
        avgPowerAvailability: AVAILABLE_POWER_MW,
        avgOperationsCost: summary?.avgOperationalCostPerMWh ?? 0,
        avgEnergyRevenue: summary?.avgRevenuePerMWh ?? 0,
      }
    : null

  const labels = _map(log, (entry) => getPeriodKey(entry.ts, periodType))
  const revenueValuesUSD = _map(log, 'energyRevenueUSD_MW')
  const revenueValuesBTC = _map(log, 'energyRevenueBTC_MW')

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
        values: _map(log, (entry) => entry.curtailmentRate ?? 0),
        color: CHART_COLORS.purple,
        stack: 'stack1',
        datalabels: { formatter: rateLabelFormatter },
      },
      {
        label: 'Op. Issues',
        values: _map(log, (entry) => entry.operationalIssuesRate ?? 0),
        color: CHART_COLORS.blue,
        stack: 'stack1',
        datalabels: { formatter: rateLabelFormatter },
      },
    ],
  }

  const powerPoints = _map(log, (entry) => ({ ts: entry.ts, value: entry.sitePowerMW }))
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

  const allInCostValuesUSD = _map(log, (entry) =>
    entry.sitePowerMW > 0 ? entry.totalCostUSD / entry.sitePowerMW : 0,
  )
  const revenueValuesSats = _map(log, (entry) => entry.energyRevenueBTC_MW * BTC_SATS)
  const allInCostValuesSats = _map(log, (entry) => {
    if (entry.sitePowerMW <= 0 || entry.revenueBTC <= 0) return 0
    const derivedPriceUSD = entry.revenueUSD / entry.revenueBTC
    const costPerMW = entry.totalCostUSD / entry.sitePowerMW
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
    aggregatedData: log,
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
    activeTab,
    revenueDisplayMode,
    costDisplayMode,
    setRevenueDisplayMode,
    setCostDisplayMode,
    setActiveTab,
  }
}

export default useEnergyBalance
