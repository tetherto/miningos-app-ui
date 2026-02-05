import _countBy from 'lodash/countBy'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _partition from 'lodash/partition'
import _round from 'lodash/round'
import type { NavigateFunction } from 'react-router'

import type { Alert } from '@/app/utils/alertUtils'
import { getLogFormattedAlertData } from '@/app/utils/alertUtils'
import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isMicroBT,
  isMicroBTKehua,
} from '@/app/utils/containerUtils'
import {
  getConfig,
  getContainerSpecificStats,
  getStats,
  unitToKilo,
  formatPowerConsumption,
} from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { convertMpaToBar } from '@/app/utils/format'
import { formatNumber } from '@/app/utils/format'
import { MinerStatuses } from '@/app/utils/statusUtils'
import { getContainerState } from '@/Components/Container/ContentBox/helper'
import {
  getBitdeerOilTemperatureColor,
  getBitdeerTankPressureColor,
  getBitdeerTemperatureColor,
} from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.utils'
import {
  getAntspaceSupplyLiquidTemperatureColor,
  getAntspaceSupplyLiquidPressureColor,
} from '@/Components/Explorer/Containers/BitMainHydro/HydroSettings.utils'
import { getImmersionTemperatureColor } from '@/Components/Explorer/Containers/BitMainImmersion/ImmersionSettings.utils'
import { getMicroBtInletTempColor } from '@/Components/Explorer/Containers/MicroBT/MicroBTSettings/MicorBTSettingsUtils'
import { LOG_TYPES } from '@/Components/LogsCard/constants'
import { LogComponent, LogData } from '@/Components/LogsCard/LogComponent'
import { LogDotComponent } from '@/Components/LogsCard/LogDotComponent'
import { UNITS } from '@/constants/units'
import { onLogClicked } from '@/Views/Alerts/Alerts.util'

export const getCoolingSystem = (data: UnknownRecord) =>
  (getContainerSpecificStats(data as Device)?.cooling_system || {}) as UnknownRecord

// Todo investigate where this is getting called and why it fails without the noop
export const getSingleAlarmMessage = (alarm: Alert, getFormattedDate?: (date: Date) => string) =>
  `(${alarm.severity}) ${getFormattedDate?.(new Date(alarm.createdAt)) ?? ''}: ${alarm.name} Description: ${
    alarm.description
  } ${alarm.message || ''}`

export const getAlarms = (
  data: Device = {} as Device,
  getString?: () => void,
  getFormattedDate?: (date: Date) => string,
) => {
  const alarms = data?.last?.alerts as Alert[]

  if (!getString || !alarms) {
    return alarms
  }
  return _join(
    _map(alarms, (alarm) => getSingleAlarmMessage(alarm, getFormattedDate)),
    ',\n',
  )
}

export const getBitdeerContainerControlsBoxData = (data: UnknownRecord = {}) => {
  const { id } = data
  const { exhaust_fan_enabled, oil_pump = [] } = getCoolingSystem(data)

  const getTank1Status = () =>
    _isArray(oil_pump) && oil_pump.length > 0 ? oil_pump[0]?.tank : undefined

  const getTank2Status = () =>
    _isArray(oil_pump) && oil_pump.length > 1 ? oil_pump[1]?.tank : undefined

  return {
    id,
    exhaustFanEnabled: exhaust_fan_enabled,
    tank1Enabled: getTank1Status(),
    tank2Enabled: getTank2Status(),
  }
}

export const getAntspaceContainerControlsBoxData = (data: UnknownRecord = {}) => {
  const { id } = data

  return {
    id,
    pidModeEnabled: getContainerSpecificStats(data)?.pid_mode,
    runningModeEnabled: getContainerSpecificStats(data)?.running_mode,
  }
}

