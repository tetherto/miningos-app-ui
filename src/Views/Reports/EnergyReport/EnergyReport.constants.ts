import { MINER_POWER_MODE, MinerStatuses } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'

export const ENERGY_REPORT_TABS = {
  SITE: 'site',
  MINER_TYPE: 'minerType',
  MINER_UNIT: 'minerUnit',
} as const

export type EnergyReportTab = (typeof ENERGY_REPORT_TABS)[keyof typeof ENERGY_REPORT_TABS]

interface MinerMode {
  mode: string
  title: string
  color: string
}

export const MINER_MODES: MinerMode[] = [
  {
    mode: MinerStatuses.OFFLINE,
    title: 'Offline',
    color: COLOR.GREY_IDLE,
  },
  {
    mode: MinerStatuses.ERROR,
    title: 'Error',
    color: COLOR.RED,
  },
  {
    mode: MINER_POWER_MODE.SLEEP,
    title: 'Sleep',
    color: COLOR.SLEEP_BLUE,
  },
  {
    mode: MINER_POWER_MODE.LOW,
    title: 'Low',
    color: COLOR.BRIGHT_YELLOW,
  },
  {
    mode: MINER_POWER_MODE.NORMAL,
    title: 'Normal',
    color: COLOR.GREEN,
  },
  {
    mode: MINER_POWER_MODE.HIGH,
    title: 'High',
    color: COLOR.MINT_GREEN,
  },
  {
    mode: MinerStatuses.MAINTENANCE,
    title: 'Maintenance',
    color: COLOR.ORANGE_WARNING,
  },
]

export const MinerTypePowerModesMap = {
  offline_type_cnt: MinerStatuses.OFFLINE,
  error_type_cnt: MinerStatuses.ERROR,
  power_mode_sleep_type_cnt: MINER_POWER_MODE.SLEEP,
  power_mode_low_type_cnt: MINER_POWER_MODE.LOW,
  power_mode_normal_type_cnt: MINER_POWER_MODE.NORMAL,
  power_mode_high_type_cnt: MINER_POWER_MODE.HIGH,
  maintenance_type_cnt: MinerStatuses.MAINTENANCE,
} as const

export type MinerModeKey = keyof typeof MinerTypePowerModesMap
