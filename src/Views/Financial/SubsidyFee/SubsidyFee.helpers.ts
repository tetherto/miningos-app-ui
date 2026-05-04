import _isNil from 'lodash/isNil'
import _map from 'lodash/map'

import { getPeriodKey } from '../common/financial.helpers'
import type { PeriodType } from '../common/financial.types'

import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'
import type { SubsidyFeesLogEntry } from '@/types'

const BTC_SATS = 100000000

interface AggregatedPeriodData {
  period: string
  subsidyBTC: number
  feesBTC: number
  feePercent: number
  avgSatsPerVByte: number
  blockCount: number
  firstTs: number
}

/**
 * Map v2 `/auth/finance/subsidy-fees` log entries into the period rows the chart components expect.
 * The backend already aggregates per period - we just convert sats to BTC and derive fee percent.
 * `avgSatsPerVByte` is set to 0 because the v2 endpoint does not currently surface block size.
 */
export const mapLogToPeriodData = (
  log: SubsidyFeesLogEntry[],
  periodType: PeriodType,
): AggregatedPeriodData[] =>
  _map(log, (entry) => {
    const subsidySats = Math.max(entry.blockReward - entry.blockTotalFees, 0)
    const subsidyBTC = subsidySats / BTC_SATS
    const feesBTC = entry.blockTotalFees / BTC_SATS
    const totalBTC = subsidyBTC + feesBTC

    return {
      period: getPeriodKey(entry.ts, periodType),
      subsidyBTC,
      feesBTC,
      feePercent: totalBTC > 0 ? (feesBTC / totalBTC) * 100 : 0,
      avgSatsPerVByte: 0,
      blockCount: 0,
      firstTs: entry.ts,
    }
  })

export const transformToSubsidyFeesChartData = (aggregatedData: AggregatedPeriodData[]) => {
  const labels = _map(aggregatedData, 'period')
  const subsidyValues = _map(aggregatedData, 'subsidyBTC')
  const feesValues = _map(aggregatedData, 'feesBTC')
  const feePercentValues = _map(aggregatedData, (d) => d.feePercent / 100)

  const stackedBarFormatter = (value: number, context: unknown) => {
    const isTopOfStack = (context as { datasetIndex: number })?.datasetIndex === 1
    if (!isTopOfStack) return ''
    if (_isNil(value)) return ''

    const dataIndex = (context as { dataIndex: number })?.dataIndex
    const total = subsidyValues[dataIndex] + feesValues[dataIndex]
    if (total === 0) return '0'
    return formatNumber(total)
  }

  return {
    labels,
    series: [
      {
        label: 'Subsidy',
        values: subsidyValues,
        color: CHART_COLORS.blue,
        stack: 'stack1',
        datalabels: { formatter: stackedBarFormatter },
      },
      {
        label: 'Fees',
        values: feesValues,
        color: CHART_COLORS.purple,
        stack: 'stack1',
        datalabels: { formatter: stackedBarFormatter },
      },
    ],
    lines: [
      {
        label: 'Fee %',
        values: feePercentValues,
        color: CHART_COLORS.red,
        yAxisID: 'y1',
      },
    ],
  }
}

const avgFeesFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'
  return formatNumber(value)
}

export const transformToAverageFeesChartData = (aggregatedData: AggregatedPeriodData[]) => ({
  labels: _map(aggregatedData, 'period'),
  series: [
    {
      label: 'Average Fees in Sats/vByte',
      values: _map(aggregatedData, 'avgSatsPerVByte'),
      color: CHART_COLORS.purple,
      datalabels: { formatter: avgFeesFormatter },
    },
  ],
})
