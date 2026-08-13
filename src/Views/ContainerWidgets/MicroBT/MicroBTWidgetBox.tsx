import { FC } from 'react'

import { MicroBTWidgetBoxRoot } from './MicroBTWidgetBox.styles'

import { Device, getContainerSpecificStats } from '@/app/utils/deviceUtils'
import { CONTAINER_STATUS, DEVICE_STATUS } from '@/app/utils/statusUtils'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'

interface MicroBTWidgetBoxProps {
  data: Device
}

export const MicroBTWidgetBox: FC<MicroBTWidgetBoxProps> = ({ data }) => {
  const { cdu } = getContainerSpecificStats(data) as {
    cdu: {
      circulation_pump_running_status: string
      cooling_fan_control: boolean
    }
  }

  return (
    <MicroBTWidgetBoxRoot>
      <DeviceStatus
        title="Cicle Pump"
        status={
          cdu?.circulation_pump_running_status === CONTAINER_STATUS.RUNNING
            ? DEVICE_STATUS.RUNNING
            : DEVICE_STATUS.OFF
        }
        isRow
        secondary
      />
      <DeviceStatus
        title="Cooling Fan"
        status={cdu?.cooling_fan_control ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.ERROR}
        isRow
        secondary
      />
    </MicroBTWidgetBoxRoot>
  )
}
