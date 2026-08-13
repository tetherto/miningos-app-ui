import { memo } from 'react'

import { ChartCardLayout } from './ChartCardLayout'

import BarChart, { type BarChartData } from '@/Components/BarChart/BarChart'
import { BAR_WIDTH } from '@/MultiSiteViews/Charts/constants'

export interface MinersStatusData {
  dataset?: Array<{
    label: string
    backgroundColor: string | string[]
    borderColor: string
    stackGroup: string
    legendColor: string
    [key: string]: unknown
  }>
}

interface MinersStatusChartProps {
  error?: unknown
  isLoading: boolean
  isExpanded: boolean
  contentCentered?: boolean
  onToggleExpand: VoidFunction
  data: MinersStatusData | null
}

const MinersStatusChartComponent = ({
  data,
  error,
  isLoading,
  isExpanded,
  contentCentered,
  onToggleExpand,
}: MinersStatusChartProps) => (
  <ChartCardLayout
    id="miners"
    error={error}
    title="Miners Status"
    hasHeaderMarginBottom
    isExpanded={isExpanded}
    onToggleExpand={onToggleExpand}
    contentCentered={contentCentered}
    noDataMessage="No miners data available"
    errorMessage="Failed to load miners data"
    hasData={isLoading || (data?.dataset?.length ?? 0) > 0}
  >
    <BarChart
      data={data as BarChartData | undefined}
      isStacked
      isLegendVisible
      legendPosition="bottom"
      chartHeight={300}
      barWidth={BAR_WIDTH.WIDE}
      yTicksFormatter={(value) => String(Math.round(value))}
    />
  </ChartCardLayout>
)

export const MinersStatusChart = memo(MinersStatusChartComponent)
