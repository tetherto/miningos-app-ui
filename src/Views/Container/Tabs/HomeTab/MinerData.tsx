import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isBitdeer,
  isMicroBT,
} from '../../../../app/utils/containerUtils'
import type { Device } from '../../../../app/utils/deviceUtils/types'
import BitdeerOptions from '../../../../Components/Explorer/Containers/Bitdeer/Settings/ContainerOptions/BitdeerOptions'
import BitMainHome from '../../../../Components/Explorer/Containers/BitMainHydro/StatusItem/BitMainHome/BitMainHome'
import BitMainImmersionHome from '../../../../Components/Explorer/Containers/BitMainImmersion/BitMainImmersionHome/BitMainImmersionHome'
import MicroBTHome from '../../../../Components/Explorer/Containers/MicroBT/MicroBTHome/MicroBTHome'

interface MinerDataProps {
  data?: Device
}

export const MinerData = ({ data }: MinerDataProps) => {
  if (!data?.type) {
    return null
  }

  if (isAntspaceHydro(data.type)) {
    return <BitMainHome data={data} />
  }
  if (isAntspaceImmersion(data.type)) {
    return <BitMainImmersionHome data={data} />
  }
  if (isMicroBT(data.type)) {
    return <MicroBTHome data={data} />
  }
  if (isBitdeer(data.type)) {
    return <BitdeerOptions data={data} />
  }

  return null
}
