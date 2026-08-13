import { FC } from 'react'

import BaseThresholdForm from './BaseThresholdForm'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { UNITS } from '@/constants/units'

interface MicroBTEditableThresholdFormProps {
  data?: UnknownRecord
  waterTempColorFunc?: (value: number) => string
  waterTempFlashFunc?: (value: number) => boolean
  waterTempSuperflashFunc?: (value: number) => boolean
}

const MicroBTEditableThresholdForm: FC<MicroBTEditableThresholdFormProps> = ({
  data = {},
  waterTempColorFunc,
  waterTempFlashFunc,
  waterTempSuperflashFunc,
}) => {
  // Define the threshold configuration for water temperature
  const thresholdConfigs = [
    {
      type: 'waterTemperature',
      title: 'Water Temperature (°C)',
      unit: UNITS.TEMPERATURE_C,
      colorFunc: waterTempColorFunc,
      flashFunc: waterTempFlashFunc,
      superflashFunc: waterTempSuperflashFunc,
    },
  ]

  return <BaseThresholdForm data={data} thresholdConfigs={thresholdConfigs} />
}

export default MicroBTEditableThresholdForm
