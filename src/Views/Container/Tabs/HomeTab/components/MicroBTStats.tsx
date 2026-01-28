import { getFireStatusBoxData } from '../../ParametersTab/ParametersTab.util'
import { getAntspacePressureAndFlowData, getMicroBTPressureAndFlowData } from '../HomeTab.util'

import { isAntspaceHydro } from '@/app/utils/containerUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { GenericDataBox } from '@/Components/Container/ContentBox/GenericDataBox'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'
import { FireStatusBox } from '@/Components/Explorer/Containers/MicroBT/FireStatusBox/FireStatusBox'
import PowerMeters from '@/Components/Explorer/Containers/MicroBT/PowerMeters/PowerMeters'

interface MicroBTStatsProps {
  data: Device
  containerSettings: UnknownRecord | undefined
}

/**
 * MicroBT-specific statistics and monitoring panels
 */
export const MicroBTStats = ({ data, containerSettings }: MicroBTStatsProps) => (
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

    <PowerMeters data={data} />

    <ContainerPanel>
      <ContentBox title="Fire status">
        <FireStatusBox data={getFireStatusBoxData(data)} />
      </ContentBox>
    </ContainerPanel>
  </>
)
