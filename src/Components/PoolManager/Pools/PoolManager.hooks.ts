import _fromPairs from 'lodash/fromPairs'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _map from 'lodash/map'

import { POOL_ENDPOINT_INDEX_ROLES } from '../PoolManager.constants'

import { useGetPoolConfigsQuery } from '@/app/services/api'
import { PoolSummary } from '@/Views/PoolManager/types'

interface PoolConfigData {
  poolConfigName: string
  description: string
  poolUrls: Array<{ url: string; pool: string; workerName?: string; workerPassword?: string }>
  id: string
  miners: number
  containers: number
  updatedAt: string | number
}

export const usePoolConfigs = () => {
  const { data: rawPoolData, isLoading, error } = useGetPoolConfigsQuery({})
  const poolData = rawPoolData as PoolConfigData[] | undefined
  const pools: PoolSummary[] = _map(poolData, (poolConfigData) => {
    const {
      poolConfigName: name,
      description,
      poolUrls,
      id,
      miners,
      containers: units,
      updatedAt: updatedAtTs,
    } = poolConfigData

    const workerName = _get(poolUrls, ['0', 'workerName'])
    const workerPassword = _get(poolUrls, ['0', 'workerPassword'])
    const updatedAt = new Date(updatedAtTs)

    const endpoints = _map(poolUrls, (endpoint, index) => {
      const { url: poolUrl, pool: poolName } = endpoint

      let url: URL
      try {
        url = new URL(poolUrl)
      } catch (error) {
        if (_includes(_get(error, 'message', '') as string, 'Invalid URL')) {
          return {
            host: '',
            port: '',
            pool: '',
            url: poolUrl,
          }
        }
        throw error
      }
      const role = POOL_ENDPOINT_INDEX_ROLES[index as keyof typeof POOL_ENDPOINT_INDEX_ROLES]
      const host = url.hostname
      const port = url.port || '80' // Default port if not specified
      return {
        role,
        host,
        port,
        pool: poolName,
        url: poolUrl,
      }
    })

    return {
      id,
      name,
      description,
      units,
      miners,
      workerName,
      workerPassword,
      endpoints,
      updatedAt,
    }
  })

  const poolIdMap = _fromPairs(_map(pools, (pool) => [pool.id, pool]))

  return {
    pools,
    poolIdMap,
    isLoading,
    error,
  }
}
