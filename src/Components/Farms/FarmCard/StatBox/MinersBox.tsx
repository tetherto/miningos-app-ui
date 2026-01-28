import Tooltip from 'antd/es/tooltip'

import { useGetFeatureConfigQuery } from '../../../../app/services/api'
import { formatNumber } from '../../../../app/utils/format'
import { WEBAPP_NAME } from '../../../../constants'

import { Miners } from './Icons/Miners'
import {
  DataColumn,
  IconColumn,
  StatBoxContainer,
  StatusColumn,
  StatusLabel,
  StatusRow,
  StatusValue,
  Title,
  SubTitle,
  TopRow,
  Value,
} from './StatBox.styles'
import { statBoxWithLoading } from './StatBoxWithLoading'

const MinersBox = ({ total = 0, on = 0, off = 0, poolOn = 0, poolOff = 0 }) => {
  const { data: featureConfig } = useGetFeatureConfigQuery({})
  const isPoolStatsEnabled = (featureConfig as import('@/types/api').FeatureFlags)?.poolStats

  return (
    <StatBoxContainer>
      <TopRow>
        <IconColumn>
          <Miners />
        </IconColumn>
        <DataColumn $gap="8px">
          <Title>Miners</Title>
          <Tooltip title="Total active miners / Total containers capacity">
            <Value>{total}</Value>
          </Tooltip>
        </DataColumn>
        <StatusColumn>
          <StatusRow>
            <StatusValue>{formatNumber(on)}</StatusValue>
            <StatusLabel>On</StatusLabel>
          </StatusRow>
          <StatusRow>
            <StatusValue>{formatNumber(off)}</StatusValue>
            <StatusLabel $off>Off</StatusLabel>
          </StatusRow>
          {isPoolStatsEnabled && <SubTitle>{WEBAPP_NAME}</SubTitle>}
        </StatusColumn>

        {isPoolStatsEnabled && (
          <StatusColumn>
            <StatusRow>
              <StatusValue>{formatNumber(poolOn)}</StatusValue>
              <StatusLabel>On</StatusLabel>
            </StatusRow>
            <StatusRow>
              <StatusValue>{formatNumber(poolOff)}</StatusValue>
              <StatusLabel $off>Off</StatusLabel>
            </StatusRow>
            <SubTitle>Pool</SubTitle>
          </StatusColumn>
        )}
      </TopRow>
    </StatBoxContainer>
  )
}

export default statBoxWithLoading(MinersBox)
