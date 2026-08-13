import _isBoolean from 'lodash/isBoolean'
import { FC } from 'react'

import { DEVICE_STATUS } from '../../../../../../../app/utils/statusUtils'
import { DeviceStatus } from '../../../../../../DeviceStatus/DeviceStatus'
import { SystemStatusContainer } from '../BitdeerOptions.styles'

interface OilPumpsProps {
  oilPumpItem?: unknown
}

const OilPumps: FC<OilPumpsProps> = ({ oilPumpItem }) => {
  const pumpTyped = oilPumpItem as { enabled: boolean; index: number }
  return (
    <>
      <SystemStatusContainer>
        {_isBoolean(pumpTyped.enabled) && (
          <DeviceStatus
            status={pumpTyped.enabled ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
            title={`Oil Pump ${pumpTyped.index + 1}`}
          />
        )}
      </SystemStatusContainer>
    </>
  )
}

export default OilPumps
