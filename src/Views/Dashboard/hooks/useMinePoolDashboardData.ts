import _get from 'lodash/get'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _keyBy from 'lodash/keyBy'
import _map from 'lodash/map'
import _split from 'lodash/split'

import { useGetExtDataQuery, useGetListRacksQuery } from '@/app/services/api'
import {
  MinerPoolExtData,
  MinerPoolExtDataResponse,
  MinerPoolExtDataStats,
  MinerPoolRackListData,
  MinerPoolRackListResponse,
} from '@/types'

export interface MinerPoolDashboardData extends MinerPoolRackListData {
  stats: MinerPoolExtDataStats
  [key: string]: unknown
}

export const useMinePoolDashboardData = () => {
  const {
    data: listRacks,
    isFetching: isFetchingListRack,
    isLoading: isLoadingListRacks,
    isError: isErrorListRacks,
  } = useGetListRacksQuery<MinerPoolRackListResponse>({
    type: 'minerpool',
  })
  const {
    data: extData,
    isFetching: isFetchingExtData,
    isLoading: isLoadingExtData,
    isError: isErrorExtData,
  } = useGetExtDataQuery<MinerPoolExtDataResponse>({
    type: 'minerpool',
    query: JSON.stringify({ key: 'stats' }),
  })

  let data: MinerPoolDashboardData[] = []

  const poolsData = _isArray(extData) ? _head(_head(extData)) : []
  const minerPools = _isArray(listRacks) ? _head(listRacks) : []

  if (!_isEmpty(minerPools) && !_isEmpty(poolsData)) {
    const stats = _get(poolsData, 'stats', []) as MinerPoolExtData['stats']
    const statsByPoolType = _keyBy(stats, 'poolType')

    data = _map(minerPools, (pool) => {
      const poolTypeKey = _get(_split(pool.type, '-'), '1')
      const stat = _get(statsByPoolType, poolTypeKey)

      return {
        ...pool,
        stats: stat,
      }
    })
  }

  return {
    data,
    isLoading: isLoadingListRacks || isLoadingExtData,
    isFetching: isFetchingListRack || isFetchingExtData,
    isError: isErrorListRacks || isErrorExtData,
  }
}
