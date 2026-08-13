import PropTypes from 'prop-types'

import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import DoughnutChartCard from '@/Components/DoughnutChartCard/DoughnutChartCard'
import { CHART_HEIGHT_DOUGHNUT, DONUT_CHART_SETTINGS } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper } from '@/MultiSiteViews/Common.style'
import { createSubsidyFeesData } from '@/MultiSiteViews/RevenueAndCost/revenueDataHelpers'

export const SubsidyFeesDoughnutChart = ({ revenueData, isLoading = false }) => {
  const chartData = createSubsidyFeesData(revenueData)

  const finalData = {
    ...chartData,
    ...DONUT_CHART_SETTINGS,
  }

  return (
    <ChartWrapper $heightUnset>
      <ChartTitle>Subsidy / Fees</ChartTitle>
      <InnerChartWrapper>
        <ChartContainer data={finalData} isLoading={isLoading} minHeight={CHART_HEIGHT_DOUGHNUT}>
          <DoughnutChartCard
            isReversed
            flexCol
            data={finalData}
            isLoading={isLoading}
            legendPercentOnTop
            maximumFractionDigits={8}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}

SubsidyFeesDoughnutChart.propTypes = {
  revenueData: PropTypes.object,
  isLoading: PropTypes.bool,
}
