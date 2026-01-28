import Empty from 'antd/es/empty'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import { useState } from 'react'
import { Line } from 'react-chartjs-2'

import { LEGEND_PLACEMENT } from '../constants'
import CustomLegend from '../Legend/Legend'

import {
  defaultLabelFormatter,
  getChartDataThreshold,
  getChartOptions,
  type LineChartData,
} from './helper'

import { hasNonZeroLineSeriesValues } from '@/app/utils/chartUtils'
import { CHART_EMPTY_DESCRIPTION } from '@/constants/charts'
import {
  ChartHeader,
  ChartTitle,
  ChartWrapper,
  InnerChartWrapper,
  NoDataWrapper,
  Unit,
} from '@/MultiSiteViews/Common.style'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

interface ThresholdLineChartProps {
  data?: LineChartData
  title?: string
  timeframeType?: string
  unit?: string
  isLegendVisible?: boolean
  legendPlacement?: typeof LEGEND_PLACEMENT.HEADER | typeof LEGEND_PLACEMENT.BOTTOM
  fullHeight?: boolean
  fillArea?: boolean
  labelFormatter?: (ts: string | number) => Date | string | number
}

export const ThresholdLineChart = ({
  data,
  title,
  timeframeType,
  unit,
  isLegendVisible = true,
  legendPlacement = LEGEND_PLACEMENT.HEADER,
  fullHeight = false,
  fillArea = false,
  labelFormatter: customLabelFormatter,
}: ThresholdLineChartProps) => {
  const [hiddenDatasets, setHiddenDatasets] = useState<number[]>([])

  const toggleDataset = (datasetIndex: number) => {
    setHiddenDatasets((prev) => {
      if (_includes(prev, datasetIndex)) {
        return _filter(prev, (i) => i !== datasetIndex)
      }
      return [...prev, datasetIndex]
    })
  }

  // Return empty chart if no data or all values are zero
  if (!data || !hasNonZeroLineSeriesValues(data.series)) {
    return (
      <ChartWrapper $heightFull={fullHeight}>
        {title && <ChartTitle>{title}</ChartTitle>}
        {unit && <Unit>{unit}</Unit>}
        <NoDataWrapper>
          <Empty description={CHART_EMPTY_DESCRIPTION} />
        </NoDataWrapper>
      </ChartWrapper>
    )
  }

  // Wrap labelFormatter to ensure it returns a string for the helper function
  let wrappedLabelFormatter: ((ts: unknown) => string) | undefined
  if (customLabelFormatter) {
    wrappedLabelFormatter = (ts: unknown) => String(customLabelFormatter(ts as string | number))
  } else if (!_isNil(timeframeType)) {
    wrappedLabelFormatter = (ts: unknown) =>
      defaultLabelFormatter(new Date(ts as string | number).toString())
  }

  const chartData = getChartDataThreshold({
    data,
    labelFormatter: wrappedLabelFormatter,
    fillArea,
  })

  // Apply hidden datasets to chart data
  // Always explicitly set hidden property to ensure Chart.js updates correctly
  const visibleChartData = {
    ...chartData,
    datasets: _map(chartData.datasets, (dataset, index) => ({
      ...dataset,
      hidden: _includes(hiddenDatasets, index),
    })),
  }

  const options = getChartOptions({
    timeframeType,
    isLegendVisible: false, // Disable Chart.js legend
  })

  const showLegendInHeader = isLegendVisible && legendPlacement === LEGEND_PLACEMENT.HEADER
  const showLegendAtBottom = isLegendVisible && legendPlacement === LEGEND_PLACEMENT.BOTTOM

  return (
    <ChartWrapper $heightFull={fullHeight}>
      {title && showLegendInHeader ? (
        <ChartHeader>
          <ChartTitle>{title}</ChartTitle>
          <CustomLegend
            datasets={chartData.datasets}
            hiddenDatasets={hiddenDatasets}
            onToggleDataset={toggleDataset}
            usePointStyle={false}
          />
        </ChartHeader>
      ) : (
        title && <ChartTitle>{title}</ChartTitle>
      )}
      {unit && <Unit>{unit}</Unit>}
      <InnerChartWrapper $fullHeight={fullHeight}>
        <Line data={visibleChartData} options={options} />
      </InnerChartWrapper>
      {showLegendAtBottom && (
        <CustomLegend
          datasets={chartData.datasets}
          hiddenDatasets={hiddenDatasets}
          onToggleDataset={toggleDataset}
          usePointStyle={false}
          forceRow
        />
      )}
    </ChartWrapper>
  )
}
