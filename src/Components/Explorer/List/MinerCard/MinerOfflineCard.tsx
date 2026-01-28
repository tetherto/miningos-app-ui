import { type FC } from 'react'

import IconRow from '../IconRow/IconRow'
import { ERROR_MESSAGES } from '../ListView.const'
import { DangerDeviceCardColText, DeviceCardColText } from '../ListView.styles'
import MinerStatusIndicator from '../MinerStatusIndicator/MinerStatusIndicator'

import { MinerCol } from './MinerCol'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MinerOfflineCardProps {
  id?: string
  rack?: string
  stats?: UnknownRecord
  err?: string
}

export const MinerOfflineCard: FC<MinerOfflineCardProps> = ({ stats, err }) => {
  const error = (err && ERROR_MESSAGES[err as keyof typeof ERROR_MESSAGES]) || err || ''

  return (
    <>
      <MinerCol
        sm={24}
        md={12}
        lg={12}
        dataRow2={<DangerDeviceCardColText>{error}</DangerDeviceCardColText>}
      />
      <MinerCol
        sm={8}
        md={4}
        lg={4}
        dataRow1={
          <IconRow
            icon={<MinerStatusIndicator stats={stats} />}
            text={<DeviceCardColText>{stats?.status as string}</DeviceCardColText>}
          />
        }
      />
    </>
  )
}