export const getEMCATemperatureAndHumidityBoxData = (data: UnknownRecord = {}) => {
  const stats = getStats(data as Device)
  const { ambient_temp_c, humidity_percent } = stats

  const containerSpecificStats = (stats?.container_specific || {}) as {
    left?: UnknownRecord
    right?: UnknownRecord
    cabinet_air_temp?: unknown
    container_air_temp?: unknown
  }
  const { left, right, cabinet_air_temp, container_air_temp } = containerSpecificStats

  return [
    {
      id: 'containerTemp',
      label: 'Container Temp',
      value: ambient_temp_c,
      units: UNITS.TEMPERATURE_C,
    },
    {
      id: 'containerAirTemp',
      label: 'Container Air Temp',
      value: container_air_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      id: 'cabinetAirTemp',
      label: 'Cabinet Air Temp',
      value: cabinet_air_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      id: 'humidity',
      label: 'Humidity',
      ...(_isFinite(humidity_percent)
        ? {
            value: humidity_percent,
            units: UNITS.HUMIDITY_PERCENT,
          }
        : {
            value: '-',
          }),
    },

    {
      id: 'frontTempIn',
      label: 'Front Temp In',
      leftValue: left?.front_temp_in,
      rightValue: right?.front_temp_in,
      units: UNITS.TEMPERATURE_C,
      isLeftRightValue: true,
    },
    {
      id: 'rearTempIn',
      label: 'Rear Temp In',
      leftValue: left?.rear_temp_in,
      rightValue: right?.rear_temp_in,
      units: UNITS.TEMPERATURE_C,
      isLeftRightValue: true,
    },
    {
      id: 'frontTempOut',
      label: 'Front Temp Out',
      leftValue: left?.front_temp_out,
      rightValue: right?.front_temp_out,
      units: UNITS.TEMPERATURE_C,
      isLeftRightValue: true,
    },
    {
      id: 'rearTempOut',
      label: 'Rear Temp Out',
      leftValue: left?.rear_temp_out,
      rightValue: right?.rear_temp_out,
      units: UNITS.TEMPERATURE_C,
      isLeftRightValue: true,
    },
  ]
}

export const getEMCAConfigurationBoxData = (data: UnknownRecord = {}) => {
  const config = getConfig(data as Device)
  const containerSpecificConfig = (config?.container_specific || {}) as {
    left?: UnknownRecord
    right?: UnknownRecord
    high_air_temp?: unknown
  }
  const { left, right, high_air_temp } = containerSpecificConfig

  return [
    {
      label: 'High Air Temp',
      value: high_air_temp,
      units: UNITS.TEMPERATURE_C,
    },

    {
      label: 'Liquid Target Temp',
      leftValue: left?.liquid_target_temp,
      rightValue: right?.liquid_target_temp,
      units: UNITS.TEMPERATURE_C,
      isLeftRightValue: true,
    },
    {
      label: 'Liquid Alert Temp',
      leftValue: left?.liquid_alert_temp,
      rightValue: right?.liquid_alert_temp,
      units: UNITS.TEMPERATURE_C,
      isLeftRightValue: true,
    },
    {
      label: 'Admin Main Relay',
      leftValue: left?.admin_main_relay,
      rightValue: right?.admin_main_relay,
      units: '',
      isLeftRightValue: true,
    },
    {
      label: 'Liquid Step Interval',
      leftValue: left?.liquid_step_interval,
      rightValue: right?.liquid_step_interval,
      units: '',
      isLeftRightValue: true,
    },
    {
      label: 'Admin Main KM',
      leftValue: left?.admin_main_km,
      rightValue: right?.admin_main_km,
      units: '',
      isLeftRightValue: true,
    },
    {
      label: 'Admin Pump KM',
      leftValue: left?.admin_pump_km,
      rightValue: right?.admin_pump_km,
      units: '',
      isLeftRightValue: true,
    },
    {
      label: 'Pressure Stab Interval',
      leftValue: left?.pressure_stab_interval,
      rightValue: right?.pressure_stab_interval,
      units: '',
      isLeftRightValue: true,
    },
    {
      label: 'Pressure Stab Target',
      leftValue: left?.pressure_stab_target,
      rightValue: right?.pressure_stab_target,
      units: '',
      isLeftRightValue: true,
    },
    {
      label: 'Fan Min Frequency',
      leftValue: left?.fan_min_freq,
      rightValue: right?.fan_min_freq,
      units: '',
      isLeftRightValue: true,
    },
  ]
}

