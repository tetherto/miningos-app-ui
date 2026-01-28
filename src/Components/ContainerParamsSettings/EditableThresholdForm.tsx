import { FC } from 'react'

import BaseThresholdForm from './BaseThresholdForm'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { UNITS } from '@/constants/units'

interface EditableThresholdFormProps {
  data?: UnknownRecord
  oilTempColorFunc?: (value: number) => string
  oilTempFlashFunc?: (value: number) => boolean
  oilTempSuperflashFunc?: (value: number) => boolean
  tankPressureColorFunc?: (value: number) => string
  tankPressureFlashFunc?: (value: number) => boolean
  tankPressureSuperflashFunc?: (value: number) => boolean
}

const EditableThresholdForm: FC<EditableThresholdFormProps> = ({
  data = {},
  oilTempColorFunc,
  oilTempFlashFunc,
  oilTempSuperflashFunc,
  tankPressureColorFunc,
  tankPressureFlashFunc,
  tankPressureSuperflashFunc,
}) => {
  // Define the threshold configuration for both oil temperature and tank pressure
  const thresholdConfigs = [
    {
      type: 'oilTemperature',
      title: 'Oil Temperature (°C)',
      unit: UNITS.TEMPERATURE_C,
      colorFunc: oilTempColorFunc,
      flashFunc: oilTempFlashFunc,
      superflashFunc: oilTempSuperflashFunc,
    },
    {
      type: 'tankPressure',
      title: 'Oil Pressure (bar)',
      unit: UNITS.PRESSURE_BAR,
      colorFunc: tankPressureColorFunc,
      flashFunc: tankPressureFlashFunc,
      superflashFunc: tankPressureSuperflashFunc,
    },
  ]

  return <BaseThresholdForm data={data} thresholdConfigs={thresholdConfigs} />
}

export default EditableThresholdForm
