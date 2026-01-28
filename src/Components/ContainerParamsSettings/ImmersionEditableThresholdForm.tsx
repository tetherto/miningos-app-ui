import { FC } from 'react'

import BaseThresholdForm from './BaseThresholdForm'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { UNITS } from '@/constants/units'

interface ImmersionEditableThresholdFormProps {
  data?: UnknownRecord
  oilTempColorFunc?: (value: number) => string
  oilTempFlashFunc?: (value: number) => boolean
  oilTempSuperflashFunc?: (value: number) => boolean
}

const ImmersionEditableThresholdForm: FC<ImmersionEditableThresholdFormProps> = ({
  data = {},
  oilTempColorFunc,
  oilTempFlashFunc,
  oilTempSuperflashFunc,
}) => {
  // Define the threshold configuration for oil temperature
  const thresholdConfigs = [
    {
      type: 'oilTemperature',
      title: 'Oil Temperature (°C)',
      unit: UNITS.TEMPERATURE_C,
      colorFunc: oilTempColorFunc,
      flashFunc: oilTempFlashFunc,
      superflashFunc: oilTempSuperflashFunc,
    },
  ]

  return <BaseThresholdForm data={data} thresholdConfigs={thresholdConfigs} />
}

export default ImmersionEditableThresholdForm
