import _isNil from 'lodash/isNil'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatChartDate } from '@/app/utils/format'

export const getDataset = (data, isChartDateShort) => {
  const KEY = 'avgFeesSatsVByte'
  const LABEL = 'Average Fees in Sats/vByte'
  const COLOR = 'PURPLE'

  return [
    _reduce(
      data,
      (acc, entry) => {
        if (!entry.ts || _isNil(entry[KEY])) return acc

        const label = formatChartDate(entry.ts, !isChartDateShort)

        _set(acc, label, {
          value: entry[KEY],
          style: getBarChartItemStyle(COLOR),
          legendColor: getBarChartItemStyle(COLOR)?.backgroundColor,
        })

        acc.label = LABEL
        return acc
      },
      {},
    ),
  ]
}
