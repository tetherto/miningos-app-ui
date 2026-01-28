import { useGetFeatureConfigQuery } from '../../../../../app/services/api'
import { formatNumber } from '../../../../../app/utils/format'
import { WEBAPP_SHORT_NAME } from '../../../../../constants'
import { UNITS } from '../../../../../constants/units'
import { Hashrate } from '../Icons/Hashrate'
import { statBoxWithLoading } from '../StatBoxWithLoading'

import {
  HeaderStatBoxHeading,
  HeaderStatBoxLeftCol,
  HeaderStatBoxRightCol,
  HeaderStatBoxTitle,
  HeaderStatBoxValue,
  HeaderStatBoxValueSuffix,
  HeaderStatBoxValueWrapper,
  HeaderStatBoxWrapper,
  HeaderStatsRow,
  HeaderStatsRowTitle,
} from './HeaderStatBox.styles'

const HashrateBox = ({
  hashrate = { unit: UNITS.HASHRATE_TH_S, value: 0 },
  poolHashrate = { unit: UNITS.HASHRATE_TH_S, value: 0 },
}) => {
  const { data: featureConfig } = useGetFeatureConfigQuery({})
  const isPoolStatsEnabled = (featureConfig as import('@/types/api').FeatureFlags)?.poolStats

  return (
    <HeaderStatBoxWrapper>
      <HeaderStatBoxLeftCol>
        <HeaderStatBoxHeading>
          <Hashrate />
          <HeaderStatBoxTitle>Hashrate</HeaderStatBoxTitle>
        </HeaderStatBoxHeading>
      </HeaderStatBoxLeftCol>
      <HeaderStatBoxRightCol>
        <HeaderStatsRow>
          <HeaderStatsRowTitle>{WEBAPP_SHORT_NAME}</HeaderStatsRowTitle>
          <HeaderStatBoxValueWrapper>
            <HeaderStatBoxValue>
              {formatNumber(hashrate?.value, { maximumFractionDigits: 3 })}
            </HeaderStatBoxValue>
            <HeaderStatBoxValueSuffix>{hashrate?.unit}</HeaderStatBoxValueSuffix>
          </HeaderStatBoxValueWrapper>
        </HeaderStatsRow>
        {isPoolStatsEnabled && (
          <HeaderStatsRow>
            <HeaderStatsRowTitle>Pool</HeaderStatsRowTitle>
            <HeaderStatBoxValueWrapper>
              <HeaderStatBoxValue>{poolHashrate?.value}</HeaderStatBoxValue>
              <HeaderStatBoxValueSuffix>{poolHashrate?.unit}</HeaderStatBoxValueSuffix>
            </HeaderStatBoxValueWrapper>
          </HeaderStatsRow>
        )}
      </HeaderStatBoxRightCol>
    </HeaderStatBoxWrapper>
  )
}

export default statBoxWithLoading(HashrateBox)
