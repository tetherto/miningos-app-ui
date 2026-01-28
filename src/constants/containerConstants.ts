export const CONTAINER_MODEL = {
  BITDEER: 'bitdeer',
  ANTSPACE: 'antspace',
  BITMAIN: 'bitmain',
  ANTSPACE_HYDRO: 'antspace-hydro',
  BITMAIN_HYDRO: 'bitmain-hydro',
  MICROBT: 'microbt',
  ANTSPACE_IMMERSION: 'antspace-immersion',
  BITMAIN_IMMERSION: 'bitmain-immersion',
  BITMAIN_IMM: 'bitmain-imm',
  IMMERSION_CONTAINER: 'container-as-immersion',
  // Threshold mapping constants
  BITDEER_THRESHOLD: 'bitdeer',
  MICROBT_THRESHOLD: 'microbt',
  HYDRO_THRESHOLD: 'hydro',
  IMMERSION_THRESHOLD: 'immersion',
} as const

// Container Settings Model constants - used for API queries
export const CONTAINER_SETTINGS_MODEL = {
  BITDEER: 'bd',
  MICROBT: 'mbt',
  HYDRO: 'hydro',
  IMMERSION: 'immersion',
}

export const CONTAINER_TYPE = {
  BITDEER: 'bd',
  ANTSPACE: 'as',
  ANTSPACE_HYDRO: 'as-hk3',
  ANTSPACE_IMMERSION: 'as-immersion',
  MICROBT: 'mbt',
} as const

export const COMPLETE_CONTAINER_TYPE = {
  BITDEER_M30: 'container-bd-d40-m30',
  BITDEER_A1346: 'container-bd-d40-a1346',
  BITDEER_M56: 'container-bd-d40-m56',
  BITDEER_S19XP: 'container-bd-d40-s19xp',
  BITMAIN_HYDRO: 'container-as-hk3',
  BITMAIN_IMMERSION: 'container-as-immersion',
  MICROBT_WONDERINT: 'container-mbt-wonderint',
  MICROBT_KEHUA: 'container-mbt-kehua',
} as const

export const CONTAINER_TYPE_NAME_MAP = {
  [COMPLETE_CONTAINER_TYPE.BITDEER_M30]: 'Bitdeer M30',
  [COMPLETE_CONTAINER_TYPE.BITDEER_A1346]: 'Bitdeer A1346',
  [COMPLETE_CONTAINER_TYPE.BITDEER_M56]: 'Bitdeer M56',
  [COMPLETE_CONTAINER_TYPE.BITDEER_S19XP]: 'Bitdeer S19XP',
  [COMPLETE_CONTAINER_TYPE.BITMAIN_HYDRO]: 'Bitmain Hydro',
  [COMPLETE_CONTAINER_TYPE.BITMAIN_IMMERSION]: 'Bitmain Imm',
  [COMPLETE_CONTAINER_TYPE.MICROBT_WONDERINT]: 'MicroBT Wonder',
  [COMPLETE_CONTAINER_TYPE.MICROBT_KEHUA]: 'MicroBT Kehua',
} as const

export const CONTAINER_TACTICS_TYPE = {
  COIN: 'coin',
  DISABLED: 'disabled',
  ELECTRICITY: 'electricity',
} as const

export const MAINTENANCE_CONTAINER = 'maintenance'

export const NO_MAINTENANCE_CONTAINER = 'no_maintenance'

export const THRESHOLD_TYPE = {
  OIL_TEMPERATURE: 'oilTemperature',
  TANK_PRESSURE: 'tankPressure',
  WATER_TEMPERATURE: 'waterTemperature',
  SUPPLY_LIQUID_PRESSURE: 'supplyLiquidPressure',
} as const

export const THRESHOLD_LEVEL = {
  CRITICAL_LOW: 'criticalLow',
  ALARM_LOW: 'alarmLow',
  ALERT: 'alert',
  NORMAL: 'normal',
  ALARM: 'alarm',
  ALARM_HIGH: 'alarmHigh',
  CRITICAL_HIGH: 'criticalHigh',
} as const

export const CONTAINER_TAB = {
  HOME: 'home',
  PDU: 'pdu',
  SETTINGS: 'settings',
  CHARTS: 'charts',
  HEATMAP: 'heatmap',
} as const

// Type exports
export type ContainerModelKey = keyof typeof CONTAINER_MODEL
export type ContainerModelValue = (typeof CONTAINER_MODEL)[ContainerModelKey]
export type ContainerTypeKey = keyof typeof CONTAINER_TYPE
export type ContainerTypeValue = (typeof CONTAINER_TYPE)[ContainerTypeKey]
export type CompleteContainerTypeKey = keyof typeof COMPLETE_CONTAINER_TYPE
export type CompleteContainerTypeValue = (typeof COMPLETE_CONTAINER_TYPE)[CompleteContainerTypeKey]
export type ContainerTypeNameKey = keyof typeof CONTAINER_TYPE_NAME_MAP
export type ContainerTypeNameValue = (typeof CONTAINER_TYPE_NAME_MAP)[ContainerTypeNameKey]
export type ContainerTacticsTypeKey = keyof typeof CONTAINER_TACTICS_TYPE
export type ContainerTacticsTypeValue = (typeof CONTAINER_TACTICS_TYPE)[ContainerTacticsTypeKey]
export type ThresholdTypeKey = keyof typeof THRESHOLD_TYPE
export type ThresholdTypeValue = (typeof THRESHOLD_TYPE)[ThresholdTypeKey]
export type ThresholdLevelKey = keyof typeof THRESHOLD_LEVEL
export type ThresholdLevelValue = (typeof THRESHOLD_LEVEL)[ThresholdLevelKey]
export type ContainerTabKey = keyof typeof CONTAINER_TAB
export type ContainerTabValue = (typeof CONTAINER_TAB)[ContainerTabKey]
