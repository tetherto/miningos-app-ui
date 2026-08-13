import _find from 'lodash/find'

import { isBitdeer, isMicroBT } from '@/app/utils/containerUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getBitdeerParameterSettingsData } from '@/Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings.utils'
import { getMicroBTThresholdSettingsData } from '@/Components/Explorer/Containers/MicroBT/MicroBTSettings/MicorBTSettingsUtils'

interface ParameterSetting {
  name: string
  value?: number | string
  suffix?: string
  type?: string
}

interface AlarmsData {
  oil_temp?: { low_c?: number; high_c?: number }
  water_temp?: { low_c?: number; high_c?: number }
  pressure_bar?: number
}

interface SetTempsData {
  cold_oil_temp_c?: number
  exhaust_fan_temp_c?: number
}

export const getBitdeerParametersSettings = (
  data: UnknownRecord,
): Record<string, ParameterSetting> => {
  const { alarms, set_temps } = getBitdeerParameterSettingsData(data)
  const alarmsTyped = alarms as AlarmsData
  const setTempsTyped = set_temps as SetTempsData

  return {
    coolOilAlarmTemp: {
      name: 'Cool Oil Alarm Temp',
      value: alarmsTyped?.oil_temp?.low_c,
      suffix: '°C',
      type: 'number',
    },
    coolWaterAlarmTemp: {
      name: 'Cool Water Alarm Temp',
      value: alarmsTyped?.water_temp?.low_c,
      suffix: '°C',
      type: 'number',
    },
    coolOilSetTemp: {
      name: 'Cool Oil Setting Temp',
      value: setTempsTyped?.cold_oil_temp_c,
      suffix: '°C',
      type: 'number',
    },
    hotOilAlarmTemp: {
      name: 'Hot Oil Alarm Temp',
      value: alarmsTyped?.oil_temp?.high_c,
      suffix: '°C',
      type: 'number',
    },
    hotWaterAlarmTemp: {
      name: 'Hot Water Alarm Temp',
      value: alarmsTyped?.water_temp?.high_c,
      suffix: '°C',
      type: 'number',
    },
    exhaustFansRunTemp: {
      name: 'Exhaust Fans Run Temp',
      value: setTempsTyped?.exhaust_fan_temp_c,
      suffix: '°C',
      type: 'number',
    },
    alarmPressure: {
      name: 'Alarm Pressure',
      value: alarmsTyped?.pressure_bar,
      suffix: 'bar',
      type: 'number',
    },
  }
}

export const getMicroBTParametersSettings = (
  data: UnknownRecord,
): Record<string, ParameterSetting> => {
  const thresholdsData = getMicroBTThresholdSettingsData(data)

  return {
    runningSpeed: {
      name: 'Running Speed',
      value: thresholdsData?.coolingFanRunningSpeedThreshold as number | string | undefined,
      suffix: 'RPM',
      type: 'number',
    },
    startTemp: {
      name: 'Start Temp',
      value: thresholdsData?.coolingFanStartTemperatureThreshold as number | string | undefined,
      suffix: '°C',
      type: 'number',
    },
    stopTemp: {
      name: 'Stop Temp',
      value: thresholdsData?.coolingFanStopTemperatureThreshold as number | string | undefined,
      suffix: '°C',
      type: 'number',
    },
  }
}

const CONTAINER_PARAMS_GETTERS = [
  {
    isType: isBitdeer,
    getParams: getBitdeerParametersSettings,
  },
  {
    isType: isMicroBT,
    getParams: getMicroBTParametersSettings,
  },
]

export const getContainerParametersSettings = (
  data: UnknownRecord,
): Record<string, ParameterSetting> | undefined => {
  const containerType = data?.type as string | undefined

  if (!containerType) {
    return undefined
  }

  interface ParamsGetter {
    isType: (type: string) => boolean
    getParams: (data: UnknownRecord) => Record<string, ParameterSetting>
  }

  const matched = _find(CONTAINER_PARAMS_GETTERS, (item: unknown) =>
    (item as ParamsGetter).isType(containerType),
  )

  if (!matched) {
    return undefined
  }

  return (matched as ParamsGetter).getParams(data)
}
