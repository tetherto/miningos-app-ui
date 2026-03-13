import { useGetPoolConfigsQuery } from '@/app/services/api'
import { PoolSummary } from '@/Views/PoolManager/types'
import _map from 'lodash/map'
import _values from 'lodash/values'
import _includes from 'lodash/includes'
import _get from 'lodash/get'
import { POOL_ENDPOINT_INDEX_ROLES } from '../PoolManager.constants'

export const usePoolConfigs = () => {
  const { data: poolData, isLoading } = useGetPoolConfigsQuery({})
  const pools: PoolSummary[] = _map(poolData, (poolConfigData) => {
    const { poolConfigName: name, description, poolUrls, id } = poolConfigData
    const workerName = _get(poolUrls, ['0', 'workerName'])
    const workerPassword = _get(poolUrls, ['0', 'workerPassword'])
    return {
      id,
      name,
      description,
      // TODO: fetch these stats when API supports them
      units: 0,
      miners: 0,
      workerName,
      workerPassword,
      endpoints: _map(poolUrls, (endpoint, index) => {
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
        }
      }),
    }
  })

  return {
    pools,
    isLoading,
  }
}
