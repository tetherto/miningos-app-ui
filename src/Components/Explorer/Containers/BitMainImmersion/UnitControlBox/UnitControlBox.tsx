import Tag from 'antd/es/tag'
import { FC } from 'react'

import { DEVICE_STATUS } from '../../../../../app/utils/statusUtils'
import { DeviceStatus } from '../../../../DeviceStatus/DeviceStatus'
import { ControlBox } from '../ControlBox/ControlBox'
import { Frequency, FrequencyLabel, FrequencyValue } from '../ControlBox/ControlBox.styles'

import { StatusColors } from '@/Theme/GlobalColors'

interface UnitControlBoxProps {
  title?: string
  alarmStatus?: unknown
  frequency?: unknown
  isDryCooler?: unknown
  running?: unknown
  showFrequencyInLeftColumn?: unknown
  secondary?: unknown
}

const UnitControlBox: FC<UnitControlBoxProps> = ({
  title,
  alarmStatus,
  frequency,
  isDryCooler,
  running,
  showFrequencyInLeftColumn,
  secondary = false,
}) => {
  const secondaryBool = secondary as boolean
  const runningBool = running as boolean
  const frequencyPiece = frequency !== undefined && frequency !== null && (
    <Frequency>
      <FrequencyLabel>Frequency</FrequencyLabel>
      <FrequencyValue>{String(frequency)} Hz</FrequencyValue>
    </Frequency>
  )

  return (
    <ControlBox
      secondary={secondaryBool}
      title={title as string | undefined}
      leftContent={<>{showFrequencyInLeftColumn ? frequencyPiece : null}</>}
      rightContent={
        <>
          {/** Map device status to StatusColors keys */}
          {(() => {
            const colorKey: keyof typeof StatusColors = alarmStatus ? 'fault' : 'normal'
            return <Tag color={StatusColors[colorKey]}>{alarmStatus ? 'Fault' : 'Normal'}</Tag>
          })()}
          <DeviceStatus
            status={runningBool ? DEVICE_STATUS.RUNNING : DEVICE_STATUS.OFF}
            fault={(alarmStatus as boolean) && DEVICE_STATUS.ERROR}
            title={isDryCooler ? 'Dry Cooler' : (title as string | undefined)}
          />
          {!showFrequencyInLeftColumn ? frequencyPiece : null}
        </>
      }
    />
  )
}

export { UnitControlBox }