export const getEMCAPressureAndFrequencyBoxData = (data: UnknownRecord = {}) => {
  const stats = getStats(data as Device)
  const containerSpecificStats = stats?.container_specific as {
    left?: UnknownRecord
    right?: UnknownRecord
    high_air_temp?: unknown
  }

  const { left, right } = containerSpecificStats

  return [
    {
      label: 'Front Pressure In',
      leftValue: left?.front_pressure_in,
      rightValue: right?.front_pressure_in,
      units: 'kPa',
      isLeftRightValue: true,
    },
    {
      label: 'Front Pressure Out',
      leftValue: left?.front_pressure_out,
      rightValue: right?.front_pressure_out,
      units: 'kPa',
      isLeftRightValue: true,
    },
    {
      label: 'Rear Pressure In',
      leftValue: left?.rear_pressure_in,
      rightValue: right?.rear_pressure_in,
      units: 'kPa',
      isLeftRightValue: true,
    },
    {
      label: 'Rear Pressure Out',
      leftValue: left?.rear_pressure_out,
      rightValue: right?.rear_pressure_out,
      units: 'kPa',
      isLeftRightValue: true,
    },
    {
      label: 'Front Freq.',
      leftValue: left?.freq_front,
      rightValue: right?.freq_front,
      units: UNITS.PERCENT,
      isLeftRightValue: true,
    },
    {
      label: 'Rear Freq.',
      leftValue: left?.freq_rear,
      rightValue: right?.freq_rear,
      units: UNITS.PERCENT,
      isLeftRightValue: true,
    },
  ]
}

type CoolingSystem = {
  oil_pump?: { cold_temp_c?: number; hot_temp_c?: number }[]
  water_pump?: { cold_temp_c?: number; hot_temp_c?: number }[]
  tank1_bar?: number
  tank2_bar?: number
}

