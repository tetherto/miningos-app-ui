import _isFinite from 'lodash/isFinite'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'

import {
  generateChartLegendLabels,
  getTimeScaleTimeConfig,
  handleLegendClick,
} from '@/app/utils/chartUtils'
import { getHashrateUnit } from '@/app/utils/deviceUtils'
import { formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'

export const getLineDatasetFromHashrate = ({
  data,
  key = 'avgHashrateMHs',
  label = 'Network Hashrate',
  color = COLOR.COLD_ORANGE,
}) => {
  const sorted = [...data].sort((a, b) => Number(a.ts) - Number(b.ts))
  const labels = _map(sorted, (entry) => {
    const timestamp = Number(entry?.ts)
    return _isFinite(timestamp) ? timestamp : 'Invalid Date'
  })
  const values = _map(sorted, (entry) => {
    const value = entry?.[key]
    return !_isNil(value) ? value : null
  })

  return {
    labels,
    dataset: {
      label,
      data: values,
      borderColor: color,
      backgroundColor: 'transparent',
      tension: 0.1,
      pointRadius: 0,
      borderWidth: 1.5,
    },
  }
}

const commonAxisOptions = {
  ticks: {
    color: COLOR.WHITE,
  },
  grid: {
    color: COLOR.DARKER_GREY,
  },
}

export const getChartOptions = ({ timeframeType }) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      usePointStyle: true,
      position: 'bottom',
      align: 'start',
      labels: {
        color: COLOR.TRANSPARENT_WHITE,
        boxWidth: 12,
        generateLabels: (chart) => generateChartLegendLabels(chart),
      },
      onClick: handleLegendClick,
    },
    tooltip: {
      displayColors: false,
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (ctx) => {
          const { value } = getHashrateUnit(ctx.raw)
          const formattedValue = value ? formatNumber(value) : 0

          return `${ctx.dataset.label}: ${formattedValue}`
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  hover: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: false,
        text: 'Hashrate',
        color: COLOR.WHITE,
      },
      ...commonAxisOptions,
      ticks: {
        ...commonAxisOptions.ticks,
        callback: (value) => {
          const { value: formattedValue } = getHashrateUnit(value)

          return formattedValue ? formatNumber(formattedValue) : 0
        },
      },
    },
    x: {
      type: 'time',
      time: getTimeScaleTimeConfig(timeframeType),
      ticks: {
        color: COLOR.TRANSPARENT_WHITE,
      },
      grid: {
        color: COLOR.DARKER_GREY,
      },
    },
  },
})
