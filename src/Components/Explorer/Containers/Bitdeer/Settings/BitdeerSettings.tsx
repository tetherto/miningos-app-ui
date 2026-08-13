import { FC } from 'react'

import {
  getBitdeerOilTemperatureColor,
  shouldBitdeerOilTemperatureFlash,
  shouldBitdeerOilTemperatureSuperflash,
  getBitdeerTankPressureColor,
  shouldBitdeerTankPressureFlash,
  shouldBitdeerTankPressureSuperflash,
} from './BitdeerSettings.utils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContainerParamsSettings } from '@/Components/ContainerParamsSettings'
import EditableThresholdForm from '@/Components/ContainerParamsSettings/EditableThresholdForm'

interface BitdeerSettingsProps {
  data?: UnknownRecord
}

const BitdeerSettings: FC<BitdeerSettingsProps> = ({ data = {} }) => (
  <>
    <ContainerParamsSettings data={data} />
    <br />
    <EditableThresholdForm
      data={data}
      oilTempColorFunc={(value: number) => getBitdeerOilTemperatureColor(true, value, data)}
      oilTempFlashFunc={(value: number) =>
        shouldBitdeerOilTemperatureFlash(true, value, data?.status as string, data)
      }
      oilTempSuperflashFunc={(value: number) =>
        shouldBitdeerOilTemperatureSuperflash(true, value, data?.status as string, data)
      }
      tankPressureColorFunc={(value: number) => getBitdeerTankPressureColor(true, value, data)}
      tankPressureFlashFunc={(value: number) =>
        shouldBitdeerTankPressureFlash(true, value, data?.status as string, data)
      }
      tankPressureSuperflashFunc={(value: number) =>
        shouldBitdeerTankPressureSuperflash(true, value, data?.status as string, data)
      }
    />
  </>
)

export default BitdeerSettings