export const getBitdeerTemperaturePressureHumidityBoxData = (
  data: UnknownRecord = {},
  containerSettings: UnknownRecord | null = null,
) => {
  const { ambient_temp_c, humidity_percent } = getStats(data as Device)
  const { tank1Enabled, tank2Enabled } = getBitdeerContainerControlsBoxData(data)
  const {
    oil_pump = [],
    water_pump = [],
    tank1_bar,
    tank2_bar,
  } = getCoolingSystem(data) as Partial<CoolingSystem>

  const [
    { cold_temp_c: cold_temp_c_1, hot_temp_c: hot_temp_c_1 } = {},
    { cold_temp_c: cold_temp_c_2, hot_temp_c: hot_temp_c_2 } = {},
  ] = oil_pump

  const [
    { cold_temp_c: cold_temp_c_w_1, hot_temp_c: hot_temp_c_w_1 } = {},
    { cold_temp_c: cold_temp_c_w_2, hot_temp_c: hot_temp_c_w_2 } = {},
  ] = water_pump

  return [
    {
      label: 'Container Temp',
      value: ambient_temp_c,
      units: UNITS.TEMPERATURE_C,
      color: getBitdeerTemperatureColor(data, ambient_temp_c as number),
    },
    {
      label: 'Humidity',
      value: humidity_percent,
      units: UNITS.HUMIDITY_PERCENT,
    },

    {
      label: 'Tank1 Oil TempH',
      value: hot_temp_c_1,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Tank1 Oil TempL',
      value: cold_temp_c_1,
      units: UNITS.TEMPERATURE_C,
      isHighlighted: true,
      color: getBitdeerOilTemperatureColor(
        tank1Enabled,
        cold_temp_c_1 as number,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Tank1 Water TempH',
      value: hot_temp_c_w_1,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Tank1 Water TempL',
      value: cold_temp_c_w_1,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Tank1 Pressure',
      value: tank1_bar,
      units: UNITS.PRESSURE_BAR,
      isHighlighted: true,
      color: getBitdeerTankPressureColor(
        tank1Enabled,
        tank1_bar as number,
        data,
        containerSettings,
      ),
    },

    {
      label: 'Tank2 Oil TempH',
      value: hot_temp_c_2,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Tank2 Oil TempL',
      value: cold_temp_c_2,
      units: UNITS.TEMPERATURE_C,
      isHighlighted: true,
      color: getBitdeerOilTemperatureColor(
        tank2Enabled,
        cold_temp_c_2 as number,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Tank2 Water TempH',
      value: hot_temp_c_w_2,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Tank2 Water TempL',
      value: cold_temp_c_w_2,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Tank2 Pressure',
      value: tank2_bar,
      units: UNITS.PRESSURE_BAR,
      isHighlighted: true,
      color: getBitdeerTankPressureColor(
        tank2Enabled,
        tank2_bar as number,
        data,
        containerSettings,
      ),
    },
  ]
}

export const getAntspaceTemperatureAndHumidityBoxData = (
  data: UnknownRecord = {},
  containerSettings: UnknownRecord | null = null,
) => {
  const { ambient_temp_c, humidity_percent, status } = getStats(data as Device)

  const containerSpecific = getContainerSpecificStats(data as Device)

  return [
    {
      label: 'Container Temp',
      value: ambient_temp_c,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Humidity',
      value: humidity_percent,
      units: UNITS.HUMIDITY_PERCENT,
    },
    {
      label: 'Supply Liquid Temp',
      value: containerSpecific?.supply_liquid_temp,
      units: UNITS.TEMPERATURE_C,
      isHighlighted: true,
      color: getAntspaceSupplyLiquidTemperatureColor(
        containerSpecific?.supply_liquid_temp as number,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Return Liquid Temp',
      value: containerSpecific?.return_liquid_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Cooling Tower Inlet Temp',
      value: containerSpecific?.cooling_tower_inlet_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Supply Liquid Set Temp',
      value: containerSpecific?.supply_liquid_set_temp,
      units: UNITS.TEMPERATURE_C,
      isHighlighted: true,
      color: getAntspaceSupplyLiquidTemperatureColor(
        containerSpecific?.supply_liquid_set_temp as number,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
  ]
}

export const getAntspaceImmersionTemperatureAndHumidityBoxData = (
  data: UnknownRecord = {},
  containerSettings: UnknownRecord | null = null,
) => {
  const { ambient_temp_c, humidity_percent, status } = getStats(data as Device)
  const containerSpecific = getContainerSpecificStats(data as Device)

  return [
    {
      label: 'Container Temp',
      value: ambient_temp_c,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Humidity',
      value: humidity_percent,
      units: UNITS.HUMIDITY_PERCENT,
    },
    {
      label: 'Pri. Liquid supply Temp',
      value: containerSpecific?.primary_supply_temp,
      isHighlighted: true,
      units: UNITS.TEMPERATURE_C,
      color: getImmersionTemperatureColor(
        containerSpecific?.primary_supply_temp as number,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Pri. Liquid return Temp',
      value: containerSpecific?.primary_return_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Sec. Liquid supply Temp1',
      value: containerSpecific?.second_supply_temp1,
      isHighlighted: true,
      units: UNITS.TEMPERATURE_C,
      color: getImmersionTemperatureColor(
        containerSpecific?.second_supply_temp1 as number,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Sec. Liquid return Temp1',
      value: containerSpecific?.second_return_temp1,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Sec. Liquid supply Temp2',
      value: containerSpecific?.second_supply_temp2,
      isHighlighted: true,
      units: UNITS.TEMPERATURE_C,
      color: getImmersionTemperatureColor(
        containerSpecific?.second_supply_temp2 as number,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Sec. Liquid return Temp2',
      value: containerSpecific?.second_return_temp2,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Supply Liquid Set Temp',
      value: containerSpecific?.supply_liquid_set_temp,
      units: UNITS.TEMPERATURE_C,
      isHighlighted: true,
      color: getImmersionTemperatureColor(
        containerSpecific?.supply_liquid_set_temp as number,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Outdoor Temp',
      value: containerSpecific?.out_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Power dist. Temp',
      value: containerSpecific?.power_distribution_temp,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Power dist. Humidity',
      value: containerSpecific?.power_distribution_humidity,
      units: UNITS.HUMIDITY_PERCENT,
    },
  ]
}

export const getMicroBTTemperatureAndHumidityBoxData = (
  data: UnknownRecord = {},
  containerSettings: UnknownRecord | null = null,
) => {
  const containerStats = getStats(data as Device)
  const { ambient_temp_c, humidity_percent } = containerStats
  const { isCoolingOn } = getContainerState({
    ...containerStats,
    type: data?.type,
  }) as unknown as { isCoolingOn: boolean }

  const { cdu } = getContainerSpecificStats(data as Device) as {
    cdu?: {
      indoor_dew_point_temperature?: number
      cooling_temp_t1?: number
      unit_inlet_temp_t2?: number
      unit_outlet_temp_t3?: number
    }
  }

  const temperatureHumidityBoxData = [
    {
      label: 'Container Temp',
      value: ambient_temp_c,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Humidity',
      value: humidity_percent,
      units: UNITS.HUMIDITY_PERCENT,
    },
    {
      label: 'Indoor Dew Point Temp',
      value: cdu?.indoor_dew_point_temperature,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Cooling Temp (T1)',
      value: cdu?.cooling_temp_t1,
      units: UNITS.TEMPERATURE_C,
    },
    {
      label: 'Unit Inlet Temp (T2)',
      value: cdu?.unit_inlet_temp_t2,
      units: UNITS.TEMPERATURE_C,
      isHighlighted: true,
      color: getMicroBtInletTempColor(
        cdu?.unit_inlet_temp_t2 as number,
        isCoolingOn,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
  ]

  if (!isMicroBTKehua(data?.type as string)) {
    temperatureHumidityBoxData.push({
      label: 'Unit Outlet Temp (T3)',
      value: cdu?.unit_outlet_temp_t3,
      units: UNITS.TEMPERATURE_C,
    })
  }
  return temperatureHumidityBoxData
}

export const getAntspacePowerBoxData = (data: UnknownRecord = {}) => {
  const { power_w, distribution_box1_power_w, distribution_box2_power_w } = getStats(data as Device)

  return [
    {
      label: 'Total Power',
      value: formatNumber(unitToKilo(power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Distribution Box1',
      value: formatNumber(unitToKilo(distribution_box1_power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Distribution Box2',
      value: formatNumber(unitToKilo(distribution_box2_power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
  ]
}

export const getAntspaceImmersionPowerBoxData = (data: UnknownRecord = {}) => {
  const { power_w, distribution_box_power_w, power_distribution_w } = getStats(data as Device)
  const containerSpecific = getContainerSpecificStats(data as Device)

  return [
    {
      label: 'Total Power',
      value: formatNumber(unitToKilo(power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Power distribution box',
      value: formatNumber(unitToKilo(power_distribution_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Total active power distr. box',
      value: formatNumber(unitToKilo(distribution_box_power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Voltage Va',
      value: containerSpecific.vol_a_distribution,
      units: 'V',
    },
    {
      label: 'Voltage Vb',
      value: containerSpecific.vol_b_distribution,
      units: 'V',
    },
    {
      label: 'Voltage Vc',
      value: containerSpecific.vol_c_distribution,
      units: 'V',
    },

    {
      label: 'Current Ia',
      value: containerSpecific.cur_a_distribution,
      units: 'A',
    },
    {
      label: 'Current Ib',
      value: containerSpecific.cur_b_distribution,
      units: 'A',
    },
    {
      label: 'Current Ic',
      value: containerSpecific.cur_c_distribution,
      units: 'A',
    },
  ]
}

export const getAntspacePressureAndFlowData = (
  data: UnknownRecord = {},
  containerSettings: UnknownRecord | null = null,
) => {
  const containerSpecific = getContainerSpecificStats(data as Device)
  const { status } = getStats(data as Device)
  const convertedSupplyLiquidPressure = Number(
    formatNumber(convertMpaToBar(containerSpecific?.supply_liquid_pressure)),
  )

  return [
    {
      label: 'Supply liquid flow',
      value: containerSpecific?.supply_liquid_flow,
      isHighlighted: true,
      units: 'm³/h',
    },
    {
      label: 'Supply liquid pressure',
      value: convertedSupplyLiquidPressure,
      isHighlighted: true,
      units: UNITS.PRESSURE_BAR,
      color: getAntspaceSupplyLiquidPressureColor(
        convertedSupplyLiquidPressure,
        status as string,
        data,
        containerSettings,
      ),
      flash: false, // No flashing on home page - colors only
    },
    {
      label: 'Return liquid pressure',
      value: formatNumber(convertMpaToBar(containerSpecific?.return_liquid_pressure)),
      units: UNITS.PRESSURE_BAR,
    },
  ]
}

export const getMicroBTPressureAndFlowData = (data: UnknownRecord = {}) => {
  const { cdu } = getContainerSpecificStats(data as Device) as {
    cdu?: {
      circulation_pump_inlet_pressure_p1?: number
      unit_inlet_pressure_p2?: number
      unit_outlet_pressure_p3?: number
      circulation_pump_outlet_pressure_p5?: number
    }
  }

  return [
    {
      label: 'Circ.. Pump Inlet Pres (P1)',
      value: formatNumber(_round(cdu?.circulation_pump_inlet_pressure_p1 as number, 2)),
      units: UNITS.PRESSURE_BAR,
    },
    {
      label: 'Unit Inlet Pressure (P2)',
      value: formatNumber(_round(cdu?.unit_inlet_pressure_p2 as number, 2)),
      units: UNITS.PRESSURE_BAR,
      isHighlighted: true,
    },
    {
      label: 'Unit Outlet Pressure (P3)',
      value: formatNumber(_round(cdu?.unit_outlet_pressure_p3 as number, 2)),
      units: UNITS.PRESSURE_BAR,
    },
    {
      label: 'Circ.. Pump Outlet Pres (P1)',
      value: formatNumber(_round(cdu?.circulation_pump_outlet_pressure_p5 as number, 2)),
      units: UNITS.PRESSURE_BAR,
    },
  ]
}

export const getUpsInformationBoxData = (data: UnknownRecord = {}) => {
  const { ups } = getContainerSpecificStats(data as Device) as {
    ups?: {
      input?: { voltage_v?: number; freq_hz?: number }
      output?: { voltage_v?: number; freq_hz?: number }
      temp_c?: number
      battery_percent?: number
    }
  }
  return [
    { label: 'Input Voltage', value: ups?.input?.voltage_v, units: 'V' },
    { label: 'Input Frequency', value: ups?.input?.freq_hz, units: 'Hz' },
    { label: 'Output voltage', value: ups?.output?.voltage_v, units: 'V' },
    { label: 'Output Frequency', value: ups?.output?.freq_hz, units: 'Hz' },
    { label: 'Temperature', value: ups?.temp_c, units: UNITS.TEMPERATURE_C },
    { label: 'Battery Status', value: ups?.battery_percent, units: '%' },
  ]
}

export const getGabbaniPowerBoxData = (data: UnknownRecord, powerType: string) => {
  const { power_meters } = getContainerSpecificStats(data as Device)
  const powerData = _get(power_meters, powerType) || {}
  const { current_w, previous_w, ultimate_w } = powerData
  return [
    { label: 'Current', ...formatPowerConsumption(current_w) },
    { label: 'Previous', ...formatPowerConsumption(previous_w) },
    { label: 'Penultimate', ...formatPowerConsumption(ultimate_w) },
  ]
}

export const getElectricPowerBoxData = (data: UnknownRecord) => {
  const { power_w } = getStats(data as Device)
  const { phase_data: { a = {}, b = {}, c = {} } = {} } = getContainerSpecificStats(
    data as Device,
  ) as {
    phase_data?: {
      a?: { power_w?: number; voltage_v?: number; current_a?: number }
      b?: { power_w?: number; voltage_v?: number; current_a?: number }
      c?: { power_w?: number; voltage_v?: number; current_a?: number }
    }
  }

  return [
    {
      label: 'Total Power',
      value: formatNumber(unitToKilo(power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Power A',
      value: formatNumber(unitToKilo(a.power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Power B',
      value: formatNumber(unitToKilo(b.power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },
    {
      label: 'Power C',
      value: formatNumber(unitToKilo(c.power_w as number), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      units: UNITS.POWER_KW,
    },

    { label: 'Voltage A', value: a.voltage_v, units: 'V' },
    { label: 'Voltage B', value: b.voltage_v, units: 'V' },
    { label: 'Voltage C', value: c.voltage_v, units: 'V' },

    { label: 'Current A', value: a.current_a, units: 'A' },
    { label: 'Current B', value: b.current_a, units: 'A' },
    { label: 'Current C', value: c.current_a, units: 'A' },
  ]
}

export const groupMinersByActivity = (connectedMiners: Device[] = []) => {
  const [onlineMiners, offlineMiners] = _partition(
    connectedMiners,
    (miner) => _get(miner, ['last', 'snap', 'stats', 'status']) !== MinerStatuses.OFFLINE,
  )

  return {
    total: connectedMiners.length,
    ..._countBy(onlineMiners, 'last.snap.config.power_mode'),
    [MinerStatuses.OFFLINE]: offlineMiners.length,
  }
}

/**
 * Get miner's temperature and humidity data
 * @param {Object} data
 * @param {Object} containerSettings
 * @returns {Object}
 */
export const getMinersTemperatureAndHumidityData = (
  data: UnknownRecord = {},
  containerSettings: UnknownRecord | null = null,
) => {
  if (isAntspaceHydro(data?.type as string)) {
    return getAntspaceTemperatureAndHumidityBoxData(data, containerSettings)
  }
  if (isMicroBT(data?.type as string)) {
    return getMicroBTTemperatureAndHumidityBoxData(data, containerSettings)
  }
  if (isAntspaceImmersion(data?.type as string)) {
    return getAntspaceImmersionTemperatureAndHumidityBoxData(data, containerSettings)
  }
  return getBitdeerTemperaturePressureHumidityBoxData(data, containerSettings)
}

export const getContainerFormatedAlerts = (
  alarmsData: Alert[],
  data: Device,
  getFormattedDate: (date: Date) => string,
) =>
  _map(alarmsData, (alert) =>
    getLogFormattedAlertData(
      {
        alert,
        id: data?.id,
        info: data?.info,
        type: data?.type,
      },
      getFormattedDate,
    ),
  )

export const getAlertTimelineItems = (formatedAlerts: LogData[], navigate: NavigateFunction) =>
  _map(formatedAlerts, (log) => ({
    item: log,
    children: <LogComponent onLogClicked={(id) => onLogClicked(navigate, id)} data={log} />,
    dot: <LogDotComponent status={log.status as string} type={LOG_TYPES.INCIDENTS} />,
  }))
