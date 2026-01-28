import Empty from 'antd/es/empty'
import PropTypes from 'prop-types'

import { formatValueUnit } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { CURRENCY, UNITS } from '@/constants/units'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { getDataset } from '@/MultiSiteViews/Charts/SiteEnergyVsCostChart/helper'
import { NoDataWrapper } from '@/MultiSiteViews/Common.style'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

const CHART_EMPTY_DESCRIPTION = 'No data available for the selected period'

export const SiteEnergyVsCostChart = ({
  title = 'Site Revenue',
  isLoading = false,
  revenueData = [],
  unit = `${CURRENCY.USD}/${UNITS.ENERGY_MWH}`,
  isDateShort = false,
  chartHeightUnset = false,
  showNoDataPlaceholder = false,
  isSingleSite = false,
}) => {
  const dataset = getDataset(revenueData, isDateShort, isSingleSite)

  return (
    <ChartWrapper $heightUnset={chartHeightUnset}>
      <ChartTitle>{title}</ChartTitle>
      {unit && <Unit>{unit}</Unit>}
      <InnerChartWrapper>
        <ChartContainer data={{ dataset }} isLoading={isLoading} minHeight={CHART_HEIGHT}>
          {showNoDataPlaceholder ? (
            <NoDataWrapper>
              <Empty description={CHART_EMPTY_DESCRIPTION} />
            </NoDataWrapper>
          ) : (
            <BarChart
              data={{ dataset }}
              isLegendVisible
              barWidth={BAR_WIDTH.THIN}
              chartHeight={CHART_HEIGHT}
              yTicksFormatter={(val) => formatValueUnit(val)}
            />
          )}
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

SiteEnergyVsCostChart.propTypes = {
  title: PropTypes.string,
  isLoading: PropTypes.bool,
  unit: PropTypes.string,
  revenueData: PropTypes.arrayOf(
    PropTypes.shape({
      ts: PropTypes.number.isRequired,
      revenueUSD: PropTypes.number,
    }),
  ),
  isDateShort: PropTypes.bool,
  chartHeightUnset: PropTypes.bool,
  isSingleSite: PropTypes.bool,
  showNoDataPlaceholder: PropTypes.bool,
}
