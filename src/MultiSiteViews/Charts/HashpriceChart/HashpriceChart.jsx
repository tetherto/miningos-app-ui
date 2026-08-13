import PropTypes from 'prop-types'

import { formatValueUnit } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { UNITS } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { getDataset } from '@/MultiSiteViews/Charts/HashpriceChart/helper'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'
import { CURRENCY } from '@/MultiSiteViews/constants'

export const HashpriceChart = ({
  data,
  isLoading = false,
  isDateShort = false,
  customFormatTemplate = '',
}) => {
  const dataset = getDataset(data, isDateShort, customFormatTemplate)

  return (
    <ChartWrapper>
      <ChartTitle>Cost / Revenue / Network Hashprice</ChartTitle>
      <Unit>{`${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`}</Unit>
      <InnerChartWrapper>
        <ChartContainer data={{ dataset: dataset }} isLoading={isLoading} minHeight={CHART_HEIGHT}>
          <BarChart
            isLegendVisible
            barWidth={BAR_WIDTH.THIN}
            data={{ dataset: dataset }}
            yTicksFormatter={(value) => formatValueUnit(value)}
            chartHeight={CHART_HEIGHT}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

HashpriceChart.propTypes = {
  data: PropTypes.array,
  noData: PropTypes.bool,
  isLoading: PropTypes.bool,
  isDateShort: PropTypes.bool,
  customFormatTemplate: PropTypes.string,
}
