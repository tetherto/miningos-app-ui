import { getMonthlyRevenueDataset, processRevenueDataset } from './helper'

import { formatValueUnit } from '@/app/utils/format'
import { ChartLegendPosition } from '@/app/utils/utils.types'
import BarChart, { BarChartDataset } from '@/Components/BarChart/BarChart'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import { useChartDataCheck } from '@/hooks/useChartDataCheck'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { ChartTitle, ChartWrapper, InnerChartWrapper, Unit } from '@/MultiSiteViews/Common.style'

interface RevenueDataItem {
  timeKey: string
  period: string
  timestamp: number
  [key: string]: unknown
}

interface SiteItem {
  id: string
  name?: string
}

interface RevenueChartProps {
  data?: RevenueDataItem[]
  isLoading?: boolean
  siteList?: (string | SiteItem)[]
  legendPosition?: ChartLegendPosition
  legendAlign?: 'start' | 'center' | 'end'
}

export const RevenueChart = ({
  data = [],
  isLoading = false,
  siteList = [],
}: RevenueChartProps) => {
  const dataset = getMonthlyRevenueDataset(data, siteList)
  const { dataset: displayDataset, currencyUnit } = processRevenueDataset(dataset)
  const noData = useChartDataCheck({ data: displayDataset, dataset: displayDataset })

  return (
    <ChartWrapper>
      <ChartTitle>Revenue</ChartTitle>
      <Unit>{currencyUnit}</Unit>
      <InnerChartWrapper>
        <ChartContainer
          data={undefined}
          dataset={displayDataset}
          isLoading={isLoading}
          minHeight={CHART_HEIGHT}
          customNoDataMessage={undefined}
          loadingMinHeight={undefined}
        >
          <BarChart
            isStacked
            isLegendVisible
            data={{
              dataset: noData ? undefined : (displayDataset as BarChartDataset[]),
            }}
            barWidth={BAR_WIDTH.WIDE}
            chartHeight={CHART_HEIGHT}
            yTicksFormatter={(value) => formatValueUnit(value)}
          />
        </ChartContainer>
      </InnerChartWrapper>
    </ChartWrapper>
  )
}
