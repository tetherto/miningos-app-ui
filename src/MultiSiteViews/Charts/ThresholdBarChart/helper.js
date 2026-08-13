import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _round from 'lodash/round'
import _split from 'lodash/split'
import _times from 'lodash/times'

import { getTimeScaleTimeConfig } from '@/app/utils/chartUtils'
import { CHART_COLORS } from '@/constants/colors'

const pick = (explicit, i, arr) => explicit || arr[i % arr.length]

const toArray = (values, labels) =>
  _isArray(values) ? values : _map(labels, (l) => values?.[l] ?? null)

const deriveLabels = ({ labels, series = [], lines = [] }) => {
  if (labels?.length) return labels

  const set = new Set()
  const collect = (v) => {
    if (!_isArray(v)) _forEach(_keys(v || {}), (k) => set.add(k))
  }
  _forEach(series, (s) => collect(s.values))
  _forEach(lines, (l) => collect(l.values))

  if (set.size) return Array.from(set)

  if (_isArray(series[0]?.values)) {
    return _map(series[0].values, (_v, i) => String(i + 1))
  }

  return []
}

const toRgba = (base, a = 1) => {
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(base)) {
    const m = base.slice(1)
    const hex = m.length === 3 ? _map(_split(m, ''), (c) => c + c).join('') : m
    const n = parseInt(hex, 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  const m = base.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})` : base
}

const makeBarGradient = (ctx, base, { top = 0.3, bottom = 0.1 } = {}) => {
  const { chartArea, ctx: c } = ctx.chart
  if (!chartArea) return base
  const vertical = ctx.chart.config.options.indexAxis !== 'y'
  const g = vertical
    ? c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    : c.createLinearGradient(chartArea.left, 0, chartArea.right, 0)

  g.addColorStop(0, toRgba(base, top))
  g.addColorStop(1, toRgba(base, bottom))
  return g
}

const DEFAULT_CATEGORY_PCT = 0.9
const DEFAULT_BAR_PCT = 0.94
const BAR_PALETTE = [CHART_COLORS.blue, CHART_COLORS.VIOLET, CHART_COLORS.orange]
const LINE_PALETTE = [CHART_COLORS.red, CHART_COLORS.yellow, CHART_COLORS.purple]

// ---------- data builder ----------
export const getBarChartData = ({
  labels: labelsIn,
  series = [],
  lines = [],
  constants = [],
  barWidth = 28,
  defaultLineAxis = 'y',
  categoryPercentage = DEFAULT_CATEGORY_PCT,
  barPercentage = DEFAULT_BAR_PCT,
}) => {
  const labels = deriveLabels({ labels: labelsIn, series, lines })

  const barDatasets = _map(series, (s, i) => {
    const solid = s.color || pick(undefined, i, BAR_PALETTE)
    const gradientStops = s.gradient || { top: 0.3, bottom: 0.1 }

    return {
      type: 'bar',
      label: s.label,
      data: toArray(s.values, labels),
      backgroundColor: (ctx) => makeBarGradient(ctx, solid, gradientStops),
      borderColor: solid,
      borderWidth: { top: 1.5, right: 0, bottom: 0, left: 0 },
      borderSkipped: false,
      borderRadius: 0,
      maxBarThickness: barWidth,
      categoryPercentage: s.categoryPercentage ?? categoryPercentage,
      barPercentage: s.barPercentage ?? barPercentage,
      stack: s.stack,
      order: 1,
      _legendColor: solid,
      datalabels: s.datalabels, // Pass through custom datalabels config
    }
  })

  const lineDatasets = _map(lines || [], (l, i) => {
    const color = l.color || pick(undefined, i, LINE_PALETTE)
    return {
      type: 'line',
      label: l.label,
      data: toArray(l.values, labels),
      borderColor: color,
      backgroundColor: color,
      yAxisID: l.yAxisID || defaultLineAxis,
      tension: l.tension ?? 0.35,
      pointRadius: l.pointRadius ?? 3,
      pointHoverRadius: l.pointHoverRadius ?? 4,
      fill: false,
      spanGaps: true,
      order: 3,
      _legendColor: color,
    }
  })

  const constantDatasets = _map(constants || [], (c) => {
    const color = c.color || CHART_COLORS.red
    return {
      type: 'line',
      label: c.label,
      // prefer-times: repeat a constant value without using args
      data: _times(labels.length, () => c.value),
      borderColor: color,
      backgroundColor: color,
      borderDash: c.borderDash || [6, 6],
      pointRadius: 0,
      tension: 0,
      yAxisID: c.yAxisID || 'y',
      fill: false,
      order: 2,
      _legendColor: color,
    }
  })

  return { labels, datasets: [...barDatasets, ...lineDatasets, ...constantDatasets] }
}

export const buildBarOptions = ({
  isHorizontal = false,
  isStacked = false,
  yTicksFormatter = (v) => v,
  yRightTicksFormatter = null,
  isLegendVisible = true,
  displayColors = true,
  legendPosition = 'top',
  legendAlign = 'end',
  showDataLabels = false,
  timeframeType = null,
}) => {
  const axisTicks = { color: CHART_COLORS.axisTicks }
  const gridColor = CHART_COLORS.gridLine

  const scales = isHorizontal
    ? {
        x: {
          beginAtZero: true,
          stacked: isStacked,
          ticks: { callback: (v) => yTicksFormatter(v), ...axisTicks },
          grid: { color: gridColor, offset: false },
        },
        y: { stacked: isStacked, ticks: axisTicks },
      }
    : {
        y: {
          beginAtZero: true,
          stacked: isStacked,
          grace: showDataLabels ? '15%' : 0,
          ticks: { callback: (v) => yTicksFormatter(v), ...axisTicks },
          grid: { color: gridColor },
        },
        x: {
          stacked: isStacked,
          ticks: axisTicks,
          ...(!_isNil(timeframeType)
            ? {
                type: 'time',
                time: getTimeScaleTimeConfig(timeframeType),
                bounds: 'ticks',
              }
            : {}),
        },
      }

  if (yRightTicksFormatter) {
    scales.y1 = {
      position: 'right',
      beginAtZero: true,
      grid: { drawOnChartArea: false },
      ticks: { callback: (v) => yRightTicksFormatter(v), ...axisTicks },
    }
  }

  // top-of-stack helper (for stacked charts)
  // Shows label only for topmost bar with a non-zero value
  const isTopOfStack = (ctx) => {
    const { chart, dataset, dataIndex } = ctx
    if (dataset.type !== 'bar') return false
    if (!isStacked) return true
    const stackKey = dataset.stack || '__nostack__'
    const dsets = chart.data.datasets
    for (let i = dsets.length - 1; i >= 0; i--) {
      const ds = dsets[i]
      if (ds.type !== 'bar') continue
      if ((ds.stack || '__nostack__') !== stackKey) continue
      if (!chart.isDatasetVisible(i)) continue
      const v = _isArray(ds.data) ? ds.data[dataIndex] : null
      if (_isNil(v) || v === 0) continue // Skip zero values

      return ds === dataset
    }
    return true
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: isHorizontal ? 'y' : 'x',
    layout: {
      padding: {
        top: showDataLabels ? 20 : 0,
      },
    },
    plugins: {
      legend: {
        display: isLegendVisible,
        position: legendPosition,
        align: legendAlign,
        labels: {
          usePointStyle: false,
          boxWidth: 12,
          color: CHART_COLORS.legendLabel,
        },
      },
      tooltip: {
        displayColors,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || ''
            const value = ctx.parsed.y ?? ctx.parsed.x
            if (_isNil(value)) return `${label}: `
            // Use yRightTicksFormatter for datasets on y1 axis
            if (ctx.dataset.yAxisID === 'y1' && yRightTicksFormatter) {
              return `${label}: ${yRightTicksFormatter(value)}`
            }
            // Use more decimal places for small values (e.g., BTC)
            const absValue = Math.abs(value)
            let decimals = 2
            if (absValue > 0 && absValue < 0.01) decimals = 6
            else if (absValue > 0 && absValue < 1) decimals = 4
            const formatted = _round(value, decimals)
            return `${label}: ${formatted}`
          },
        },
      },
      datalabels: showDataLabels
        ? {
            display: (ctx) => ctx.dataset.type === 'bar' && isTopOfStack(ctx),
            anchor: 'end',
            align: 'end',
            offset: 2,
            clamp: true,
            clip: false,
            color: CHART_COLORS.white,
            font: { size: 11, weight: '600' },
            formatter: (v) => (_isNil(v) ? '' : _round(v)),
          }
        : { display: false },
    },
    elements: { bar: { borderWidth: 1 } },
    scales,
  }
}
