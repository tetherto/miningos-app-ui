import _find from 'lodash/find'
import _fromPairs from 'lodash/fromPairs'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import _sum from 'lodash/sum'
import _toPairs from 'lodash/toPairs'
import _values from 'lodash/values'

import { MINER_TYPES_REPORT_FILTER_OPTIONS } from './MinerTypesReport.constants'

import { createCategoricalColorGen } from '@/app/utils/colorUtils'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'

const DEFAULT_TAIL_LOG_KEY = 'type_cnt'

export const getChartData = ({
  filter,
  tailLogData: rawTailLogData,
}: {
  filter: string
  tailLogData: Record<string, Record<string, number>>[]
}) => {
  const tailLogKey = _get(
    _find(MINER_TYPES_REPORT_FILTER_OPTIONS, ['value', filter]),
    ['tailLogKey'],
    DEFAULT_TAIL_LOG_KEY,
  )

  const tailLogHead = _head(rawTailLogData)

  const tailLogData = _isArray(tailLogHead) ? _head(tailLogHead) : tailLogHead

  const minerStats = _fromPairs(
    _map(_toPairs(_get(tailLogData, [tailLogKey], {})), ([type, value]) => [
      _get(MINER_TYPE_NAME_MAP, [type], type),
      value,
    ]),
  )
  const total = _sum(_values(minerStats))

  const colorGen = createCategoricalColorGen()

  return {
    dataset: _fromPairs(
      _map(_toPairs(minerStats), ([key, value]) => [
        key,
        {
          color: colorGen.next().value,
          value,
        },
      ]),
    ),
    label: 'Total Miners',
    value: total,
  }
}
