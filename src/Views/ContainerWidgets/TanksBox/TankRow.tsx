import Tooltip from 'antd/es/tooltip'
import _isNil from 'lodash/isNil'
import { FC } from 'react'

import {
  TankParam,
  TankParamLabel,
  TankParams,
  TankParamValue,
  TankPumpStatuses,
  TankRowRoot,
} from './TankRow.styles'

import { DEVICE_STATUS } from '@/app/utils/statusUtils'
import { DeviceStatus } from '@/Components/DeviceStatus/DeviceStatus'
import { UNITS } from '@/constants/units'

interface TankRowProps {
  label: string
  temperature: number
  unit: string
  oilPumpEnabled: boolean
  waterPumpEnabled: boolean
  color: string
  flash?: boolean
  tooltip?: string
  pressure: {
    value?: number
    flash?: boolean
    color?: string
    tooltip?: string
  }
}

const TankRow: FC<TankRowProps> = ({
  label,
  temperature,
  unit,
  oilPumpEnabled,
  waterPumpEnabled,
  color,
  flash,
  tooltip,
  pressure,
}) => (
  <TankRowRoot>
    <span>{label}</span>
    <TankParams>
      <TankParam>
        <TankParamLabel $color={color} $flash={flash}>
          Temperature
        </TankParamLabel>
        <Tooltip title={tooltip || `Temperature: ${temperature}${unit}`}>
          <TankParamValue $color={color} $flash={flash}>
            {temperature}
            {unit}
          </TankParamValue>
        </Tooltip>
      </TankParam>
      {!_isNil(pressure.value) && (
        <TankParam>
          <TankParamLabel $color={pressure.color} $flash={pressure.flash}>
            Pressure
          </TankParamLabel>
          <Tooltip title={pressure.tooltip || `Pressure: ${pressure.value} ${UNITS.PRESSURE_BAR}`}>
            <TankParamValue $color={pressure.color} $flash={pressure.flash}>
              {pressure.value}&nbsp;{UNITS.PRESSURE_BAR}
            </TankParamValue>
          </Tooltip>
        </TankParam>
      )}
    </TankParams>
    <TankPumpStatuses>
      <DeviceStatus
        title="Oil Pump"
        status={oilPumpEnabled ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
        secondary
      />
      <DeviceStatus
        title="Water Pump"
        status={waterPumpEnabled ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
        secondary
      />
    </TankPumpStatuses>
  </TankRowRoot>
)

export { TankRow }
