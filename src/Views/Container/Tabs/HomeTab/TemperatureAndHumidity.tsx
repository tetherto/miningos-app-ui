import type { Device, UnknownRecord } from '../../../../app/utils/deviceUtils/types'
import { ContentBox } from '../../../../Components/Container/ContentBox/ContentBox'
import { GenericDataBox } from '../../../../Components/Container/ContentBox/GenericDataBox'

import { getMinersTemperatureAndHumidityData } from './HomeTab.util'

import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface TemperatureAndHumidityProps {
  data?: Device
  fallbackValue?: string
  containerSettings?: UnknownRecord | null
}

export const TemperatureAndHumidity = ({
  data,
  fallbackValue,
  containerSettings,
}: TemperatureAndHumidityProps) => (
  <ContainerPanel>
    <ContentBox title="Temperature & Humidity">
      <GenericDataBox
        fallbackValue={fallbackValue}
        data={
          getMinersTemperatureAndHumidityData(data, containerSettings) as unknown as UnknownRecord
        }
      />
    </ContentBox>
  </ContainerPanel>
)
