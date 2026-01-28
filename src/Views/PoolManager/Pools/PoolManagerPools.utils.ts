import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _fromPairs from 'lodash/fromPairs'
import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import _sum from 'lodash/sum'
import _toPairs from 'lodash/toPairs'
import _uniq from 'lodash/uniq'
import _uniqBy from 'lodash/uniqBy'
import _values from 'lodash/values'

import { getRackNameFromId } from '@/app/utils/deviceUtils'
import { POOL_ENDPOINT_INDEX_ROLES } from '@/Components/PoolManager/PoolManager.constants'
import { COMPLETE_MINER_TYPES } from '@/constants/deviceConstants'

const minerTypes = _values(COMPLETE_MINER_TYPES)
const minerTypesIndexLookup = _fromPairs(_map(minerTypes, (type, index) => [type, index]))

type PoolCfgRow = {
  rackId: string
  requestValue: {
    pool: string
    url: string
  }[]
}

export const getPools = (
  poolResponseData: PoolCfgRow[][],
  tailLogResponseData: Array<Array<Array<Record<string, unknown>>>> | undefined,
) => {
  const poolData = _groupBy(_flatMap(_head(poolResponseData), 'requestValue'), 'pool')

  const minerTypesInPool = _reduce(
    _reject(
      _map(minerTypes, (minerType) => [
        minerType,
        _get(
          _find(_head(poolResponseData), ({ rackId }) => getRackNameFromId(rackId) === minerType),
          ['requestValue', '0', 'pool'],
        ),
      ]),
      ([, poolName]) => _isNil(poolName),
    ),
    (result: Record<string, string[]>, [minerType, poolName]) => {
      if (!result[poolName]) {
        result[poolName] = []
      }

      result[poolName].push(minerType)
      return result
    },
    {} as Record<string, string[]>,
  )

  const tailLogData = tailLogResponseData ?? []

  interface PoolEndpoint {
    role: string
    host: string
    port: string | number
    [key: string]: unknown
  }

  type PoolSummary = {
    name: string
    description: string
    units: number
    miners: number
    endpoints: Array<null | {
      role: string
      host: string
      port: string | number
    }>
  }

  const pools: PoolSummary[] = _map(_toPairs(poolData), ([name, endpointData]) => {
    const endpoints = _map(
      _slice(_uniqBy(endpointData, 'url'), 0, 3),
      ({ url: poolUrl }, index) => {
        let url: URL
        try {
          url = new URL(poolUrl)
        } catch (error) {
          if (_includes(_get(error, 'message', '') as string, 'Invalid URL')) {
            return null
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
        } as PoolEndpoint
      },
    )

    const { units = [], numMiners = 0 } = _reduce(
      _map(
        _get(minerTypesInPool, [name], []),
        (minerType) =>
          _get(
            tailLogData,
            [
              0,
              minerTypesIndexLookup[minerType as keyof typeof minerTypesIndexLookup],
              0,
              'hashrate_mhs_5m_active_container_group_cnt',
            ],
            {},
          ) as Record<string, number>,
      ),
      (result, minerTypeTailLogData) => {
        result.numMiners += _sum(_values(minerTypeTailLogData))
        result.units = _uniq([...result.units, ..._keys(minerTypeTailLogData)])
        return result
      },
      {
        units: [] as string[],
        numMiners: 0,
      },
    )

    return {
      name,
      description: '',
      units: _size(units),
      miners: numMiners,
      endpoints,
    }
  })

  return pools
}
