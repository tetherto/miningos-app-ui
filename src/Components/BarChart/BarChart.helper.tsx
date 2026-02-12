import type { Chart, ChartDataset } from 'chart.js'
import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _isUndefined from 'lodash/isUndefined'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _padStart from 'lodash/padStart'
import _reduce from 'lodash/reduce'
import _set from 'lodash/set'
import _toPairs from 'lodash/toPairs'

import { YAXIS_TOOLTIP_LABEL_STYLES } from './BarChart.const'
import { wrapText } from './BarChart.util'

import {
  generateChartLegendLabels,
  getBarChartDatasetBackgroundColor,
  getBarChartItemStyle,
  handleLegendClick,
} from '@/app/utils/chartUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ChartLegendPosition } from '@/app/utils/utils.types'
import { LABEL_TO_IGNORE } from '@/constants/charts'
import { CHART_COLORS, COLOR } from '@/constants/colors'
import { MINER_TYPE_MESSAGE } from '@/constants/deviceConstants'

interface YAxisTooltip {
  visible: boolean
  text: string
  x: number
  y: number
}

interface ChartWithTooltip extends Omit<Chart<'bar'>, 'options'> {
  _yAxisTooltip?: YAxisTooltip | undefined
  options?: Chart<'bar'>['options'] & {
    showYAxisTooltip?: boolean
  }
}

// Custom plugin for Y-axis label tooltips
export const yAxisTooltipPlugin = {
  id: 'yAxisTooltip',
  afterDraw: (chart: ChartWithTooltip) => {
    const { ctx, scales, chartArea } = chart
    const yScale = scales.y

    if (!yScale || !chartArea) return

    // Store tooltip state on chart instance
    if (!chart._yAxisTooltip) {
      chart._yAxisTooltip = {
        visible: false,
        text: '',
        x: 0,
        y: 0,
      }
    }

    const tooltip = chart._yAxisTooltip

    // Draw tooltip if visible
    if (tooltip.visible && tooltip.text) {
      ctx.save()

      // Tooltip styling
      const padding = YAXIS_TOOLTIP_LABEL_STYLES.PADDING
      const fontSize = YAXIS_TOOLTIP_LABEL_STYLES.FONT_SIZE
      const lineHeight = YAXIS_TOOLTIP_LABEL_STYLES.LINE_HEIGHT
      const fontFamily = YAXIS_TOOLTIP_LABEL_STYLES.FONT_FAMILY
      const maxWidth = YAXIS_TOOLTIP_LABEL_STYLES.MAX_WIDTH

      ctx.font = `${fontSize}px ${fontFamily}`

      const lines = wrapText(ctx, tooltip.text, maxWidth - padding * 2)
      const textWidth = Math.min(
        maxWidth - padding * 2,
        Math.max(...lines.map((line: string) => ctx.measureText(line).width)),
      )
      const tooltipWidth = textWidth + padding * 2
      const tooltipHeight = lines.length * lineHeight + padding * 2

      // Position tooltip to the right of the cursor
      const tooltipX = tooltip.x + 10
      const tooltipY = tooltip.y - tooltipHeight / 2

      // Draw tooltip background with fallback for roundRect
      ctx.fillStyle = COLOR.DARK_BLACK
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4)
      } else {
        // Fallback for browsers without roundRect support
        ctx.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight)
      }
      ctx.fill()

      // Draw tooltip text (multi-line)
      ctx.fillStyle = COLOR.WHITE
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      lines.forEach((line, index) => {
        ctx.fillText(line, tooltipX + padding, tooltipY + padding + index * lineHeight)
      })

      ctx.restore()
    }
  },
  beforeEvent: (chart: ChartWithTooltip, args: { event: { x?: number; y?: number } }) => {
    const { event } = args
    const { scales, chartArea, options } = chart
    const yScale = scales.y

    // Check if the tooltip should be shown based on the chart options
    if (!options?.showYAxisTooltip) return

    if (!yScale || !chartArea) return

    // Initialize tooltip state if needed
    if (!chart._yAxisTooltip) {
      chart._yAxisTooltip = {
        visible: false,
        text: '',
        x: 0,
        y: 0,
      }
    }

    const tooltip = chart._yAxisTooltip
    const { x, y } = event

    // Check if mouse is over Y-axis area
    if (_isUndefined(x) || _isUndefined(y)) return
    const isOverYAxis =
      x >= chartArea.left - yScale.width &&
      x <= chartArea.left &&
      y >= chartArea.top &&
      y <= chartArea.bottom

    if (isOverYAxis) {
      // Find which label is being hovered
      const ticks = yScale.ticks
      let hoveredLabel = null

      for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i]
        const tickY = yScale.getPixelForTick(i)
        const tickHeight = (chartArea.bottom - chartArea.top) / ticks.length

        if (y !== undefined && y >= tickY - tickHeight / 2 && y <= tickY + tickHeight / 2) {
          hoveredLabel = tick.label
          break
        }
      }

      if (hoveredLabel) {
        // Check if this label has a message in MINER_TYPE_MESSAGE
        const message = MINER_TYPE_MESSAGE[hoveredLabel as keyof typeof MINER_TYPE_MESSAGE]
        if (message && x !== undefined && y !== undefined) {
          tooltip.visible = true
          tooltip.text = message
          tooltip.x = x
          tooltip.y = y
          chart.update('none') // Update without animation
        } else if (tooltip.visible) {
          tooltip.visible = false
          chart.update('none')
        }
      } else if (tooltip.visible) {
        tooltip.visible = false
        chart.update('none')
      }
    } else if (tooltip.visible) {
      tooltip.visible = false
      chart.update('none')
    }
  },
}

