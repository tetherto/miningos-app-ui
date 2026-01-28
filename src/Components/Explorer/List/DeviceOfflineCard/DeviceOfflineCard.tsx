import Col from 'antd/es/col'
import { FC } from 'react'

import { DangerDeviceCardColText } from '../ListView.styles'

import { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface DeviceOfflineCardProps {
  data: UnknownRecord
  field: string
}

interface DeviceSnapData {
  stats?: UnknownRecord
  [key: string]: unknown
}

export const DeviceOfflineCard: FC<DeviceOfflineCardProps> = ({ data, field }) => {
  const err = data?.err as string | undefined
  const snapData = data?.snap as DeviceSnapData | undefined
  const stats = snapData?.stats
  const fieldValue = stats?.[field]

  return (
    <>
      <Col span={12}>
        <DangerDeviceCardColText>
          {err || (fieldValue !== undefined ? String(fieldValue) : '')}
        </DangerDeviceCardColText>
      </Col>
    </>
  )
}
