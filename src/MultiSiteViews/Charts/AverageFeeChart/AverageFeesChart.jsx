import PropTypes from 'prop-types'

import { getDataset } from './helper'

import { formatNumber } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { UNITS } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

export const AverageFeeChart = ({ data = [], isLoading = false, isDateShort = false }) => {
  const dataset = getDataset(data, isDateShort)

  return (
    <ChartWrapper>
      <ChartTitle>
        Average Fees in {UNITS.SATS}/{UNITS.VBYTE}
      </ChartTitle>
      <Unit>
        {UNITS.SATS}/{UNITS.VBYTE}
      </Unit>
      <InnerChartWrapper $fullHeight>
        <ChartContainer data={{ dataset }} isLoading={isLoading}>
          <BarChart
            data={{ dataset }}
            barWidth={BAR_WIDTH.WIDE}
            chartHeight={CHART_HEIGHT}
            isLegendVisible
            yTicksFormatter={(val) => formatNumber(val)}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

AverageFeeChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      ts: PropTypes.number.isRequired,
      avgFeesSatsVByte: PropTypes.number,
    }),
  ).isRequired,
  unit: PropTypes.string,
  isLoading: PropTypes.bool,
  isDateShort: PropTypes.bool,
}
