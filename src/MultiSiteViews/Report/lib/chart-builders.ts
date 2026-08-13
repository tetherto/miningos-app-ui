import _isFinite from 'lodash/isFinite'

import { tsToISO } from './mining-utils'

import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'

/**
 * Chart builder types
 */
export interface GradientConfig {
  top: number
  bottom: number
}

export interface DataLabelsConfig {
  display: boolean
  formatter?: (value: number) => string
}

export interface ChartPoint {
  ts: string
  value: number
}

export interface ChartSeries {
  label: string
  values: number[]
  color: string
  gradient?: GradientConfig
  datalabels?: DataLabelsConfig
  [key: string]: unknown
}

export interface LineChartSeries {
  label: string
  points: ChartPoint[]
  color: string
  [key: string]: unknown
}

export interface ChartConstant {
  label: string
  value: number
  color: string
}

export interface BarChartData {
  labels: string[]
  series: ChartSeries[]
  lines?: ChartSeries[]
}

export interface LineChartData {
  series: LineChartSeries[]
  constants: ChartConstant[]
}

export interface SeriesInput {
  label: string
  values: number[]
  color: string
  options?: Record<string, unknown>
}

export interface LineSeriesInput {
  label: string
  data: Array<{ ts: number | string; value: number }>
  color: string
  options?: Record<string, unknown>
}

export interface ConstantInput {
  label: string
  value: number
  color: string
}

export interface RevenueSeriesConfig {
  allInCost?: number[]
  hashRevenue?: number[]
  networkHashprice?: number[]
}

export const formatDataLabel = (value: number) => {
  if (_isFinite(value)) {
    if (value === 0) {
      return '0'
    }

    const valueAbs = Math.abs(value)

    if (valueAbs > 0 && valueAbs < 1) {
      return formatNumber(value, { minimumSignificantDigits: 1, maximumSignificantDigits: 3 })
    }
  }

  return formatNumber(value)
}

export const DEFAULT_GRADIENT: GradientConfig = { top: 0.3, bottom: 0.1 }
export const DEFAULT_DATALABELS: DataLabelsConfig = {
  display: true,
  formatter: formatDataLabel,
}

/**
 * Create a standard chart series object
 */
export const buildSeries = (
  label: string,
  values: number[],
  color: string,
  options: Record<string, unknown> = {},
): ChartSeries => ({
  label,
  values,
  color,
  gradient: (options.gradient as GradientConfig) || DEFAULT_GRADIENT,
  datalabels: (options.datalabels as DataLabelsConfig) || DEFAULT_DATALABELS,
  ...options,
})

/**
 * Create a line chart series with points
 */
export const buildLineSeries = (
  label: string,
  data: Array<{ ts: number | string; value: number }>,
  color: string,
  options: Record<string, unknown> = {},
): LineChartSeries => ({
  label,
  points: data.map((item) => ({
    ts: tsToISO(item.ts),
    value: item.value,
  })),
  color,
  ...options,
})

/**
 * Create a chart constant (horizontal line)
 */
export const buildConstant = (label: string, value: number, color: string): ChartConstant => ({
  label,
  value,
  color,
})

/**
 * Build a standard revenue/cost chart with multiple series
 */
export const buildBarChart = (labels: string[], seriesData: SeriesInput[]): BarChartData => ({
  labels,
  series: seriesData.map((s) => buildSeries(s.label, s.values, s.color, s.options)),
})

/**
 * Build a line chart with constants
 */
export const buildLineChart = (
  seriesData: LineSeriesInput[],
  constantsData: ConstantInput[] = [],
): LineChartData => ({
  series: seriesData.map((s) => buildLineSeries(s.label, s.data, s.color, s.options)),
  constants: constantsData.map((c) => buildConstant(c.label, c.value, c.color)),
})

/**
 * Build hashrate chart structure
 */