const commonPluginsOptions = {
  datalabels: {
    labels: {
      title: null,
    },
  },
}

export interface CustomDataset extends Omit<
  ChartDataset<'bar' | 'line'>,
  | 'label'
  | 'backgroundColor'
  | 'tension'
  | 'pointRadius'
  | 'pointHoverRadius'
  | 'barPercentage'
  | 'categoryPercentage'
  | 'maxBarThickness'
  | 'fill'
> {
  label?: string
  displayLabels?: string[]
  _legendColor?: string
  originalValues?: number[]
  unit?: string
  backgroundColor?: string | string[] | ((ctx: { chart: Chart }) => string | string[])
  tension?: number
  pointRadius?: number
  pointHoverRadius?: number
  barPercentage?: number
  categoryPercentage?: number
  maxBarThickness?: number
  fill?: boolean
}

const getLegendOptions = () => ({
  usePointStyle: false,
  boxWidth: 12,
  generateLabels: (chart: Chart) =>
    generateChartLegendLabels(chart, {
      getLabelText: (ds: ChartDataset) => {
        const customDs = ds as CustomDataset
        return customDs.displayLabels?.[0] || customDs.label || ''
      },
      getLegendColor: (ds: ChartDataset) => {
        const customDs = ds as CustomDataset
        return customDs._legendColor || COLOR.WHITE
      },
    }),
  onClick: handleLegendClick,
})

const getLabelForAxis = (
  context: { dataset: CustomDataset; dataIndex: number; parsed: Record<string, number> },
  yTicksFormatter: (value: number) => string,
  axis: string,
  hasSuffix = true,
) => {
  const datasetLabel =
    context.dataset.displayLabels?.[context.dataIndex] || context.dataset.label || ''
  const original = context.dataset?.originalValues?.[context.dataIndex]
  const value = original ?? context.parsed[axis]
  const separator = datasetLabel ? ':' : ''
  const unit = context.dataset?.unit || ''
  const unitSuffix = unit ? ` ${unit}` : ''

  return `${datasetLabel}${separator} ${yTicksFormatter(value)}${hasSuffix ? unitSuffix : ''}`
}

interface VerticalChartOptions {
  yTicksFormatter: (value: number) => string
  yRightTicksFormatter?: ((value: number) => string) | null
  isLegendVisible: boolean
  isStacked: boolean
  displayColors?: boolean
  legendPosition?: ChartLegendPosition
  legendAlign?: string
  hasSuffix?: boolean
}

