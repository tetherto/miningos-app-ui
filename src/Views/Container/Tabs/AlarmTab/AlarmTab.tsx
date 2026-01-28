import _map from 'lodash/map'
import { useEffect, useState } from 'react'

import type {
  AlarmItem,
  ContainerSpecificStats,
  MicroBTContainerStats,
} from '../../../../app/utils/containerUtils'
import {
  isAntspaceHydro,
  isAntspaceImmersion,
  isMicroBT,
} from '../../../../app/utils/containerUtils'
import {
  getAntspaceAlarms,
  getAntspaceImmersionAlarms,
  getMicroBTAlarms,
} from '../../../../app/utils/containerUtils/containerAlarms'
import type { Device } from '../../../../app/utils/deviceUtils'
import { getDeviceData } from '../../../../app/utils/deviceUtils'
import { ContentBox } from '../../../../Components/Container/ContentBox/ContentBox'
import { StatusItem } from '../../../../Components/Explorer/Containers/BitMainHydro/StatusItem/StatusItem'

import { AlarmTabContainer } from './AlarmTab.styles'

interface AlarmTabProps {
  data?: Device
}

const AlarmTab = ({ data }: AlarmTabProps) => {
  const [alarmsData, setAlarmsData] = useState<AlarmItem[]>([])

  useEffect(() => {
    const [, deviceData] = getDeviceData(data)

    const containerSpecificStats = deviceData?.snap?.stats?.container_specific
    const deviceType = deviceData?.type ?? ''

    if (isAntspaceHydro(deviceType)) {
      setAlarmsData(getAntspaceAlarms(containerSpecificStats as ContainerSpecificStats))
    }
    if (isAntspaceImmersion(deviceType)) {
      setAlarmsData(getAntspaceImmersionAlarms(containerSpecificStats as ContainerSpecificStats))
    }
    if (isMicroBT(deviceType)) {
      setAlarmsData(getMicroBTAlarms(containerSpecificStats as MicroBTContainerStats))
    }
  }, [data])

  return (
    <ContentBox title="Display">
      <AlarmTabContainer>
        {_map(alarmsData, (alarm) => (
          <StatusItem
            label={alarm.label}
            key={alarm.id}
            status={alarm.status as 'normal' | 'warning' | 'fault' | 'unavailable'}
          />
        ))}
      </AlarmTabContainer>
    </ContentBox>
  )
}

export { AlarmTab }
