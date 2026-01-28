import type { Chart } from 'chart.js'
import { TooltipItem } from 'chart.js'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isFunction from 'lodash/isFunction'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _some from 'lodash/some'
import _toNumber from 'lodash/toNumber'

import {
  BAR_CHART_DATASET_STYLE_FALLBACK,
  BAR_CHART_HEIGHT,
  BAR_PERCENTAGE_DEFAULT,
  BAR_PERCENTAGE_WITH_DATASET3,
  DATASET_3_DEFAULT_BORDER_WIDTH,
} from './BarSteppedLineChart.const'

import {
  DatasetWithBackground,
  getBarChartDatasetBackgroundColor,
  getBarChartItemLinearGradientRenderer,
  getBarChartItemStyle,
} from '@/app/utils/chartUtils'
import { getPercentFormattedNumber } from '@/app/utils/format'
import { BAR_CHART_ITEM_BORDER_COLORS, CHART_COLORS, COLOR } from '@/constants/colors'

type CanvasGradient = ReturnType<CanvasRenderingContext2D['createLinearGradient']>

export interface ChartDataset {
  order?: number
  customLabel?: string
  label?: string
  data?: number[]
  backgroundColor?: string | string[] | ((context: { chart: Chart }) => CanvasGradient)
  borderColor?: string | string[]
  borderWidth?: number
  type?: 'bar' | 'line'
  barPercentage?: number
  [key: string]: unknown
}

export interface BarSteppedLineChartData {
  labels?: string[]
  dataSet1?: ChartDataset
  dataSet2?: ChartDataset
  dataSet3?: ChartDataset
}

export interface FooterStatItem {
  label: string
  value: string | number
  [key: string]: unknown
}

interface GetOptionsParams {
  isLegendVisible: boolean
  showDataLabels: boolean
  yTicksFormatter: (value: number) => string | number
  showDifference?: boolean
  dataSet3?: ChartDataset | null
  unit?: string
}
interface GetRawDatasetsParams {
  dataset1st: ChartDataset | undefined
  dataSet2: ChartDataset | undefined
  dataSet3: ChartDataset | undefined
  isBarDynamicallyColored: boolean
}

interface DatasetWithData {
  data?: number[] | undefined
  [key: string]: unknown
}

export const isDatasetListFilled = (...datasetList: Array<DatasetWithData | undefined>): boolean =>
  !_some(datasetList, (dataset: DatasetWithData | undefined) => _isEmpty(dataset?.data))

export const getMainDatasetStyles = (
  valuesDataset: DatasetWithData | undefined,
  limitsDataset: DatasetWithData | undefined,
) =>
  _map(valuesDataset?.data || [], (value: number, index: number) => {
    const limit = _get(limitsDataset?.data, index, value) as number

    if (value > limit) {
      return getBarChartItemStyle('RED')
    }

    if (value === limit) {
      return getBarChartItemStyle('GREEN')
    }

    return getBarChartItemStyle('BLUE')
  })

export const getOptions = ({
  isLegendVisible,
  showDataLabels,
  yTicksFormatter,
  showDifference,
  dataSet3,
  unit,
}: GetOptionsParams) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: isLegendVisible,
      position: 'bottom' as const,
      align: 'start' as const,
      labels: {
        color: CHART_COLORS.legendLabel,
        usePointStyle: true,
        pointStyle: 'rect' as const,
        generateLabels: (chart: Chart<'bar'>) => {
          const datasets = chart.data.datasets
          const legendOptions = chart.legend?.options as
            | { labels?: { usePointStyle?: boolean; textAlign?: string; color?: string } }
            | undefined
          const textAlign = legendOptions?.labels?.textAlign
          const color = legendOptions?.labels?.color ?? CHART_COLORS.legendLabel

          return _map(datasets, (dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex)
            const style = meta.controller.getStyle(0, meta.hidden)

            return {
              text: (dataset as ChartDataset)?.customLabel || (dataset as ChartDataset).label || '',
              fillStyle: style.backgroundColor as string,
              fontColor: color,
              hidden: !meta.visible,
              lineCap: style.borderCapStyle as string,
              lineDash: style.borderDash as number[],
              lineDashOffset: style.borderDashOffset as number,
              lineJoin: style.borderJoinStyle as string,
              lineWidth: 1,
              strokeStyle: (style.borderColor as string) || COLOR.SIMPLE_BLACK,
              pointStyle: 'rect' as const,
              rotation: (style.rotation as number) || 0,
              textAlign: (textAlign || (style.textAlign as string)) as
                | 'left'
                | 'center'
                | 'right'
                | undefined,
              borderRadius: 0,
              datasetIndex: meta.index,
            }
          })
        },
      },
    },
    tooltip: {
      mode: 'index',
      usePointStyle: true,
      displayColors: false,
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const label = context?.dataset?.label || ''
          const value = (context?.parsed?.y as number) || 0
          return `${label}: ${yTicksFormatter(value)}`
        },
        afterTitle: (context: TooltipItem<'bar'>[]) => {
          const dataset1Value = (context[0]?.raw as number) || 0
          const dataset2Value = (context[1]?.raw as number) || 0

          const difference = dataset2Value - dataset1Value

          const percentage = dataset1Value
            ? getPercentFormattedNumber(difference / dataset1Value)
            : 0

          return showDifference
            ? `Difference: ${yTicksFormatter(difference)} (${percentage})`
            : null
        },
        labelPointStyle: (context: TooltipItem<'bar'>) => {
          if (context?.datasetIndex === 1 && dataSet3?.type === 'line') {
            return {
              pointStyle: 'line',
            }
          }

          return {
            pointStyle: 'rect',
          }
        },
      },
    },
    datalabels: showDataLabels
      ? {
          display: true,
          anchor: 'end',
          align: 'end',
          offset: 2,
          clamp: true,
          clip: false,
          color: CHART_COLORS.white,
          font: { size: 11, weight: '600' },
          formatter: (value: number | unknown) =>
            _isNumber(value) && value > 0 ? yTicksFormatter(value) : '',
        }
      : { display: false },
  },
  scales: {
    x: {
      offset: true,
      ticks: {
        color: CHART_COLORS.axisTicks,
      },
      grid: {
        display: false,
      },
      stacked: !!dataSet3?.type,
    },
    y: {
      grace: showDataLabels ? '15%' : 0,
      ticks: {
        callback: (value: string | number) =>
          unit ? _toNumber(value) : yTicksFormatter(_toNumber(value)),
        color: CHART_COLORS.axisTicks,
      },
      grid: {
        color: CHART_COLORS.gridLine,
      },
      beginAtZero: true,
    },
  },
})