export const getVerticalChartOptions = ({
  yTicksFormatter,
  yRightTicksFormatter = null,
  isLegendVisible,
  isStacked,
  displayColors = false,
  legendPosition = 'bottom',
  legendAlign = 'start',
  hasSuffix = true,
}: VerticalChartOptions) => {
  const scales = {
    y: {
      stacked: isStacked,
      beginAtZero: true,
      position: 'left',
      ticks: {
        callback: (value: number) => yTicksFormatter(value),
        color: CHART_COLORS.axisTicks,
      },
      grid: {
        color: CHART_COLORS.gridLine,
      },
    },
    x: {
      stacked: isStacked,
      ticks: {
        color: CHART_COLORS.axisTicks,
      },
    },
  }

  if (yRightTicksFormatter) {
    ;(scales as { y1?: UnknownRecord }).y1 = {
      position: 'right',
      beginAtZero: true,
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        callback: (value: number) => yRightTicksFormatter(value),
        color: CHART_COLORS.axisTicks,
      },
      // Align the percentage axis with the BTC axis
      // Both axes should start from 0 at the bottom
      min: 0,
      max: 1.05,
    }
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales,
    plugins: {
      ...commonPluginsOptions,
      legend: {
        display: isLegendVisible,
        position: legendPosition,
        align: legendAlign as 'start' | 'center' | 'end',
        labels: getLegendOptions(),
      },
      tooltip: {
        displayColors,
        callbacks: {
          label: (context: {
            dataset: CustomDataset
            dataIndex: number
            parsed: Record<string, number>
          }) => {
            const formatter =
              context.dataset.yAxisID === 'y1' && yRightTicksFormatter
                ? yRightTicksFormatter
                : yTicksFormatter
            return getLabelForAxis(context, formatter, 'y', hasSuffix)
          },
        },
      },
    },
  }
}

interface HorizontalChartOptions {
  yTicksFormatter: (value: number) => string
  isLegendVisible: boolean
  isStacked: boolean
  displayColors?: boolean
  legendPosition?: ChartLegendPosition
  legendAlign?: string
  hasSuffix?: boolean
}

export const getHorizontalChartOptions = ({
  yTicksFormatter,
  isLegendVisible,
  isStacked,
  displayColors = false,
  legendPosition = 'bottom',
  legendAlign = 'start',
  hasSuffix = true,
}: HorizontalChartOptions) => ({
  responsive: true,
  maintainAspectRatio: true,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      stacked: isStacked,
      ticks: {
        autoSkip: false,
        maxRotation: 45,
        minRotation: 45,
        callback: (value: number) => yTicksFormatter(value),
        color: CHART_COLORS.axisTicks,
      },
      offset: false,
      grid: {
        offset: false,
        color: CHART_COLORS.gridLine,
      },
    },
    y: {
      stacked: isStacked,
      beginAtZero: true,
      ticks: {
        color: CHART_COLORS.axisTicks,
      },
    },
  },
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  plugins: {
    ...commonPluginsOptions,
    legend: {
      display: isLegendVisible,
      position: legendPosition,
      align: legendAlign as 'start' | 'center' | 'end',
      labels: getLegendOptions(),
    },
    datalabels: {
      labels: {
        title: null,
      },
    },
    tooltip: {
      displayColors,
      callbacks: {
        label: (context: {
          dataset: CustomDataset
          dataIndex: number
          parsed: Record<string, number>
        }) => getLabelForAxis(context, yTicksFormatter, 'x', hasSuffix) || '',
        title: (context: Array<{ dataset?: { title?: string } }>) => {
          const label = context?.[0]?.dataset?.title || ''
          return `${label}`
        },
      },
    },
    ticks: {
      callback: (value: number) => yTicksFormatter(value),
    },
  },
})

interface ItemStyleAttrsParams {
  item: Record<string, { styleKey?: string; style?: UnknownRecord; color?: string }>
  target: UnknownRecord
  defaultColor: string
  chartHeight: number
  isChartDirHoz: boolean
}

export const getItemStyleAttrs = ({
  item,
  target,
  defaultColor,
  chartHeight,
  isChartDirHoz,
}: ItemStyleAttrsParams) => {
  const styles = _reduce(
    _filter(_keys(target), (key: string) => !_includes(LABEL_TO_IGNORE, key)),
    (acc, label, index) => {
      const itemStyleKey = _get(item, [label, 'styleKey']) as string | undefined

      const itemStyle = itemStyleKey
        ? getBarChartItemStyle(
            itemStyleKey as
              | 'ORANGE'
              | 'RED'
              | 'GREEN'
              | 'YELLOW'
              | 'LIGHT_BLUE'
              | 'BLUE_SEA'
              | 'BLUE'
              | 'METALLIC_BLUE'
              | 'SKY_BLUE'
              | 'VIOLET'
              | 'PURPLE',
            { isChartHorizontal: isChartDirHoz },
          )
        : _get(item, [label, 'style'])

      if (itemStyle) {
        const itemStyleEntries = _toPairs(itemStyle)

        _forEach(itemStyleEntries, ([attrKey, attrValue]) => {
          _set(acc, [attrKey, index], attrValue)
        })

        _set(acc, ['borderRadius', index], 0)
      } else {
        const itemColor = _get(item, [label, 'color'], defaultColor) as string
        _set(acc, ['backgroundColor', index], itemColor)
        _set(acc, ['borderColor', index], itemColor)
        _set(acc, ['borderRadius', index], 5)
      }

      return acc
    },
    {
      backgroundColor: [] as Array<string | string[] | ((ctx: { dataIndex: number }) => string)>,
      borderColor: [] as string[],
      borderWidth: [] as (number | { top?: number; right?: number })[],
      borderRadius: [] as number[],
    },
  )

  const bgColorSet = styles.backgroundColor

  ;(styles.backgroundColor as unknown) = (ctx: { chart: Chart; dataIndex: number }) =>
    _map(bgColorSet, (backgroundColor) => {
      const datasetBgColorVal = getBarChartDatasetBackgroundColor({
        isChartHorizontal: isChartDirHoz,
        chartHeight,
        chartWidth: 300,
        dataset: {
          backgroundColor,
        },
        fallback: defaultColor,
      })

      if (_isFunction(datasetBgColorVal)) {
        return datasetBgColorVal(ctx)
      }

      return datasetBgColorVal
    })[ctx.dataIndex] as string

  return styles
}

