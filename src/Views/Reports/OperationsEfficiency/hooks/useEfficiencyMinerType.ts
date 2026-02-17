import _get from 'lodash/get'
import _head from 'lodash/head'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'

import { TAIL_LOG_MINER_TYPE_KEY } from '../constants'

import { useGetTailLogQuery } from '@/app/services/api'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'

export const useEfficiencyMinerType = ({ start, end }: { start: Date; end: Date }) => {
  const {
    data: tailLogData,
    isLoading: isMinerTailLogLoading,
    isFetching: isMinerTailLogFetching,
  } = useGetTailLogQuery({
    key: 'stat-5m',
    type: 'miner',
    tag: 't-miner',
    limit: 1,
    start: start.valueOf(),
    end: end.valueOf(),
  })

  const tailLog = _head(tailLogData) ?? {}

  const categories = _sortBy(_keys(_get(tailLog, TAIL_LOG_MINER_TYPE_KEY, {})))

  const labels = _map(categories, (category) => _get(MINER_TYPE_NAME_MAP, category, category))
  const dataSet = _map(categories, (category) => _get(tailLog, [TAIL_LOG_MINER_TYPE_KEY, category]))

  const data = {
    labels,
    dataSet1: {
      label: 'Site Efficiency',
      data: dataSet,
    },
  }

  return {
    data,
    isLoading: isMinerTailLogLoading || isMinerTailLogFetching,
  }
}
