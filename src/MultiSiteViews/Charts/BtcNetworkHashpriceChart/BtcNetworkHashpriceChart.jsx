import PropTypes from 'prop-types'

import { getDataset } from './helper'

import { formatNumber } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { UNITS } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

export const BtcNetworkHashpriceChart = ({
  data,
  currency,
  isLoading = false,
  isDateShort = false,
  customFormatTemplate = '',
}) => {
  const unit = `${currency}/${UNITS.HASHRATE_PH_S}/day`
  const dataset = getDataset(data, unit, isDateShort, currency, customFormatTemplate)

  return (
    <ChartWrapper>
      <ChartTitle>Bitcoin Network Hashprice</ChartTitle>
      {unit && <Unit>{unit}</Unit>}
      <InnerChartWrapper $fullHeight>
        <ChartContainer data={{ dataset }} isLoading={isLoading}>
          <BarChart
            data={{ dataset }}
            barWidth={BAR_WIDTH.WIDE}
            chartHeight={CHART_HEIGHT}
            yTicksFormatter={(val) => formatNumber(val)}
            isLegendVisible
            hasSuffix={false}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

BtcNetworkHashpriceChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array.isRequired,
  hasSuffix: PropTypes.bool,
  currency: PropTypes.string,
  isDateShort: PropTypes.bool,
  customFormatTemplate: PropTypes.string,
}
