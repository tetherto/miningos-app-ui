import _isFinite from 'lodash/isFinite'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatBTC, formatChartDate } from '@/app/utils/format'
import { CURRENCY } from '@/MultiSiteViews/constants'

export const getDataset = (
  data,
  unit,
  isChartDateShort = false,
  currency,
  customFormatTemplate,
) => {
  const KEY = 'hashprice'
  const LABEL = 'Bitcoin Network Hashprice'
  const COLOR = 'PURPLE'

  return [
    _reduce(
      data,
      (acc, entry) => {
        const valueUSD = entry?.[KEY]
        const valueBTC = formatBTC(entry?.dailyRevenueUSD / entry?.priceUSD).realValue

        const value = currency === CURRENCY.BTC ? valueBTC : valueUSD

        const ts = entry?.ts
        if (!_isFinite(value) || !ts) return acc

        const label = formatChartDate(Number(ts), !isChartDateShort, customFormatTemplate)
        _set(acc, label, {
          value,
          style: getBarChartItemStyle(COLOR),
          legendColor: getBarChartItemStyle(COLOR)?.backgroundColor,
        })
        acc.label = LABEL
        acc.unit = unit

        return acc
      },
      {},
    ),
  ]
}
