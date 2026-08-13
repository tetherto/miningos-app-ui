import type { Device } from '../../../../app/utils/deviceUtils'
import { getContainerSpecificStats } from '../../../../app/utils/deviceUtils'

export const getPowerMeterBoxData = (data: Device) => getContainerSpecificStats(data)?.power_meters

export const MicroBTStatusLabels = {
  normal: 'Normal',
  alarm: 'Alarm',
  unavailable: 'Unavailable',
} as const

export const getStatusLabelFromValue = (value: number | undefined) => {
  if (value === 0) {
    return MicroBTStatusLabels.normal
  }

  if (value === 1) {
    return MicroBTStatusLabels.alarm
  }

  return MicroBTStatusLabels.unavailable
}

export const getFireStatusBoxData = (data: Device) => {
  const env = getContainerSpecificStats(data)?.env as Record<string, unknown> | undefined
  const {
    smoke_detector: smokeDetectorStatus,
    water_ingress_detector: waterIngressStatus,
    cooling_fan_status: coolingFanStatus,
  } = env || {}
  return {
    smokeDetector: getStatusLabelFromValue(smokeDetectorStatus as number | undefined),
    waterIngressDetector: getStatusLabelFromValue(waterIngressStatus as number | undefined),
    coolingFanStatus: getStatusLabelFromValue(coolingFanStatus as number | undefined),
  }
}
