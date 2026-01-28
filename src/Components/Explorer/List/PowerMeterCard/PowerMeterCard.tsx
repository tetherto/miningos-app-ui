import Col from 'antd/es/col'

import { getDeviceData } from '../../../../app/utils/deviceUtils'
import { DeviceOfflineCard } from '../DeviceOfflineCard/DeviceOfflineCard'
import ErrorCard from '../ErrorCard/ErrorCard'
import { DeviceCardColText } from '../ListView.styles'
import { MinerCardContainer } from '../MinerCard/MinerCard.styles'
import { MinerCol } from '../MinerCard/MinerCol'

import type { Device } from '@/app/utils/deviceUtils/types'

interface PowerMeterCardProps {
  device: Device | null | undefined
  isHighlighted: boolean
}

const PowerMeterCard = ({ device, isHighlighted }: PowerMeterCardProps) => {
  const [error, data] = getDeviceData(device)

  if (error) {
    return <ErrorCard error={error} />
  }

  // DeviceSnap doesn't have success property, check err instead
  const isOffline = !!data?.err

  return (
    <MinerCardContainer isHighlighted={isHighlighted}>
      <Col span={1}></Col>
      <MinerCol
        dataRow1={<DeviceCardColText>{data?.type}</DeviceCardColText>}
        dataRow2={<DeviceCardColText>{data?.info?.container}</DeviceCardColText>}
      />
      {isOffline && (
        <DeviceOfflineCard data={data as unknown as Record<string, unknown>} field="status" />
      )}
    </MinerCardContainer>
  )
}

export default PowerMeterCard
