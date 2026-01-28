import _isNumber from 'lodash/isNumber'

import { getHashrateUnit } from '../../../app/utils/deviceUtils'
import { decimalToMegaNumber } from '../../../app/utils/numberUtils'
import type { ValueUnit } from '../../../app/utils/utils.types'
import { UNITS } from '../../../constants/units'
import { useHeaderStats } from '../../../hooks/useHeaderStats'
import HeaderConsumptionBox from '../../Farms/FarmCard/StatBox/Header/HeaderConsumptionBox'
import HeaderEfficiencyBox from '../../Farms/FarmCard/StatBox/Header/HeaderEfficiencyBox'
import HeaderHashrateBox from '../../Farms/FarmCard/StatBox/Header/HeaderHashrateBox'
import HeaderMinersBox from '../../Farms/FarmCard/StatBox/Header/HeaderMinersBox'

import { HeaderRightBorder } from './HeaderRightBorder'
import { getEfficiencyStat } from './HeaderStats.helper'
import { WebappHeaderStatsContainer } from './HeaderStats.styles'

const HeaderStats = () => {
  const {
    minerEntry,
    isLoading,
    consumption,
    isDevicesDataLoading,
    poolMinersOn,
    poolMinersTotal,
    poolHashrate,
    minersAmount,
  } = useHeaderStats()

  const hashrateValue = _isNumber(minerEntry?.hashrate_mhs_1m_sum_aggr)
    ? minerEntry.hashrate_mhs_1m_sum_aggr
    : 0
  const poolHashrateValue = _isNumber(poolHashrate) ? decimalToMegaNumber(poolHashrate) : 0

  return (
    <WebappHeaderStatsContainer>
      <HeaderRightBorder />
      <HeaderMinersBox
        on={_isNumber(minersAmount.onlineOrMinorErrors) ? minersAmount.onlineOrMinorErrors : 0}
        error={_isNumber(minersAmount.majorErrors) ? minersAmount.majorErrors : 0}
        off={_isNumber(minersAmount.offlineOrSleep) ? minersAmount.offlineOrSleep : 0}
        total={
          _isNumber(minersAmount.totalContainerCapacity) ? minersAmount.totalContainerCapacity : 0
        }
        poolOn={_isNumber(poolMinersOn) ? poolMinersOn : 0}
        poolTotal={_isNumber(poolMinersTotal) ? poolMinersTotal : 0}
        isLoading={isLoading}
      />
      <HeaderRightBorder />
      <HeaderHashrateBox
        hashrate={
          getHashrateUnit(_isNumber(hashrateValue) ? hashrateValue : 0, 3) as {
            unit: 'TH/s'
            value: number
          }
        }
        poolHashrate={getHashrateUnit(poolHashrateValue, 3) as { unit: 'TH/s'; value: number }}
        isLoading={isLoading}
      />
      <HeaderRightBorder />
      <HeaderConsumptionBox
        error={!consumption?.formattedConsumption || consumption?.consumptionAlert}
        consumption={
          consumption?.formattedConsumption
            ? {
                value: (consumption.formattedConsumption as ValueUnit).value as number | undefined,
                unit: (consumption.formattedConsumption as ValueUnit).unit,
                realValue: (consumption.formattedConsumption as ValueUnit).realValue,
              }
            : undefined
        }
        isLoading={isDevicesDataLoading}
      />
      <HeaderRightBorder />
      <HeaderEfficiencyBox
        efficiency={{
          value: getEfficiencyStat(
            _isNumber(consumption?.rawConsumptionW) ? consumption.rawConsumptionW : undefined,
            _isNumber(minerEntry?.hashrate_mhs_1m_sum_aggr)
              ? minerEntry.hashrate_mhs_1m_sum_aggr
              : undefined,
          ),
          unit: UNITS.EFFICIENCY_W_PER_TH_S,
        }}
        isLoading={isLoading || isDevicesDataLoading}
      />
      <HeaderRightBorder />
    </WebappHeaderStatsContainer>
  )
}

export default HeaderStats
