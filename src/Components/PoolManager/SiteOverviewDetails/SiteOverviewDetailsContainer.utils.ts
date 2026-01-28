import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _reverse from 'lodash/reverse'
import _split from 'lodash/split'

import { Logger } from '@/app/services/logger'
import { Device } from '@/types'

type HeadMinerConfig =
  | {
      pool_config?: {
        url?: string
      }[]
    }
  | undefined

export const getMinersPoolName = (miners?: Device[]) => {
  const minerConfig = _find(miners, (miner) => !!miner?.last?.snap?.config)?.last?.snap
    ?.config as HeadMinerConfig

  const poolUrl = _head(minerConfig?.pool_config)?.url

  let poolHost: string | undefined

  if (!poolUrl) {
    return ''
  }

  try {
    poolHost = new URL(poolUrl).hostname
  } catch (exception) {
    Logger.error(`getMinersPoolName failed for '${poolUrl}' URL value`, exception)
  }

  if (!poolHost) {
    return ''
  }

  return _get(_reverse(_split(poolHost, '.')), ['1'], '')
}
