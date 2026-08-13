import { FC } from 'react'

import BaseThresholdForm from './BaseThresholdForm'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { UNITS } from '@/constants/units'

interface HydroEditableThresholdFormProps {
  data?: UnknownRecord
  waterTempColorFunc?: (value: number) => string
  waterTempFlashFunc?: (value: number) => boolean
  waterTempSuperflashFunc?: (value: number) => boolean
  pressureColorFunc?: (value: number) => string
  pressureFlashFunc?: (value: number) => boolean
  pressureSuperflashFunc?: (value: number) => boolean
}

const HydroEditableThresholdForm: FC<HydroEditableThresholdFormProps> = ({
  data = {},
  waterTempColorFunc,
  waterTempFlashFunc,
  waterTempSuperflashFunc,
  pressureColorFunc,
  pressureFlashFunc,
  pressureSuperflashFunc,
}) => {
  // Define the threshold configuration for both water temperature and supply liquid pressure
  const thresholdConfigs = [
    {
      type: 'waterTemperature',
      title: 'Water Temperature (°C)',
      unit: UNITS.TEMPERATURE_C,
      colorFunc: waterTempColorFunc,
      flashFunc: waterTempFlashFunc,
      superflashFunc: waterTempSuperflashFunc,
    },
    {
      type: 'supplyLiquidPressure',
      title: 'Supply Liquid Pressure (bar)',
      unit: UNITS.PRESSURE_BAR,
      colorFunc: pressureColorFunc,
      flashFunc: pressureFlashFunc,
      superflashFunc: pressureSuperflashFunc,
    },
  ]

  return <BaseThresholdForm data={data} thresholdConfigs={thresholdConfigs} />
}

export default HydroEditableThresholdForm