interface AdapterDataItem {
  label?: string
  stackGroup?: string
  unit?: string
  legendColor?: string | string[]
  [key: string]:
    | {
        value?: number
        original?: number
        displayLabel?: string
        style?: UnknownRecord
        styleKey?: string
        color?: string
      }
    | string
    | string[]
    | undefined
}

interface AdapterParams {
  dataItem: AdapterDataItem | AdapterDataItem[]
  isChartDirHoz: boolean
  useXYFormat: boolean
  labels?: string[]
  chartHeight?: number
}

export const adapter = (
  { dataItem, isChartDirHoz, useXYFormat, chartHeight = 300 }: AdapterParams,
  defaultColor: string,
  barWidth?: number,
): CustomDataset => {
  const target = _isArray(dataItem) ? _head(dataItem) : dataItem
  if (!target) {
    throw new Error('Adapter requires a valid dataItem')
  }

  const targetKeys = _filter(_keys(target), (key: string) => !_includes(LABEL_TO_IGNORE, key))

  const firstMonthKey = targetKeys?.[0]

  const legendColorRecord =
    (target as AdapterDataItem).legendColor ||
    _get(dataItem, [firstMonthKey, 'style', 'legendColor']) ||
    _get(dataItem, [firstMonthKey, 'style', 'backgroundColor']) ||
    defaultColor

  const legendColor = _isArray(legendColorRecord) ? legendColorRecord[0] : legendColorRecord

  const label = (target as AdapterDataItem).label || ''
  const stack = (target as AdapterDataItem).stackGroup || label
  const unit = (target as AdapterDataItem).unit || ''

  const styleAttrs = getItemStyleAttrs({
    item: target as Record<string, { styleKey?: string; style?: UnknownRecord; color?: string }>,
    target: target as UnknownRecord,
    defaultColor,
    chartHeight,
    isChartDirHoz,
  })

  const getItemValue = (
    key: string,
  ): { value?: number; original?: number; displayLabel?: string } | undefined => {
    const item = (target as UnknownRecord)[key]
    return _isObject(item) && item !== null
      ? (item as { value?: number; original?: number; displayLabel?: string })
      : undefined
  }

  const { backgroundColor: styleBgColor, ...restStyleAttrs } = styleAttrs

  // Define types for chart data based on format
  type XYFormatDataPoint = { x: string; y: number | null }
  type NumericDataPoint = number | null
  type ChartJsDataPoint = number | [number, number] | { x: number; y: number } | null

  const xyFormatData: XYFormatDataPoint[] = useXYFormat
    ? _map(targetKeys, (key: string): XYFormatDataPoint => {
        const item = getItemValue(key)
        return {
          x: key,
          y: item?.value ?? null,
        }
      })
    : []

  const numericData: NumericDataPoint[] = !useXYFormat
    ? _map(targetKeys, (key: string): NumericDataPoint => {
        const item = getItemValue(key)
        return item?.value ?? null
      })
    : []

  // Chart.js accepts string labels for x-axis (categorical), so we cast appropriately
  const chartData: ChartJsDataPoint[] = useXYFormat
    ? (xyFormatData as unknown as ChartJsDataPoint[])
    : (numericData as ChartJsDataPoint[])

  const data: CustomDataset = {
    label,
    stack,
    unit,
    backgroundColor: (styleBgColor || legendColor) as
      | string
      | string[]
      | ((ctx: { chart: Chart }) => string | string[]),
    ...restStyleAttrs,
    data: chartData,
    originalValues: _map(targetKeys, (key: string) => {
      const item = getItemValue(key)
      return item?.original
    }).filter((v): v is number => v !== undefined),
    displayLabels: _map(targetKeys, (key: string) => {
      const item = getItemValue(key)
      return item?.displayLabel
    }).filter((v): v is string => v !== undefined),
    barPercentage: 1,
    categoryPercentage: useXYFormat ? 0.7 : 1,
    maxBarThickness: barWidth || 15,
    _legendColor: legendColor as string,
  }

  return data
}

