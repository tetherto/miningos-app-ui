import _isBoolean from 'lodash/isBoolean'
import { FC } from 'react'

import { DEVICE_STATUS } from '../../../../../../../app/utils/statusUtils'
import { DeviceStatus } from '../../../../../../DeviceStatus/DeviceStatus'
import { SystemStatusContainer } from '../BitdeerOptions.styles'

interface WaterPumpItem {
  enabled?: boolean
  index: number
}

interface WaterPumpsProps {
  waterPumpItem?: WaterPumpItem
}

const WaterPumps: FC<WaterPumpsProps> = ({ waterPumpItem }) => (
  <>
    <SystemStatusContainer>
      {waterPumpItem && _isBoolean(waterPumpItem.enabled) && (
        <DeviceStatus
          status={waterPumpItem.enabled ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
          title={`Water Pump ${waterPumpItem.index + 1}`}
        />
      )}
    </SystemStatusContainer>
  </>
)

export default WaterPumps
