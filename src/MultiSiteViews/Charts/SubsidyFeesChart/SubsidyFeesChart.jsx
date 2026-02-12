import _isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'

import { formatValueUnit } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { processSubsidyFeesDataset } from '@/MultiSiteViews/Charts/SubsidyFeesChart/helper'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

export const SubsidyFeesChart = ({ data = [], isLoading = false, isDateShort = false }) => {
  const {
    dataset: processedDataset,
    lineDataset: processedLineDataset,
    currencyUnit,
  } = processSubsidyFeesDataset(data, isDateShort)

  return (
    <ChartWrapper>
      <ChartTitle>Subsidy / Fees</ChartTitle>
      <Unit>{currencyUnit}</Unit>
      <InnerChartWrapper>
        <ChartContainer
          data={{ dataset: processedDataset }}
          isLoading={isLoading}
          minHeight={!_isEmpty(processedDataset) ? undefined : CHART_HEIGHT}
        >
          <BarChart
            isStacked
            isLegendVisible
            barWidth={BAR_WIDTH.WIDE}
            data={{ dataset: processedDataset, lineDataset: processedLineDataset }}
            yTicksFormatter={(value) => formatValueUnit(value)}
            yRightTicksFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            chartHeight={CHART_HEIGHT}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

SubsidyFeesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      ts: PropTypes.number.isRequired,
      totalRevenueBTC: PropTypes.number,
      totalFeesBTC: PropTypes.number,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  isDateShort: PropTypes.bool,
}
