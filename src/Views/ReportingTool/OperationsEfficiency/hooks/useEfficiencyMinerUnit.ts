import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _pickBy from 'lodash/pickBy'
import _sortBy from 'lodash/sortBy'

import { TAIL_LOG_CONTAINER_KEY } from '../constants'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'
import { getContainerName } from '@/app/utils/containerUtils'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import type { Container } from '@/types'

const getLabelName = (category: string, containers?: Container[]) => {
  const container = _find(containers, (c) => _get(c, ['info', 'container']) === category)
  const type = _get(container, 'type')

  return _isNil(type) ? category : getContainerName(category, type)
}

export const useEfficiencyMinerUnit = ({ start, end }: { start: Date; end: Date }) => {
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

  const { data: containerListData, isLoading: isContainerListDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      tags: {
        $in: ['t-container'],
      },
    }),
  })

  const containers = (_head(containerListData) ?? []) as Container[]

  const tailLog = _head(tailLogData) ?? {}

  const categories = _sortBy(
    _keys(
      _pickBy(
        _get(tailLog, TAIL_LOG_CONTAINER_KEY, {}),
        (value, key) => !_includes(key, MAINTENANCE_CONTAINER) && _isNumber(value) && value > 0,
      ),
    ),
  )

  const labels = _map(categories, (category) => getLabelName(category, containers))
  const dataSet = _map(categories, (category) => _get(tailLog, [TAIL_LOG_CONTAINER_KEY, category]))

  const data = {
    labels,
    dataSet1: {
      label: 'Site Efficiency',
      data: dataSet,
    },
  }

  return {
    data,
    isLoading: isMinerTailLogLoading || isMinerTailLogFetching || isContainerListDataLoading,
  }
}
