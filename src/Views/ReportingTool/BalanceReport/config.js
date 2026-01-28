import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatBalance, formatValueUnit } from '@/app/utils/format'
import { DATE_RANGE } from '@/constants'
import { CHART_COLORS } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'

export const minerPoolAggrFields = {
  'pool_snap.stats.hashrate': 1,
  'pool_snap.stats.active_workers_count': 1,
  'pool_snap.stats.revenue_24h': 1,
  'pool_snap.stats.unsettled': 1,
  'pool_snap.stats.balance': 1,
}

const btcFormatter = (value) =>
  formatValueUnit(value, CURRENCY.BTC, {
    maximumFractionDigits: 5,
    maximumSignificantDigits: 10,
  })

export const BALANCE_CHART_CONFIG = {
  bars: [
    {
      type: 'bar',
      label: 'Balance',
      backendAttribute: 'balance',
      ...getBarChartItemStyle('RED'),
    },
    {
      type: 'bar',
      label: 'Unsettled',
      backendAttribute: 'unsettled',
      ...getBarChartItemStyle('BLUE'),
    },
  ],
  formatter: btcFormatter,
}

export const REVENUE_CHART_CONFIG = {
  lines: [
    {
      label: 'Revenue 24 hrs',
      backendAttribute: 'revenue_24h',
      borderColor: CHART_COLORS.green,
    },
  ],
  formatter: formatBalance,
  currentValueLabel: {
    backendAttribute: 'revenue_24h',
  },
}

export const DATE_RANGE_WITH_DAYS_AGO = {
  [DATE_RANGE.W1]: 7,
  [DATE_RANGE.MONTH1]: 30,
}
