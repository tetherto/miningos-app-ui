import { isBitdeer, isMicroBT, isAntspaceHydro, isAntspaceImmersion } from './containerUtils'

interface ParameterValue {
  value?: number
}

interface Parameters {
  coolOilAlarmTemp?: ParameterValue
  coolWaterAlarmTemp?: ParameterValue
  coolOilSetTemp?: ParameterValue
  hotOilAlarmTemp?: ParameterValue
  hotWaterAlarmTemp?: ParameterValue
  exhaustFansRunTemp?: ParameterValue
  alarmPressure?: ParameterValue
  runningSpeed?: ParameterValue
  startTemp?: ParameterValue
  stopTemp?: ParameterValue
  miner1CoolingConsumptionW?: ParameterValue
  miner1MinPowerW?: ParameterValue
  miner2CoolingConsumptionW?: ParameterValue
  miner2MinPowerW?: ParameterValue
}

interface ThresholdRange {
  criticalLow?: number
  alarmLow?: number
  alert?: number
  normal?: number
  alarm?: number
  alarmHigh?: number
  criticalHigh?: number
}

interface Thresholds {
  oilTemperature?: ThresholdRange
  tankPressure?: ThresholdRange
  waterTemperature?: ThresholdRange
  supplyLiquidPressure?: ThresholdRange
}

interface ContainerData {
  type?: string
}

/**
 * Transforms container parameters data for the setContainerSettings API
 */
export const transformContainerParameters = (
  data: ContainerData,
  parameters: Parameters,
): Record<string, number | undefined> => {
  const containerType = data?.type

  if (!containerType || !parameters) {
    return {}
  }

  // Transform based on container type
  if (isBitdeer(containerType)) {
    return {
      coolOilAlarmTemp: parameters.coolOilAlarmTemp?.value,
      coolWaterAlarmTemp: parameters.coolWaterAlarmTemp?.value,
      coolOilSetTemp: parameters.coolOilSetTemp?.value,
      hotOilAlarmTemp: parameters.hotOilAlarmTemp?.value,
      hotWaterAlarmTemp: parameters.hotWaterAlarmTemp?.value,
      exhaustFansRunTemp: parameters.exhaustFansRunTemp?.value,
      alarmPressure: parameters.alarmPressure?.value,
    }
  }

  if (isMicroBT(containerType)) {
    return {
      runningSpeed: parameters.runningSpeed?.value,
      startTemp: parameters.startTemp?.value,
      stopTemp: parameters.stopTemp?.value,
    }
  }

  return {}
}

/**
 * Transforms container thresholds data for the setContainerSettings API
 * These are editable threshold values that define the boundaries for different states
 */
export const transformContainerThresholds = (
  data: ContainerData,
  thresholds: Thresholds,
): Thresholds => {
  const containerType = data?.type

  if (!containerType || !thresholds) {
    return {}
  }

  // Transform based on container type
  if (isBitdeer(containerType)) {
    return {
      oilTemperature: {
        criticalLow: thresholds.oilTemperature?.criticalLow,
        alert: thresholds.oilTemperature?.alert,
        normal: thresholds.oilTemperature?.normal,
        alarm: thresholds.oilTemperature?.alarm,
        criticalHigh: thresholds.oilTemperature?.criticalHigh,
      },
      tankPressure: {
        criticalLow: thresholds.tankPressure?.criticalLow,
        alarmLow: thresholds.tankPressure?.alarmLow,
        normal: thresholds.tankPressure?.normal,
        alarmHigh: thresholds.tankPressure?.alarmHigh,
        criticalHigh: thresholds.tankPressure?.criticalHigh,
      },
    }
  }

  if (isMicroBT(containerType)) {
    return {
      waterTemperature: {
        criticalLow: thresholds.waterTemperature?.criticalLow,
        alarmLow: thresholds.waterTemperature?.alarmLow,
        normal: thresholds.waterTemperature?.normal,
        alarmHigh: thresholds.waterTemperature?.alarmHigh,
        criticalHigh: thresholds.waterTemperature?.criticalHigh,
      },
    }
  }

  if (isAntspaceHydro(containerType)) {
    return {
      waterTemperature: {
        criticalLow: thresholds.waterTemperature?.criticalLow,
        alarmLow: thresholds.waterTemperature?.alarmLow,
        alert: thresholds.waterTemperature?.alert,
        normal: thresholds.waterTemperature?.normal,
        alarmHigh: thresholds.waterTemperature?.alarmHigh,
        criticalHigh: thresholds.waterTemperature?.criticalHigh,
      },
      supplyLiquidPressure: {
        criticalLow: thresholds.supplyLiquidPressure?.criticalLow,
        alarmLow: thresholds.supplyLiquidPressure?.alarmLow,
        normal: thresholds.supplyLiquidPressure?.normal,
        alarmHigh: thresholds.supplyLiquidPressure?.alarmHigh,
        criticalHigh: thresholds.supplyLiquidPressure?.criticalHigh,
      },
    }
  }

  if (isAntspaceImmersion(containerType)) {
    return {
      oilTemperature: {
        criticalLow: thresholds.oilTemperature?.criticalLow,
        alert: thresholds.oilTemperature?.alert,
        normal: thresholds.oilTemperature?.normal,
        alarm: thresholds.oilTemperature?.alarm,
        criticalHigh: thresholds.oilTemperature?.criticalHigh,
      },
    }
  }

  return {}
}

/**
 * Prepares the complete payload for setContainerSettings API
 */
export const prepareContainerSettingsPayload = (
  data: ContainerData,
  parameters: Parameters,
  thresholds: Thresholds,
): {
  data: { model?: string; parameters: Record<string, number | undefined>; thresholds: Thresholds }
} => ({
  data: {
    model: data?.type,
    parameters: transformContainerParameters(data, parameters),
    thresholds: transformContainerThresholds(data, thresholds),
  },
})

/**
 * Gets the default threshold structure for a container type
 * This helps initialize empty threshold forms
 */
export const getDefaultThresholdStructure = (containerType: string): Thresholds => {
  if (isBitdeer(containerType)) {
    return {
      oilTemperature: {
        criticalLow: 33,
        alert: 39,
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      },
      tankPressure: {
        criticalLow: 2,
        alarmLow: 2.3,
        normal: 2.3,
        alarmHigh: 3.5,
        criticalHigh: 4,
      },
    }
  }

  if (isMicroBT(containerType)) {
    return {
      waterTemperature: {
        criticalLow: 25,
        alarmLow: 33,
        normal: 33,
        alarmHigh: 37,
        criticalHigh: 39,
      },
    }
  }

  if (isAntspaceHydro(containerType)) {
    return {
      waterTemperature: {
        criticalLow: 21,
        alarmLow: 25,
        alert: 25,
        normal: 30,
        alarmHigh: 37,
        criticalHigh: 40,
      },
      supplyLiquidPressure: {
        criticalLow: 2,
        alarmLow: 2.3,
        normal: 2.3,
        alarmHigh: 3.5,
        criticalHigh: 4,
      },
    }
  }

  if (isAntspaceImmersion(containerType)) {
    return {
      oilTemperature: {
        criticalLow: 33,
        alert: 42,
        normal: 42,
        alarm: 46,
        criticalHigh: 48,
      },
    }
  }

  return {}
}
