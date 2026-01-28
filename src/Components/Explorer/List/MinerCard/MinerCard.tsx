import Checkbox from 'antd/es/checkbox'
import Col from 'antd/es/col'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import {
  selectSelectedContainers,
  selectSelectedDeviceTags,
} from '../../../../app/slices/devicesSlice'
import { getContainerName } from '../../../../app/utils/containerUtils'
import { getDeviceData, getMinerName, isMinerOffline } from '../../../../app/utils/deviceUtils'
import ErrorCard from '../ErrorCard/ErrorCard'
import { DeviceCardColText, WarningDeviceCardColText } from '../ListView.styles'

import { MinerDeviceCardContainer } from './MinerCard.styles'
import { MinerCol } from './MinerCol'
import { MinerOfflineCard } from './MinerOfflineCard'
import { MinerOnlineCard } from './MinerOnlineCard'

import type { Alert } from '@/app/utils/alertUtils'
import type { Device, DeviceData } from '@/app/utils/deviceUtils/types'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

interface MinerCardProps {
  onSelectToggle: (event: { target: { checked: boolean } }, device: unknown) => void
  isSelected: (
    selectedDevicesTags: unknown,
    selectedContainers: unknown,
    device: unknown,
  ) => boolean
  device: unknown
  isHighlighted: boolean
}

const MinerCard = memo(({ onSelectToggle, isSelected, device, isHighlighted }: MinerCardProps) => {
  const [error, data] = getDeviceData(device as Device | null | undefined)
  const selectedDevicesTags = useSelector(selectSelectedDeviceTags)
  const selectedContainers = useSelector(selectSelectedContainers)
  if (error || !data) {
    return <ErrorCard error={error || 'Device data not available'} />
  }
  const deviceData = data as DeviceData
  const { snap, id, rack, type, address, info, err, alerts: rawAlerts } = deviceData
  const alerts = (rawAlerts as Alert[] | undefined) || []
  if (!snap) {
    return <ErrorCard error="Device snap data not available" />
  }
  const { stats, config } = snap
  const name = `${getContainerName(info?.container, type)}  ${info?.pos && '-' + info?.pos}`
  const isOffline = !!err || isMinerOffline(deviceData as Device)

  const onMinerCardClick = () => {
    // Prevent selection if miner is offline
    if (isOffline) {
      return
    }
    onSelectToggle(
      {
        target: {
          checked: !isSelected(selectedDevicesTags, selectedContainers, device),
        },
      },
      device,
    )
  }

  return (
    <MinerDeviceCardContainer
      gutter={[12, 12]}
      onClick={onMinerCardClick}
      isHighlighted={isHighlighted}
    >
      <Col lg={1} md={1} xs={2} sm={1}>
        <Checkbox
          checked={isSelected(selectedDevicesTags, selectedContainers, device)}
          disabled={isOffline}
        />
      </Col>
      <MinerCol
        lg={5}
        md={4}
        sm={7}
        xs={10}
        dataRow1={<DeviceCardColText>{getMinerName(type || '')}</DeviceCardColText>}
        dataRow2={
          info?.container === MAINTENANCE_CONTAINER ? (
            <WarningDeviceCardColText>Maintenance</WarningDeviceCardColText>
          ) : (
            <DeviceCardColText>{name}</DeviceCardColText>
          )
        }
      />
      {err || isMinerOffline(device as Device) ? (
        <MinerOfflineCard id={id || ''} rack={rack} stats={stats} err={err} />
      ) : (
        <MinerOnlineCard
          alerts={alerts}
          config={config}
          info={info}
          stats={stats}
          rack={rack}
          address={address}
        />
      )}
    </MinerDeviceCardContainer>
  )
})

MinerCard.displayName = 'MinerCard'

export default MinerCard
