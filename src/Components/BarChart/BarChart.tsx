import Empty from 'antd/es/empty'
import type { ChartData, ChartOptions } from 'chart.js'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import _forEach from 'lodash/forEach'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import { FC, useEffect, useRef } from 'react'
import { Bar } from 'react-chartjs-2'

import {
  adapter,
  convertLineDataset,
  getHorizontalChartOptions,
  getVerticalChartOptions,
  yAxisTooltipPlugin,
  type CustomDataset,
} from './BarChart.helper'
import { NoDataWrapper } from './Barchart.styles'

import { naturalSorting } from '@/app/utils/containerUtils'
import { ChartLegendPosition } from '@/app/utils/utils.types'
import { withErrorBoundary } from '@/Components/ErrorBoundary'
import { CHART_EMPTY_DESCRIPTION, LABEL_TO_IGNORE } from '@/constants/charts'
import { COLOR } from '@/constants/colors'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  yAxisTooltipPlugin,
)

interface BarChartDataItem {
  value?: number
  original?: number
  displayLabel?: string
  style?: {
    backgroundColor?: string
    borderColor?: string
    legendColor?: string
    [key: string]: unknown
  }
  styleKey?: string
  [key: string]: unknown
}

export interface BarChartDataset {
  label?: string
  stackGroup?: string
  unit?: string
  legendColor?: string | string[]
  [key: string]: BarChartDataItem | string | string[] | undefined
}

interface LineDataset {
  label: string
  data: Record<string, number | null | undefined>
  borderColor?: string
  backgroundColor?: string
  yAxisID?: string
}

export interface BarChartData {
  dataset?: BarChartDataset | BarChartDataset[]
  lineDataset?: LineDataset
}

interface BarChartProps {
  data?: BarChartData
  isHorizontal?: boolean
  isStacked?: boolean
  yTicksFormatter?: (value: number) => string
  yRightTicksFormatter?: ((value: number) => string) | null
  chartHeight?: number
  displayColors?: boolean
  barWidth?: number
  isLegendVisible?: boolean
  allowGrouping?: boolean
  legendPosition?: ChartLegendPosition
  legendAlign?: string
  hasSuffix?: boolean
  showYAxisTooltip?: boolean
  hiddenDatasets?: number[]
}

// Type for chart data that bridges our CustomDataset with Chart.js types
interface BarChartDataStructure {
  labels?: string[]
  datasets: CustomDataset[]
}

const BarChart: FC<BarChartProps> = ({
  data,
  isHorizontal = false,
  isStacked = false,
  yTicksFormatter = (value: number) => String(value),
  yRightTicksFormatter = null,
  chartHeight = 300,
  displayColors = false,
  barWidth = 15,
  isLegendVisible = false,
  allowGrouping = false,
  legendPosition = 'bottom',
  legendAlign = 'start',
  hasSuffix = true,
  showYAxisTooltip = false,
  hiddenDatasets = [],
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  // Handle controlled dataset visibility
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current
      // Update visibility for all datasets based on hiddenDatasets prop
      chart.data.datasets.forEach((_, index) => {
        const meta = chart.getDatasetMeta(index)
        if (meta) {
          meta.hidden = hiddenDatasets.includes(index)
        }
      })
      chart.update()
    }
  }, [hiddenDatasets])

  const options = (() => {
    const baseOptions = isHorizontal
      ? getHorizontalChartOptions({
          yTicksFormatter,
          isLegendVisible,
          isStacked,
          displayColors,
          legendPosition,
          legendAlign,
          hasSuffix,
        })
      : getVerticalChartOptions({
          yTicksFormatter,
          yRightTicksFormatter,
          isLegendVisible,
          isStacked,
          displayColors,
          legendPosition,
          legendAlign,
          hasSuffix,
        })

    // Store the showYAxisTooltip flag in the options
    const optionsWithCustomProps = {
      ...baseOptions,
      showYAxisTooltip,
    }

    return optionsWithCustomProps as typeof baseOptions & { showYAxisTooltip: boolean }
  })()

  const chartData: BarChartDataStructure = (() => {
    if (!data) {
      return { datasets: [] }
    }

    const { dataset, lineDataset } = data

    let datasetArray: BarChartDataset[] = []
    if (_isArray(dataset)) {
      datasetArray = dataset
    } else if (dataset) {
      datasetArray = [dataset]
    }

    const labels = Array.from(
      _reduce(
        datasetArray as BarChartDataset[],
        (set: Set<string>, ds: BarChartDataset) => {
          _forEach(_keys(ds), (key: string) => {
            if (!_includes(LABEL_TO_IGNORE, key)) set.add(key)
          })
          return set
        },
        new Set<string>(),
      ),
    ).sort((a: string, b: string) => naturalSorting(a, b))

    const makeAdapter = (dataItem: BarChartDataset) =>
      adapter(
        {
          dataItem,
          isChartDirHoz: isHorizontal,
          labels,
          useXYFormat: allowGrouping || isStacked,
          chartHeight,
        },
        COLOR.COLD_ORANGE,
        barWidth,
      )

    const barDatasets: CustomDataset[] = _map(datasetArray, makeAdapter)
    const lineDatasets: CustomDataset[] = lineDataset
      ? [convertLineDataset(lineDataset, labels as string[])]
      : []
    const allDatasets: CustomDataset[] = [...barDatasets, ...lineDatasets]

    // Return structure compatible with Chart.js - labels are optional when using x/y format
    const chartDataResult: BarChartDataStructure = {
      ...(allowGrouping || isStacked ? {} : { labels }),
      datasets: allDatasets,
    }

    return chartDataResult
  })()

  // CustomDataset is compatible with ChartDataset, so we can safely pass to Bar component
  // The type assertion is necessary due to react-chartjs-2's strict typing

  if (!data || _isEmpty(chartData?.datasets)) {
    return (
      <NoDataWrapper>
        <Empty description={CHART_EMPTY_DESCRIPTION} />
      </NoDataWrapper>
    )
  }

  return (
    <Bar
      ref={chartRef}
      data={chartData as unknown as ChartData<'bar'>}
      options={options as unknown as ChartOptions<'bar'>}
    />
  )
}

export default withErrorBoundary(BarChart)
