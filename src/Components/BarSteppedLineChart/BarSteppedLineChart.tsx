import Empty from 'antd/es/empty'
import type { ChartData } from 'chart.js'
import { Chart, registerables } from 'chart.js'
import _every from 'lodash/every'
import _isEmpty from 'lodash/isEmpty'
import { Bar } from 'react-chartjs-2'

import { BAR_CHART_HEIGHT } from './BarSteppedLineChart.const'
import {
  BarSteppedLineChartData,
  FooterStatItem,
  getOptions,
  getRawDatasets,
} from './BarSteppedLineChart.helpers'
import { BarSteppedLineChartRoot, Unit } from './BarSteppedLineChart.styles'

import { SafeChartDataLabels } from '@/app/utils/chartUtils'
import { NoDataWrapper } from '@/Components/BarChart/Barchart.styles'
import { withErrorBoundary } from '@/Components/ErrorBoundary'
import LineChartCardFooter from '@/Components/LineChartCard/LineChartCardFooter'
import { CHART_EMPTY_DESCRIPTION } from '@/constants/charts'

Chart.defaults.font.family = "'JetBrains Mono', sans-serif"

Chart.register(...registerables, SafeChartDataLabels)

interface BarSteppedLineChartProps {
  chartData?: BarSteppedLineChartData
  yTicksFormatter?: (value: number) => string | number
  isBarDynamicallyColored?: boolean
  footerStats?: FooterStatItem[]
  unit?: string
  isLegendVisible?: boolean
  showDifference?: boolean
  showDataLabels?: boolean
}

const BarSteppedLineChartComponent = ({
  unit,
  chartData,
  footerStats,
  showDifference,
  isLegendVisible = true,
  showDataLabels = false,
  isBarDynamicallyColored = false,
  yTicksFormatter = (value: number) => value,
}: BarSteppedLineChartProps) => {
  const { labels, dataSet1: dataset1st, dataSet2, dataSet3 } = chartData || {}

  const datasets = getRawDatasets({
    dataset1st,
    dataSet2,
    dataSet3,
    isBarDynamicallyColored,
  })

  const options = getOptions({
    isLegendVisible,
    showDataLabels,
    yTicksFormatter,
    showDifference,
    dataSet3,
    unit,
  })

  const hasNoData = _isEmpty(datasets) || _every(datasets, (ds) => _isEmpty(ds?.data))

  return (
    <BarSteppedLineChartRoot $height={BAR_CHART_HEIGHT}>
      {unit && <Unit>{unit}</Unit>}
      {hasNoData ? (
        <NoDataWrapper>
          <Empty description={CHART_EMPTY_DESCRIPTION} />
        </NoDataWrapper>
      ) : (
        <Bar
          data={
            {
              labels,
              datasets,
            } as ChartData<'bar'>
          }
          options={options as never}
        />
      )}
      {!_isEmpty(footerStats) && <LineChartCardFooter stats={footerStats as FooterStatItem[]} />}
    </BarSteppedLineChartRoot>
  )
}

export const BarSteppedLineChart = withErrorBoundary(BarSteppedLineChartComponent)
