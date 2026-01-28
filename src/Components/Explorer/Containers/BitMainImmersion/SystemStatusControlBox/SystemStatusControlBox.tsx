import { FC } from 'react'

import { getContainerSpecificStats } from '../../../../../app/utils/deviceUtils'
import { CurrentStatus, StartedOption } from '../ControlBox/ControlBox.styles'

import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ContentBox } from '@/Components/Container/ContentBox/ContentBox'

interface SystemStatusControlBoxProps {
  data?: UnknownRecord
}

const SystemStatusControlBox: FC<SystemStatusControlBoxProps> = ({ data }) => {
  const containerSpecific = getContainerSpecificStats(data as Device)
  const serverOn = containerSpecific?.server_on as boolean | undefined
  const disconnect = containerSpecific?.disconnect as boolean | undefined
  return (
    <ContentBox title="System Status">
      {serverOn && <StartedOption>Allow Server Start</StartedOption>}
      {disconnect ? (
        <CurrentStatus>Disconnected</CurrentStatus>
      ) : (
        <StartedOption>Connected</StartedOption>
      )}
    </ContentBox>
  )
}

export { SystemStatusControlBox }
