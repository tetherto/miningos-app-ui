import { getUpsInformationBoxData } from '../HomeTab.util'

import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { GenericDataBox } from '@/Components/Container/ContentBox/GenericDataBox'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface BitdeerStatsProps {
  data: Device
}

/**
 * Bitdeer-specific statistics panels
 */
export const BitdeerStats = ({ data }: BitdeerStatsProps) => (
  <ContainerPanel>
    <ContentBox title="UPS Information">
      <GenericDataBox
        fallbackValue="-"
        data={getUpsInformationBoxData(data) as unknown as UnknownRecord}
      />
    </ContentBox>
  </ContainerPanel>
)
