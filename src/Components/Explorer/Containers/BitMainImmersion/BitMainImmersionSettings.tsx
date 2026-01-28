import { FC } from 'react'

import {
  getImmersionTemperatureColor,
  shouldImmersionTemperatureFlash,
  shouldImmersionTemperatureSuperflash,
} from './ImmersionSettings.utils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import ImmersionEditableThresholdForm from '@/Components/ContainerParamsSettings/ImmersionEditableThresholdForm'

interface BitMainImmersionSettingsProps {
  data?: UnknownRecord
}

const BitMainImmersionSettings: FC<BitMainImmersionSettingsProps> = ({ data = {} }) => (
  <ImmersionEditableThresholdForm
    data={data}
    oilTempColorFunc={(value: number) =>
      getImmersionTemperatureColor(value, data?.status as string, data)
    }
    oilTempFlashFunc={(value: number) =>
      shouldImmersionTemperatureFlash(value, data?.status as string, data)
    }
    oilTempSuperflashFunc={(value: number) =>
      shouldImmersionTemperatureSuperflash(value, data?.status as string, data)
    }
  />
)

export default BitMainImmersionSettings
