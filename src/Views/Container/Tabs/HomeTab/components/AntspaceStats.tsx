import BitMainImmersionSecondaryData from '../../BitMainImmersion/BitMainImmersionSecondaryData'
import { getAntspacePressureAndFlowData, getMicroBTPressureAndFlowData } from '../HomeTab.util'

import { isAntspaceHydro, isAntspaceImmersion } from '@/app/utils/containerUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { GenericDataBox } from '@/Components/Container/ContentBox/GenericDataBox'
import BitMainCoolingSystem from '@/Components/Explorer/Containers/BitMainHydro/StatusItem/BitMainSettings/BitMainCoolingSystem/BitMainCoolingSystem'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface AntspaceStatsProps {
  data: Device
  containerSettings: UnknownRecord | undefined
}

/**
 * Antspace (Hydro/Immersion) specific statistics and monitoring panels
 */
export const AntspaceStats = ({ data, containerSettings }: AntspaceStatsProps) => {
  const isHydro = isAntspaceHydro(data?.type)
  const isImmersion = isAntspaceImmersion(data?.type)

  return (
    <>
      {isHydro && (
        <>
          <ContainerPanel>
            <ContentBox title="Pressure & Flow">
              <GenericDataBox
                data={
                  (isAntspaceHydro(data?.type)
                    ? getAntspacePressureAndFlowData(data, containerSettings)
                    : getMicroBTPressureAndFlowData(data)) as unknown as UnknownRecord
                }
              />
            </ContentBox>
          </ContainerPanel>
          <BitMainCoolingSystem data={data} />
        </>
      )}

      {isImmersion && <BitMainImmersionSecondaryData data={data} />}
    </>
  )
}
