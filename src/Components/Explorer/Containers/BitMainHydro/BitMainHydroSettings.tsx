import { FC } from 'react'

import {
  getAntspaceSupplyLiquidPressureColor,
  getAntspaceSupplyLiquidTemperatureColor,
  shouldAntspacePressureFlash,
  shouldAntspacePressureSuperflash,
  shouldAntspaceSupplyLiquidTempFlash,
  shouldAntspaceSupplyLiquidTempSuperflash,
} from './HydroSettings.utils'
import { BitMainBasicSettings } from './StatusItem/BitMainSettings/BitMainBasicSettings'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import HydroEditableThresholdForm from '@/Components/ContainerParamsSettings/HydroEditableThresholdForm'

interface BitMainHydroSettingsProps {
  data?: UnknownRecord
}

const BitMainHydroSettings: FC<BitMainHydroSettingsProps> = ({ data = {} }) => (
  <>
    <BitMainBasicSettings data={data} />
    <br />
    <HydroEditableThresholdForm
      data={data}
      waterTempColorFunc={(value: number) =>
        getAntspaceSupplyLiquidTemperatureColor(value, data?.status as string, data)
      }
      waterTempFlashFunc={(value: number) =>
        shouldAntspaceSupplyLiquidTempFlash(value, data?.status as string, data)
      }
      waterTempSuperflashFunc={(value: number) =>
        shouldAntspaceSupplyLiquidTempSuperflash(value, data?.status as string, data)
      }
      pressureColorFunc={(value: number) =>
        getAntspaceSupplyLiquidPressureColor(value, data?.status as string, data)
      }
      pressureFlashFunc={(value: number) =>
        shouldAntspacePressureFlash(value, data?.status as string, data)
      }
      pressureSuperflashFunc={(value: number) =>
        shouldAntspacePressureSuperflash(value, data?.status as string, data)
      }
    />
  </>
)

export default BitMainHydroSettings
