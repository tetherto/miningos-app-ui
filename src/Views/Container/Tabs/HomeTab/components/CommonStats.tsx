import { AlarmContents } from '../AlarmContents'
import { TemperatureAndHumidity } from '../TemperatureAndHumidity'

import { isMicroBT } from '@/app/utils/containerUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'
import { GenericDataBox } from '@/Components/Container/ContentBox/GenericDataBox'
import { ContainerPanel } from '@/Components/Explorer/Containers/Container.styles'

interface CommonStatsProps {
  data: Device
  containerSettings: UnknownRecord | undefined
  alarmsDataItems: Array<{
    item: unknown
  }>
  getPowerBoxData: (data: UnknownRecord) => UnknownRecord
}

/**
 * Common statistics panels shared across multiple container types
 */
export const CommonStats = ({
  data,
  containerSettings,
  alarmsDataItems,
  getPowerBoxData,
}: CommonStatsProps) => {
  const showTemperatureAndHumidity = true
  const showAlarms = true
  const showElectricPower = !isMicroBT(data?.type)

  return (
    <>
      {showTemperatureAndHumidity && (
        <TemperatureAndHumidity
          fallbackValue="-"
          data={data}
          containerSettings={containerSettings}
        />
      )}

      {showAlarms && (
        <ContainerPanel>
          <ContentBox title="Alarm & Event">
            <AlarmContents alarmsData={alarmsDataItems} />
          </ContentBox>
        </ContainerPanel>
      )}

      {showElectricPower && (
        <ContainerPanel>
          <ContentBox title="Electric Power">
            <GenericDataBox data={getPowerBoxData(data) as unknown as UnknownRecord} />
          </ContentBox>
        </ContainerPanel>
      )}
    </>
  )
}
