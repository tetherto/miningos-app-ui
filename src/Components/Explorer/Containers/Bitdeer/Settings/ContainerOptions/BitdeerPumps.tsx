import _isBoolean from 'lodash/isBoolean'
import { FC } from 'react'

import { getBitdeerCoolingSystemData } from '../BitdeerSettings.utils'

import { BitdeerPumpsContainer, SystemStatusContainer } from './BitdeerOptions.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { DEVICE_STATUS } from '@/app/utils/statusUtils'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'

interface BitdeerPumpsProps {
  data?: UnknownRecord
}

const BitdeerPumps: FC<BitdeerPumpsProps> = ({ data }) => {
  const { exhaustFanEnabled } = getBitdeerCoolingSystemData(data ?? {})

  return (
    <BitdeerPumpsContainer>
      {_isBoolean(exhaustFanEnabled) && (
        <SystemStatusContainer>
          <DeviceStatus
            status={exhaustFanEnabled ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
            title={'Exhaust Fan'}
          />
        </SystemStatusContainer>
      )}
    </BitdeerPumpsContainer>
  )
}

export default BitdeerPumps