export const buildHashrateChart = (
  hashrateData: Array<{ ts: number | string; value: number }>,
  nominalHashrate: number,
  options: { seriesLabel?: string; constantLabel?: string } = {},
): LineChartData => {
  const seriesLabel = options.seriesLabel || 'Daily Average Hashrate'
  const constantLabel = options.constantLabel || 'Installed Nominal Hashrate'

  return buildLineChart(
    [
      {
        label: seriesLabel,
        data: hashrateData,
        color: CHART_COLORS.blue,
      },
    ],
    [
      {
        label: constantLabel,
        value: nominalHashrate,
        color: CHART_COLORS.red,
      },
    ],
  )
}

/**
 * Build efficiency chart structure
 */
export const buildEfficiencyChart = (
  efficiencyData: Array<{ ts: number | string; value: number }>,
  nominalEfficiency: number,
): LineChartData =>
  buildLineChart(
    [
      {
        label: 'Actual Sites Efficiency',
        data: efficiencyData,
        color: CHART_COLORS.blue,
      },
    ],
    [
      {
        label: 'Nominal Miners Efficiency',
        value: nominalEfficiency,
        color: CHART_COLORS.red,
      },
    ],
  )

/**
 * Build revenue comparison chart
 */
export const buildRevenueChart = (
  labels: string[],
  seriesConfig: RevenueSeriesConfig,
): BarChartData => {
  const defaultSeries = [
    { key: 'allInCost' as const, label: 'All-in Hash Cost', color: CHART_COLORS.blue },
    { key: 'hashRevenue' as const, label: 'Hash Revenue', color: CHART_COLORS.red },
    { key: 'networkHashprice' as const, label: 'Network Hashprice', color: CHART_COLORS.green },
  ]

  const series: SeriesInput[] = defaultSeries.map((s) => ({
    label: s.label,
    values: seriesConfig[s.key] || [],
    color: s.color,
  }))

  return buildBarChart(labels, series)
}

/**
 * Create empty chart structure
 */
export const createEmptyChart = (
  requiredFields: string[],
): Record<string, { labels: string[]; series: ChartSeries[] }> => {
  const empty: Record<string, { labels: string[]; series: ChartSeries[] }> = {}
  requiredFields.forEach((field) => {
    empty[field] = { labels: [], series: [] }
  })
  return empty
}

export const EMPTY_STRUCTURES = {
  hashCosts: {
    revCostHashprice: { labels: [], series: [] },
    hashrate: { series: [], constants: [] },
    hashCostMetrics: [],
  },
  hashRevenues: {
    siteHashUSD: { labels: [], series: [] },
    siteHashBTC: { labels: [], series: [] },
    networkHashrate: { series: [], constants: [] },
    networkHashprice: { labels: [], series: [] },
    hashMetrics: [],
  },
  operations: {
    hashrate: { series: [], constants: [] },
    efficiency: { series: [], constants: [] },
    workers: { series: [], constants: [] },
    powerConsumption: { series: [], constants: [] },
  },
  dailyHashrate: {
    hashpriceChart: { series: [], constants: [] },
    dailyHashrateChart: { series: [], constants: [] },
    metrics: [],
  },
  efficiency: { series: [], constants: [] },
  costSummary: {
    btcProdCost: { labels: [], series: [] },
    avgDowntime: { labels: [], series: [] },
    powerCost: { labels: [], series: [] },
    metrics: [],
  },
  energyCosts: {
    energyMetrics: [],
    revenueVsCost: { labels: [], series: [] },
    powerSeries: { series: [], constants: [] },
    units: { revenueCostUnit: '$/bucket' },
  },
  ebitda: {
    ebitdaChart: { labels: [], series: [] },
    btcProducedChart: { labels: [], series: [] },
    ebitdaMetrics: [],
  },
  powerConsumption: { series: [], constants: [] },
  subsidyVSFees: {
    subsidyFees: { labels: [], series: [], lines: [] },
    avgFeesSats: { labels: [], series: [] },
  },
  energyRevenues: {
    siteRevenueUSD: { labels: [], series: [] },
    siteRevenueBTC: { labels: [], series: [] },
    dailyAvgDowntime: { labels: [], series: [] },
    powerSeries: { series: [], constants: [] },
  },
  workers: { series: [], constants: [] },
}
