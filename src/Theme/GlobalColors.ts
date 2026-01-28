import {
  CONTAINER_STATUS,
  DEVICE_STATUS,
  MINER_POWER_MODE,
  MinerStatuses,
  SOCKET_STATUSES,
} from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'

type StatusColorMap = Record<string | number, string>

export const StatusColors: Record<'normal' | 'warning' | 'fault' | 'unavailable', string> = {
  normal: COLOR.DARK_TEXT_GREEN,
  warning: COLOR.ORANGE_WARNING,
  fault: COLOR.BRICK_RED,
  unavailable: COLOR.GREY,
} as const

export const MinersActivityBarsColors: StatusColorMap = {
  [MinerStatuses.OFFLINE]: COLOR.GREY_IDLE,
  [MinerStatuses.ERROR]: COLOR.RED,
  [MINER_POWER_MODE.SLEEP]: COLOR.SLEEP_BLUE,
  [MinerStatuses.NOT_MINING]: COLOR.RED,
  [MINER_POWER_MODE.LOW]: COLOR.MINT_GREEN,
  [MINER_POWER_MODE.NORMAL]: COLOR.GREEN,
  [MINER_POWER_MODE.HIGH]: COLOR.OCEAN_GREEN,
  [MinerStatuses.MAINTENANCE]: COLOR.ORANGE_WARNING,
  [SOCKET_STATUSES.MINER_DISCONNECTED]: COLOR.ORANGE_WARNING,
} as const

export const PowerModeColors: Record<
  (typeof MINER_POWER_MODE)[keyof typeof MINER_POWER_MODE],
  string
> = {
  [MINER_POWER_MODE.SLEEP]: COLOR.SLEEP_BLUE,
  [MINER_POWER_MODE.LOW]: COLOR.DARK_GREEN,
  [MINER_POWER_MODE.NORMAL]: COLOR.STRONG_GREEN,
  [MINER_POWER_MODE.HIGH]: COLOR.MINT_GREEN,
} as const

export const MinerStatusColors: Partial<
  Record<(typeof MinerStatuses)[keyof typeof MinerStatuses], string>
> = {
  [MinerStatuses.ERROR]: COLOR.BRICK_RED,
  [MinerStatuses.NOT_MINING]: COLOR.BRICK_RED,
  [MinerStatuses.OFFLINE]: COLOR.DARK_GREY,
  [MinerStatuses.SLEEPING]: COLOR.SLEEP_BLUE,
  [MinerStatuses.MAINTENANCE]: COLOR.ORANGE_WARNING,
} as const

export const StatusLabelColors: StatusColorMap = {
  [DEVICE_STATUS.OFF]: COLOR.DARK_GREEN,
  [DEVICE_STATUS.ERROR]: COLOR.BRICK_RED,
  [DEVICE_STATUS.RUNNING]: COLOR.GRASS_GREEN,
  [DEVICE_STATUS.UNAVAILABLE]: COLOR.ORANGE_WARNING,
  [CONTAINER_STATUS.RUNNING]: COLOR.GRASS_GREEN,
  [CONTAINER_STATUS.STOPPED]: COLOR.BRICK_RED,
  [CONTAINER_STATUS.OFFLINE]: COLOR.DARK_GREEN,
} as const

export const DeviceStatusColors: StatusColorMap = {
  [DEVICE_STATUS.UNAVAILABLE]: COLOR.ORANGE_WARNING,
  [DEVICE_STATUS.ERROR]: COLOR.RED,
  [DEVICE_STATUS.OFF]: COLOR.GREY_IDLE,
  [DEVICE_STATUS.RUNNING]: COLOR.GREEN,
  [CONTAINER_STATUS.STOPPED]: COLOR.RED,
  [CONTAINER_STATUS.RUNNING]: COLOR.GREEN,
  [CONTAINER_STATUS.OFFLINE]: COLOR.GREY_IDLE,
} as const

export const DeviceActionButtonColors: Partial<
  Record<(typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS], string>
> = {
  [DEVICE_STATUS.OFF]: COLOR.BLUE,
  [DEVICE_STATUS.ERROR]: COLOR.RED,
  [DEVICE_STATUS.RUNNING]: COLOR.DARK_TEXT_GREEN,
} as const
