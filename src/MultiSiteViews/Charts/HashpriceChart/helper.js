import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatChartDate } from '@/app/utils/format'

export const LABELS = ['Hash Cost', 'Hash Revenue', 'Network Hashprice']
const COLORS = ['BLUE', 'RED', 'GREEN']
const KEYS = ['cost', 'revenue', 'networkHashprice']

export const getDataset = (data, isChartDateShort = false, customFormatTemplate) =>
  _map(KEYS, (key, idx) =>
    _reduce(
      data,
      (acc, entry) => {
        const label = formatChartDate(
          new Date(entry.date).getTime(),
          !isChartDateShort,
          customFormatTemplate,
        )
        _set(acc, label, {
          value: entry[key],
          style: getBarChartItemStyle(COLORS[idx]),
          legendColor: getBarChartItemStyle(COLORS[idx])?.backgroundColor,
        })
        return acc
      },
      {
        label: LABELS[idx],
      },
    ),
  )
