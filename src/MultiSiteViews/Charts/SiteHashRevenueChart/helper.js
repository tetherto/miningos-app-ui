import _isNil from 'lodash/isNil'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatChartDate } from '@/app/utils/format'
import { CURRENCY } from '@/constants/units'

export const getDataset = (data, currency, isChartDateShort, customFormatTemplate) => {
  const key = `hashRevenue${currency}_PHS_d`
  const label = `Hash Revenue (${currency})`
  const color = currency === CURRENCY.BTC ? 'RED' : 'BLUE'

  const dataset = _reduce(
    data,
    (acc, entry) => {
      const value = entry?.[key]
      if (_isNil(value)) return acc

      const labelKey = formatChartDate(entry.ts, !isChartDateShort, customFormatTemplate)

      _set(acc, labelKey, {
        value,
        style: getBarChartItemStyle(color),
        legendColor: getBarChartItemStyle(color)?.backgroundColor,
      })

      return acc
    },
    { label },
  )

  return [dataset]
}
