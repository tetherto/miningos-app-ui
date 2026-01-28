import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isMicroBT,
} from '../../../../app/utils/containerUtils'
import type { Device } from '../../../../app/utils/deviceUtils'
import BitdeerSettings from '../../../../Components/Explorer/Containers/Bitdeer/Settings/BitdeerSettings'
import MicroBTSettings from '../../../../Components/Explorer/Containers/MicroBT/MicroBTSettings/MicroBTSettings'

import BitMainHydroSettings from '@/Components/Explorer/Containers/BitMainHydro/BitMainHydroSettings'
import BitMainImmersionSettings from '@/Components/Explorer/Containers/BitMainImmersion/BitMainImmersionSettings'

interface SettingsTabProps {
  data?: Device
}

const SettingsTab = ({ data }: SettingsTabProps) => {
  const type = data?.type ?? ''
  if (isBitdeer(type)) {
    return <BitdeerSettings data={data} />
  }

  if (isAntspaceHydro(type)) {
    return <BitMainHydroSettings data={data} />
  }

  if (isAntspaceImmersion(type)) {
    return <BitMainImmersionSettings data={data} />
  }

  if (isMicroBT(type)) {
    return <MicroBTSettings data={data} />
  }

  return null
}

export { SettingsTab }
