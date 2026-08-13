import PropTypes from 'prop-types'

import { getDataset } from './helper'

import { formatValueUnit } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { CURRENCY } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

export const ProductionCostPriceChart = ({
  title = 'Production Cost/Price',
  isLoading = false,
  costData = [],
  unit = CURRENCY.USD,
  btcPriceData = [],
  forPdf = false,
}) => {
  const dataset = getDataset(costData, btcPriceData, true)

  return (
    <ChartWrapper>
      <ChartTitle>{title}</ChartTitle>
      {unit && <Unit>{unit}</Unit>}
      <InnerChartWrapper>
        <ChartContainer data={{ dataset }} isLoading={isLoading} minHeight={CHART_HEIGHT}>
          <BarChart
            data={{ dataset }}
            barWidth={BAR_WIDTH.THIN}
            chartHeight={CHART_HEIGHT}
            allowGrouping={forPdf ?? false}
            isLegendVisible
            hasSuffix
            yTicksFormatter={(val) => formatValueUnit(val)}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

ProductionCostPriceChart.propTypes = {
  title: PropTypes.string,
  unit: PropTypes.string,
  isLoading: PropTypes.bool,
  costData: PropTypes.array,
  btcPriceData: PropTypes.array,
  forPdf: PropTypes.bool,
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  legendAlign: PropTypes.oneOf(['start', 'center', 'end']),
}
