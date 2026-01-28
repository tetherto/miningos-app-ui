import { useGetFeatureConfigQuery } from '../../../../app/services/api'
import { formatNumber } from '../../../../app/utils/format'
import { WEBAPP_NAME } from '../../../../constants'
import { UNITS } from '../../../../constants/units'

import { Hashrate } from './Icons/Hashrate'
import { IconColumn, HashrateStatBox, Suffix, Title, SubTitle, Value } from './StatBox.styles'
import { statBoxWithLoading } from './StatBoxWithLoading'

const HashrateBox = ({
  hashrate = { unit: UNITS.HASHRATE_TH_S, value: 0 },
  poolHashrate = { unit: UNITS.HASHRATE_TH_S, value: 0 },
}) => {
  const { data: featureConfig } = useGetFeatureConfigQuery({})
  const isPoolStatsEnabled = (featureConfig as import('@/types/api').FeatureFlags)?.poolStats
  return (
    <HashrateStatBox>
      <IconColumn>
        <Hashrate />
      </IconColumn>

      <Title>Hashrate</Title>

      <Value $area="webapphash">{formatNumber(hashrate?.value)}</Value>
      <Suffix $area="webappunit">{hashrate?.unit}</Suffix>

      {isPoolStatsEnabled && (
        <>
          <Value $area="poolhash">{formatNumber(poolHashrate?.value)}</Value>
          <Suffix>{poolHashrate?.unit}</Suffix>
          <SubTitle $area="webapplabel">{WEBAPP_NAME}</SubTitle>
          <SubTitle $area="poollabel">Pool</SubTitle>
        </>
      )}
    </HashrateStatBox>
  )
}

export default statBoxWithLoading(HashrateBox)
