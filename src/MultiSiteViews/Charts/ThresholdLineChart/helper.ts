import type { ChartData, ChartDataset, ChartOptions, TooltipItem } from 'chart.js'
import { format } from 'date-fns/format'
import _flatMap from 'lodash/flatMap'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import _times from 'lodash/times'
import _toNumber from 'lodash/toNumber'
import _uniq from 'lodash/uniq'

import { getTimeScaleTimeConfig } from '@/app/utils/chartUtils'
import { formatNumber } from '@/app/utils/format'
import { hexToOpacity } from '@/Components/LineChartCard/utils'
import { COLOR } from '@/constants/colors'

type SeriesStyle = Partial<ChartDataset<'line'>>

export interface SeriesPoint {
  ts: string | number
  value: number
}

export interface Series {
  label: string
  points: SeriesPoint[]
  style?: SeriesStyle
  color?: string
  fill?: boolean
}

export interface Constant {
  label: string
  value: number
  style?: SeriesStyle
  color?: string
}

export interface LineChartData {
  series: Series[]
  constants?: Constant[]
}
type ThresholdChartDataInput = {
  data?: LineChartData
  labelFormatter?: (ts: string) => string
  fillArea?: boolean
}

const SERIES_PALETTE: string[] = [
  COLOR.SLEEP_BLUE,
  COLOR.GREEN,
  COLOR.YELLOW,
  COLOR.PURPLE_HIGH,
  COLOR.BLUE_SEA,
  COLOR.ORANGE,
]

const CONSTANTS_PALETTE: string[] = [COLOR.RED, COLOR.BLUE_SEA, COLOR.LIGHT_GREEN]

const pickColor = (explicit: string | undefined, idx: number, fallbackList: string[]): string =>
  explicit ?? fallbackList[idx % fallbackList.length]

const commonDatasetOptions: Pick<
  ChartDataset<'line'>,
  'tension' | 'pointRadius' | 'borderWidth'
> = {
  tension: 0.1,
  pointRadius: 0,
  borderWidth: 1.5,
}

const commonAxisOptions = {
  ticks: { color: COLOR.WHITE },
  grid: { color: COLOR.DARKER_GREY },
}

const legendOptions = {
  usePointStyle: true,
  labels: { color: COLOR.WHITE, boxWidth: 12 },
  position: 'top' as const,
  align: 'end' as const,
}

const buildLabels = (series: Series[]): string[] => {
  const allTs = _flatMap(series, (s) => _map(s.points, 'ts'))
  const uniqTs = _uniq(allTs)
  return _sortBy(uniqTs, (ts) => new Date(ts).getTime()).map(String)
}

export const defaultLabelFormatter = (ts: string | number): string => {
  let date: Date

  if (_isNumber(ts)) {
    date = new Date(ts)
  } else if (_isString(ts) && !Number.isNaN(_toNumber(ts))) {
    date = new Date(_toNumber(ts))
  } else {
    date = new Date(ts)
  }

  return Number.isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd')
}

export const getChartDataThreshold = ({
  data,
  labelFormatter = defaultLabelFormatter,
  fillArea = false,
}: ThresholdChartDataInput): ChartData<'line'> => {
  if (!data) return { labels: [], datasets: [] }

  const { series = [], constants = [] } = data
  const labelsISO = buildLabels(series)
  const labels = _map(labelsISO, labelFormatter)

  const datasets: ChartDataset<'line'>[] = [
    ..._map(series, (s, i) => {
      const byTs = new Map<string, number>(_map(s.points, (p) => [String(p.ts), p.value]))
      const color = pickColor(
        s.color ?? (s.style?.borderColor as string | undefined),
        i,
        SERIES_PALETTE,
      )
      const shouldFill = s.fill ?? fillArea

      return {
        label: s.label,
        data: _map(labelsISO, (ts) => (byTs.has(ts) ? byTs.get(ts)! : null)),
        borderColor: color,
        backgroundColor: shouldFill ? hexToOpacity(color, 0.15) : 'transparent',
        fill: shouldFill,
        ...commonDatasetOptions,
        ...(s.style ?? {}),
      }
    }),

    ..._map(constants, (c, i) => {
      const color = pickColor(
        c.color ?? (c.style?.borderColor as string | undefined),
        i,
        CONSTANTS_PALETTE,
      )

      return {
        label: c.label,
        data: _times(labelsISO.length, () => c.value),
        borderColor: color,
        backgroundColor: 'transparent',
        fill: false,
        pointRadius: 0,
        ...commonDatasetOptions,
        ...(c.style ?? {}),
      }
    }),
  ]

  return { labels, datasets }
}

type ChartOptionsInput = {
  timeframeType?: string | number
  isLegendVisible?: boolean
}

export const getChartOptions = ({
  timeframeType,
  isLegendVisible = true,
}: ChartOptionsInput = {}): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: isLegendVisible ? legendOptions : { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        label: (ctx: TooltipItem<'line'>): string => {
          const value = ctx.parsed.y
          const formattedValue = formatNumber(value, {
            maximumFractionDigits: 2,
          })
          return `${ctx.dataset.label}: ${formattedValue}`
        },
      },
    },
    datalabels: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: false },
      suggestedMax: 40,
      ...commonAxisOptions,
    },
    x: {
      ...commonAxisOptions,
      ...(!_isNil(timeframeType)
        ? {
            type: 'time',
            time: getTimeScaleTimeConfig(timeframeType as string),
            bounds: 'ticks',
          }
        : {}),
      ticks: {
        ...commonAxisOptions.ticks,
        ...(_isNil(timeframeType)
          ? {
              maxTicksLimit: 12,
              callback(
                val: string | number,
                idx: number,
                ticks: { value: string | number }[],
              ): string {
                const step = Math.ceil(ticks.length / 12) || 1
                return idx % step === 0 ? this.getLabelForValue(val as number) : ''
              },
            }
          : {}),
      },
    },
  },
})
