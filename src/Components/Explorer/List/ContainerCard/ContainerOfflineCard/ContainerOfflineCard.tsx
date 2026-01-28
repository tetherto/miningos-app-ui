import { FC } from 'react'

import IconRow from '../../IconRow/IconRow'
import { DangerDeviceCardColText } from '../../ListView.styles'
import { MinerCol } from '../../MinerCard/MinerCol'
import ContainerStatusIndicator from '../ContainerStatusIndicator/ContainerStatusIndicator'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ContainerOfflineCardProps {
  data?: UnknownRecord
}

interface DeviceSnapData {
  stats?: {
    status?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

const ContainerOfflineCard: FC<ContainerOfflineCardProps> = ({ data }) => {
  const snapData = data?.snap as DeviceSnapData | undefined
  const status = snapData?.stats?.status as string | undefined

  return (
    <>
      <MinerCol
        dataRow1={<IconRow icon={<ContainerStatusIndicator isOffline />} text="" />}
        dataRow2={<DangerDeviceCardColText>{status || ''}</DangerDeviceCardColText>}
      />
    </>
  )
}

export default ContainerOfflineCard
