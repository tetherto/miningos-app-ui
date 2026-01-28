import type {
  Chart,
  ChartDataset,
  LegendItem,
  Plugin,
  TimeScaleTimeOptions,
  TimeUnit,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _isFunction from 'lodash/isFunction'
import _isNil from 'lodash/isNil'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import _reduce from 'lodash/reduce'
import _reject from 'lodash/reject'
import _reverse from 'lodash/reverse'
import _size from 'lodash/size'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'
import _sumBy from 'lodash/sumBy'
import React from 'react'

import { DATE_RANGE } from '../../constants'

import { formatPowerConsumption, getHashrateString } from './deviceUtils'
import { formatEfficiency, formatUnit } from './format'
import { getTimeRange } from './getTimeRange'

import { Logger } from '@/app/services/logger'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { hexToOpacity } from '@/Components/LineChartCard/utils'
import { f2poolAdapter } from '@/Components/Reporting/AvgHistory/adapters'
import { CHART_LEGEND_OPACITY, LABEL_TO_IGNORE } from '@/constants/charts'
import type { BarChartItemBorderColorKey } from '@/constants/colors'
import { BAR_CHART_ITEM_BORDER_COLORS, COLOR } from '@/constants/colors'
import { MINER_TYPE_BAR_CHART_ITEM_STYLE_KEY_DEFAULT } from '@/constants/deviceConstants'
import { TIMEFRAME_TYPE } from '@/constants/ranges'

interface ChartLine {
  label: string
  backendAttribute: string
  yValueOperator?: (value: number) => number
  yTicksFormatter?: (value: number) => string
  borderColor: string
  borderWidth?: number
  legendIcon?: React.ReactNode
}

interface ChartDataPayload {
  lines?: ChartLine[]
  formatter?: (
    value: number | unknown,
    decimal?: number,
  ) => { value: string | number | null | unknown; unit: string; realValue: number | unknown }
  currentValueLabel?: { backendAttribute: string }
  isMuliplePoolChart?: boolean
  legendIcon?: React.ReactNode
  multiplePoolBEAttribute?: string
  totalPoolBEAttribute?: string
  yValueOperator?: (value: number) => number
  labelSuffix?: string
}

interface DataEntry {
  ts: number
  [key: string]: unknown
}

interface DataPoint {
  x: number
  y: number
}

export const getChartBuilderDatasetLines = (
  chartDataPayload: ChartDataPayload,
  data: DataEntry[],
): DataPoint[][] =>
  _reduce(
    data,
    (acc: DataPoint[][], entry: DataEntry) => {
      const x = Number(entry.ts)

      return _reduce(
        chartDataPayload.lines,
        (lineAcc: DataPoint[][], line: ChartLine, index: number) => {
          const lineY = _get(entry, line.backendAttribute) as number
          const lineYvalue = line.yValueOperator ? line.yValueOperator(lineY) : lineY

          if (!lineAcc[index]) {
            lineAcc[index] = []
          }
          lineAcc[index].push({ x, y: lineYvalue })
          return lineAcc
        },
        acc,
      )
    },
    [] as DataPoint[][],
  )

interface LineDataset {
  type: string
  label: string
  currentValue?: { value: string | unknown; unit: string; realValue: number | unknown }
  yesterdayAvg?: { value: string | unknown; unit: string; realValue: number | unknown }
  data: DataPoint[]
  borderColor: string
  borderWidth: number
  pointRadius: number
  legendIcon?: React.ReactNode
}

export const getLineChartBuilderDataset = (
  chartDataPayload: ChartDataPayload,
  datasetLinesData: DataPoint[][],
  yesterdayAggr?: Record<string, number>,
): LineDataset[] =>
  _map(chartDataPayload.lines, (line: ChartLine, index: number) => ({
    type: 'line',
    label: line.label,
    currentValue: chartDataPayload?.formatter
      ? chartDataPayload?.formatter?.(_last(datasetLinesData[index])?.y ?? 0)
      : {
          value: String(_last(datasetLinesData[index])?.y ?? 0),
          unit: '',
          realValue: _last(datasetLinesData[index])?.y ?? 0,
        },
    yesterdayAvg: chartDataPayload?.formatter?.(
      (yesterdayAggr?.[line.backendAttribute] ?? 0) / 288,
    ),
    data: datasetLinesData[index],
    borderColor: line.borderColor,
    borderWidth: line.borderWidth || 2,
    pointRadius: 1,
    legendIcon: line.legendIcon,
  }))

type FormatOptionsGetter = (value: number) => { value: string; unit: string; realValue: number }

const getStatValueFormatter =
  (getFormatOptions: FormatOptionsGetter) =>
  (value: number): string | undefined => {
    if (!_isFinite(value)) {
      return undefined
    }

    return formatUnit(getFormatOptions(value))
  }

interface FooterStatsConfigOptions {
  getFormatOptions?: FormatOptionsGetter | (() => void)
  withDailyAvg?: boolean
}

const FOOTER_STATS_CONFIG_DEFAULT_OPTIONS: Required<FooterStatsConfigOptions> = {
  getFormatOptions: _noop,
  withDailyAvg: false,
}

const MS_PER_DAY = 24 * 60 * 60 * 1_000

interface FooterStat {
  label: string
  value?: string
}

const getFooterStatsConfig = (
  data: DataEntry[],
  itemValueKey: string,
  {
    getFormatOptions = FOOTER_STATS_CONFIG_DEFAULT_OPTIONS.getFormatOptions,
    withDailyAvg = FOOTER_STATS_CONFIG_DEFAULT_OPTIONS.withDailyAvg,
  }: FooterStatsConfigOptions = FOOTER_STATS_CONFIG_DEFAULT_OPTIONS,
): FooterStat[] => {
  const itemsCount = _size(data)

  const daysCount = itemsCount > 1 ? (_last(data)!.ts - _head(data)!.ts) / MS_PER_DAY : 1

  const valuesSum = _sumBy(data, itemValueKey)

  const formatStatValue =
    _isFunction(getFormatOptions) && getFormatOptions !== _noop
      ? getStatValueFormatter(getFormatOptions as FormatOptionsGetter)
      : () => undefined

  return _reject(
    [
      {
        label: 'Total Revenue',
        value: formatStatValue(valuesSum),
      },
      {
        label: 'Avg Revenue',
        value: formatStatValue(valuesSum / itemsCount),
      },
      withDailyAvg
        ? {
            label: 'Daily Avg Revenue',
            value: formatStatValue(valuesSum / daysCount),
          }
        : {},
    ],
    { value: undefined },
  ) as FooterStat[]
}

interface ChartBuilderOptions {
  hideLabel?: boolean
  includeFooterStats?: boolean
  includeDailyAvgStats?: boolean
  skipRound?: boolean
  roundPrecision?: number
  footerStatsItemsPerCol?: number
  formatUnitOptions?: { skipUnit?: boolean }
}

const CHART_BUILDER_DEFAULT_OPTIONS: Required<ChartBuilderOptions> = {
  hideLabel: false,
  includeFooterStats: false,
  includeDailyAvgStats: false,
  skipRound: true,
  roundPrecision: 0,
  footerStatsItemsPerCol: undefined as unknown as number,
  formatUnitOptions: undefined as unknown as { skipUnit?: boolean },
}

interface ChartBuilderResult {
  yTicksFormatter: (value: number) => string
  timeRange: string
  currentValueLabel: { value: string; unit: string; realValue: number } | null
  datasets: LineDataset[] | ChartDataset[]
  skipRound: boolean
  roundPrecision: number
  footerStats?: FooterStat[]
  footerStatsItemsPerCol?: number
}

export const getChartBuilderData =
  (
    chartDataPayload: ChartDataPayload,
    {
      hideLabel = CHART_BUILDER_DEFAULT_OPTIONS.hideLabel,
      includeFooterStats = CHART_BUILDER_DEFAULT_OPTIONS.includeFooterStats,
      includeDailyAvgStats = CHART_BUILDER_DEFAULT_OPTIONS.includeDailyAvgStats,
      skipRound = CHART_BUILDER_DEFAULT_OPTIONS.skipRound,
      roundPrecision = CHART_BUILDER_DEFAULT_OPTIONS.roundPrecision,
      footerStatsItemsPerCol = CHART_BUILDER_DEFAULT_OPTIONS.footerStatsItemsPerCol,
      formatUnitOptions,
    }: ChartBuilderOptions = CHART_BUILDER_DEFAULT_OPTIONS,
  ) =>
  (data: DataEntry[], yesterdayAggr?: Record<string, number>): ChartBuilderResult => {
    const datasetLinesData = getChartBuilderDatasetLines(chartDataPayload, data)
    const timeRange = getTimeRange(_last(data)?.ts ?? 0, _head(data)?.ts ?? 0)
    const itemValueKey = chartDataPayload.currentValueLabel?.backendAttribute ?? ''
    const getFormatOptions = chartDataPayload?.formatter || _noop
    const currentValueLabel = hideLabel
      ? null
      : (getFormatOptions as FormatOptionsGetter)(_last(data)?.[itemValueKey] as number)

    const datasets = chartDataPayload.isMuliplePoolChart
      ? f2poolAdapter(data, {
          yValueFormatter: chartDataPayload.formatter as
            | ((value: number | undefined) => { value: number; unit: string; realValue: number })
            | undefined,
          legendIcon: chartDataPayload.legendIcon,
          multiplePoolBEAttribute: chartDataPayload.multiplePoolBEAttribute,
          totalPoolBEAttribute: chartDataPayload.totalPoolBEAttribute,
          yValueOperator: chartDataPayload.yValueOperator as
            | ((value: unknown) => number)
            | undefined,
          labelSuffix: chartDataPayload.labelSuffix,
        }).datasets
      : getLineChartBuilderDataset(chartDataPayload, datasetLinesData, yesterdayAggr)

    return {
      yTicksFormatter: (value: number) =>
        formatUnit(
          (getFormatOptions as FormatOptionsGetter)(value),
          formatUnitOptions as Intl.NumberFormatOptions | undefined,
        ),
      timeRange,
      currentValueLabel,
      datasets: datasets as LineDataset[] | ChartDataset[],
      skipRound,
      roundPrecision,
      footerStats: includeFooterStats
        ? getFooterStatsConfig(data, itemValueKey, {
            getFormatOptions,
            withDailyAvg: includeDailyAvgStats,
          })
        : undefined,
      footerStatsItemsPerCol,
    }
  }

export const harshRateYTickFormatter = (value: number): string => getHashrateString(value)

export const consumptionYTickFormatter = (value: number): string =>
  formatUnit(formatPowerConsumption(value))

export const efficiencyYTickFormatter = (value: number): string =>
  formatUnit(formatEfficiency(value))

export const getTimeLineAvailability = (timeline: string, customRangeDays: number): boolean => {
  const isM5Exceeded = timeline === DATE_RANGE.M5 && customRangeDays > 1
  const isM30Exceeded = timeline === DATE_RANGE.M30 && customRangeDays > 7
  const isH3Exceeded = timeline === DATE_RANGE.H3 && customRangeDays > 31

  if (isM5Exceeded || isM30Exceeded || isH3Exceeded) return false

  return true
}

const HASH_CHAR = '#'

const HEX_COLOR_SIZE = 7 // chars including hash

interface BarChartItemStyleOptions {
  isChartHorizontal?: boolean
}

export interface BarChartItemStyle {
  backgroundColor: string | string[]
  borderColor: string
  borderWidth: { top?: number; right?: number }
}

/**
 * @param borderColorKey
 * @param options
 */
export const getBarChartItemStyle = (
  borderColorKey: BarChartItemBorderColorKey,
  options: BarChartItemStyleOptions = { isChartHorizontal: false },
): BarChartItemStyle => {
  const borderColor = BAR_CHART_ITEM_BORDER_COLORS[borderColorKey]

  if (!borderColor) {
    throw new Error(`There's no "${borderColorKey}" color registered for bar chart`)
  }

  const isBorderColorValidHex =
    _startsWith(borderColor, HASH_CHAR) && _size(borderColor) === HEX_COLOR_SIZE

  let backgroundColor: string | string[] = isBorderColorValidHex
    ? [
        `${borderColor}4d`, // 30% opacity
        `${borderColor}1a`, // 10% opacity
      ]
    : borderColor

  if (_isArray(backgroundColor) && options.isChartHorizontal) {
    backgroundColor = _reverse(backgroundColor)
  }

  return {
    backgroundColor,
    borderColor,
    borderWidth: {
      [options.isChartHorizontal ? 'right' : 'top']: 2,
    },
  }
}

const BAR_CHART_ITEM_BG_AVG_SIZE_FACTOR = 0.75

interface LinearGradientRendererOptions {
  colorMilestones: string[]
  isChartHorizontal: boolean
  chartWidth?: number
  chartHeight: number
}

type CanvasGradient = ReturnType<CanvasRenderingContext2D['createLinearGradient']>

export const getBarChartItemLinearGradientRenderer =
  ({
    colorMilestones,
    isChartHorizontal,
    chartWidth = 300,
    chartHeight,
  }: LinearGradientRendererOptions) =>
  (context: { chart: Chart }): CanvasGradient => {
    const lastMilestoneIndex = _size(colorMilestones) - 1

    const bgAvgWidth = isChartHorizontal ? chartWidth * BAR_CHART_ITEM_BG_AVG_SIZE_FACTOR : 0

    const bgAvgHeight = isChartHorizontal ? 0 : chartHeight * BAR_CHART_ITEM_BG_AVG_SIZE_FACTOR

    const linearGradient = context.chart.ctx.createLinearGradient(0, 0, bgAvgWidth, bgAvgHeight)

    _forEach(colorMilestones, (milestoneColor: string, index: number) => {
      const offset = index ? index / lastMilestoneIndex : index

      linearGradient.addColorStop(offset, milestoneColor)
    })

    return linearGradient
  }

export interface DatasetWithBackground {
  backgroundColor?: string | string[] | ((ctx: { dataIndex: number }) => string)
  [key: string]: unknown
}

interface BarChartDatasetBackgroundColorOptions {
  dataset: DatasetWithBackground
  fallback: string
  isChartHorizontal: boolean
  chartWidth: number
  chartHeight: number
}

export const getBarChartDatasetBackgroundColor = ({
  dataset,
  fallback,
  isChartHorizontal,
  chartWidth,
  chartHeight,
}: BarChartDatasetBackgroundColorOptions):
  | string
  | ((context: { chart: Chart }) => CanvasGradient) => {
  const bgColorValue = _get(dataset, ['backgroundColor'])

  if (_isEmpty(bgColorValue)) {
    return fallback
  }

  if (_isArray(bgColorValue)) {
    return getBarChartItemLinearGradientRenderer({
      isChartHorizontal,
      chartWidth,
      chartHeight,
      colorMilestones: bgColorValue,
    })
  }

  return bgColorValue as string
}

interface ChartDatasetItemLegendColorOptions {
  color?: string
  borderColor?: string
  styleKey?: BarChartItemBorderColorKey
  style?: { backgroundColor?: string[] }
}

export const getChartDatasetItemLegendColor = ({
  color,
  borderColor,
  styleKey,
  style,
}: ChartDatasetItemLegendColorOptions): string => {
  if (color) {
    return color
  }

  if (borderColor) {
    return borderColor
  }

  if (styleKey) {
    return BAR_CHART_ITEM_BORDER_COLORS[styleKey]
  }

  const hexColorWithOpacity = _get(style, ['backgroundColor', 0], '')

  if (!hexColorWithOpacity) {
    return BAR_CHART_ITEM_BORDER_COLORS[MINER_TYPE_BAR_CHART_ITEM_STYLE_KEY_DEFAULT]
  }

  return hexColorWithOpacity.substr(0, HEX_COLOR_SIZE) // remove opacity chars
}

export const getChartDataAvailability = (datasets: ChartDataset[]): boolean => {
  if (_isEmpty(datasets)) {
    return false
  }

  const hasAnyData = _some(datasets, (dataset: unknown) => {
    const data = _get(dataset, ['data'], [])

    return !_isEmpty(data)
  })

  return hasAnyData
}

/**
 * Recursively checks if a dataset contains any non-null, non-undefined values
 * @param dataset - The dataset to check
 * @returns True if the dataset contains data values, false otherwise
 */
export const hasDataValues = (dataset: unknown): boolean => {
  if (_isNil(dataset)) return false

  if (_isArray(dataset)) {
    if (_isEmpty(dataset)) return false
    return _some(dataset, (ds: unknown) => hasDataValues(ds))
  }

  // Handle primitive values (numbers, strings, etc.)
  if (!_isObject(dataset)) {
    return !_isNil(dataset)
  }

  if (_isEmpty(dataset)) return false

  return _some(_keys(dataset), (key: string) => {
    const item = (dataset as UnknownRecord)[key]

    // Skip metadata, styling, and non-data properties
    if (_includes(LABEL_TO_IGNORE, key)) return false

    if (item && _isObject(item)) {
      // Check if the nested object has a value property
      if (!_isNil((item as { value?: unknown }).value)) return true
      // If it's an array, check if it has data values
      if (_isArray(item)) {
        return hasDataValues(item)
      }
      // If it's an object, check for value property
      return !_isNil((item as { value?: unknown }).value)
    }

    return !_isNil(item)
  })
}

/**
 * Checks if bar chart series contain any non-zero values
 * Used to detect "empty" charts where data exists but all values are 0
 * @param series - Array of series with values property
 * @returns True if at least one value is non-zero
 */
export const hasNonZeroSeriesValues = (
  series: Array<{ values?: Array<number | null | undefined> }>,
): boolean => {
  if (_isEmpty(series)) return false
  return _some(series, (s) => _some(s.values, (v) => _isFinite(v) && v !== 0))
}

/**
 * Checks if line chart series contain any non-zero values
 * Used to detect "empty" line charts where data exists but all values are 0
 * @param series - Array of series with points property
 * @returns True if at least one point value is non-zero
 */
export const hasNonZeroLineSeriesValues = (
  series: Array<{ points?: Array<{ value: number }> }>,
): boolean => {
  if (_isEmpty(series)) return false
  return _some(series, (s) => _some(s.points, (p) => _isFinite(p.value) && p.value !== 0))
}

interface GenerateChartLegendLabelsOptions {
  defaultColor?: string
  getLabelText?: (ds: ChartDataset) => string
  getLegendColor?: (ds: ChartDataset) => string
}

interface CustomLegendItem extends LegendItem {
  cursor: string
  fontColor: string
}

export const generateChartLegendLabels = (
  chart: Chart,
  options: GenerateChartLegendLabelsOptions = {},
): CustomLegendItem[] => {
  const {
    defaultColor = COLOR.WHITE,
    getLabelText = (ds: unknown) => (ds as ChartDataset).label ?? '',
    getLegendColor = (ds: unknown) =>
      ((ds as ChartDataset).borderColor as string) ||
      (ds as ChartDataset & { _legendColor?: string })._legendColor ||
      defaultColor,
  } = options

  return _map(chart.data.datasets, (ds: ChartDataset, i: number) => {
    const isVisible = chart.isDatasetVisible(i)
    const opacity = isVisible ? CHART_LEGEND_OPACITY.VISIBLE : CHART_LEGEND_OPACITY.HIDDEN
    const fillOpacity = isVisible ? CHART_LEGEND_OPACITY.HIDDEN : CHART_LEGEND_OPACITY.FILL_HIDDEN
    const legendColor = getLegendColor(ds)

    return {
      text: getLabelText(ds),
      cursor: 'pointer',
      fontColor: isVisible ? defaultColor : hexToOpacity(defaultColor, opacity),
      fillStyle: hexToOpacity(legendColor, fillOpacity),
      strokeStyle: hexToOpacity(legendColor, opacity),
      index: i,
      datasetIndex: i,
      textDecoration: 'none',
    } as CustomLegendItem
  })
}

export const handleLegendClick = (
  _event: unknown,
  legendItem: LegendItem,
  legend: { chart: Chart },
): void => {
  const { chart } = legend
  const meta = chart.getDatasetMeta(legendItem.datasetIndex!)

  meta.hidden = !meta.hidden
  chart.update()
}

const TIMEFRAME_TO_TIME_UNIT_MAP: Record<string, string> = {
  [TIMEFRAME_TYPE.YEAR]: 'month',
}

export const getTimeScaleTimeConfig = (timeframeType: string): Partial<TimeScaleTimeOptions> => {
  const unit = _get(TIMEFRAME_TO_TIME_UNIT_MAP, timeframeType, 'day') as TimeUnit
  return {
    unit,
    displayFormats: {
      day: 'MM-dd',
      month: 'yyyy-MM',
      year: 'yyyy-mm',
    },
  }
}

export const SafeChartDataLabels: Plugin = {
  id: ChartDataLabels.id,
  defaults: ChartDataLabels.defaults,
  beforeInit(chart: Chart) {
    // Ensure chart.data exists before plugin runs
    if (!chart.data) chart.data = { labels: [], datasets: [] }

    try {
      if (ChartDataLabels.beforeInit && _isFunction(ChartDataLabels.beforeInit)) {
        ChartDataLabels.beforeInit(chart, {}, {})
      }
    } catch (err) {
      Logger.warn('SafeChartDataLabels prevented crash in beforeInit', err)
    }
  },
  beforeUpdate(chart, args, options) {
    try {
      if (ChartDataLabels.beforeUpdate && _isFunction(ChartDataLabels.beforeUpdate)) {
        ChartDataLabels.beforeUpdate(chart, args, options)
      }
    } catch (err) {
      Logger.warn('SafeChartDataLabels prevented crash in beforeUpdate', err)
    }
  },
  afterDatasetUpdate(chart, args, options) {
    try {
      if (ChartDataLabels.afterDatasetUpdate && _isFunction(ChartDataLabels.afterDatasetUpdate)) {
        ChartDataLabels.afterDatasetUpdate(chart, args, options)
      }
    } catch (err) {
      Logger.warn('SafeChartDataLabels prevented crash in afterDatasetUpdate', err)
    }
  },
  afterUpdate(chart, args, options) {
    try {
      if (ChartDataLabels.afterUpdate && _isFunction(ChartDataLabels.afterUpdate)) {
        ChartDataLabels.afterUpdate(chart, args, options)
      }
    } catch (err) {
      Logger.warn('SafeChartDataLabels prevented crash in afterUpdate', err)
    }
  },
  afterDatasetsDraw(chart, args, options) {
    try {
      // Only call original plugin if chart and labels exist
      if (chart?.data?.labels?.length) {
        if (ChartDataLabels.afterDatasetsDraw && _isFunction(ChartDataLabels.afterDatasetsDraw)) {
          ChartDataLabels.afterDatasetsDraw(chart, args, options, false)
        }
      }
    } catch (err) {
      Logger.warn('SafeChartDataLabels prevented crash in afterDatasetsDraw', err)
    }
  },
}
