import _find from 'lodash/find'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _reverse from 'lodash/reverse'
import _split from 'lodash/split'

import { SITE_OVERVIEW_STATUS_COLORS, SITE_OVERVIEW_STATUSES } from '../PoolManager.constants'

import { Logger } from '@/app/services/logger'
import { MinerStatuses } from '@/app/utils/statusUtils'
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

export const getMinerStatus = (miner?: {
  error?: string
  snap?: { stats?: { status?: string } }
}) => {
  if (!miner || miner.error === 'Device Not Found') {
    return SITE_OVERVIEW_STATUSES.EMPTY as keyof typeof SITE_OVERVIEW_STATUS_COLORS
  }

  if (miner.snap?.stats?.status === MinerStatuses.NOT_MINING) {
    return SITE_OVERVIEW_STATUSES.NOT_MINING as keyof typeof SITE_OVERVIEW_STATUS_COLORS
  }

  if (miner.snap?.stats?.status === MinerStatuses.MINING) {
    return SITE_OVERVIEW_STATUSES.MINING as keyof typeof SITE_OVERVIEW_STATUS_COLORS
  }

  return SITE_OVERVIEW_STATUSES.OFFLINE as keyof typeof SITE_OVERVIEW_STATUS_COLORS
}
