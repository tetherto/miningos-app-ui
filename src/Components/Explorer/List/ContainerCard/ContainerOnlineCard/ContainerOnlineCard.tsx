import Col from 'antd/es/col'
import _isNumber from 'lodash/isNumber'
import { FC } from 'react'

import { unitToKilo } from '../../../../../app/utils/deviceUtils'
import { formatValueUnit } from '../../../../../app/utils/format'
import IconRow from '../../IconRow/IconRow'
import { DeviceCardColText } from '../../ListView.styles'
import CoolingDrop from '../../MinerCard/Icons/CoolingDrop'
import Power from '../../MinerCard/Icons/Power'
import { TemperatureIndicator } from '../../MinerCard/Icons/TemperatureIndicator'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface ContainerOnlineCardProps {
  data?: UnknownRecord
}

interface DeviceSnapData {
  stats?: {
    ambient_temp_c?: number
    humidity_percent?: number
    power_w?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

const ContainerOnlineCard: FC<ContainerOnlineCardProps> = ({ data }) => {
  const snapData = data?.snap as DeviceSnapData | undefined
  const stats = snapData?.stats

  return (
    <>
      <Col lg={4} md={4} sm={4} xs={12}>
        <IconRow
          icon={<TemperatureIndicator />}
          text={
            <DeviceCardColText>
              {_isNumber(stats?.ambient_temp_c) ? `${stats.ambient_temp_c} °C` : '-'}
            </DeviceCardColText>
          }
        />
      </Col>
      <Col lg={4} md={4} sm={4} xs={12}>
        <IconRow
          icon={<CoolingDrop />}
          text={
            <DeviceCardColText>
              {_isNumber(stats?.humidity_percent)
                ? formatValueUnit(stats.humidity_percent, '%')
                : '-'}
            </DeviceCardColText>
          }
        />
      </Col>
      <Col lg={4} md={4} sm={4} xs={12}>
        <IconRow
          icon={<Power />}
          text={
            <DeviceCardColText>
              {_isNumber(stats?.power_w) ? formatValueUnit(unitToKilo(stats.power_w), 'kW') : '-'}
            </DeviceCardColText>
          }
        />
      </Col>
    </>
  )
}

export default ContainerOnlineCard
