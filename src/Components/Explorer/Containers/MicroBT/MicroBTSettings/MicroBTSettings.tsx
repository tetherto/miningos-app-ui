import {
  getMicroBtInletTempColor,
  shouldMicroBtTemperatuerSuperflash,
  shouldMicroBtTemperatureFlash,
} from './MicorBTSettingsUtils'

import { ContainerParamsSettings } from '@/Components/ContainerParamsSettings'
import MicroBTEditableThresholdForm from '@/Components/ContainerParamsSettings/MicroBTEditableThresholdForm'

const MicroBTSettings = ({ data = {} }) => (
  <>
    <ContainerParamsSettings data={data} />
    <br />
    <MicroBTEditableThresholdForm
      data={data}
      waterTempColorFunc={(value: number) => getMicroBtInletTempColor(value, true, data)}
      waterTempFlashFunc={(value: number) => shouldMicroBtTemperatureFlash(value, true, data)}
      waterTempSuperflashFunc={(value: number) =>
        shouldMicroBtTemperatuerSuperflash(value, true, data)
      }
    />
  </>
)

export default MicroBTSettings
