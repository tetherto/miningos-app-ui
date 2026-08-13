import _isNil from 'lodash/isNil'
import _map from 'lodash/map'

import { getPeriodKey, getPeriodType } from '../common/financial.helpers'
import { useFinancialDateRange } from '../common/useFinancialDateRange'

import type { EbitdaMetrics } from './EBITDA.types'

import { useGetFinanceEbitdaQuery } from '@/app/services/api'
import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import type { EbitdaLogEntry, FinancePeriod } from '@/types'

const toFinancePeriod = (period?: string): FinancePeriod => {
  if (period === PERIOD.WEEKLY) return 'weekly'
  if (period === PERIOD.YEARLY) return 'yearly'
  if (period === PERIOD.DAILY) return 'daily'
  return 'monthly'
}

const formatCurrency = (number: number) => {
  const abs = Math.abs(number)
  const [prefix, suffix] = number < 0 ? ['($', ')'] : ['$', '']
  return `${prefix}${formatNumber(abs, { compactDisplay: 'short', notation: 'compact' })}${suffix}`
}

const ebitdaBarFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '$0'
  return formatCurrency(value)
}

const btcProducedFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0 \u20BF'
  const formatted = formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 3 })
  return `${formatted} \u20BF`
}

const useEBITDA = () => {
  const { dateRange, handleRangeChange } = useFinancialDateRange()
  const periodType = getPeriodType(dateRange)
  const period = toFinancePeriod(dateRange?.period)

  const { data, isLoading, error } = useGetFinanceEbitdaQuery(
    { start: dateRange?.start ?? 0, end: dateRange?.end ?? 0, period },
    { skip: !dateRange?.start || !dateRange?.end, refetchOnMountOrArgChange: true },
  )

  const errors = error ? ['EBITDA data failed'] : []
  const log: EbitdaLogEntry[] = data?.log ?? []
  const summary = data?.summary
  const currentBTCPrice = summary?.currentBtcPrice ?? 0

  const hasData = Boolean(dateRange && summary && log.length > 0)

  const metrics: EbitdaMetrics | null =
    hasData && summary
      ? {
          bitcoinProductionCost: summary.avgBtcProductionCost ?? 0,
          bitcoinPrice:
            log.length > 0
              ? log.reduce((sum, entry) => sum + (entry.btcPrice || 0), 0) / log.length
              : currentBTCPrice,
          bitcoinProduced: summary.totalRevenueBTC,
          ebitdaSellingBTC: summary.totalEbitdaSelling,
          actualEbitda: summary.totalEbitdaSelling,
          ebitdaNotSellingBTC: summary.totalEbitdaHodl,
        }
      : null

  const labels = _map(log, (entry) => getPeriodKey(entry.ts, periodType))

  const ebitdaChartData = hasData
    ? {
        labels,
        series: [
          {
            label: 'Sell scenario',
            values: _map(log, 'ebitdaSelling'),
            color: CHART_COLORS.blue,
            datalabels: {
              formatter: ebitdaBarFormatter,
              anchor: 'end',
              align: 'top',
              offset: 2,
              font: { size: 9 },
              padding: { right: 30 },
            },
          },
          {
            label: 'HODL scenario',
            values: _map(log, 'ebitdaHodl'),
            color: CHART_COLORS.green,
            datalabels: {
              formatter: ebitdaBarFormatter,
              anchor: 'end',
              align: 'top',
              offset: 2,
              font: { size: 9 },
              padding: { left: 30 },
            },
          },
        ],
      }
    : null

  const btcProducedChartData = hasData
    ? {
        labels,
        series: [
          {
            label: 'Bitcoin Produced',
            values: _map(log, 'revenueBTC'),
            color: CHART_COLORS.orange,
            datalabels: { formatter: btcProducedFormatter },
          },
        ],
      }
    : null

  return {
    metrics,
    ebitdaChartData,
    btcProducedChartData,
    isLoading,
    handleRangeChange,
    dateRange,
    errors,
    currentBTCPrice,
  }
}

export default useEBITDA
