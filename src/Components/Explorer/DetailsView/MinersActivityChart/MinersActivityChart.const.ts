import _indexOf from 'lodash/indexOf'

import { MINER_POWER_MODE, MinerStatuses, SOCKET_STATUSES } from '@/app/utils/statusUtils'

type StatusItems = (
  | (typeof MinerStatuses)[keyof typeof MinerStatuses]
  | (typeof MINER_POWER_MODE)[keyof typeof MINER_POWER_MODE]
  | (typeof SOCKET_STATUSES)[keyof typeof SOCKET_STATUSES]
)[]

const MINERS_ACTIVITY_COMMON_ITEMS = [
  MinerStatuses.OFFLINE,
  MinerStatuses.NOT_MINING,
  MINER_POWER_MODE.LOW,
  MINER_POWER_MODE.NORMAL,
  MINER_POWER_MODE.HIGH,
]

const MINERS_ACTIVITY_ITEMS_RAW = {
  WITH_MAINTENANCE: [...MINERS_ACTIVITY_COMMON_ITEMS, MinerStatuses.MAINTENANCE],
  WOUT_MAINTENANCE: [...MINERS_ACTIVITY_COMMON_ITEMS, SOCKET_STATUSES.MINER_DISCONNECTED],
}

const commonItemsNotMiningIndex = _indexOf(MINERS_ACTIVITY_COMMON_ITEMS, MinerStatuses.NOT_MINING)

const extendItems = (rawItems: StatusItems) => {
  const items = [...rawItems]

  items.splice(commonItemsNotMiningIndex, 1, MinerStatuses.ERROR, MINER_POWER_MODE.SLEEP)

  return items
}

export const MINERS_ACTIVITY_ITEMS = {
  SHORT: MINERS_ACTIVITY_ITEMS_RAW,
  EXTENDED: {
    WITH_MAINTENANCE: extendItems(MINERS_ACTIVITY_ITEMS_RAW.WITH_MAINTENANCE),
    WOUT_MAINTENANCE: extendItems(MINERS_ACTIVITY_ITEMS_RAW.WOUT_MAINTENANCE),
  },
}

export const MINERS_ACTIVITY_TOOLTIPS = {
  [MinerStatuses.ERROR]: "This does not include minor errors not affecting the miner's hash rate",
}

export const MINERS_ACTIVITY_LABELS = {
  [SOCKET_STATUSES.MINER_DISCONNECTED]: 'empty',
}

export const SKELETON_MIN_HEIGHT_LARGE = 120
export const SKELETON_MIN_HEIGHT_DEFAULT = 80
