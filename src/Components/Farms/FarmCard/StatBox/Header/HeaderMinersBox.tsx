import Tooltip from 'antd/es/tooltip'

import { useGetFeatureConfigQuery } from '../../../../../app/services/api'
import { formatNumber } from '../../../../../app/utils/format'
import { WEBAPP_SHORT_NAME } from '../../../../../constants'
import { Miners } from '../Icons/Miners'
import { statBoxWithLoading } from '../StatBoxWithLoading'

import {
  HeaderStatBoxHeading,
  HeaderStatBoxTitle,
  HeaderStatBoxValue,
  HeaderStatsRow,
  MinerBoxWrapper,
  HeaderStatsRowTitle,
  HeaderStatsRowValue,
} from './HeaderStatBox.styles'

const HeaderMinersBox = ({ total = 0, on = 0, error = 0, off = 0, poolOn = 0, poolTotal = 0 }) => {
  const { data: featureConfig } = useGetFeatureConfigQuery({})
  const isPoolStatsEnabled = (featureConfig as import('@/types/api').FeatureFlags)?.poolStats
  const totalMiners = on + error + off

  return (
    <MinerBoxWrapper>
      <HeaderStatBoxHeading>
        <Miners />
        <HeaderStatBoxTitle>Miners</HeaderStatBoxTitle>
      </HeaderStatBoxHeading>
      <HeaderStatsRowTitle>
        {`${WEBAPP_SHORT_NAME} (${formatNumber(totalMiners)})`}
      </HeaderStatsRowTitle>
      <HeaderStatsRow>
        <Tooltip title="Miners Online + minor errors">
          <HeaderStatsRowValue $color="green">{formatNumber(on)}</HeaderStatsRowValue>
        </Tooltip>
        <Tooltip title="Miners having major errors">
          <HeaderStatsRowValue $color="orange">{formatNumber(error)}</HeaderStatsRowValue>
        </Tooltip>
        <Tooltip title="Miners offline + sleep">
          <HeaderStatsRowValue $color="red">{formatNumber(off)}</HeaderStatsRowValue>
        </Tooltip>
      </HeaderStatsRow>
      <Tooltip title="Total active miners / Total containers capacity">
        <HeaderStatBoxValue $big>
          <span>{formatNumber(on)}</span>
          <span>/</span>
          <span>{formatNumber(total)}</span>
        </HeaderStatBoxValue>
      </Tooltip>
      {isPoolStatsEnabled && (
        <HeaderStatsRowTitle $color="red">{`Pool (${formatNumber(poolTotal)})`}</HeaderStatsRowTitle>
      )}
      {isPoolStatsEnabled && (
        <HeaderStatsRow $spaceBetween>
          <Tooltip title="Pool on">
            <HeaderStatsRowValue $color="green">{formatNumber(poolOn)}</HeaderStatsRowValue>
          </Tooltip>
          <Tooltip title="Pool off">
            <HeaderStatsRowValue $color="red">
              {formatNumber(Math.max(0, poolTotal - poolOn))}
            </HeaderStatsRowValue>
          </Tooltip>
        </HeaderStatsRow>
      )}
    </MinerBoxWrapper>
  )
}

export default statBoxWithLoading(HeaderMinersBox)
