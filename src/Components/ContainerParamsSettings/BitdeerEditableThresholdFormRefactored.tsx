import { FC } from 'react'

import BaseThresholdForm from './BaseThresholdForm'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getContainerParametersSettings } from '@/Components/Explorer/Containers/SettingsForm/SettingsFormUtils'

interface BitdeerEditableThresholdFormRefactoredProps {
  data?: UnknownRecord
  oilTempColorFunc?: (value: number) => string
  oilTempFlashFunc?: (value: number) => boolean
  oilTempSuperflashFunc?: (value: number) => boolean
  tankPressureColorFunc?: (value: number) => string
  tankPressureFlashFunc?: (value: number) => boolean
  tankPressureSuperflashFunc?: (value: number) => boolean
}

const BitdeerEditableThresholdFormRefactored: FC<BitdeerEditableThresholdFormRefactoredProps> = ({
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
      unit: '°C',
      colorFunc: oilTempColorFunc,
      flashFunc: oilTempFlashFunc,
      superflashFunc: oilTempSuperflashFunc,
    },
    {
      type: 'tankPressure',
      title: 'Oil Pressure (bar)',
      unit: 'bar',
      colorFunc: tankPressureColorFunc,
      flashFunc: tankPressureFlashFunc,
      superflashFunc: tankPressureSuperflashFunc,
    },
  ]

  return (
    <BaseThresholdForm
      data={data}
      getContainerParametersSettings={getContainerParametersSettings}
      thresholdConfigs={thresholdConfigs}
    />
  )
}

export default BitdeerEditableThresholdFormRefactored