const PURPLE = 'purple'

interface LineDatasetInput {
  label: string
  data: Record<string, number | null | undefined>
  borderColor?: string
  backgroundColor?: string
  yAxisID?: string
}

export const convertLineDataset = (
  lineDataset: LineDatasetInput,
  labels: string[],
): CustomDataset => ({
  type: 'line',
  data: _map(labels, (label: string) => lineDataset.data[label] ?? null),
  borderColor: lineDataset.borderColor || PURPLE,
  backgroundColor: lineDataset.backgroundColor || PURPLE,
  _legendColor: lineDataset.borderColor || PURPLE,
  yAxisID: lineDataset.yAxisID || 'y1',
  tension: 0.3,
  pointRadius: 3,
  pointHoverRadius: 5,
  fill: false,
  label: lineDataset.label,
})

// ── Simple month key formatter like "04-24"
const _mmYY = (d: Date): string =>
  `${_padStart(String(d.getMonth() + 1), 2, '0')}-${String(d.getFullYear()).slice(-2)}`

// Build consecutive month labels
interface BuildMonthKeysParams {
  start?: Date
  count?: number
}

export const buildMonthKeys = ({
  start = new Date(2024, 3, 1),
  count = 12,
}: BuildMonthKeysParams = {}): string[] =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(start)
    d.setMonth(d.getMonth() + i)
    return _mmYY(d)
  })

// Create one series in the adapter-friendly shape
interface MakeBarSeriesParams {
  label: string
  months: string[]
  values: number[]
  color?: string
  styleKey?: string
}

export const makeBarSeries = ({
  label,
  months,
  values,
  color,
  styleKey,
}: MakeBarSeriesParams): UnknownRecord => {
  const ds: UnknownRecord = { label }
  _forEach(months, (m: string, idx: number) => {
    const v = values[idx] ?? 0
    ds[m] = styleKey
      ? { value: v, styleKey } // use a named style if you have one in getBarChartItemStyle
      : { value: v, style: { backgroundColor: color, legendColor: color } }
  })
  return ds
}

// Make grouped bar chart data: { dataset: [series...] }
interface BarSeriesInput {
  label: string
  values: number[]
  color?: string
  styleKey?: string
}

interface MakeGroupedBarDataParams {
  start?: Date
  count?: number
  series?: BarSeriesInput[]
}

export const makeGroupedBarData = ({
  start = new Date(2024, 3, 1),
  count = 12,
  series = [],
}: MakeGroupedBarDataParams = {}) => {
  const months = buildMonthKeys({ start, count })
  return {
    dataset: _map(series, (s: BarSeriesInput) =>
      makeBarSeries({
        label: s.label,
        months,
        values: s.values,
        color: s.color,
        styleKey: s.styleKey,
      }),
    ),
  }
}

// ---- Ready-to-use dummy data to match your screenshots ----
export const getDummySiteEnergyRevenueUSD = () =>
  makeGroupedBarData({
    start: new Date(2024, 3, 1), // Apr 2024
    count: 12,
    series: [
      {
        label: 'SITE-C',
        values: [63, 30, 59, 75, 20, 10, 27, 45, 12, 45, 33, 28],
        color: COLOR.SLEEP_BLUE,
      },
      {
        label: 'SITE-D',
        values: [30, 9, 26, 35, 20, 27, 18, 27, 20, 42, 20, 19],
        color: COLOR.RED,
      },
    ],
  })

export const getDummySiteEnergyRevenueBTC = () =>
  makeGroupedBarData({
    start: new Date(2024, 3, 1),
    count: 12,
    series: [
      {
        label: 'SITE-C',
        values: [
          58000, 26000, 55000, 59000, 28000, 10000, 55000, 57000, 26000, 12000, 58000, 26000,
        ],
        color: COLOR.SLEEP_BLUE,
      },
      {
        label: 'SITE-D',
        values: [34000, 9000, 31000, 33000, 22000, 27000, 18000, 30000, 28000, 11000, 31000, 25000],
        color: COLOR.RED,
      },
    ],
  })
