import _omit from 'lodash/omit'

import { COLOR } from '@/constants/colors'

export const MINER_POWER_MODE = {
  SLEEP: 'sleep',
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const

export type MinerPowerMode = (typeof MINER_POWER_MODE)[keyof typeof MINER_POWER_MODE]

export const MinerStatuses = {
  MINING: 'mining',
  OFFLINE: 'offline',
  SLEEPING: 'sleeping',
  ERROR: 'error',
  NOT_MINING: 'not_mining',
  MAINTENANCE: 'maintenance',
  ALERT: 'alert',
} as const

export type MinerStatus = (typeof MinerStatuses)[keyof typeof MinerStatuses]

// Statuses to exclude from filter dropdowns
const NON_FILTERABLE_MINER_STATUSES = ['MAINTENANCE', 'ALERT'] as const

// Filtered statuses without maintenance and alert for filter dropdowns
export const FilterableMinerStatuses = _omit(MinerStatuses, NON_FILTERABLE_MINER_STATUSES)

export const DEVICE_STATUS = {
  RUNNING: 'Running',
  OFF: 'Off',
  ERROR: 'Error',
  UNAVAILABLE: 'Unavailable',
} as const

export type DeviceStatus = (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS]

export const CONTAINER_STATUS = {
  RUNNING: 'running',
  OFFLINE: 'offline',
  STOPPED: 'stopped',
} as const

export type ContainerStatus = (typeof CONTAINER_STATUS)[keyof typeof CONTAINER_STATUS]

export const SOCKET_STATUSES = {
  ...MinerStatuses,
  ...MINER_POWER_MODE,
  ERROR_MINING: 'errorMining',
  MINER_DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
} as const

export type SocketStatus = (typeof SOCKET_STATUSES)[keyof typeof SOCKET_STATUSES]

export interface ConsumptionLevels {
  low: number
  medium: number
  high: number
  critical: number
}

/**
 * Get overall consumption color
 * @param value MWatt
 */
export const getConsumptionColor = (
  value: number | null | undefined,
  levels: ConsumptionLevels | undefined,
): string => {
  if (!levels || !value || value < levels.low) {
    return COLOR.WHITE
  }
  if (value < levels.medium) {
    return COLOR.ORANGE
  }
  if (value < levels.high) {
    return COLOR.YELLOW
  }
  if (value < levels.critical) {
    return COLOR.GREEN
  }

  return COLOR.RED
}
