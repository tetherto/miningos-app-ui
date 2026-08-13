/**
 * Container alarm-related functions
 */
import _isBoolean from 'lodash/isBoolean'

import type { AlarmItem } from './types'

export interface ContainerSpecificStats {
  power_fault?: boolean
  liquid_level_low?: boolean
  circulating_pump_fault?: boolean
  fan1_fault?: boolean
  fan2_fault?: boolean
  fluid_infusion_pump_fault?: boolean
  cooling_tower_fan1_fault?: boolean
  cooling_tower_fan2_fault?: boolean
  cooling_tower_fan3_fault?: boolean
  leakage_fault?: boolean
  supply_liquid_temp_high?: boolean
  supply_liquid_temp_too_high?: boolean
  supply_liquid_pressure_high?: boolean
  return_liquid_pressure_low?: boolean
  supply_liquid_flow_low?: boolean
  cooling_tower_liquid_level_low?: boolean
  freezing_alarm?: boolean
  primary_circulating_pump?: boolean
  dry_cooler_power_fre_fault?: boolean
  dry_cooler_fre_conv?: boolean
  second_pump1_fault?: boolean
  second_pump2_fault?: boolean
  fan_fault?: boolean
  phasefailure?: boolean
  supply_liquid_temp_fault?: boolean
  return_liquid_temp_fault?: boolean
  power_distribution_Fault?: boolean
  lever_sensor_fault?: boolean
  smoke_sensor_fault?: boolean
  return_liquid_temp_high?: boolean
  return_liquid_temp_too_high?: boolean
  power_distribution_temp_high?: boolean
  lever_high?: boolean
  lever_low?: boolean
}

export interface MicroBTContainerStats {
  cdu?: {
    outdoor_ambient_temperature_sensor_fault?: boolean
    indoor_temperature_humidity_sensor_fault?: boolean
    makeup_water_pump_fault?: boolean
    power_supply_fault?: boolean
    water_immersion_fault?: boolean
  }
}

export const ANTSPACE_ALARM_STATUS = {
  FAULT: 'fault',
  UNAVAILABLE: 'unavailable',
  NORMAL: 'normal',
} as const

export type AntspaceAlarmStatus = (typeof ANTSPACE_ALARM_STATUS)[keyof typeof ANTSPACE_ALARM_STATUS]

export const getAntspaceFaultAlarmStatus = (fault: boolean | unknown): AntspaceAlarmStatus => {
  if (!_isBoolean(fault)) return ANTSPACE_ALARM_STATUS.UNAVAILABLE
  if (fault) return ANTSPACE_ALARM_STATUS.FAULT
  return ANTSPACE_ALARM_STATUS.NORMAL
}

export const getAntspaceAlarms = (containerSpecificStats: ContainerSpecificStats): AlarmItem[] => [
  {
    label: 'Power failure',
    id: 'power-failure',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.power_fault),
  },
  {
    label: 'Liquid level low alarm',
    id: 'low-level',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.liquid_level_low),
  },
  {
    label: 'Circul pump overload',
    id: 'circul-pump-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.circulating_pump_fault),
  },
  {
    label: 'Fan #1 overload',
    id: 'fan1-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fan1_fault),
  },
  {
    label: 'Fan #2 overload',
    id: 'fan2-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fan2_fault),
  },
  {
    label: 'Fluid infusion pump fault',
    id: 'fluid-infusion-pump',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fluid_infusion_pump_fault),
  },
  {
    label: 'Cooling tower fan #1 overload',
    id: 'coolfan1-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_fan1_fault),
  },
  {
    label: 'Cooling tower fan #2 overload',
    id: 'coolfan2-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_fan2_fault),
  },
  {
    label: 'Cooling tower fan #3 overload',
    id: 'coolfan3-overload',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_fan3_fault),
  },
  {
    label: 'Leakage alarm',
    id: 'leakage1-alarm',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.leakage_fault),
  },
  {
    label: 'Supply Liquid temp high alarm',
    id: 'temp-high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_high),
  },
  {
    label: 'Supply Liquid temp too high alarm',
    id: 'supply',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_too_high),
  },
  {
    label: 'Supply Liquid pressure high alarm',
    id: 'pressure-high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_pressure_high),
  },
  {
    label: 'Return Liquid pressure low alarm',
    id: 'pressure-low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_pressure_low),
  },
  {
    label: 'Supply flow low alarm',
    id: 'flow-low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_flow_low),
  },
  {
    label: 'Cooling tower liquid level low alarm',
    id: 'coolbox-low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.cooling_tower_liquid_level_low),
  },
  {
    label: 'Freezing alarm',
    id: 'freezing_alarm',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.freezing_alarm),
  },
]

