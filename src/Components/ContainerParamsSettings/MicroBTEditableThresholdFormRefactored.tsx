import { FC } from 'react'

import BaseThresholdForm from './BaseThresholdForm'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { getContainerParametersSettings } from '@/Components/Explorer/Containers/SettingsForm/SettingsFormUtils'

interface MicroBTEditableThresholdFormRefactoredProps {
  data?: UnknownRecord
  waterTempColorFunc?: (value: number) => string
  waterTempFlashFunc?: (value: number) => boolean
  waterTempSuperflashFunc?: (value: number) => boolean
}

const MicroBTEditableThresholdFormRefactored: FC<MicroBTEditableThresholdFormRefactoredProps> = ({
  data = {},
  waterTempColorFunc,
  waterTempFlashFunc,
  waterTempSuperflashFunc,
}) => {
  // Define the threshold configuration
  const thresholdConfigs = [
    {
      type: 'waterTemperature',
      title: 'Water Temperature (°C)',
      unit: '°C',
      colorFunc: waterTempColorFunc,
      flashFunc: waterTempFlashFunc,
      superflashFunc: waterTempSuperflashFunc,
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

export default MicroBTEditableThresholdFormRefactored