export const getRawDatasets = ({
  isBarDynamicallyColored,
  dataset1st,
  dataSet2,
  dataSet3,
}: GetRawDatasetsParams): ChartDataset[] => {
  const barPercentage = dataSet3 ? BAR_PERCENTAGE_WITH_DATASET3 : BAR_PERCENTAGE_DEFAULT

  const resolveBorderWidth = (bw?: number | { top?: number; right?: number }, fallback = 2) => {
    if (_isNumber(bw)) return bw
    if (_isObject(bw)) return bw.top ?? bw.right ?? fallback
    return fallback
  }

  const resolveBackground = ({
    dataset,
    fallbackStyle,
  }: {
    dataset?: DatasetWithBackground
    fallbackStyle: typeof BAR_CHART_DATASET_STYLE_FALLBACK.PRIMARY
  }) => {
    const gradientRenderer = getBarChartItemLinearGradientRenderer({
      chartHeight: BAR_CHART_HEIGHT,
      colorMilestones: Array.isArray(fallbackStyle.backgroundColor)
        ? fallbackStyle.backgroundColor
        : [fallbackStyle.backgroundColor],
      isChartHorizontal: false,
      chartWidth: 0,
    })

    const bg = getBarChartDatasetBackgroundColor({
      chartHeight: BAR_CHART_HEIGHT,
      dataset: dataset ?? {},
      fallback: '',
      isChartHorizontal: false,
      chartWidth: 0,
    })

    // If getBarChartDatasetBackgroundColor returns a function (from array backgroundColor), use it
    // Otherwise use the gradient renderer as fallback if bgColor is empty string
    if (_isFunction(bg)) return bg

    // If bgColor is empty string, use gradient renderer as fallback
    // Otherwise return the string color (bgColor is guaranteed to be string here)
    if (bg === '') return gradientRenderer

    return bg
  }

  const dataSet1 =
    isBarDynamicallyColored && dataset1st && isDatasetListFilled(dataset1st, dataSet3)
      ? {
          ...dataset1st,
          ...getMainDatasetStyles(dataset1st, dataSet3),
        }
      : dataset1st

  const datasets: ChartDataset[] = []

  if (dataSet1) {
    datasets.push({
      order: dataSet1.order,
      customLabel: dataSet1.customLabel,
      label: dataSet1.label,
      data: dataSet1.data,
      backgroundColor: isBarDynamicallyColored
        ? (dataSet1.backgroundColor as ChartDataset['backgroundColor'])
        : resolveBackground({
            dataset: dataSet1 as unknown as DatasetWithBackground,
            fallbackStyle: BAR_CHART_DATASET_STYLE_FALLBACK.PRIMARY,
          }),
      borderWidth: resolveBorderWidth(
        dataSet1.borderWidth,
        BAR_CHART_DATASET_STYLE_FALLBACK.PRIMARY.borderWidth.top ??
          BAR_CHART_DATASET_STYLE_FALLBACK.PRIMARY.borderWidth.right,
      ),
      borderColor: dataSet1.borderColor ?? BAR_CHART_DATASET_STYLE_FALLBACK.PRIMARY.borderColor,
      barPercentage,
    })
  }

  if (dataSet2) {
    datasets.push({
      order: dataSet2.order,
      customLabel: dataSet2.customLabel,
      label: dataSet2.label,
      data: dataSet2.data,
      backgroundColor: isBarDynamicallyColored
        ? undefined
        : resolveBackground({
            dataset: dataSet2 as unknown as DatasetWithBackground,
            fallbackStyle: BAR_CHART_DATASET_STYLE_FALLBACK.SECONDARY,
          }),
      borderWidth: resolveBorderWidth(
        dataSet2.borderWidth,
        BAR_CHART_DATASET_STYLE_FALLBACK.SECONDARY.borderWidth.top ??
          BAR_CHART_DATASET_STYLE_FALLBACK.SECONDARY.borderWidth.right,
      ),
      borderColor: dataSet2.borderColor ?? BAR_CHART_DATASET_STYLE_FALLBACK.SECONDARY.borderColor,
      barPercentage,
    })
  }

  if (dataSet3) {
    datasets.push({
      type: 'line',
      order: dataSet3.order,
      label: dataSet3.label,
      data: dataSet3.data,
      backgroundColor: dataSet3.backgroundColor || COLOR.TRANSPARENT,
      borderColor: BAR_CHART_ITEM_BORDER_COLORS.YELLOW,
      borderWidth: dataSet3.borderWidth || DATASET_3_DEFAULT_BORDER_WIDTH,
    })
  }

  return datasets
}