export const getAntspaceImmersionAlarms = (
  containerSpecificStats: ContainerSpecificStats,
): AlarmItem[] => [
  {
    label: 'Primary circ. pump Frequency conversion fault',
    id: 'primary_circulating_pump',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.primary_circulating_pump),
  },
  {
    label: 'Dry Cooler Power frequency fault',
    id: 'dry_cooler_power_fre_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.dry_cooler_power_fre_fault),
  },
  {
    label: 'Dry Cooler Frequency conversion fault',
    id: 'dry_cooler_fre_conv',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.dry_cooler_fre_conv),
  },
  {
    label: '#1 Secondary circulation pump fault',
    id: 'second_pump1_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.second_pump1_fault),
  },
  {
    label: '#2 Secondary circulation pump fault',
    id: 'second_pump2_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.second_pump2_fault),
  },
  {
    label: 'Container fan fault',
    id: 'fan_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.fan_fault),
  },
  {
    label: 'Phase fault and phase sequence protection alarm',
    id: 'phasefailure',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.phasefailure),
  },
  {
    label: 'Liquid supply temperature transmitter fault',
    id: 'supply_liquid_temp_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_fault),
  },
  {
    label: 'Liquid return temperature transmitter fault',
    id: 'return_liquid_temp_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_temp_fault),
  },
  {
    label: 'Power distribution box temperature sensor fault',
    id: 'power_distribution_Fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.power_distribution_Fault),
  },
  {
    label: 'Liquid level sensor fault',
    id: 'lever_sensor_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.lever_sensor_fault),
  },
  {
    label: 'Smoke sensor fault',
    id: 'smoke_sensor_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.smoke_sensor_fault),
  },
  {
    label: 'Secondary supply temperature TT24 high',
    id: 'supply_liquid_temp_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_high),
  },
  {
    label: 'Secondary supply temperature TT24 too high',
    id: 'supply_liquid_temp_too_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.supply_liquid_temp_too_high),
  },
  {
    label: 'High secondary liquid return temperature',
    id: 'return_liquid_temp_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_temp_high),
  },
  {
    label: 'Too high secondary liquid return temperature',
    id: 'return_liquid_temp_too_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.return_liquid_temp_too_high),
  },
  {
    label: 'High power distribution box temperature',
    id: 'power_distribution_temp_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.power_distribution_temp_high),
  },
  {
    label: 'High liquid level alarm',
    id: 'lever_high',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.lever_high),
  },
  {
    label: 'Low liquid level alarm',
    id: 'lever_low',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.lever_low),
  },
  {
    label: 'Liquid leakage alarm',
    id: 'leakage_fault',
    status: getAntspaceFaultAlarmStatus(containerSpecificStats?.leakage_fault),
  },
]

export const getMicroBTAlarms = (containerSpecificStats: MicroBTContainerStats): AlarmItem[] => {
  const { cdu } = containerSpecificStats
  return [
    {
      label: 'Outdoor ambient temperature sensor fault',
      id: 'power-failure',
      status: getAntspaceFaultAlarmStatus(cdu?.outdoor_ambient_temperature_sensor_fault),
    },
    {
      label: 'Indoor temperature humidity sensor fault',
      id: 'low-level',
      status: getAntspaceFaultAlarmStatus(cdu?.indoor_temperature_humidity_sensor_fault),
    },
    {
      label: 'Makeup water pump fault',
      id: 'circul-pump-overload',
      status: getAntspaceFaultAlarmStatus(cdu?.makeup_water_pump_fault),
    },
    {
      label: 'Power supply fault',
      id: 'fan1-overload',
      status: getAntspaceFaultAlarmStatus(cdu?.power_supply_fault),
    },
    {
      label: 'Water immersion',
      id: 'fan2-overload',
      status: getAntspaceFaultAlarmStatus(cdu?.water_immersion_fault),
    },
  ]
}
