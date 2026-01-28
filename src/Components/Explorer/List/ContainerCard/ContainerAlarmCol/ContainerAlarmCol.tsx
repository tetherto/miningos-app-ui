import Col from 'antd/es/col'
import Tooltip from 'antd/es/tooltip'
import { FC } from 'react'

import useTimezone from '../../../../../hooks/useTimezone'
import { getAlarms } from '../../../../../Views/Container/Tabs/HomeTab/HomeTab.util'
import IconRow from '../../IconRow/IconRow'
import AlertTriangle from '../../MinerCard/Icons/AlertTriangle'
import { MinerStatusIndicatorContainer } from '../../MinerCard/MinerCard.styles'
import ContainerStatusIndicator from '../ContainerStatusIndicator/ContainerStatusIndicator'

import { Device } from '@/types'

interface ContainerAlarmColProps {
  data: Device
}

interface DeviceLastData {
  alerts?: unknown[]
  err?: string
  [key: string]: unknown
}

const ContainerAlarmCol: FC<ContainerAlarmColProps> = ({ data }) => {
  const lastData = (data?.last as DeviceLastData | undefined) || {}
  const alarmStatus = (lastData?.alerts?.length || 0) > 0
  const { getFormattedDate } = useTimezone()
  const alarm = getAlarms(data, undefined, getFormattedDate)

  return (
    <Col lg={1} md={1} sm={1} xs={2}>
      {alarmStatus && (
        <div>
          <IconRow
            icon={
              <Tooltip title={alarm ? String(alarm) : ''}>
                <MinerStatusIndicatorContainer>
                  <AlertTriangle />
                </MinerStatusIndicatorContainer>
              </Tooltip>
            }
            text=""
          />
        </div>
      )}
      {lastData?.err && (
        <IconRow
          icon={<ContainerStatusIndicator error={String(lastData.err)} />}
          text={String(lastData.err)}
        />
      )}
      {!alarmStatus && !lastData?.err && <div />}
    </Col>
  )
}

export default ContainerAlarmCol
